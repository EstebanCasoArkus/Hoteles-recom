import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import CustomHotelCalendar from "./CustomHotelCalendar";

interface Hotel {
  id?: number;
  nombre: string;
  estrellas?: number;
  precio_promedio?: number;
  precios_por_dia?: any[];
  fecha?: string;
  precio?: number;
  tipo?: string;
}

interface Event {
  nombre?: string;
  fecha?: string;
  lugar?: string;
  enlace?: string;
  name?: string;
  date?: string;
  venue?: string;
  url?: string;
  hotel_referencia?: string;
}

const HotelCalendarTab: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<string>("");
  const [events, setEvents] = useState<Event[]>([]);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  // Fetch hotels from Supabase
  useEffect(() => {
    const fetchHotels = async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const resp = await fetch(`${backendUrl}/api/hotels`);
      const data = await resp.json();
      setHotels(data);
      if (data.length > 0) setSelectedHotel(data[0].nombre);
    };
    fetchHotels();
  }, []);

  // Agrupa los registros por nombre de hotel y crea precios_por_dia
  const hotelsGrouped = React.useMemo(() => {
    const map = new Map<string, Hotel & { precios_por_dia: any[] }>();
    (Array.isArray(hotels) ? hotels : []).forEach(hotel => {
      if (!map.has(hotel.nombre)) {
        map.set(hotel.nombre, {
          ...hotel,
          precios_por_dia: []
        });
      }
      // Agrega el precio de este registro al array SOLO si tiene fecha, precio y tipo
      if (hotel.fecha && typeof hotel.precio !== 'undefined' && hotel.tipo) {
        map.get(hotel.nombre)!.precios_por_dia.push({
          fecha: hotel.fecha,
          precio: hotel.precio,
          tipo: hotel.tipo
        });
      }
    });
    // Ordena los precios_por_dia por fecha
    map.forEach(hotel => {
      hotel.precios_por_dia.sort((a, b) => a.fecha.localeCompare(b.fecha));
    });
    return Array.from(map.values());
  }, [hotels]);

  const hotelData = React.useMemo(() => {
    return hotelsGrouped.find(h => h.nombre === selectedHotel) || null;
  }, [selectedHotel, hotelsGrouped]);

  // Fetch events for the next 15 days
  useEffect(() => {
    const fetchEvents = async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const resp = await fetch(`${backendUrl}/api/events`);
      const data = await resp.json();
      const now = new Date();
      const in15 = new Date();
      in15.setDate(now.getDate() + 30);
      // Filtrar eventos próximos (15 días) y del hotel seleccionado
      const filtered = data.filter((e: Event) => {
        const dateStr = e.fecha || e.date || "";
        if (!dateStr) return false;
        const eventDate = new Date(dateStr);
        return (
          !isNaN(eventDate.getTime()) &&
          eventDate >= now &&
          eventDate <= in15 
          
        );
      });
      setEvents(filtered);
    };
    if (selectedHotel) fetchEvents();
  }, [selectedHotel]);

  // Generar precios para el calendario
  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month" || !hotelData?.precios_por_dia) return null;
    // Suponemos que precios_por_dia[0] es para hoy, [1] para mañana, etc.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < hotelData.precios_por_dia.length; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
      ) {
        const valor = hotelData.precios_por_dia[i];
        return (
          <div className="flex flex-col items-center mt-1">
            <span className="text-xs font-semibold text-blue-600 bg-blue-100 rounded px-1">
              {typeof valor === 'object' && valor !== null && 'precio' in valor
                ? `$${(valor as any).precio}`
                : `$${valor}`}
            </span>
          </div>
        );
      }
    }
    return null;
  };

  // Filtrar hoteles únicos por nombre para el Select, eligiendo la versión más completa
  const uniqueHotels = React.useMemo(() => {
    const map = new Map();
    (Array.isArray(hotels) ? hotels : []).forEach(hotel => {
      const prev = map.get(hotel.nombre);
      const currScore = Array.isArray(hotel.precios_por_dia)
        ? (typeof hotel.precios_por_dia[0] === 'object' ? 2 : 1)
        : 0;
      const prevScore = prev && Array.isArray(prev.precios_por_dia)
        ? (typeof prev.precios_por_dia[0] === 'object' ? 2 : 1)
        : 0;
      if (!prev || currScore > prevScore) {
        map.set(hotel.nombre, hotel);
      }
    });
    return Array.from(map.values());
  }, [hotels]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Calendario de Precios y Eventos
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Visualiza los precios diarios del hotel y eventos próximos
        </p>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
        <div className="flex flex-col items-start">
          <label className="mb-1 font-medium">Hotel</label>
          <Select value={selectedHotel} onValueChange={setSelectedHotel}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecciona un hotel" />
            </SelectTrigger>
            <SelectContent>
              {hotelsGrouped.map((hotel) => (
                <SelectItem key={hotel.nombre} value={hotel.nombre}>{hotel.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <Card className="p-4 w-full max-w-md mx-auto">
          {hotelData?.precios_por_dia && hotelData.precios_por_dia.length > 0 ? (
            <CustomHotelCalendar 
              precios_por_dia={hotelData.precios_por_dia}
              fecha_inicio={new Date()} 
            />
          ) : (
            <div className="text-gray-400 text-center">No hay datos de precios para este hotel.</div>
          )}
        </Card>
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          Eventos próximos (30 días)
        </h3>
        {events.length === 0 ? (
          <div className="text-gray-500 text-sm">No hay eventos próximos para este hotel.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event, idx) => (
              <div key={event.enlace || event.url || (event.nombre ?? event.name ?? '') + idx} className="border rounded-lg p-4 bg-white dark:bg-gray-900 shadow">
                <div className="font-semibold text-lg mb-1">{event.nombre || event.name}</div>
                <div className="text-sm text-gray-600 mb-1">{event.lugar || event.venue}</div>
                <div className="text-xs text-gray-500 mb-2">{event.fecha || event.date}</div>
                {(event.enlace || event.url) ? (
                  <a
                    href={event.enlace || event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Ver evento
                  </a>
                ) : (
                  <span className="text-gray-400 text-xs">Sin enlace</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx global>{`
        .calendar-custom .react-calendar__tile--active {
          background: #2563eb !important;
          color: #fff !important;
        }
        .calendar-custom .react-calendar__tile--now {
          background: #dbeafe !important;
        }
        .calendar-custom .react-calendar__tile {
          min-height: 60px;
        }
      `}</style>
    </div>
  );
};

export default HotelCalendarTab; 