import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users, Music2 } from "lucide-react";
import { Event } from "@/lib/hotel-correlation";

interface EventsSectionProps {
  events: Event[];
  selectedDate: string;
  range: 'day' | 'week1' | 'week2' | 'week3' | 'week4' | 'month';
}

const weekRanges = {
  week1: ["2025-07-01", "2025-07-07"],
  week2: ["2025-07-08", "2025-07-14"],
  week3: ["2025-07-15", "2025-07-21"],
  week4: ["2025-07-22", "2025-07-31"],
};

function isEventInRange(event: Event, selectedDate: string, range: 'day' | 'week1' | 'week2' | 'week3' | 'week4' | 'month') {
  const eventStart = new Date(event.fecha || event.fecha_inicio || "");
  const eventEnd = event.fecha_fin ? new Date(event.fecha_fin) : eventStart;
  const sel = new Date(selectedDate);
  if (range === 'day') {
    return sel >= eventStart && sel <= eventEnd;
  }
  if (range.startsWith('week')) {
    const [start, end] = weekRanges[range as keyof typeof weekRanges];
    const weekStart = new Date(start);
    const weekEnd = new Date(end);
    return eventEnd >= weekStart && eventStart <= weekEnd;
  }
  if (range === 'month') {
    return (
      eventStart.getFullYear() === sel.getFullYear() &&
      eventStart.getMonth() === sel.getMonth()
    );
  }
  return false;
}

export function EventsSection({ events, selectedDate, range }: EventsSectionProps) {
  const filtered = events.filter(e => isEventInRange(e, selectedDate, range));
  return (
    <div className="w-full bg-blue-900/80 rounded-2xl p-4 shadow-md mb-6">
      <h2 className="text-lg font-semibold text-blue-100 mb-4 flex items-center gap-2">
        <Music2 className="w-5 h-5" /> Relevant Events
      </h2>
      {filtered.length === 0 && (
        <div className="text-blue-200 text-sm">No events found for this period.</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((event, idx) => (
          <Card key={idx} className="bg-blue-800/80 border-blue-700 text-blue-100">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Music2 className="w-4 h-4" />
                <span className="font-semibold">{event.titulo}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <Calendar className="w-3 h-3" />
                <span>{event.fecha || event.fecha_inicio}{event.fecha_fin && ` - ${event.fecha_fin}`}</span>
                {event.lugar && (<><MapPin className="w-3 h-3 ml-2" />{event.lugar}</>)}
              </div>
            </CardHeader>
            <CardContent className="text-xs text-blue-200">
              {event.descripcion && <div className="mb-1">{event.descripcion}</div>}
              {event.tipo_evento && <div className="italic">Type: {event.tipo_evento}</div>}
              {event.estado && <div>Status: {event.estado}</div>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 