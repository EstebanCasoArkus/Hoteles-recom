"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  Search, 
  MapPin, 
  Music2, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  Play,
  Users,
  Clock,
  Building2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Event {
  id?: string;
  nombre: string;
  fecha: string;
  lugar: string;
  enlace: string;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
  hotel_referencia?: string;
  created_at?: string;
}

interface EventStats {
  total_events: number;
  avg_distance: number;
  events_this_month: number;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDistance = (distance: number) => {
  return `${distance.toFixed(1)} km`;
};

export const EventsTab: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<string>("Grand Hotel Tijuana");

  // Lista de hoteles disponibles con sus coordenadas
  // Esta lista se puede actualizar desde el archivo hotel_coordinates.py
  const availableHotels = [
    "Grand Hotel Tijuana",
    "Hotel Real del Río",
    "Hotel Pueblo Amigo",
    "Hotel Ticuan",
    "Hotel Lucerna",
    "Hotel Fiesta Inn",
    "Hotel Marriott",
    "Hotel Holiday Inn",
    "Hotel Best Western",
    "Hotel Comfort Inn"
  ];

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Faltan variables de entorno de Supabase. Revisa tu archivo .env");
      }
      
      const response = await fetch(`${supabaseUrl}/rest/v1/events?select=*&order=created_at.desc`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error fetching events');
      }
      
      const data = await response.json();
      setEvents(data);
      
      // Calculate stats
      const totalEvents = data.length;
      const avgDistance = data.length > 0 
        ? data.reduce((sum: number, event: Event) => sum + (event.distance_km || 0), 0) / data.length 
        : 0;
      const eventsThisMonth = data.filter((event: Event) => {
        const eventDate = new Date(event.fecha);
        const now = new Date();
        return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
      }).length;
      
      setStats({
        total_events: totalEvents,
        avg_distance: avgDistance,
        events_this_month: eventsThisMonth
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleStartScraping = async () => {
    setIsRunning(true);
    setLogs([]);

    try {
      console.log('🚀 Iniciando scraping de eventos...');
      setLogs([`🚀 Iniciando scraping de eventos cerca de ${selectedHotel}...`]);
      
      // Ejecuta el script de scraping de eventos con el hotel seleccionado
      const response = await fetch('http://localhost:5000/run-scrapeo-geo', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hotel_name: selectedHotel })
      });
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error ejecutando el script');
      }
      
      console.log('✅ Script ejecutado correctamente');
      setLogs(prev => [...prev, '✅ Script ejecutado correctamente', result.output]);
      
      // Espera un poco para que los datos se suban a Supabase
      setTimeout(async () => {
        console.log('🔄 Actualizando datos desde Supabase...');
        setLogs(prev => [...prev, '🔄 Actualizando datos desde Supabase...']);
        
        await fetchEvents();
        setIsRunning(false);
        
        console.log('✅ Datos actualizados automáticamente');
        setLogs(prev => [...prev, '✅ Datos actualizados automáticamente']);
      }, 3000);
      
    } catch (error) {
      console.error('Error running script:', error);
      setIsRunning(false);
      setLogs(['❌ Error ejecutando el script: ' + (error as Error).message]);
    }
  };

  const handleRefresh = () => {
    fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Gestión de Eventos
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Administra y visualiza eventos cercanos en Tijuana
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Hotel Selection Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Seleccionar Hotel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Elige el hotel desde donde buscar eventos cercanos
            </p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Hotel de Referencia
              </label>
              <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Selecciona un hotel" />
                </SelectTrigger>
                <SelectContent>
                  {availableHotels.map((hotel) => (
                    <SelectItem key={hotel} value={hotel}>
                      {hotel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 p-2 rounded">
              <strong>Hotel seleccionado:</strong> {selectedHotel}
            </div>
          </CardContent>
        </Card>

        {/* Scraping Button Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-600" />
              Scraping de Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ejecuta el script para obtener eventos cercanos desde Eventbrite
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              El script busca eventos musicales en un radio de 20km desde {selectedHotel}
            </p>
            
            <Button
              onClick={handleStartScraping}
              disabled={isRunning}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Buscando eventos...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Ejecutar Scraping
                </>
              )}
            </Button>

            {/* Logs Section */}
            {logs.length > 0 && (
              <div className="bg-slate-900 rounded-lg p-4">
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
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Estadísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Eventos:</span>
                  <span className="font-semibold">{stats.total_events}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Distancia Promedio:</span>
                  <span className="font-semibold">{formatDistance(stats.avg_distance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Eventos este mes:</span>
                  <span className="font-semibold">{stats.events_this_month}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 mx-auto animate-spin text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">Cargando estadísticas...</p>
              </div>
            )}
            
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Conexión Supabase:</span>
                <Badge variant={error ? "destructive" : "default"}>
                  {error ? "Error" : "Conectado"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Backend:</span>
                <Badge variant="default">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Última actualización:</span>
                <span className="text-xs text-gray-500">
                  {events.length > 0 && events[0].created_at 
                    ? formatDate(events[0].created_at) 
                    : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music2 className="w-5 h-5" />
            Eventos Encontrados ({events.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-400" />
              <p className="text-gray-500 mt-2">Cargando eventos...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Music2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p>No se encontraron eventos</p>
              <p className="text-sm">Ejecuta el scraping para obtener eventos cercanos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <Card key={event.id || event.nombre} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {event.nombre}
                        </CardTitle>
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{event.fecha}</span>
                        </div>
                      </div>
                      {event.distance_km && (
                        <Badge variant="secondary" className="ml-2">
                          {formatDistance(event.distance_km)}
                        </Badge>
                      )}
                      {event.hotel_referencia && (
                        <Badge variant="outline" className="ml-1 text-xs">
                          Desde: {event.hotel_referencia}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{event.lugar}</span>
                      </div>
                      
                      {event.created_at && (
                        <div className="text-xs text-gray-500">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Creado: {formatDate(event.created_at)}
                        </div>
                      )}
                      
                      {event.enlace && event.enlace !== "Sin enlace" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => window.open(event.enlace, '_blank')}
                        >
                          Ver Evento
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 