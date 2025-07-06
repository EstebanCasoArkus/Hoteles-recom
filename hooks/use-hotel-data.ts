"use client";

import { useState, useMemo } from 'react';
import { calcularAjustesParaHoteles, type Event, type Hotel, type AjusteResultado } from '../lib/hotel-correlation';

// Empty data structures since simulated data has been removed
const hotelData = {
  data: {
    hotels: [] as Hotel[]
  }
};

const eventsData = {
  eventos_julio_2025: [] as Event[]
};

export interface ProcessedHotel {
  name: string;
  roomType: string;
  date: string;
  originalPrice: number;
  adjustedPrice: number;
  percentIncrease: number;
  hasEvent: boolean;
  eventDetails: Event[];
  breakdown: Record<string, any>;
  impactLevel: 'alto' | 'medium' | 'low' | 'none';
}

export interface HotelFilters {
  searchName: string;
  selectedRoomType: string;
  selectedDate: string;
  showOnlyAdjusted: boolean;
  selectedPrincipalHotel: string;
  priceRange: [number, number];
  filterEvents: boolean;
  filterAdjusted: boolean;
  filterSignificantDiff: boolean;
}

export interface HotelStats {
  totalHotels: number;
  hotelsWithAdjustment: number;
  hotelsWithEvents: number;
  avgIncrease: number;
  eventsToday: number;
  impactDistribution: {
    alto: number;
    medium: number;
    low: number;
    none: number;
  };
}

const getCurrentDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const useHotelData = () => {
  const [filters, setFilters] = useState<HotelFilters>({
    searchName: "all",
    selectedRoomType: "Todas",
    selectedDate: getCurrentDateString(),
    showOnlyAdjusted: false,
    selectedPrincipalHotel: "none",
    priceRange: [1700, 2600],
    filterEvents: false,
    filterAdjusted: false,
    filterSignificantDiff: false
  });

  // Base data
  const hotels = hotelData.data.hotels;
  const eventos = eventsData.eventos_julio_2025;

  // Derived data
  const hotelNames = useMemo(() => {
    return Array.from(new Set(hotels.map(h => h.name)));
  }, [hotels]);

  const roomTypes = useMemo(() => {
    const types = new Set<string>();
    hotels.forEach(h => h.rooms.forEach(r => types.add(r.type)));
    return Array.from(types);
  }, [hotels]);

  const uniqueDates = useMemo(() => {
    const dates = new Set<string>();
    hotels.forEach(h => h.rooms.forEach(r => r.prices.forEach(p => dates.add(p.date))));
    return Array.from(dates).sort();
  }, [hotels]);

  // Correlation adjustments
  const ajustes = useMemo(() => {
    return calcularAjustesParaHoteles(hotels, eventos, [filters.selectedDate]);
  }, [hotels, eventos, filters.selectedDate]);

  // Get correlation adjustment for a specific hotel and room type
  const getCorrelationAdjustment = useMemo(() => {
    return (hotelName: string, roomType: string): AjusteResultado | null => {
      return ajustes.find(a => 
        a.hotel === hotelName && 
        a.roomType === roomType && 
        a.date === filters.selectedDate
      ) || null;
    };
  }, [ajustes, filters.selectedDate]);

  // Get events for a specific date
  const getEventsForDate = useMemo(() => {
    return (date: string) => {
      return eventos.filter(e => {
        const eventDate = e.fecha || e.fecha_inicio;
        return eventDate === date;
      });
    };
  }, [eventos]);

  // Classify event impact
  const classifyEventImpact = useMemo(() => {
    return (eventList: typeof eventos): "alto" | "medium" | "low" | "none" => {
      if (eventList.length === 0) return "none";
      // Estimate attendees based on event type and venue capacity
      const totalAttendees = eventList.reduce((sum, e) => {
        // Estimate based on event type
        if (e.tipo_evento === 'concierto') return sum + 15000;
        if (e.tipo_evento === 'festival') return sum + 25000;
        if (e.tipo_evento === 'conferencia') return sum + 2500;
        if (e.tipo_evento === 'deportivo') return sum + 30000;
        return sum + 5000; // Default estimate
      }, 0);
      if (totalAttendees > 20000) return "alto";
      if (totalAttendees > 5000) return "medium";
      return "low";
    };
  }, []);

  // Process hotels with correlation data
  const processedHotels = useMemo((): ProcessedHotel[] => {
    const results: ProcessedHotel[] = [];
    
    hotels.forEach(hotel => {
      hotel.rooms.forEach(room => {
        const priceData = room.prices.find(p => p.date === filters.selectedDate);
        if (!priceData) return;

        const adjustment = getCorrelationAdjustment(hotel.name, room.type);
        const adjustedPrice = adjustment ? adjustment.precioAjustado : priceData.price;
        const percentIncrease = adjustment ? Number(adjustment.porcentajeAumento) : 0;
        
        const eventsToday = getEventsForDate(filters.selectedDate);
        const impactLevel = classifyEventImpact(eventsToday);
        
        results.push({
          name: hotel.name,
          roomType: room.type,
          date: filters.selectedDate,
          originalPrice: priceData.price,
          adjustedPrice,
          percentIncrease,
          hasEvent: eventsToday.length > 0,
          eventDetails: eventsToday,
          breakdown: adjustment?.desglose || {},
          impactLevel
        });
      });
    });

    return results;
  }, [hotels, filters.selectedDate, getCorrelationAdjustment, getEventsForDate, classifyEventImpact]);

  // Apply filters
  const filteredHotels = useMemo(() => {
    return processedHotels.filter(hotel => {
      // Name filter
      if (filters.searchName !== "all" && hotel.name !== filters.searchName) {
        return false;
      }
      
      // Room type filter
      if (filters.selectedRoomType !== "Todas" && hotel.roomType !== filters.selectedRoomType) {
        return false;
      }
      
      // Adjusted price filter
      if (filters.showOnlyAdjusted && hotel.adjustedPrice === hotel.originalPrice) {
        return false;
      }
      
      // Price range filter (convert to MXN)
      const priceInMXN = hotel.adjustedPrice * 17;
      if (priceInMXN < filters.priceRange[0] || priceInMXN > filters.priceRange[1]) {
        return false;
      }
      
      // Events filter
      if (filters.filterEvents && !hotel.hasEvent) {
        return false;
      }
      
      // Adjusted filter
      if (filters.filterAdjusted && hotel.adjustedPrice === hotel.originalPrice) {
        return false;
      }
      
      // Significant difference filter
      if (filters.filterSignificantDiff && Math.abs(hotel.percentIncrease) <= 10) {
        return false;
      }
      
      return true;
    });
  }, [processedHotels, filters]);

  // Calculate statistics
  const stats = useMemo((): HotelStats => {
    const totalHotels = filteredHotels.length;
    const hotelsWithAdjustment = filteredHotels.filter(h => h.adjustedPrice !== h.originalPrice).length;
    const hotelsWithEvents = filteredHotels.filter(h => h.hasEvent).length;
    const avgIncrease = filteredHotels
      .filter(h => h.percentIncrease > 0)
      .reduce((acc, h) => acc + h.percentIncrease, 0) / Math.max(1, hotelsWithAdjustment);
    
    const eventsToday = getEventsForDate(filters.selectedDate);
    const impactDistribution = {
      alto: filteredHotels.filter(h => h.impactLevel === "alto").length,
      medium: filteredHotels.filter(h => h.impactLevel === "medium").length,
      low: filteredHotels.filter(h => h.impactLevel === "low").length,
      none: filteredHotels.filter(h => h.impactLevel === "none").length,
    };

    return {
      totalHotels,
      hotelsWithAdjustment,
      hotelsWithEvents,
      avgIncrease,
      eventsToday: eventsToday.length,
      impactDistribution
    };
  }, [filteredHotels, getEventsForDate, filters.selectedDate]);

  // Update filter functions
  const updateFilter = <K extends keyof HotelFilters>(key: K, value: HotelFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      searchName: "all",
      selectedRoomType: "Todas",
      selectedDate: getCurrentDateString(),
      showOnlyAdjusted: false,
      selectedPrincipalHotel: "none",
      priceRange: [1700, 2600],
      filterEvents: false,
      filterAdjusted: false,
      filterSignificantDiff: false
    });
  };

  return {
    // Data
    hotels: filteredHotels,
    hotelNames,
    roomTypes,
    uniqueDates,
    stats,
    
    // Filters
    filters,
    updateFilter,
    resetFilters,
    
    // Utilities
    getEventsForDate,
    getCorrelationAdjustment,
    classifyEventImpact
  };
}; 