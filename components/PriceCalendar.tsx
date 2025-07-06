"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarDays, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { type Event, type Hotel } from "../lib/hotel-correlation";

// Empty data structures since simulated data has been removed
const hotelData = {
  data: {
    hotels: [] as Hotel[]
  }
};

const eventsData = {
  eventos_julio_2025: [] as Event[]
};

interface PriceCalendarProps {
  selectedHotel?: string;
  selectedRoomType?: string;
}

export const PriceCalendar: React.FC<PriceCalendarProps> = ({
  selectedHotel = "Grand Hotel Tijuana",
  selectedRoomType = "Suite"
}) => {
  const [currentHotel, setCurrentHotel] = useState(selectedHotel);
  const [currentRoomType, setCurrentRoomType] = useState(selectedRoomType);

  // Obtener datos del hotel seleccionado
  const hotelDataForCalendar = useMemo(() => {
    const hotel = hotelData.data.hotels.find(h => h.name === currentHotel);
    if (!hotel) return null;

    const room = hotel.rooms.find(r => r.type === currentRoomType);
    if (!room) return null;

    return {
      hotel: hotel,
      room: room,
      prices: room.prices
    };
  }, [currentHotel, currentRoomType]);

  // Obtener eventos para las fechas
  const eventsForDates = useMemo(() => {
    const events = eventsData.eventos_julio_2025;
    const eventMap = new Map<string, any[]>();
    
    events.forEach(event => {
      const date = event.fecha || event.fecha_inicio;
      if (date) {
        if (!eventMap.has(date)) {
          eventMap.set(date, []);
        }
        eventMap.get(date)!.push(event);
      }
    });
    
    return eventMap;
  }, []);

  // Generar días del mes de julio
  const daysInJuly = useMemo(() => {
    const days = [];
    for (let day = 1; day <= 31; day++) {
      const date = `2025-07-${day.toString().padStart(2, '0')}`;
      const price = hotelDataForCalendar?.prices.find(p => p.date === date);
      const events = eventsForDates.get(date) || [];
      
      days.push({
        date,
        day,
        price: price?.price || null,
        events,
        hasEvent: events.length > 0
      });
    }
    return days;
  }, [hotelDataForCalendar, eventsForDates]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const prices = daysInJuly.map(d => d.price).filter(p => p !== null) as number[];
    if (prices.length === 0) return null;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const daysWithEvents = daysInJuly.filter(d => d.hasEvent).length;

    return {
      minPrice,
      maxPrice,
      avgPrice,
      daysWithEvents,
      totalDays: daysInJuly.length
    };
  }, [daysInJuly]);

  if (!hotelDataForCalendar) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No se encontraron datos
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No hay datos disponibles para el hotel y tipo de habitación seleccionados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Configuración del Calendario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Hotel
              </label>
              <Select value={currentHotel} onValueChange={setCurrentHotel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hotelData.data.hotels.map((hotel) => (
                    <SelectItem key={hotel.name} value={hotel.name}>
                      {hotel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo de Habitación
              </label>
              <Select value={currentRoomType} onValueChange={setCurrentRoomType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hotelDataForCalendar.hotel.rooms.map((room) => (
                    <SelectItem key={room.type} value={room.type}>
                      {room.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Precio Mínimo</p>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                    ${stats.minPrice.toFixed(2)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400">Precio Máximo</p>
                  <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                    ${stats.maxPrice.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Precio Promedio</p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    ${stats.avgPrice.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Días con Eventos</p>
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                    {stats.daysWithEvents}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calendario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendario de Precios - Julio 2025
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Días de la semana */}
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div key={day} className="text-center p-2 font-semibold text-gray-600 dark:text-gray-400 text-sm">
                {day}
              </div>
            ))}

            {/* Días del mes */}
            {daysInJuly.map((dayData) => {
              const isToday = dayData.date === '2025-07-15'; // Ejemplo: día actual
              const priceColor = dayData.price && stats ? 
                (dayData.price === stats.minPrice ? 'text-green-600' : 
                 dayData.price === stats.maxPrice ? 'text-red-600' : 'text-gray-700') : 'text-gray-400';

              return (
                <div
                  key={dayData.date}
                  className={`
                    p-2 border rounded-lg text-center cursor-pointer transition-all duration-200
                    ${isToday ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600' : 
                      dayData.hasEvent ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700' :
                      'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}
                    hover:shadow-md hover:scale-105
                  `}
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {dayData.day}
                  </div>
                  
                  {dayData.price ? (
                    <div className={`text-xs font-bold ${priceColor} dark:text-gray-300`}>
                      ${dayData.price.toFixed(0)}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">-</div>
                  )}

                  {dayData.hasEvent && (
                    <div className="mt-1">
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {dayData.events.length} evento{dayData.events.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  )}

                  {isToday && (
                    <div className="mt-1">
                      <Badge className="text-xs px-1 py-0 bg-blue-600">
                        Hoy
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leyenda */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Leyenda</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Precio más bajo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Precio más alto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-50 border border-orange-200 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Día con eventos</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 