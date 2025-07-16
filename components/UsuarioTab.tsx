import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/table';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { calculateAdjustedPrice } from '../lib/hotel-correlation';
import { AlertTriangle } from 'lucide-react';

interface HotelUsuarioRow {
  id: number;
  user_id: string;
  hotel_name: string;
  scrape_date: string;
  checkin_date: string;
  room_type: string;
  price: string;
  created_at: string;
}

interface EventRow {
  id?: number;
  nombre?: string;
  fecha?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  lugar?: string;
  [key: string]: any;
}

function formatCurrency(price: number | string | null | undefined) {
  if (price === null || price === undefined || price === '') return '-';
  let n: number;
  if (typeof price === 'string') {
    // Elimina cualquier caracter que no sea número o punto decimal
    n = parseFloat(price.replace(/[^0-9.]/g, ''));
  } else {
    n = price;
  }
  if (isNaN(n)) return '-';
  return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 });
}

export default function UsuarioTab() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [hotelData, setHotelData] = useState<HotelUsuarioRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  if (!session) return <div>No session</div>;

  // Obtener el nombre del hotel del usuario de forma robusta
  const hotelName = session.user.user_metadata?.hotel_name || session.user.user_metadata?.hotel || '';
  const hasHotel = !!hotelName;

  // Información del usuario
  const userName = session.user.user_metadata?.display_name ;
  const userEmail = session.user.email;
  const userId = session.user.id;

  // Cargar datos del usuario
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('hotel_usuario')
        .select('*')
        .eq('user_id', session.user.id)
        .order('checkin_date', { ascending: true });
      setHotelData((data as HotelUsuarioRow[]) || []);
      setLoading(false);
    };
    fetchData();
  }, [session, supabase, scraping, updating]);

  // Cargar eventos del usuario
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        const { data: { session: userSession } } = await supabase.auth.getSession();
        const jwt = userSession?.access_token;
        const response = await fetch(`${backendUrl}/api/events`, {
          headers: jwt ? { 'x-user-jwt': jwt } : undefined
        });
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          setEvents([]);
        }
      } catch {
        setEvents([]);
      }
    };
    fetchEvents();
  }, [supabase]);

  // Ejecutar scraping
  const handleScrape = async () => {
    setScraping(true);
    setLogs([]);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      setLogs(prev => [...prev, `🚀 Ejecutando scraping de mi hotel (${hotelName})...`]);
      // Obtener JWT de la sesión actual
      const { data: { session: userSession } } = await supabase.auth.getSession();
      const jwt = userSession?.access_token;
      const res = await fetch(`${backendUrl}/run-scrape-hotel-propio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: session.user.id,
          hotel_name: hotelName,
          jwt // <-- Enviar el JWT en el body
        })
      });
      const result = await res.json();
      if (!res.ok) {
        setLogs(prev => [...prev, '❌ Error ejecutando el script:', result.error || 'Error desconocido']);
        alert('Error al ejecutar el scraping');
        setScraping(false);
        return;
      }
      setLogs(prev => [...prev, '✅ Script ejecutado correctamente', result.output]);
      setTimeout(() => setScraping(false), 8000);
    } catch (error) {
      setLogs(prev => [...prev, '❌ Error ejecutando el script:', (error as Error).message]);
      alert('Error al ejecutar el scraping');
      setScraping(false);
    }
  };

  // Agrupa los datos por fecha
  const groupedByDate: Record<string, HotelUsuarioRow[]> = useMemo(() => hotelData.reduce((acc, row) => {
    if (!acc[row.checkin_date]) acc[row.checkin_date] = [];
    acc[row.checkin_date].push(row);
    return acc;
  }, {} as Record<string, HotelUsuarioRow[]>), [hotelData]);

  // Precios promedio por día
  const avgPriceByDate: Record<string, number> = useMemo(() => {
    const out: Record<string, number> = {};
    Object.entries(groupedByDate).forEach(([date, rooms]) => {
      const avg = rooms.reduce((sum, r) => {
        let n = typeof r.price === 'string' ? parseFloat(r.price.replace(/[^0-9.]/g, '')) : r.price;
        return sum + (isNaN(n) ? 0 : n);
      }, 0) / rooms.length;
      out[date] = Math.round(avg * 100) / 100;
    });
    return out;
  }, [groupedByDate]);

  // Fechas de eventos
  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    events.forEach(e => {
      if (e.fecha) dates.add(e.fecha);
      if (e.fecha_inicio && e.fecha_fin) {
        let d = new Date(e.fecha_inicio);
        const end = new Date(e.fecha_fin);
        while (d <= end) {
          dates.add(d.toISOString().slice(0, 10));
          d.setDate(d.getDate() + 1);
        }
      }
    });
    return dates;
  }, [events]);

  // Día seleccionado: por defecto el primero con datos
  useEffect(() => {
    if (!selectedDate && Object.keys(groupedByDate).length > 0) {
      setSelectedDate(Object.keys(groupedByDate)[0]);
    }
  }, [groupedByDate, selectedDate]);

  // Precios y ajuste para el día seleccionado
  const selectedRooms = selectedDate ? groupedByDate[selectedDate] || [] : [];
  const isEventDay = selectedDate ? eventDates.has(selectedDate) : false;
  const eventForDay = selectedDate ? events.find(e => e.fecha === selectedDate || (e.fecha_inicio && e.fecha_fin && selectedDate >= e.fecha_inicio && selectedDate <= e.fecha_fin)) : undefined;
  const eventYesterday = selectedDate ? events.find(e => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    const y = d.toISOString().slice(0, 10);
    return e.fecha === y || (e.fecha_inicio && e.fecha_fin && y >= e.fecha_inicio && y <= e.fecha_fin);
  }) : undefined;

  // Recomendar aumento de precio
  const priceRecommendations = useMemo(() => {
    if (!selectedRooms.length) return [];
    return selectedRooms.map(room => {
      const basePrice = typeof room.price === 'string'
        ? parseFloat(room.price.replace(/[^0-9.]/g, ''))
        : room.price;
      // Si hay evento el día anterior, sugerir aumento menor
      if (eventYesterday && !isEventDay) {
        const adj = calculateAdjustedPrice(basePrice, selectedDate!, [eventYesterday]);
        return { ...room, ...adj, type: 'yesterday' };
      }
      // Si hay evento hoy, sugerir aumento mayor
      if (isEventDay && eventForDay) {
        const adj = calculateAdjustedPrice(basePrice, selectedDate!, [eventForDay]);
        return { ...room, ...adj, type: 'today' };
      }
      return { ...room, basePrice, adjustedPrice: basePrice, percentIncrease: 0, type: 'none' };
    });
  }, [selectedRooms, isEventDay, eventForDay, eventYesterday, selectedDate]);

  // Actualizar precios en la base de datos
  const handleAcceptNewRates = async () => {
    setUpdating(true);
    setUpdateMsg(null);
    try {
      for (const rec of priceRecommendations) {
        const originalPrice = typeof rec.price === 'string'
          ? parseFloat(rec.price.replace(/[^0-9.]/g, ''))
          : rec.price;
        if (
          rec.adjustedPrice !== undefined &&
          !isNaN(rec.adjustedPrice) &&
          rec.adjustedPrice !== originalPrice
        ) {
          await supabase
            .from('hotel_usuario')
            .update({ price: rec.adjustedPrice.toString() })
            .eq('id', rec.id);
        }
      }
      setUpdateMsg('Precios actualizados correctamente.');
      setTimeout(() => setUpdateMsg(null), 3000);
    } catch (e) {
      setUpdateMsg('Error al actualizar precios.');
    } finally {
      setUpdating(false);
    }
  };

  // Render custom day for calendar
  function renderDay(day: Date) {
    const dateStr = day.toISOString().slice(0, 10);
    const isEvent = eventDates.has(dateStr);
    const avgPrice = avgPriceByDate[dateStr];
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <span className="text-xs font-medium">
          {day.getDate()}
        </span>
        {avgPrice !== undefined && (
          <span className="text-[10px] text-muted-foreground">{formatCurrency(avgPrice)}</span>
        )}
        {isEvent && (
          <span title="Evento registrado" className="text-yellow-600 flex items-center justify-center mt-0.5">
            <AlertTriangle className="w-3 h-3 mr-0.5" />
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Tarjeta de información del usuario */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div>
              <div className="font-semibold text-lg">{userName}</div>
              <div className="text-sm text-muted-foreground">{userEmail}</div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Cuadro izquierdo: Lista de fechas */}
        <Card className="flex-1 min-w-[320px] max-w-[380px] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-semibold">Lista de precios por día</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Selecciona un día para ver el detalle
              </CardDescription>
            </div>
            <Button onClick={handleScrape} disabled={scraping || !hasHotel} size="sm" className="ml-auto">
              {scraping ? 'Analizando...' : 'Analizar precios de mi hotel'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="max-h-[420px] overflow-y-auto divide-y divide-muted-foreground/10">
              {Object.keys(avgPriceByDate).length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No hay datos registrados.</div>
              ) : (
                Object.entries(avgPriceByDate)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([date, avgPrice]) => {
                    const isEvent = eventDates.has(date);
                    return (
                      <div
                        key={date}
                        className={`flex items-center justify-between px-2 py-2 cursor-pointer rounded transition ${selectedDate === date ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-accent'}`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{date}</span>
                          <span className="text-xs text-muted-foreground">{formatCurrency(avgPrice)}</span>
                        </div>
                        {isEvent && (
                          <span title="Evento registrado">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          </span>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </CardContent>
        </Card>


        {/* Cuadro derecho: Detalle de precios */}
        <Card className="flex-1 min-w-[320px]">
          <CardHeader>
            <CardTitle>Detalle de precios</CardTitle>
            <CardDescription>
              {selectedDate ? `Precios para el ${selectedDate}` : 'Selecciona un día en el calendario'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Si no hay datos para el día seleccionado */}
            {selectedRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[200px]">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
                <div className="text-lg font-semibold text-yellow-700">No hay datos registrados para este día</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de habitación</TableHead>
                    <TableHead>Precio actual</TableHead>
                    {/* Solo mostrar columnas de recomendación si hay sugerencia */}
                    {(isEventDay || eventYesterday) && (
                      <>
                        <TableHead>Recomendado</TableHead>
                        <TableHead>Cambio</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceRecommendations.map((rec, i) => (
                    <TableRow key={rec.id}>
                      <TableCell>{rec.room_type}</TableCell>
                      <TableCell>{formatCurrency(rec.price)}</TableCell>
                      {(isEventDay || eventYesterday) && (
                        <>
                          <TableCell>
                            {rec.adjustedPrice !== undefined && rec.adjustedPrice !== parseFloat(rec.price) ? (
                              <span className="font-semibold text-yellow-700">{formatCurrency(rec.adjustedPrice)}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {rec.percentIncrease > 0 ? (
                              <Badge variant="secondary">+{rec.percentIncrease}%</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {/* Mensaje y botón de recomendación solo si hay sugerencia */}
            {(isEventDay || eventYesterday) && selectedRooms.length > 0 && (
              <>
                <div className="mt-4 p-3 rounded bg-yellow-50 border border-yellow-300 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="text-black dark">
                    {isEventDay && eventForDay && (
                      <>Día de evento registrado (<b>{eventForDay.nombre || eventForDay.titulo}</b>). Se recomienda aumentar los precios.</>
                    )}
                    {!isEventDay && eventYesterday && (
                      <>Un evento está registrado el día anterior (<b>{eventYesterday.nombre || eventYesterday.titulo}</b>). Se recomienda un aumento moderado.</>
                    )}
                  </span>
                </div>
                <div className="mt-4">
                  <Button onClick={handleAcceptNewRates} disabled={updating}>
                    {updating ? 'Actualizando...' : 'Aceptar nuevas cuotas sugeridas'}
                  </Button>
                  {updateMsg && <div className="mt-2 text-sm text-green-700">{updateMsg}</div>}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Logs de scraping */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Logs de Scraping</CardTitle>
            <CardDescription>Mensajes recientes de la ejecución</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-48 overflow-y-auto space-y-1 text-sm font-mono bg-muted/30 rounded p-2 border">
              {logs.length === 0 ? (
                <span className="text-muted-foreground">No hay logs recientes.</span>
              ) : (
                logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 