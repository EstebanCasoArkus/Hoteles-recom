"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Building2, 
  Calendar, 
  TrendingUp, 
  Filter,
  Hotel,
  DollarSign,
  CalendarDays,
  Zap
} from "lucide-react";
import RealHotelDashboard from "./real-hotel-dashboard";
import { HotelsTab } from "./HotelsTab";
import { PreciosTab } from "./PreciosTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { EventsTab } from "./EventsTab";
import { useBackendAPI } from "../hooks/use-backend-api";

interface TabbedDashboardProps {
  // Props para pasar datos a las diferentes pestañas
}

export const TabbedDashboard: React.FC<TabbedDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { hotels, stats, loading } = useBackendAPI();
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Obtener eventos
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xvwnwzlppenrtzxfwjax.supabase.co';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2d253emxwcGVucnR6eGZ3amF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjQyMzgsImV4cCI6MjA2NzE0MDIzOH0.e9rwMsihJfV8PIXX6mWLMtZS9KEO3R5GnE7tbcEapxA';
        
        const response = await fetch(`${supabaseUrl}/rest/v1/events?select=*&order=created_at.desc`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Componente de resumen
  const DashboardSummary = () => {
    if (loading || loadingEvents) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando resumen...</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 w-full max-w-7xl mx-auto">
        {/* Resumen de Hoteles */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 w-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Resumen de Hoteles
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                  {hotels.length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Total de Hoteles
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                  {stats ? formatPrice(stats.avg_price) : 'N/A'}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Precio Promedio
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                  {stats ? formatPrice(stats.price_range.max) : 'N/A'}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Precio Máximo
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de Eventos */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 w-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Resumen de Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-800 dark:text-purple-200">
                  {events.length}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  Total de Eventos
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-800 dark:text-purple-200">
                  {events.length > 0 ? 'Disponibles' : 'Sin eventos'}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  Estado
                </div>
              </div>
            </div>
            {events.length > 0 && (
              <div className="mt-3">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                  Eventos Recientes:
                </h4>
                <div className="space-y-2">
                  {events.slice(0, 3).map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        {event.nombre}
                      </span>
                      <span className="text-xs text-purple-600 dark:text-purple-400">
                        {event.fecha}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones Rápidas */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 w-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setActiveTab("hotels")}
                className="flex items-center gap-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
              >
                <Building2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Ver Hoteles</span>
              </button>
              <button 
                onClick={() => setActiveTab("events")}
                className="flex items-center gap-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
              >
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Ver Eventos</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 font-inter antialiased text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm py-4 px-6 flex items-center justify-between sticky top-0 z-10 rounded-b-xl border-b border-blue-100 dark:border-gray-700 transition-colors duration-300">
        <div className="flex items-center">
          <Hotel className="h-7 w-7 text-blue-600 dark:text-blue-400 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Hotel Dashboard con Correlación
          </h1>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col items-center">
          <TabsList className="flex flex-row justify-center items-center gap-2 mb-8 w-full max-w-4xl mx-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Hoteles</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Precios</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Eventos</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Análisis</span>
            </TabsTrigger>
          </TabsList>

          {/* Pestaña de Resumen */}
          <TabsContent value="overview" className="space-y-4">
            <DashboardSummary />
          </TabsContent>

          {/* Pestaña de Hoteles */}
          <TabsContent value="hotels" className="space-y-6">
            <HotelsTab />
          </TabsContent>

          {/* Pestaña de Precios */}
          <TabsContent value="pricing" className="space-y-6">
            <PreciosTab />
          </TabsContent>

          {/* Pestaña de Calendario */}
          <TabsContent value="calendar" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Calendario de Precios y Eventos
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Visualiza los precios del hotel y eventos por día
              </p>
            </div>
          </TabsContent>

          {/* Pestaña de Eventos */}
          <TabsContent value="events" className="space-y-6">
            <EventsTab />
          </TabsContent>

          {/* Pestaña de Análisis */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}; 