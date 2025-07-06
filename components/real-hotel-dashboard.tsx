"use client";

import React, { useState, useMemo } from "react";
import {
  Hotel as HotelIcon,
  DollarSign,
  Calendar as CalendarIcon,
  CalendarDays,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  BarChart2,
  Upload,
  Building,
  Tag,
  Info,
  Menu,
  Bell,
  UserCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  Zap,
  Minus,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeSwitcher } from "./theme-switcher";
import { calculateAdjustedPrice, calcularAjustesParaHoteles, type Event, type Hotel, type AjusteResultado } from "../lib/hotel-correlation";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Empty data structures since simulated data has been removed
const hotelData = {
  data: {
    hotels: [] as Hotel[]
  }
};

const eventsData = {
  eventos_julio_2025: [] as Event[]
};

/** Helper para capitalizar nombres */
const formatHotelName = (name: string) =>
  name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

/** Formatea precio MXN (convierte de USD a MXN si es necesario) */
const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(price * 17);

const getCurrentDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**************************** Layout ********************************/ 
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 font-inter antialiased text-gray-800 dark:text-gray-100 transition-colors duration-300">
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm py-4 px-6 flex items-center justify-between sticky top-0 z-10 rounded-b-xl border-b border-blue-100 dark:border-gray-700 transition-colors duration-300">
      <div className="flex items-center">
        <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300 mr-4 cursor-pointer lg:hidden" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <HotelIcon className="h-7 w-7 text-blue-600 dark:text-blue-400 mr-2" />
          Hotel Dashboard con Correlación
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <ThemeSwitcher />
        <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
        <UserCircle className="h-8 w-8 text-gray-600 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
      </div>
    </nav>
    <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
  </div>
);

/**************************** Enhanced HotelCard *****************************/
interface EnhancedHotelCardProps {
  name: string;
  roomType: string;
  date: string;
  originalPrice: number;
  adjustedPrice: number;
  percentIncrease: number;
  avgPrice: number;
  isCheaper: boolean;
  isMoreExpensive: boolean;
  hasEvent: boolean;
  eventDetails?: Event[];
  breakdown?: Record<string, any>;
  impactLevel?: "alto" | "medium" | "low" | "none";
  isPrincipal?: boolean;
  principalHotelName?: string;
}

