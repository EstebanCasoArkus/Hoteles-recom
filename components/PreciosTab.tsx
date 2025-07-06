"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Star,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  Filter,
  RefreshCw,
  Download,
  Share2,
  BookOpen,
  Calendar,
  MapPin,
  Users,
  Building2,
  Activity
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  LineChart as RechartsLineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  ZAxis,
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  ComposedChart,
  Legend
} from 'recharts';
import { useBackendAPI, type Hotel } from "../hooks/use-backend-api";
import { PriceHeatmap } from "./charts/PriceHeatmap";
import { TrendSparklines } from "./charts/TrendSparklines";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

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
  });
};

// Error boundary para gráficas
class ChartErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return <div className="text-red-500 text-center py-8">Error en la gráfica. Intenta recargar o cambiar de pestaña.</div>;
    }
    return this.props.children;
  }
}

// Tooltip personalizado con mejor diseño visual
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 p-4 border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl backdrop-blur-sm">
      <div className="space-y-2">
        <div className="border-b border-gray-200 dark:border-gray-600 pb-2 mb-2">
          <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
            {typeof label === 'number' ? `${label} estrellas` : label}
          </p>
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {entry.name}
              </span>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PreciosTab: React.FC = () => {
  const { hotels, loading, error, stats } = useBackendAPI();
  
  // Error boundary para Recharts
  const [chartError, setChartError] = useState<string | null>(null);
  
  const [selectedStarFilter, setSelectedStarFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedChart, setSelectedChart] = useState<string>("distribution");
  const [selectedHotel, setSelectedHotel] = useState<string>("all");

  // Filtrar hoteles según criterios
  const filteredHotels = useMemo(() => {
    if (!hotels) return [];
    
    return hotels.filter(hotel => {
      const starMatch = selectedStarFilter === "all" || hotel.estrellas.toString() === selectedStarFilter;
      const priceMatch = hotel.precio_promedio >= priceRange[0] && hotel.precio_promedio <= priceRange[1];
      const hotelMatch = selectedHotel === "all" || hotel.nombre === selectedHotel;
      
      return starMatch && priceMatch && hotelMatch;
    });
  }, [hotels, selectedStarFilter, priceRange, selectedHotel]);

  // Datos para gráficas
  const chartData = useMemo(() => {
    if (!filteredHotels.length) return [];

    // Agrupar por estrellas
    const starGroups = filteredHotels.reduce((acc, hotel) => {
      const stars = hotel.estrellas;
      if (!acc[stars]) {
        acc[stars] = {
          estrellas: stars,
          count: 0,
          avgPrice: 0,
          totalPrice: 0,
          minPrice: Infinity,
          maxPrice: 0,
          competitiveCount: 0,
          expensiveCount: 0,
          competitiveHotels: [],
          expensiveHotels: []
        };
      }
      acc[stars].count++;
      acc[stars].totalPrice += hotel.precio_promedio;
      acc[stars].minPrice = Math.min(acc[stars].minPrice, hotel.precio_promedio);
      acc[stars].maxPrice = Math.max(acc[stars].maxPrice, hotel.precio_promedio);
      
      // Clasificar por competitividad
      const avgPrice = filteredHotels.reduce((sum, h) => sum + h.precio_promedio, 0) / filteredHotels.length;
      if (hotel.precio_promedio <= avgPrice) {
        acc[stars].competitiveCount++;
        acc[stars].competitiveHotels.push(hotel);
      } else {
        acc[stars].expensiveCount++;
        acc[stars].expensiveHotels.push(hotel);
      }
      return acc;
    }, {} as Record<number, any>);

    // Calcular promedios
    Object.values(starGroups).forEach(group => {
      group.avgPrice = group.totalPrice / group.count;
    });

    return Object.values(starGroups).sort((a, b) => a.estrellas - b.estrellas);
  }, [filteredHotels]);

  // Datos para gráfica de dispersión precio vs estrellas
  const scatterData = useMemo(() => {
    if (!filteredHotels.length) return [];
    
    const avgPrice = filteredHotels.reduce((sum, hotel) => sum + hotel.precio_promedio, 0) / filteredHotels.length;
    
    return filteredHotels.map(hotel => ({
      name: hotel.nombre,
      estrellas: hotel.estrellas,
      precio: hotel.precio_promedio,
      noches: hotel.noches_contadas,
      isCompetitive: hotel.precio_promedio <= avgPrice,
      avgPrice: avgPrice,
      priceDifference: hotel.precio_promedio - avgPrice,
      priceDifferencePercent: ((hotel.precio_promedio - avgPrice) / avgPrice) * 100
    }));
  }, [filteredHotels]);

  // Datos para gráfica de rangos de precio
  const priceRangeData = useMemo(() => {
    if (!filteredHotels.length) return [];

    const ranges = [
      { range: "Económico", min: 0, max: 1000, color: "#10B981" },
      { range: "Medio", min: 1000, max: 2000, color: "#F59E0B" },
      { range: "Alto", min: 2000, max: 3000, color: "#EF4444" },
      { range: "Premium", min: 3000, max: Infinity, color: "#8B5CF6" }
    ];

    return ranges.map(range => {
      const count = filteredHotels.filter(hotel => 
        hotel.precio_promedio >= range.min && hotel.precio_promedio < range.max
      ).length;
      
      return {
        range: range.range,
        count,
        percentage: (count / filteredHotels.length) * 100,
        color: range.color
      };
    }).filter(item => item.count > 0);
  }, [filteredHotels]);

  // Estadísticas de competitividad
  const competitivenessStats = useMemo(() => {
    if (!filteredHotels.length) return null;

    const avgPrice = filteredHotels.reduce((sum, hotel) => sum + hotel.precio_promedio, 0) / filteredHotels.length;
    const competitiveHotels = filteredHotels.filter(hotel => hotel.precio_promedio <= avgPrice);
    const expensiveHotels = filteredHotels.filter(hotel => hotel.precio_promedio > avgPrice);

    return {
      totalHotels: filteredHotels.length,
      avgPrice,
      competitiveCount: competitiveHotels.length,
      expensiveCount: expensiveHotels.length,
      competitivePercentage: Math.round((competitiveHotels.length / filteredHotels.length) * 100),
      minPrice: Math.min(...filteredHotels.map(h => h.precio_promedio)),
      maxPrice: Math.max(...filteredHotels.map(h => h.precio_promedio)),
      priceRange: Math.max(...filteredHotels.map(h => h.precio_promedio)) - Math.min(...filteredHotels.map(h => h.precio_promedio))
    };
  }, [filteredHotels]);

  // Recomendaciones de precio
  const priceRecommendations = useMemo(() => {
    if (!competitivenessStats) return [];

    const recommendations = [];

    // Recomendación basada en competitividad
    if (competitivenessStats.competitivePercentage < 50) {
      recommendations.push({
        type: "competitividad",
        title: "Precios Competitivos",
        description: `Solo ${competitivenessStats.competitivePercentage}% de los hoteles tienen precios competitivos.`,
        action: "Considera ajustar precios para ser más competitivo.",
        icon: <Target className="w-5 h-5" />,
        color: "text-blue-600"
      });
    }

    // Recomendación basada en rango de precios
    if (competitivenessStats.priceRange > 2000) {
      recommendations.push({
        type: "rango",
        title: "Gran Variación de Precios",
        description: `Hay una diferencia de ${formatPrice(competitivenessStats.priceRange)} entre el precio más alto y más bajo.`,
        action: "Analiza qué factores justifican esta diferencia.",
        icon: <AlertTriangle className="w-5 h-5" />,
        color: "text-orange-600"
      });
    }

    // Recomendación basada en precio promedio
    recommendations.push({
      type: "promedio",
      title: "Precio Promedio del Mercado",
      description: `El precio promedio del mercado es ${formatPrice(competitivenessStats.avgPrice)}.`,
      action: "Usa este valor como referencia para posicionar tu hotel.",
      icon: <DollarSign className="w-5 h-5" />,
      color: "text-green-600"
    });

    return recommendations;
  }, [competitivenessStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando datos de precios...</span>
      </div>
    );
  }

  if (error || chartError) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
        <p className="text-gray-600">{error || chartError}</p>
        {chartError && (
          <Button 
            onClick={() => setChartError(null)} 
            className="mt-4"
            variant="outline"
          >
            Reintentar
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Análisis de Precios
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Analiza y compara precios para encontrar la estrategia de precios ideal
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Análisis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Estrellas</label>
              <Select value={selectedStarFilter} onValueChange={setSelectedStarFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las estrellas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las estrellas</SelectItem>
                  <SelectItem value="1">1 estrella</SelectItem>
                  <SelectItem value="2">2 estrellas</SelectItem>
                  <SelectItem value="3">3 estrellas</SelectItem>
                  <SelectItem value="4">4 estrellas</SelectItem>
                  <SelectItem value="5">5 estrellas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Hotel Específico</label>
              <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los hoteles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los hoteles</SelectItem>
                  {hotels?.map(hotel => (
                    <SelectItem key={hotel.id} value={hotel.nombre}>
                      {hotel.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Rango de Precio: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
              </label>
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                max={5000}
                min={0}
                step={100}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Rápidas */}
      {competitivenessStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Precio Promedio</p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {formatPrice(competitivenessStats.avgPrice)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Competitivos</p>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                    {competitivenessStats.competitivePercentage}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Rango de Precios</p>
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                    {formatPrice(competitivenessStats.priceRange)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Total Hoteles</p>
                  <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                    {competitivenessStats.totalHotels}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Visualizaciones de Datos
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Tab activa:</span>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
              {selectedChart === 'distribution' && 'Distribución'}
              {selectedChart === 'scatter' && 'Dispersión'}
              {selectedChart === 'trends' && 'Tendencias'}
            </Badge>
          </div>
        </div>
        
        <Tabs value={selectedChart} onValueChange={setSelectedChart} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-1 rounded-xl shadow-lg border border-blue-100 dark:border-gray-600">
          <TabsTrigger 
            value="distribution" 
            className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:font-semibold hover:bg-white/50 dark:hover:bg-gray-700/50"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Distribución</span>
            <span className="sm:hidden">Dist.</span>
          </TabsTrigger>
          <TabsTrigger 
            value="scatter" 
            className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:font-semibold hover:bg-white/50 dark:hover:bg-gray-700/50"
          >
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Dispersión</span>
            <span className="sm:hidden">Disp.</span>
          </TabsTrigger>
          <TabsTrigger 
            value="trends" 
            className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:font-semibold hover:bg-white/50 dark:hover:bg-gray-700/50"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Tendencias</span>
            <span className="sm:hidden">Tend.</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Distribución de Hoteles por Estrellas y Competitividad
              </CardTitle>
              <p className="text-blue-100 text-sm">Análisis de la distribución de hoteles competitivos vs no competitivos por categoría de estrellas</p>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ChartErrorBoundary>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="estrellas" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '12px',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                          backdropFilter: 'blur(8px)',
                          padding: '16px',
                          color: 'white'
                        }}
                        labelStyle={{
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          marginBottom: '8px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                          paddingBottom: '8px'
                        }}
                        itemStyle={{
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                        formatter={(value: any, name: string) => {
                          if (name === 'Competitivos') {
                            return [`${value} hoteles competitivos`, 'Hoteles con precios por debajo del promedio'];
                          } else if (name === 'No Competitivos') {
                            return [`${value} hoteles no competitivos`, 'Hoteles con precios por encima del promedio'];
                          } else if (name === 'Precio Promedio') {
                            return [formatPrice(value), 'Precio promedio del mercado'];
                          } else if (name === 'Rango Máximo') {
                            return [formatPrice(value), 'Precio más alto registrado'];
                          } else if (name === 'Rango Mínimo') {
                            return [formatPrice(value), 'Precio más bajo registrado'];
                          }
                          return [value, name];
                        }}
                        labelFormatter={(label: any) => {
                          if (typeof label === 'number') {
                            return `${label} estrellas`;
                          }
                          return label;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="competitiveCount" stackId="a" fill="#10B981" name="Competitivos" />
                      <Bar dataKey="expensiveCount" stackId="a" fill="#EF4444" name="No Competitivos" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartErrorBoundary>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay datos disponibles para mostrar la distribución
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scatter" className="space-y-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-700">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Precio vs Estrellas - Análisis de Competitividad
              </CardTitle>
              <p className="text-green-100 text-sm">Correlación entre estrellas y precios, con indicadores de competitividad del mercado</p>
            </CardHeader>
            <CardContent>
              {scatterData.length > 0 ? (
                <ChartErrorBoundary>
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        dataKey="estrellas" 
                        name="Estrellas"
                        domain={[0, 5]}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="precio" 
                        name="Precio"
                        tickFormatter={(value) => formatPrice(value)}
                      />
                      <ZAxis type="number" dataKey="noches" range={[20, 100]} />
                      <Tooltip 
                        contentStyle={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '12px',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                          backdropFilter: 'blur(8px)',
                          padding: '16px',
                          color: 'white'
                        }}
                        labelStyle={{
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          marginBottom: '8px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                          paddingBottom: '8px'
                        }}
                        itemStyle={{
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                        formatter={(value: any, name: string) => {
                          if (name === 'Competitivos') {
                            return [`${value} hoteles competitivos`, 'Hoteles con precios por debajo del promedio'];
                          } else if (name === 'No Competitivos') {
                            return [`${value} hoteles no competitivos`, 'Hoteles con precios por encima del promedio'];
                          } else if (name === 'Precio Promedio') {
                            return [formatPrice(value), 'Precio promedio del mercado'];
                          } else if (name === 'Rango Máximo') {
                            return [formatPrice(value), 'Precio más alto registrado'];
                          } else if (name === 'Rango Mínimo') {
                            return [formatPrice(value), 'Precio más bajo registrado'];
                          }
                          return [value, name];
                        }}
                        labelFormatter={(label: any) => {
                          if (typeof label === 'number') {
                            return `${label} estrellas - Categoría hotelera`;
                          }
                          return label;
                        }}
                      />
                      <Legend />
                      <Scatter 
                        data={scatterData.filter(h => h.isCompetitive)} 
                        fill="#10B981" 
                        name="Competitivos"
                      />
                      <Scatter 
                        data={scatterData.filter(h => !h.isCompetitive)} 
                        fill="#EF4444" 
                        name="No Competitivos"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </ChartErrorBoundary>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay datos disponibles para mostrar la dispersión
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-700">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Análisis de Tendencias y Rangos de Precio
              </CardTitle>
              <p className="text-purple-100 text-sm">Evolución de precios promedio y rangos (mínimo-máximo) por categoría de estrellas</p>
            </CardHeader>
            <CardContent>
              <ChartErrorBoundary>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="estrellas" />
                    <YAxis tickFormatter={(value) => formatPrice(value)} />
                    <Tooltip 
                      contentStyle={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        backdropFilter: 'blur(8px)',
                        padding: '16px',
                        color: 'white'
                      }}
                      labelStyle={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        marginBottom: '8px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                        paddingBottom: '8px'
                      }}
                      itemStyle={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === 'Competitivos') {
                          return [`${value} hoteles competitivos`, 'Hoteles con precios por debajo del promedio'];
                        } else if (name === 'No Competitivos') {
                          return [`${value} hoteles no competitivos`, 'Hoteles con precios por encima del promedio'];
                        } else if (name === 'Precio Promedio') {
                          return [formatPrice(value), 'Precio promedio del mercado'];
                        } else if (name === 'Rango Máximo') {
                          return [formatPrice(value), 'Precio más alto registrado'];
                        } else if (name === 'Rango Mínimo') {
                          return [formatPrice(value), 'Precio más bajo registrado'];
                        }
                        return [value, name];
                      }}
                      labelFormatter={(label: any) => {
                        if (typeof label === 'number') {
                          return `${label} estrellas`;
                        }
                        return label;
                      }}
                    />
                    <Legend />
                    <Area 
                      dataKey="maxPrice" 
                      stackId="a" 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.1}
                      name="Rango Máximo"
                    />
                    <Area 
                      dataKey="minPrice" 
                      stackId="a" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.3}
                      name="Rango Mínimo"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgPrice" 
                      stroke="#EF4444" 
                      strokeWidth={3}
                      name="Precio Promedio"
                      dot={{ r: 6, fill: "#EF4444" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartErrorBoundary>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>

      {/* Recomendaciones */}
      {priceRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Recomendaciones de Precios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {priceRecommendations.map((rec, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-start gap-3">
                    <div className={`${rec.color} mt-1`}>
                      {rec.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {rec.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {rec.description}
                      </p>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {rec.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visualizaciones Avanzadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriceHeatmap hotels={filteredHotels} />
        <TrendSparklines hotels={filteredHotels} />
      </div>

      {/* Tabla de Hoteles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Hoteles Analizados</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Hotel</th>
                  <th className="text-left py-2">Estrellas</th>
                  <th className="text-left py-2">Precio Promedio</th>
                  <th className="text-left py-2">Noches</th>
                  <th className="text-left py-2">Competitividad</th>
                  <th className="text-left py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredHotels.map((hotel) => {
                  const isCompetitive = hotel.precio_promedio <= (competitivenessStats?.avgPrice || 0);
                  return (
                    <tr key={hotel.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-2 font-medium">{hotel.nombre}</td>
                      <td className="py-2">
                        <div className="flex items-center">
                          {Array.from({ length: hotel.estrellas }, (_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </td>
                      <td className="py-2 font-semibold">{formatPrice(hotel.precio_promedio)}</td>
                      <td className="py-2">{hotel.noches_contadas}</td>
                      <td className="py-2">
                        <Badge variant={isCompetitive ? "default" : "secondary"}>
                          {isCompetitive ? "Competitivo" : "Alto"}
                        </Badge>
                      </td>
                      <td className="py-2">
                        <Button variant="outline" size="sm">
                          <BookOpen className="w-4 h-4 mr-1" />
                          Ver Detalles
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};