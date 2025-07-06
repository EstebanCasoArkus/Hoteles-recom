import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Hotel } from '../../hooks/use-backend-api';

interface TrendSparklinesProps {
  hotels: Hotel[];
  className?: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(price);
};

export const TrendSparklines: React.FC<TrendSparklinesProps> = ({ hotels, className }) => {
  const trendData = useMemo(() => {
    if (!hotels.length) return [];

    // Agrupar por estrellas y calcular tendencias
    const starGroups = hotels.reduce((acc, hotel) => {
      const stars = hotel.estrellas;
      if (!acc[stars]) {
        acc[stars] = {
          estrellas: stars,
          hoteles: [],
          avgPrice: 0,
          minPrice: Infinity,
          maxPrice: 0,
          trend: 0
        };
      }
      acc[stars].hoteles.push(hotel);
      return acc;
    }, {} as Record<number, any>);

    // Calcular estadísticas por grupo
    Object.values(starGroups).forEach(group => {
      const prices = group.hoteles.map((h: Hotel) => h.precio_promedio);
      group.avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
      group.minPrice = Math.min(...prices);
      group.maxPrice = Math.max(...prices);
      
      // Calcular tendencia (simulada basada en la variación de precios)
      const sortedPrices = prices.sort((a: number, b: number) => a - b);
      const firstHalf = sortedPrices.slice(0, Math.floor(sortedPrices.length / 2));
      const secondHalf = sortedPrices.slice(Math.floor(sortedPrices.length / 2));
      const firstAvg = firstHalf.reduce((a: number, b: number) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a: number, b: number) => a + b, 0) / secondHalf.length;
      group.trend = ((secondAvg - firstAvg) / firstAvg) * 100;
    });

    return Object.values(starGroups).sort((a, b) => a.estrellas - b.estrellas);
  }, [hotels]);

  const getTrendIcon = (trend: number) => {
    if (trend > 2) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend < -2) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 2) return "text-red-600";
    if (trend < -2) return "text-green-600";
    return "text-gray-600";
  };

  if (!hotels.length) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No hay datos disponibles para las tendencias</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Tendencias de Precios por Categoría</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendData.map((group) => (
            <div key={group.estrellas} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">
                  {group.estrellas} {group.estrellas === 1 ? 'Estrella' : 'Estrellas'}
                </h4>
                <div className="flex items-center gap-1">
                  {getTrendIcon(group.trend)}
                  <span className={`text-sm font-medium ${getTrendColor(group.trend)}`}>
                    {group.trend > 0 ? '+' : ''}{group.trend.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Promedio:</span>
                  <span className="font-medium">{formatPrice(group.avgPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rango:</span>
                  <span className="font-medium">
                    {formatPrice(group.minPrice)} - {formatPrice(group.maxPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hoteles:</span>
                  <span className="font-medium">{group.hoteles.length}</span>
                </div>
              </div>

              {/* Sparkline */}
              <div className="h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={group.hoteles.slice(0, 10).map((h: Hotel, i: number) => ({
                    index: i,
                    price: h.precio_promedio
                  }))}>
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke={group.trend > 2 ? "#ef4444" : group.trend < -2 ? "#10b981" : "#6b7280"}
                      strokeWidth={2}
                      dot={false}
                    />
                    <XAxis dataKey="index" hide />
                    <YAxis hide />
                    <Tooltip 
                      formatter={(value) => [formatPrice(Number(value)), 'Precio']}
                      labelFormatter={() => ''}
                      cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 