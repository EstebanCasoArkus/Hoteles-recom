"use client";

import React, { useState } from "react";
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
  CalendarDays
} from "lucide-react";
import RealHotelDashboard from "./real-hotel-dashboard";
import { PriceCalendar } from "./PriceCalendar";
import { HotelsTab } from "./HotelsTab";
import { PreciosTab } from "./PreciosTab";
import { AnalyticsTab } from "./AnalyticsTab";

interface TabbedDashboardProps {
  // Props para pasar datos a las diferentes pestañas
}

export const TabbedDashboard: React.FC<TabbedDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState("overview");

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
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
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
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Calendario</span>
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
          <TabsContent value="overview" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Resumen del Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Vista general de la correlación entre hoteles y eventos
              </p>
            </div>
            
            {/* Aquí irá el contenido del dashboard actual */}
            <RealHotelDashboard />
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
                Calendario de Precios
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Visualiza los precios del hotel principal por día
              </p>
            </div>
            
            <PriceCalendar />
          </TabsContent>

          {/* Pestaña de Eventos */}
          <TabsContent value="events" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Gestión de Eventos
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Administra eventos y su impacto en los precios hoteleros
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Eventos de Julio 2025
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Contenido de la gestión de eventos se implementará aquí...
                </p>
              </CardContent>
            </Card>
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