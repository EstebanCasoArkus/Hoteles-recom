"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
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
  Activity,
  BarChart,
  LineChart,
  PieChart
} from "lucide-react";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  LineChart as RechartsLineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
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

export const AnalyticsTab: React.FC = () => {
  const { hotels, loading, error, stats } = useBackendAPI();
  
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>("market");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("current");

  // Análisis de mercado
  const marketAnalysis = useMemo(() => {
    if (!hotels || hotels.length === 0) return null;

    const avgPrice = hotels.reduce((sum, hotel) => sum + hotel.precio_promedio, 0) / hotels.length;
    const competitiveHotels = hotels.filter(hotel => hotel.precio_promedio <= avgPrice);
    const expensiveHotels = hotels.filter(hotel => hotel.precio_promedio > avgPrice);

    // Análisis por estrellas
    const starAnalysis = hotels.reduce((acc, hotel) => {
      if (!acc[hotel.estrellas]) {
        acc[hotel.estrellas] = {
          count: 0,
          totalPrice: 0,
          avgPrice: 0,
          minPrice: Infinity,
          maxPrice: 0
        };
      }
      acc[hotel.estrellas].count++;
      acc[hotel.estrellas].totalPrice += hotel.precio_promedio;
      acc[hotel.estrellas].minPrice = Math.min(acc[hotel.estrellas].minPrice, hotel.precio_promedio);
      acc[hotel.estrellas].maxPrice = Math.max(acc[hotel.estrellas].maxPrice, hotel.precio_promedio);
      return acc;
    }, {} as Record<number, any>);

    // Calcular promedios por estrellas
    Object.values(starAnalysis).forEach(analysis => {
      analysis.avgPrice = analysis.totalPrice / analysis.count;
    });

    return {
      totalHotels: hotels.length,
      avgPrice,
      competitiveCount: competitiveHotels.length,
      expensiveCount: expensiveHotels.length,
      competitivePercentage: Math.round((competitiveHotels.length / hotels.length) * 100),
      minPrice: Math.min(...hotels.map(h => h.precio_promedio)),
      maxPrice: Math.max(...hotels.map(h => h.precio_promedio)),
      priceRange: Math.max(...hotels.map(h => h.precio_promedio)) - Math.min(...hotels.map(h => h.precio_promedio)),
      starAnalysis: Object.entries(starAnalysis).map(([stars, data]) => ({
        stars: parseInt(stars),
        ...data
      })).sort((a, b) => a.stars - b.stars)
    };
  }, [hotels]);

  // Análisis de tendencias
  const trendAnalysis = useMemo(() => {
    if (!hotels || hotels.length === 0) return null;

    // Simular tendencias basadas en los datos actuales
    const trends = hotels.map(hotel => ({
      name: hotel.nombre,
      currentPrice: hotel.precio_promedio,
      previousPrice: hotel.precio_promedio * (0.9 + Math.random() * 0.2), // Simular precio anterior
      change: 0,
      changePercent: 0
    }));

    trends.forEach(trend => {
      trend.change = trend.currentPrice - trend.previousPrice;
      trend.changePercent = (trend.change / trend.previousPrice) * 100;
    });

    return {
      trends,
      averageChange: trends.reduce((sum, t) => sum + t.changePercent, 0) / trends.length,
      increasingHotels: trends.filter(t => t.changePercent > 0).length,
      decreasingHotels: trends.filter(t => t.changePercent < 0).length,
      stableHotels: trends.filter(t => Math.abs(t.changePercent) < 5).length
    };
  }, [hotels]);

  // Análisis de competitividad
  const competitivenessAnalysis = useMemo(() => {
    if (!hotels || hotels.length === 0) return null;

    const avgPrice = hotels.reduce((sum, hotel) => sum + hotel.precio_promedio, 0) / hotels.length;
    
    const competitiveLevels = hotels.map(hotel => {
      const priceDiff = ((hotel.precio_promedio - avgPrice) / avgPrice) * 100;
      let level = 'competitivo';
      let color = 'green';
      
      if (priceDiff > 20) {
        level = 'caro';
        color = 'red';
      } else if (priceDiff > 10) {
        level = 'moderado';
        color = 'orange';
      } else if (priceDiff < -20) {
        level = 'muy económico';
        color = 'blue';
      } else if (priceDiff < -10) {
        level = 'económico';
        color = 'green';
      }
      
      return {
        hotel: hotel.nombre,
        price: hotel.precio_promedio,
        stars: hotel.estrellas,
        priceDiff,
        level,
        color
      };
    });

    return {
      competitiveLevels,
      competitiveCount: competitiveLevels.filter(c => c.level === 'competitivo').length,
      expensiveCount: competitiveLevels.filter(c => c.level === 'caro').length,
      economicCount: competitiveLevels.filter(c => c.level.includes('económico')).length
    };
  }, [hotels]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando análisis...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar análisis</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Análisis Avanzado
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Reportes detallados y tendencias del mercado hotelero
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Configuración del Análisis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Análisis</label>
              <Select value={selectedAnalysis} onValueChange={setSelectedAnalysis}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Análisis de Mercado</SelectItem>
                  <SelectItem value="trends">Tendencias</SelectItem>
                  <SelectItem value="competitiveness">Competitividad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Período</label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Actual</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análisis de Mercado */}
      {selectedAnalysis === "market" && marketAnalysis && (
        <div className="space-y-6">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Precio Promedio</p>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                      {formatPrice(marketAnalysis.avgPrice)}
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
                      {marketAnalysis.competitivePercentage}%
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
                      {formatPrice(marketAnalysis.priceRange)}
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
                      {marketAnalysis.totalHotels}
                    </p>
                  </div>
                  <Building2 className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfica de precios por estrellas */}
          <Card>
            <CardHeader>
              <CardTitle>Precios por Categoría de Estrellas</CardTitle>
            </CardHeader>
            <CardContent>
              {marketAnalysis.starAnalysis.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={marketAnalysis.starAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stars" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'count' ? value : formatPrice(Number(value)),
                        name === 'count' ? 'Cantidad' : 'Precio'
                      ]}
                      cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Cantidad de Hoteles" />
                    <Line yAxisId="right" type="monotone" dataKey="avgPrice" stroke="#ff7300" name="Precio Promedio" />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay datos disponibles para mostrar el análisis
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Análisis de Tendencias */}
      {selectedAnalysis === "trends" && trendAnalysis && (
        <div className="space-y-6">
          {/* Estadísticas de tendencias */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">En Aumento</p>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                      {trendAnalysis.increasingHotels}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400">En Disminución</p>
                    <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                      {trendAnalysis.decreasingHotels}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Estables</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {trendAnalysis.stableHotels}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfica de tendencias */}
          <Card>
            <CardHeader>
              <CardTitle>Evolución de Precios</CardTitle>
            </CardHeader>
            <CardContent>
              {trendAnalysis.trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={trendAnalysis.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatPrice(value)} />
                    <Tooltip 
                      formatter={(value) => [formatPrice(Number(value)), 'Precio']}
                      cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="currentPrice" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                      name="Precio Actual"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="previousPrice" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.3}
                      name="Precio Anterior"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay datos disponibles para mostrar las tendencias
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Análisis de Competitividad */}
      {selectedAnalysis === "competitiveness" && competitivenessAnalysis && (
        <div className="space-y-6">
          {/* Estadísticas de competitividad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">Competitivos</p>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                      {competitivenessAnalysis.competitiveCount}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400">Caros</p>
                    <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                      {competitivenessAnalysis.expensiveCount}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Económicos</p>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                      {competitivenessAnalysis.economicCount}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de competitividad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Análisis de Competitividad por Hotel</span>
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
                      <th className="text-left py-2">Precio</th>
                      <th className="text-left py-2">Diferencia</th>
                      <th className="text-left py-2">Nivel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitivenessAnalysis.competitiveLevels.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-2">{item.hotel}</td>
                        <td className="py-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < item.stars ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="py-2 font-semibold">{formatPrice(item.price)}</td>
                        <td className="py-2">
                          <span className={`font-semibold ${
                            item.priceDiff > 0 ? "text-red-600" : "text-green-600"
                          }`}>
                            {item.priceDiff > 0 ? "+" : ""}{item.priceDiff.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2">
                          <Badge variant={
                            item.level === 'competitivo' ? 'default' :
                            item.level === 'caro' ? 'destructive' :
                            'secondary'
                          }>
                            {item.level}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Acciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Acciones Recomendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Análisis de Competitividad
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Revisa los precios de la competencia para posicionarte mejor en el mercado.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Seguimiento de Tendencias
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Monitorea los cambios de precios para anticipar movimientos del mercado.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <div className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Reportes Periódicos
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Genera reportes semanales para mantener un análisis continuo del mercado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 