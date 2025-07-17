"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Building2, 
  Search, 
  Star, 
  DollarSign, 
  Calendar,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  X,
  Play
} from "lucide-react";
import { useBackendAPI, type Hotel, type HotelStats } from "../hooks/use-backend-api";
import { createClient } from '@supabase/supabase-js';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const renderStars = (stars: number) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < stars ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-sm text-gray-600 ml-1">({stars})</span>
    </div>
  );
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);



export const HotelsTab: React.FC = () => {
  const {
    hotels,
    loading,
    error,
    stats,
    fetchHotels,
  } = useBackendAPI();

  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const handleStartScraping = async () => {
    setIsRunning(true);
    setLogs([]); // Limpia los logs al iniciar
    // Obtén el usuario autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user) {
      setLogs(['❌ Debes iniciar sesión para usar esta función.']);
      setIsRunning(false);
      return;
    }
    const user_id = user.id;
  
    try {
      setLogs(prev => [...prev, '🚀 Ejecutando scraping de hoteles...']);
      const response = await fetch('https://backend-py-7tos.onrender.com/run-scrape-hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id }),
      });
      const data = await response.json();
      if (response.ok) {
        setLogs(prev => [
          ...prev,
          '✅ Scraping completado correctamente.',
          data.output || ''
        ]);
        await fetchHotels();
      } else {
        setLogs(prev => [
          ...prev,
          `❌ Error ejecutando el scraping: ${data.error || 'Error desconocido'}`,
          data.details ? `Detalles: ${data.details}` : ''
        ]);
      }
    } catch (err) {
      setLogs(prev => [
        ...prev,
        '❌ Error de red o del servidor.',
        (err as Error).message
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRefresh = () => {
    fetchHotels();
  };

  // Filtrar hoteles únicos por nombre y solo datos reales
  const uniqueRealHotels = React.useMemo(() => {
    const seen = new Set();
    return (Array.isArray(hotels) ? hotels : [])
      .filter(hotel => {
        // Si el hotel ya fue visto por nombre, lo omitimos
        if (seen.has(hotel.nombre)) return false;
        seen.add(hotel.nombre);
        // Si tiene precios_por_dia, aseguramos que tenga al menos un precio real
        if (hotel.precios_por_dia && Array.isArray(hotel.precios_por_dia)) {
          return hotel.precios_por_dia.some((p: any) => p.tipo === 'real');
        }
        // Si no tiene precios_por_dia, lo mostramos igual
        return true;
      });
  }, [hotels]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Gestión de Hoteles
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Administra y visualiza información detallada de todos los hoteles
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Search Button Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Análisis de Precios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ejecuta el script para obtener precios promedio de hoteles en Tijuana
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              El script analiza precios durante 15 días para calcular promedios precisos
            </p>
            
            <Button
              onClick={handleStartScraping}
              disabled={isRunning}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Ejecutar Análisis
                </>
              )}
            </Button>

            {/* Logs Section */}
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
                  <span className="text-sm text-gray-600">Total Hoteles:</span>
                  <span className="font-semibold">{stats.total_hotels}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Precio Promedio:</span>
                  <span className="font-semibold">{formatPrice(stats.avg_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rango de Precios:</span>
                  <span className="font-semibold">
                    {formatPrice(stats.price_range.min)} - {formatPrice(stats.price_range.max)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Actualizado: {formatDate(stats.last_updated)}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Cargando estadísticas...</p>
            )}
          </CardContent>
        </Card>

        {/* Refresh Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-600" />
              Actualizar Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Actualiza la lista de hoteles desde la base de datos
            </p>
            
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {loading ? "Actualizando..." : "Actualizar Lista"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Hotels List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Lista de Hoteles ({hotels.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2">Cargando hoteles...</span>
            </div>
          ) : hotels.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay hoteles disponibles
              </h3>
              <p className="text-gray-600">
                Ejecuta una búsqueda para obtener datos de hoteles
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uniqueRealHotels.map((hotel) => (
                <Card key={hotel.id || hotel.nombre} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {hotel.nombre}
                        </CardTitle>
                        <div className="mt-2">
                          {renderStars(hotel.estrellas)}
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {hotel.noches_contadas} noches
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Precio Promedio:</span>
                        <span className="text-xl font-bold text-green-600">
                          {formatPrice(hotel.precio_promedio)}
                        </span>
                      </div>
                      
                      {hotel.created_at && (
                        <div className="text-xs text-gray-500">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Creado: {formatDate(hotel.created_at)}
                        </div>
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