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
  Building2
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
          maxPrice: 0
        };
      }
      acc[stars].count++;
      acc[stars].totalPrice += hotel.precio_promedio;
      acc[stars].minPrice = Math.min(acc[stars].minPrice, hotel.precio_promedio);
      acc[stars].maxPrice = Math.max(acc[stars].maxPrice, hotel.precio_promedio);
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
    return filteredHotels.map(hotel => ({
      name: hotel.nombre,
      estrellas: hotel.estrellas,
      precio: hotel.precio_promedio,
      noches: hotel.noches_contadas
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
      <Tabs value={selectedChart} onValueChange={setSelectedChart} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="distribution">Distribución</TabsTrigger>
          <TabsTrigger value="scatter">Dispersión</TabsTrigger>
          <TabsTrigger value="ranges">Rangos</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Precios por Estrellas</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="estrellas" />
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
                  No hay datos disponibles para mostrar la distribución
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scatter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Precio vs Estrellas</CardTitle>
            </CardHeader>
            <CardContent>
              {scatterData.length > 0 ? (
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
                    <ZAxis type="number" dataKey="z" range={[20, 100]} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'precio' ? formatPrice(Number(value)) : value,
                        name === 'precio' ? 'Precio' : 'Estrellas'
                      ]}
                      labelFormatter={(label) => `${label} estrellas`}
                      cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                    />
                    <Scatter data={scatterData} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay datos disponibles para mostrar la dispersión
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranges" className="space-y-4" forceMount={true}>
          {selectedChart === "ranges" && (
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Rangos de Precio</CardTitle>
              </CardHeader>
              <CardContent>
                {priceRangeData.length > 0 ? (
                  <ChartErrorBoundary>
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart key={priceRangeData.length}>
                        <Pie
                          data={priceRangeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ range, percentage }) => `${range} (${percentage.toFixed(1)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {priceRangeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [value, 'Hoteles']}
                          cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                          content={({ active, payload }) =>
                            active && payload && payload.length > 0 ? (
                              <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
                                <p className="font-semibold">{payload[0].payload.range}</p>
                                <p className="text-sm text-gray-600">Hoteles: {payload[0].payload.count}</p>
                                <p className="text-sm text-gray-600">Porcentaje: {payload[0].payload.percentage.toFixed(1)}%</p>
                              </div>
                            ) : null
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartErrorBoundary>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay datos disponibles para mostrar los rangos de precio
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Tendencias</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="estrellas" />
                  <YAxis tickFormatter={(value) => formatPrice(value)} />
                  <Tooltip 
                    formatter={(value) => [formatPrice(Number(value)), 'Precio']}
                    cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgPrice" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                    name="Precio Promedio"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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