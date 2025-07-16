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
  Zap,
  User
} from "lucide-react";
import RealHotelDashboard from "./real-hotel-dashboard";
import { HotelsTab } from "./HotelsTab";
import { PreciosTab } from "./PreciosTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { EventsTab } from "./EventsTab";
import { useBackendAPI } from "../hooks/use-backend-api";
import HotelCalendarTab from "./HotelCalendarTab";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import UsuarioTab from "./UsuarioTab";

interface TabbedDashboardProps {
  // Props para pasar datos a las diferentes pestañas
}

export const TabbedDashboard: React.FC<TabbedDashboardProps> = () => {
 
  const [activeTab, setActiveTab] = useState("usuario");
  const { hotels, stats, loading } = useBackendAPI();
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();

  // Obtener perfil de usuario autenticado
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('Perfil de usuario obtenido:', user, error);
      if (user) {
        // Log completo de user_metadata para depuración
        console.log('user_metadata:', user.user_metadata);
        setUserProfile({
          name: user.user_metadata?.name || user.email,
          email: user.email,
          hotel: user.user_metadata?.hotel || "",
          hotelId: user.user_metadata?.hotelId ?? "NO HOTEL ID EN METADATA",
          hotelUrl: user.user_metadata?.hotelUrl || "",
          geoCode: user.user_metadata?.geoCode ?? "NO GEO EN METADATA"
        });
      } else {
        setUserProfile(null);
      }
    };
    fetchProfile();
  }, []);

  // Obtener eventos
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log("Intentando fetch de eventos con user_id:", user?.id);
        if (!user || !user.id) {
          console.error('No hay usuario autenticado o user_id es inválido');
          setEvents([]);
          setLoadingEvents(false);
          return;
        }
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/events?user_id=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          const errorText = await response.text();
          console.error('Error fetching events:', response.status, response.statusText, errorText);
          setEvents([]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Componente de resumen
  const DashboardSummary = () => {
    // Buscar el hotel principal del usuario
    // const mainHotel = hotels && hotels.length > 0 ? hotels[0] : null;
    const hotelId = userProfile?.hotelId || 'N/A';
    let geoCode: any = userProfile?.geoCode;
    let lat = 'N/A';
    let lng = 'N/A';
    if (geoCode && typeof geoCode === 'string') {
      try {
        // Si es string y parece JSON, intenta parsear
        if (geoCode.startsWith('{') && geoCode.endsWith('}')) {
          geoCode = JSON.parse(geoCode);
        }
      } catch (e) {
        console.warn('geoCode no es un JSON válido:', geoCode);
      }
    }
    if (geoCode && typeof geoCode === 'object') {
      lat = geoCode.latitude ?? 'NO LAT';
      lng = geoCode.longitude ?? 'NO LNG';
    } else if (geoCode && typeof geoCode === 'string' && geoCode !== 'NO GEO EN METADATA') {
      // Si es string pero no JSON, mostrar el string
      lat = geoCode;
      lng = geoCode;
    }

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
        {/* Información del usuario */}
        {userProfile === null && (
          <div className="mb-4 p-4 rounded-lg bg-red-100 text-red-800 border">No se encontró información de usuario. ¿Estás autenticado?</div>
        )}
        {userProfile && (
          <div className="mb-4 p-4 rounded-lg bg-white/80 dark:bg-gray-900/80 border flex flex-col md:flex-row md:items-center gap-2 md:gap-6 shadow">
            <div>
              <div className="font-bold text-lg text-blue-800 dark:text-blue-200">{userProfile.name}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">{userProfile.email}</div>
              <div className="text-sm text-blue-700 dark:text-blue-400 font-semibold">Hotel: {userProfile.hotel}</div>
              <div className="text-xs text-gray-500">HotelId: {hotelId}</div>
              <div className="text-xs text-gray-500">Coordenadas: {lat}, {lng}</div>
              {hotelId === 'NO HOTEL ID EN METADATA' && (
                <div className="text-xs text-red-600">No se encontró hotelId en el perfil</div>
              )}
              {userProfile.geoCode === 'NO GEO EN METADATA' && (
                <div className="text-xs text-red-600">No se encontró geoCode en el perfil</div>
              )}
              {userProfile.hotelUrl && (
                <div className="text-xs text-blue-600 underline"><a href={userProfile.hotelUrl} target="_blank">Ver sitio del hotel</a></div>
              )}
            </div>
          </div>
        )}
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
        <button
          onClick={handleLogout}
          className="ml-4 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold shadow"
        >
          Cerrar sesión
        </button>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendario</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Análisis</span>
            </TabsTrigger>
            <TabsTrigger value="usuario" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Usuario</span>
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
            <HotelCalendarTab />
          </TabsContent>

          {/* Pestaña de Eventos */}
          <TabsContent value="events" className="space-y-6">
            <EventsTab />
          </TabsContent>

          {/* Pestaña de Análisis */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab />
          </TabsContent>

          {/* Pestaña de Usuario */}
          <TabsContent value="usuario" className="space-y-6">
            <UsuarioTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}; 