const EnhancedHotelCard: React.FC<EnhancedHotelCardProps> = ({
  name,
  roomType,
  date,
  originalPrice,
  adjustedPrice,
  percentIncrease,
  avgPrice,
  isCheaper,
  isMoreExpensive,
  hasEvent,
  eventDetails = [],
  breakdown = {},
  impactLevel = "none",
  isPrincipal,
  principalHotelName,
}) => {
  const hasAdjustment = adjustedPrice !== originalPrice;
  const hasEvents = eventDetails && eventDetails.length > 0;
  
  const impactColors = {
    alto: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    medium: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800", 
    low: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    none: "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800"
  };
  
  const impactIcons = {
    alto: <Zap className="w-3 h-3" />,
    medium: <TrendingUp className="w-3 h-3" />,
    low: <Activity className="w-3 h-3" />,
    none: <Minus className="w-3 h-3" />
  };

  // Calcular comparación de precio
  const priceDifference = adjustedPrice - avgPrice;
  const priceDifferencePercent = ((priceDifference / avgPrice) * 100);
  const comparisonText = principalHotelName ? 
    `${formatHotelName(principalHotelName)} (${roomType})` : 
    `promedio de ${roomType}`;
  const showDetailedInfo = isPrincipal || !principalHotelName;

  return (
    <Card className={`transition-all duration-300 hover:shadow-xl border-l-4 bg-white dark:bg-gray-800 ${
      isPrincipal 
        ? "border-l-blue-500 ring-2 ring-blue-200 dark:ring-blue-800" 
        : hasAdjustment && showDetailedInfo
        ? "border-l-orange-400" 
        : "border-l-gray-300 dark:border-l-gray-600"
    } ${hasEvents && showDetailedInfo ? "shadow-lg" : "shadow-md"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200 leading-tight">
              {formatHotelName(name)}
              {isPrincipal && (
                <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Hotel Principal
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{roomType}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">{date}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Precio actual */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Precio actual:</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatPrice(adjustedPrice)}</span>
        </div>

        {/* Comparación directa con hotel principal */}
        {!isPrincipal && (
          <div className="mb-2">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Comparado con: <span className="font-semibold">{comparisonText}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Precio de {principalHotelName ? formatHotelName(principalHotelName) : 'hotel principal'}:</span>
              <span className="font-semibold text-blue-700 dark:text-blue-300">{formatPrice(avgPrice)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <span className="text-gray-500">Diferencia:</span>
              <span className={`font-semibold ${priceDifference > 0 ? "text-green-600 dark:text-green-400" : priceDifference < 0 ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>
                {priceDifference > 0 ? "+" : priceDifference < 0 ? "-" : ""}{formatPrice(Math.abs(priceDifference))} ({priceDifferencePercent > 0 ? "+" : priceDifferencePercent < 0 ? "-" : ""}{Math.abs(priceDifferencePercent).toFixed(1)}%)
              </span>
            </div>
            <div className="text-xs mt-1 flex items-center gap-1">
              {priceDifference > 0 ? <span className="text-green-600 dark:text-green-400">💰</span> : priceDifference < 0 ? <span className="text-red-600 dark:text-red-400">💸</span> : <span>🟰</span>}
              <span className="text-gray-600 dark:text-gray-400">
                {priceDifference > 0
                  ? <>Más <span className="text-red-600 dark:text-red-400">caro</span> que {comparisonText}</>
                  : priceDifference < 0
                  ? <>Más <span className="text-green-600 dark:text-green-400">barato</span> que {comparisonText}</>
                  : <>Mismo precio que {comparisonText}</>
                }
              </span>
            </div>
            {priceDifference > 0 && (
              <div className="text-xs mt-1 flex items-center gap-1 text-orange-600 dark:text-orange-400 font-medium">
                <span>⚠️</span>
                <span>Ajustar precio</span>
              </div>
            )}
          </div>
        )}

        {/* Justificación del precio por evento */}
        {hasEvents && eventDetails.length > 0 && (
          <div className="text-xs mt-2 flex items-center gap-2 text-orange-700 dark:text-orange-400">
            <span>💡</span>
            <span>
              Ajuste por evento: "{eventDetails[0]?.titulo}"
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/************************* Enhanced Dashboard with Correlation **********************/
const RealHotelDashboard: React.FC = () => {
  // Tipado para los JSON
  type HotelJson = typeof hotelData.data.hotels[number];
  type EventJson = (typeof eventsData.eventos_julio_2025)[number];

  const hotels: HotelJson[] = hotelData.data.hotels;
  const events: EventJson[] = eventsData.eventos_julio_2025;

  // States
  const [selectedDate, setSelectedDate] = useState(getCurrentDateString());
  const [searchName, setSearchName] = useState("all");
  const [selectedRoomType, setSelectedRoomType] = useState("Todas");
  const [showOnlyAdjusted, setShowOnlyAdjusted] = useState(false);
  const [selectedPrincipalHotel, setSelectedPrincipalHotel] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([1700, 2600]);
  const [filterEvents, setFilterEvents] = useState(false);
  const [filterAdjusted, setFilterAdjusted] = useState(false);
  const [filterSignificantDiff, setFilterSignificantDiff] = useState(false);

  // Generate dates for July 2025 as fallback when no data is available
  const generateDatesForJuly2025 = (): string[] => {
    const dates: string[] = [];
    for (let day = 1; day <= 31; day++) {
      dates.push(`2025-07-${day.toString().padStart(2, '0')}`);
    }
    return dates;
  };

  const uniqueDates = generateDatesForJuly2025();
  const hotelNames = hotels?.map((h) => h.name) || [];
  const roomTypes = Array.from(
    new Set((hotels || []).flatMap((h) => h.rooms?.map((r) => r.type) || []))
  );

  // Convertir datos para el sistema de correlación
  const correlationHotels: Hotel[] = useMemo(() => {
    return (hotels || []).map(hotel => ({
      name: hotel.name,
      rooms: hotel.rooms || [],
      source: hotel.source,
      ubicacion: { lat: 32.5149 + (Math.random() - 0.5) * 0.1, lng: -117.0382 + (Math.random() - 0.5) * 0.1 }
    }));
  }, [hotels]);

  const correlationEvents: Event[] = useMemo(() => {
    return (events || []).map(event => ({
      titulo: event.titulo,
      fecha: event.fecha,
      fecha_inicio: event.fecha_inicio,
      fecha_fin: event.fecha_fin,
      lugar: event.lugar,
      direccion: event.direccion,
      artista_principal: event.artista_principal,
      genero: event.genero,
      tipo_evento: event.tipo_evento,
      estado: event.estado,
      precios: event.precios || {},
      precio: event.precio,
      artistas: event.artistas || []
    }));
  }, [events]);

  // Calcular ajustes usando el sistema de correlación
  const correlationResults = useMemo(() => {
    return calcularAjustesParaHoteles(correlationHotels, correlationEvents, [selectedDate]);
  }, [correlationHotels, correlationEvents, selectedDate]);

  // Obtener ajuste de correlación para un hotel
  function getCorrelationAdjustment(hotelName: string, roomType: string): AjusteResultado | null {
    return correlationResults.find(r => 
      r.hotel === hotelName && 
      r.roomType === roomType && 
      r.date === selectedDate
    ) || null;
  }

  // Obtener eventos para una fecha
  function getEventsForDate(date: string): EventJson[] {
    return (events || []).filter(e => 
      e.fecha === date || 
      (e.fecha_inicio && e.fecha_fin && date >= e.fecha_inicio && date <= e.fecha_fin)
    );
  }

  // Clasificar impacto de eventos
  function classifyEventImpact(eventList: EventJson[]): "alto" | "medium" | "low" | "none" {
    if (eventList.length === 0) return "none";
    
    for (const event of eventList) {
      // Alto impacto - lugares principales, tipos importantes
      if (
        (event.lugar && (event.lugar.includes("CECUT") || event.lugar.includes("Palenque"))) ||
        event.tipo_evento === "Festival" ||
        event.tipo_evento === "Convención" ||
        event.artista_principal?.includes("internacional") ||
        (event.precios && Object.values(event.precios).some(p => p && parseFloat(p.toString().replace(/[$,]/g, "")) > 2000))
      ) {
        return "alto";
      }
      
      // Medio impacto - conciertos, eventos con precios significativos
      if (
        event.genero === "Regional Mexicano" ||
        event.tipo_evento === "Concierto" ||
        event.tipo_evento === "Show en vivo" ||
        (event.precios && Object.values(event.precios).some(p => p && parseFloat(p.toString().replace(/[$,]/g, "")) > 800))
      ) {
        return "medium";
      }
    }
    
    return "low";
  }

  // Calcular datos procesados con correlación
  const processedWithCorrelation = useMemo(() => {
    const list: Array<{
      name: string;
      originalPrice: number;
      adjustedPrice: number;
      percentIncrease: number;
      roomType: string;
      date: string;
      hasEvent: boolean;
      eventDetails: EventJson[];
      breakdown: Record<string, any>;
      impactLevel: "alto" | "medium" | "low" | "none";
    }> = [];

    (hotels || []).forEach((hotel) => {
      if (searchName && searchName !== "all" && hotel.name !== searchName) return;
      
      // Determinar qué tipos de habitación mostrar
      const roomTypesToShow = selectedRoomType === "Todas" 
        ? (hotel.rooms || []).map(r => r.type)  // Todas las habitaciones del hotel
        : [selectedRoomType];  // Solo el tipo seleccionado
      
      roomTypesToShow.forEach((roomType) => {
        // Buscar la habitación específica
        const room = (hotel.rooms || []).find(r => r.type === roomType);
        if (!room) return;
        
        // Buscar el precio para la fecha seleccionada
        const priceObj = (room.prices || []).find(p => p.date === selectedDate);
        if (!priceObj) return;
        
        const originalPrice = priceObj.price;
        const correlationResult = getCorrelationAdjustment(hotel.name, roomType);
        const eventsForDate = getEventsForDate(selectedDate);
        const impactLevel = classifyEventImpact(eventsForDate);
        
        const adjustedPrice = correlationResult ? correlationResult.precioAjustado : originalPrice;
        const percentIncrease = correlationResult 
          ? parseFloat(correlationResult.porcentajeAumento.replace('%', ''))
          : 0;

        // Filtrar si solo queremos hoteles con ajustes
        if (showOnlyAdjusted && adjustedPrice === originalPrice) return;

        list.push({
          name: hotel.name,
          originalPrice,
          adjustedPrice,
          percentIncrease,
          roomType,
          date: selectedDate,
          hasEvent: eventsForDate.length > 0,
          eventDetails: eventsForDate,
          breakdown: correlationResult?.desglose || {},
          impactLevel
        });
      });
    });
    
    return list;
  }, [hotels, searchName, selectedRoomType, selectedDate, correlationResults, showOnlyAdjusted]);

  // Filtrar hoteles según los filtros avanzados
  const filteredProcessedWithCorrelation = useMemo(() => {
    return processedWithCorrelation.filter(hotel => {
      if (filterEvents && !hotel.hasEvent) return false;
      if (filterAdjusted && hotel.adjustedPrice === hotel.originalPrice) return false;
      if (filterSignificantDiff && Math.abs(hotel.percentIncrease) < 10) return false;
      return true;
    });
  }, [processedWithCorrelation, filterEvents, filterAdjusted, filterSignificantDiff]);

  // Obtener todos los tipos de habitación únicos en el dataset
  const uniqueRoomTypes = useMemo(() => {
    return Array.from(new Set(filteredProcessedWithCorrelation.map(h => h.roomType)));
  }, [filteredProcessedWithCorrelation]);

  // Agrupar hoteles por tipo de habitación y luego por rango de precio
  function buildRoomTypeGroups() {
    return uniqueRoomTypes.map((roomType) => {
      // Filtrar hoteles de este tipo de habitación
      const hotelsOfType = filteredProcessedWithCorrelation.filter(h => h.roomType === roomType);
      // Agrupar por rango de precio (en MXN)
      const groups = {
        low: hotelsOfType.filter(h => h.adjustedPrice * 17 < priceRange[0]),
        mid: hotelsOfType.filter(h => h.adjustedPrice * 17 >= priceRange[0] && h.adjustedPrice * 17 <= priceRange[1]),
        alto: hotelsOfType.filter(h => h.adjustedPrice * 17 > priceRange[1]),
      };
      return (
        <div key={roomType} className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-200">{roomType}</h2>
          {buildGroupSection(groups.low, `Menos de $${priceRange[0].toLocaleString()} MXN`, "text-green-600 dark:text-green-400", <DollarSign />)}
          {buildGroupSection(groups.mid, `Entre $${priceRange[0].toLocaleString()} y $${priceRange[1].toLocaleString()} MXN`, "text-yellow-600 dark:text-yellow-400", <DollarSign />)}
          {buildGroupSection(groups.alto, `Más de $${priceRange[1].toLocaleString()} MXN`, "text-red-600 dark:text-red-400", <DollarSign />)}
        </div>
      );
    });
  }

  // Encontrar hotel principal seleccionado
  const principalHotel = useMemo(() => {
    if (!selectedPrincipalHotel || selectedPrincipalHotel === "none") return null;
    return filteredProcessedWithCorrelation.find(h => 
      h.name === selectedPrincipalHotel
    );
  }, [filteredProcessedWithCorrelation, selectedPrincipalHotel]);

  // Estadísticas del sistema de correlación
  const correlationStats = useMemo(() => {
    const totalHotels = filteredProcessedWithCorrelation.length;
    const hotelsWithAdjustment = filteredProcessedWithCorrelation.filter(h => h.adjustedPrice !== h.originalPrice).length;
    const hotelsWithEvents = filteredProcessedWithCorrelation.filter(h => h.hasEvent).length;
    const avgIncrease = filteredProcessedWithCorrelation
      .filter(h => h.percentIncrease > 0)
      .reduce((acc, h) => acc + h.percentIncrease, 0) / Math.max(1, hotelsWithAdjustment);
    
    const eventsToday = getEventsForDate(selectedDate);
    const impactDistribution = {
      alto: filteredProcessedWithCorrelation.filter(h => h.impactLevel === "alto").length,
      medium: filteredProcessedWithCorrelation.filter(h => h.impactLevel === "medium").length,
      low: filteredProcessedWithCorrelation.filter(h => h.impactLevel === "low").length,
      none: filteredProcessedWithCorrelation.filter(h => h.impactLevel === "none").length,
    };

    return {
      totalHotels,
      hotelsWithAdjustment,
      hotelsWithEvents,
      avgIncrease,
      eventsToday: eventsToday.length,
      impactDistribution
    };
  }, [filteredProcessedWithCorrelation, selectedDate]);

  // Función para construir secciones de grupo
  function buildGroupSection(
    list: typeof filteredProcessedWithCorrelation, 
    label: string, 
    color: string, 
    icon: React.ReactNode
  ) {
    if (list.length === 0) return null;
    
    const avgOriginal = list.reduce((acc, h) => acc + h.originalPrice, 0) / list.length;
    const avgAdjusted = list.reduce((acc, h) => acc + h.adjustedPrice, 0) / list.length;
    const withEvent = list.filter((h) => h.hasEvent).length;
    const withAdjustment = list.filter((h) => h.adjustedPrice !== h.originalPrice).length;

    return (
      <div className="mb-10">
        <div className="flex items-center mb-4 pb-2 border-b-2 border-gray-200 dark:border-gray-700 gap-3">
          <span className={`text-xl ${color}`}>{icon}</span>
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">{label}</h3>
          <div className="flex gap-4 ml-auto text-sm text-gray-600 dark:text-gray-400">
            <span>{list.length} hoteles</span>
            <span>{withEvent} con eventos</span>
            <span>{withAdjustment} con ajustes</span>
            <span>Prom: {formatPrice(avgAdjusted)}</span>
            {avgAdjusted !== avgOriginal && (
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                (Base: {formatPrice(avgOriginal)})
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((h) => {
            // Comparar solo con hoteles del mismo tipo de habitación
            const sameRoomTypeHotels = filteredProcessedWithCorrelation.filter(hotel => hotel.roomType === h.roomType);
            
            // Buscar si el hotel principal tiene este tipo de habitación
            const principalHotelSameType = principalHotel && principalHotel.name === selectedPrincipalHotel 
              ? sameRoomTypeHotels.find(hotel => hotel.name === selectedPrincipalHotel && hotel.roomType === h.roomType)
              : null;
            
            // Si hay hotel principal del mismo tipo, usar ese; sino usar promedio del mismo tipo
            const referencePrice = principalHotelSameType 
              ? principalHotelSameType.adjustedPrice 
              : sameRoomTypeHotels.reduce((acc, hotel) => acc + hotel.adjustedPrice, 0) / sameRoomTypeHotels.length;
            
            const isCheaper = h.adjustedPrice < referencePrice;
            const isMoreExpensive = h.adjustedPrice > referencePrice;
            const isPrincipal = h.name === selectedPrincipalHotel;
            
            return (
              <EnhancedHotelCard
                key={`${h.name}-${h.roomType}`}
                name={h.name}
                roomType={h.roomType}
                date={h.date}
                originalPrice={h.originalPrice}
                adjustedPrice={h.adjustedPrice}
                percentIncrease={h.percentIncrease}
                avgPrice={referencePrice}
                isCheaper={isCheaper}
                isMoreExpensive={isMoreExpensive}
                hasEvent={h.hasEvent}
                eventDetails={h.eventDetails}
                breakdown={h.breakdown}
                impactLevel={h.impactLevel}
                isPrincipal={!!isPrincipal}
                principalHotelName={principalHotelSameType?.name}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Construir datos para el gráfico de barras
  const chartData = uniqueRoomTypes.map(roomType => {
    const hotelsOfType = filteredProcessedWithCorrelation.filter(h => h.roomType === roomType);
    return {
      tipo: roomType,
      Bajo: hotelsOfType.filter(h => h.adjustedPrice * 17 < priceRange[0]).length,
      Medio: hotelsOfType.filter(h => h.adjustedPrice * 17 >= priceRange[0] && h.adjustedPrice * 17 <= priceRange[1]).length,
      Alto: hotelsOfType.filter(h => h.adjustedPrice * 17 > priceRange[1]).length,
    };
  });

  // Cálculo de alertas inteligentes
  const allPrices = filteredProcessedWithCorrelation.map(h => h.adjustedPrice * 17);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const mainHotel = selectedPrincipalHotel ? filteredProcessedWithCorrelation.find(h => h.name === selectedPrincipalHotel) : null;
  const mainHotelPrice = mainHotel ? mainHotel.adjustedPrice * 17 : null;
  const hotelsWithEvent = filteredProcessedWithCorrelation.filter(h => h.hasEvent);
  const hotelsWithSignificantDiff = filteredProcessedWithCorrelation.filter(h => Math.abs(h.percentIncrease) > 10);

  // Sistema de recomendaciones inteligentes
  const recommendations = useMemo(() => {
    if (filteredProcessedWithCorrelation.length === 0) return null;
    
    // Agrupar por tipo de habitación para recomendaciones específicas
    const recommendationsByRoomType = uniqueRoomTypes.map(roomType => {
      const hotelsOfType = filteredProcessedWithCorrelation.filter(h => h.roomType === roomType);
      if (hotelsOfType.length === 0) return null;
      
      // Calcular puntuación para cada hotel
      const scoredHotels = hotelsOfType.map(hotel => {
        let score = 0;
        
        // Puntuación por precio (más barato = mejor)
        const priceScore = 100 - ((hotel.adjustedPrice * 17 - minPrice) / (maxPrice - minPrice)) * 100;
        score += priceScore * 0.4; // 40% del peso
        
        // Puntuación por eventos (sin eventos = mejor para el cliente)
        const eventScore = hotel.hasEvent ? 0 : 100;
        score += eventScore * 0.3; // 30% del peso
        
        // Puntuación por estabilidad de precio (sin ajustes = mejor)
        const stabilityScore = hotel.adjustedPrice === hotel.originalPrice ? 100 : 50;
        score += stabilityScore * 0.2; // 20% del peso
        
        // Puntuación por competitividad (diferencia con el promedio)
        const avgPrice = hotelsOfType.reduce((acc, h) => acc + h.adjustedPrice, 0) / hotelsOfType.length;
        const competitivenessScore = hotel.adjustedPrice <= avgPrice ? 100 : 50;
        score += competitivenessScore * 0.1; // 10% del peso
        
        return { ...hotel, score: Math.round(score) };
      });
      
      // Ordenar por puntuación
      scoredHotels.sort((a, b) => b.score - a.score);
      
      return {
        roomType,
        bestHotel: scoredHotels[0],
        top3: scoredHotels.slice(0, 3),
        avgScore: Math.round(scoredHotels.reduce((acc, h) => acc + h.score, 0) / scoredHotels.length)
      };
    }).filter(Boolean);
    
    return recommendationsByRoomType;
  }, [filteredProcessedWithCorrelation, uniqueRoomTypes, minPrice, maxPrice]);

  // Estadísticas de competitividad
  const competitivenessStats = useMemo(() => {
    if (filteredProcessedWithCorrelation.length === 0) return null;
    
    const stats = uniqueRoomTypes.map(roomType => {
      const hotelsOfType = filteredProcessedWithCorrelation.filter(h => h.roomType === roomType);
      const avgPrice = hotelsOfType.reduce((acc, h) => acc + h.adjustedPrice, 0) / hotelsOfType.length;
      const competitiveHotels = hotelsOfType.filter(h => h.adjustedPrice <= avgPrice);
      const expensiveHotels = hotelsOfType.filter(h => h.adjustedPrice > avgPrice);
      
      return {
        roomType,
        totalHotels: hotelsOfType.length,
        competitiveCount: competitiveHotels.length,
        expensiveCount: expensiveHotels.length,
        competitivePercentage: Math.round((competitiveHotels.length / hotelsOfType.length) * 100),
        avgPrice: avgPrice,
        minPrice: Math.min(...hotelsOfType.map(h => h.adjustedPrice)),
        maxPrice: Math.max(...hotelsOfType.map(h => h.adjustedPrice))
      };
    });
    
    return stats;
  }, [filteredProcessedWithCorrelation, uniqueRoomTypes]);

  return (
    <div>
      {/* Estadísticas del Sistema de Correlación */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Hoteles con Ajustes</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {correlationStats.hotelsWithAdjustment}/{correlationStats.totalHotels}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Eventos Detectados</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">{correlationStats.eventsToday}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Aumento Promedio</p>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                  {correlationStats.avgIncrease.toFixed(1)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-200 dark:border-orange-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Hoteles Afectados</p>
                <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">{correlationStats.hotelsWithEvents}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución de Impacto */}
      {correlationStats.eventsToday > 0 && (
        <Alert className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-gray-700 dark:text-gray-300">
            <strong>Análisis de impacto para {selectedDate}:</strong>{" "}
            {correlationStats.impactDistribution.alto > 0 && `${correlationStats.impactDistribution.alto} hoteles con impacto alto`}
            {correlationStats.impactDistribution.alto > 0 && correlationStats.impactDistribution.medium > 0 && ", "}
            {correlationStats.impactDistribution.medium > 0 && `${correlationStats.impactDistribution.medium} con impacto medio`}
            {(correlationStats.impactDistribution.alto > 0 || correlationStats.impactDistribution.medium > 0) && correlationStats.impactDistribution.low > 0 && ", "}
            {correlationStats.impactDistribution.low > 0 && `${correlationStats.impactDistribution.low} con impacto bajo`}
            . Sistema de correlación automática aplicado.
          </AlertDescription>
        </Alert>
      )}

      {/* Sistema de Recomendaciones Inteligentes */}
      {recommendations && recommendations.length > 0 && (
        <Card className="mb-8 shadow-lg border-0 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
              <Zap className="w-5 h-5" />
              Recomendaciones Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => {
                if (!rec) return null;
                return (
                  <div key={rec.roomType} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                    <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-gray-200">{rec.roomType}</h3>
                    
                    {/* Mejor opción */}
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-600 dark:text-green-400">🏆</span>
                        <span className="font-semibold text-green-800 dark:text-green-200">Mejor opción</span>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-800 dark:text-gray-200">{formatHotelName(rec.bestHotel.name)}</div>
                        <div className="text-green-600 dark:text-green-400 font-bold">{formatPrice(rec.bestHotel.adjustedPrice)}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Puntuación: {rec.bestHotel.score}/100</div>
                      </div>
                    </div>
                    
                    {/* Top 3 */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Top 3 opciones:</div>
                      {rec.top3.map((hotel, index) => (
                        <div key={hotel.name} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {index + 1}. {formatHotelName(hotel.name)}
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {formatPrice(hotel.adjustedPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas de Competitividad */}
      {competitivenessStats && competitivenessStats.length > 0 && (
        <Card className="mb-8 shadow-lg border-0 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <BarChart2 className="w-5 h-5" />
              Análisis de Competitividad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitivenessStats.map((stat) => (
                <div key={stat.roomType} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                  <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-gray-200">{stat.roomType}</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Hoteles competitivos:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {stat.competitiveCount}/{stat.totalHotels}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stat.competitivePercentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {stat.competitivePercentage}% competitivos
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Precio mínimo:</span>
                        <div className="font-medium text-green-600 dark:text-green-400">
                          {formatPrice(stat.minPrice)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Precio máximo:</span>
                        <div className="font-medium text-red-600 dark:text-red-400">
                          {formatPrice(stat.maxPrice)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Promedio: {formatPrice(stat.avgPrice)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros Mejorados */}
      <Card className="mb-8 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 
            Filtros de Correlación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Hotel */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Hotel</label>
              <Select value={searchName} onValueChange={setSearchName}>
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los hoteles</SelectItem>
                  {hotelNames.map((h) => (
                    <SelectItem key={h} value={h}>
                      {formatHotelName(h)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de habitación */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de habitación</label>
              <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas las habitaciones</SelectItem>
                  {roomTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha</label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Fecha" />
                </SelectTrigger>
                <SelectContent className="max-h-64 overflow-y-auto">
                  {uniqueDates.map((d: string) => (
                    <SelectItem key={d} value={d}>
                      {d} {getEventsForDate(d).length > 0 && "🎯"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de ajustes */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mostrar</label>
              <Select value={showOnlyAdjusted ? "adjusted" : "all"} onValueChange={(v) => setShowOnlyAdjusted(v === "adjusted")}>
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los hoteles</SelectItem>
                  <SelectItem value="adjusted">Solo con ajustes de precio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Hotel Principal */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Hotel Principal</label>
              <Select value={selectedPrincipalHotel} onValueChange={setSelectedPrincipalHotel}>
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Seleccionar hotel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin selección</SelectItem>
                  {Array.from(new Set(filteredProcessedWithCorrelation.map(hotel => hotel.name))).map((hotelName) => (
                    <SelectItem 
                      key={hotelName} 
                      value={hotelName}
                    >
                      {formatHotelName(hotelName)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Justo antes de {buildRoomTypeGroups()} */}
      <div className="mb-8 w-full max-w-xl mx-auto flex flex-col gap-2 items-center">
        <div className="flex justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <span>Límite inferior: ${priceRange[0].toLocaleString()} MXN</span>
          <span>Límite superior: ${priceRange[1].toLocaleString()} MXN</span>
        </div>
        <Slider
          min={0}
          max={10000}
          step={100}
          value={priceRange}
          onValueChange={v => setPriceRange(v as [number, number])}
          className="w-full"
        />
        <button
          type="button"
          onClick={() => setPriceRange([1700, 2600])}
          className="mt-2 px-4 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
        >
          Resetear rangos
        </button>
      </div>

      {/* Justo antes del slider y el gráfico */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-center">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={filterEvents} onChange={e => setFilterEvents(e.target.checked)} />
          Solo con eventos
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={filterAdjusted} onChange={e => setFilterAdjusted(e.target.checked)} />
          Solo con ajuste de precio
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={filterSignificantDiff} onChange={e => setFilterSignificantDiff(e.target.checked)} />
          Solo diferencia &gt; 10%
        </label>
      </div>

      {(mainHotel && mainHotelPrice !== null) && (
        <div className="mb-4 w-full max-w-2xl mx-auto">
          {mainHotelPrice === minPrice && (
            <div className="mb-2 p-3 rounded bg-green-100 text-green-800 font-semibold flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              ¡El hotel principal es el más barato en su segmento!
            </div>
          )}
          {mainHotelPrice === maxPrice && (
            <div className="mb-2 p-3 rounded bg-red-100 text-red-800 font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              El hotel principal es el más caro en su segmento.
            </div>
          )}
          {hotelsWithEvent.length > 0 && (
            <div className="mb-2 p-3 rounded bg-blue-100 text-blue-800 font-semibold flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Hay eventos que justifican aumentos de precio en esta fecha.
            </div>
          )}
          {hotelsWithSignificantDiff.length > 0 && (
            <div className="mb-2 p-3 rounded bg-yellow-100 text-yellow-800 font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Hay hoteles con diferencia de precio significativa (&gt;10%) respecto al principal.
            </div>
          )}
        </div>
      )}

      {/* Agrupaciones con Correlación */}
      {buildRoomTypeGroups()}

      {/* Mensaje si no hay resultados */}
      {filteredProcessedWithCorrelation.length === 0 && (
        <Card className="text-center py-12 bg-white dark:bg-gray-800">
          <CardContent>
            <Building className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No hay hoteles disponibles</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {showOnlyAdjusted 
                ? "No hay hoteles con ajustes de precio para los filtros seleccionados."
                : "No hay hoteles disponibles para los filtros seleccionados."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Construir datos para el gráfico de barras */}
      <div className="mb-8 w-full max-w-2xl mx-auto">
        <h3 className="text-lg font-bold mb-2 text-blue-800 dark:text-blue-200">Distribución de hoteles por precio y tipo de habitación</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <XAxis dataKey="tipo" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="Bajo" stackId="a" fill="#34d399" />
            <Bar dataKey="Medio" stackId="a" fill="#fbbf24" />
            <Bar dataKey="Alto" stackId="a" fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RealHotelDashboard; 