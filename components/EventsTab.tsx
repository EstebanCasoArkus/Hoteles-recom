"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Event {
  id?: string;
  nombre?: string;
  fecha?: string;
  lugar?: string;
  enlace?: string;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
  hotel_referencia?: string;
  created_at?: string;
  name?: string;
  date?: string;
  venue?: string;
  url?: string;
}

export const EventsTab: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Buscar eventos automáticamente usando las coordenadas del hotel del usuario
  const handleStartScraping = async () => {
    setIsRunning(true);
    setLogs([]);
    setError(null);
    try {
      // Obtener el usuario autenticado y su hotel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("No se encontró el usuario autenticado. Por favor, inicia sesión de nuevo.");
        setIsRunning(false);
        return;
      }
      const hotelName = user.user_metadata?.hotel;
      const userId = user.id;
      const { data: { session } } = await supabase.auth.getSession();
      const jwt = session?.access_token;
      // Ejecutar el scraping de eventos usando el hotel principal del usuario
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      setLogs(prev => [...prev, `🚀 Buscando eventos cerca de tu hotel (${hotelName})...`]);
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (jwt) (headers as Record<string, string>)['x-user-jwt'] = jwt;
      const response = await fetch(`${backendUrl}/run-scrapeo-geo`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ hotel_name: hotelName, radius: 10 })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Error ejecutando el script');
      }
      setLogs(prev => [...prev, '✅ Script ejecutado correctamente', result.output]);
      // Espera un poco para que los datos se suban a Supabase
      setTimeout(async () => {
        setLogs(prev => [...prev, '🔄 Actualizando datos desde Supabase...']);
        await fetchEvents();
        setIsRunning(false);
        setLogs(prev => [...prev, '✅ Datos actualizados automáticamente']);
      }, 3000);
    } catch (error) {
      setError((error as Error).message);
      setIsRunning(false);
      setLogs(['❌ Error ejecutando el script: ' + (error as Error).message]);
    }
  };

  // Fetch eventos del backend (ya filtrados por usuario)
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setEvents([]);
        setLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      const jwt = session?.access_token;
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/events`, {
        headers: jwt ? { 'x-user-jwt': jwt } : undefined
      });
      if (!response.ok) {
        throw new Error('Error fetching events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Gestión de Eventos
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Visualiza eventos cercanos a tu hotel registrado
        </p>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 mb-6">
        <Button onClick={handleStartScraping} disabled={isRunning} className="w-full max-w-xs">
          {isRunning ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Calendar className="mr-2 h-4 w-4" />}
          Buscar eventos cerca de mi hotel
        </Button>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {/* Lista de eventos */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          Eventos encontrados
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2">Cargando eventos...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay eventos disponibles
            </h3>
            <p className="text-gray-600">
              Haz clic en el botón para buscar eventos cerca de tu hotel
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event, idx) => (
              <Card key={event.id || idx}>
                <CardHeader>
                  <CardTitle>{event.nombre || event.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {event.fecha || event.date}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {event.lugar || event.venue}
                  </div>
                  {event.enlace || event.url ? (
                    <a href={event.enlace || event.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">Ver más</a>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {/* Logs Section */}
      {logs.length > 0 && (
        <div className="bg-slate-900 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Registro de Ejecución
          </h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm text-green-400 font-mono">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 