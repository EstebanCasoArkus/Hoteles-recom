"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    setLogs([]);

    try {
      console.log('🚀 Iniciando scraping de hoteles...');
      setLogs(['🚀 Iniciando scraping de hoteles...']);
      
      // Ejecuta el script de scraping
      const response = await fetch('http://localhost:5000/run-scrape-hotels', { method: 'POST' });
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
        
        await fetchHotels();
        setIsRunning(false);
        
        console.log('✅ Datos actualizados automáticamente');
        setLogs(prev => [...prev, '✅ Datos actualizados automáticamente']);
      }, 3000); // Aumentamos el tiempo a 3 segundos para asegurar que los datos estén en Supabase
      
    } catch (error) {
      console.error('Error running script:', error);
      setIsRunning(false);
      setLogs(['❌ Error ejecutando el script: ' + (error as Error).message]);
    }
  };

  const handleRefresh = () => {
    fetchHotels();
  };

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
              {(Array.isArray(hotels) ? hotels : []).map((hotel) => (
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