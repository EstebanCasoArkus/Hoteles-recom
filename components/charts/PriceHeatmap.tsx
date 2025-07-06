import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis } from 'recharts';
import { Hotel } from '../../hooks/use-backend-api';

interface PriceHeatmapProps {
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

export const PriceHeatmap: React.FC<PriceHeatmapProps> = ({ hotels, className }) => {
  const heatmapData = useMemo(() => {
    if (!hotels.length) return [];

    // Crear datos para el mapa de calor
    return hotels.map(hotel => ({
      x: hotel.estrellas,
      y: hotel.precio_promedio,
      z: hotel.noches_contadas, // Tamaño del punto basado en noches
      name: hotel.nombre,
      price: hotel.precio_promedio,
      stars: hotel.estrellas,
      nights: hotel.noches_contadas
    }));
  }, [hotels]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-gray-600">Estrellas: {data.stars} ⭐</p>
          <p className="text-sm text-gray-600">Precio: {formatPrice(data.price)}</p>
          <p className="text-sm text-gray-600">Noches: {data.nights}</p>
        </div>
      );
    }
    return null;
  };

  if (!hotels.length) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No hay datos disponibles para el mapa de calor</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Mapa de Calor: Precio vs Estrellas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Estrellas"
              domain={[0, 5]}
              tickCount={6}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Precio"
              tickFormatter={(value) => formatPrice(value)}
            />
            <ZAxis type="number" dataKey="z" range={[20, 100]} />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(0,0,0,0.1)' }}
            />
            <Scatter 
              data={heatmapData} 
              fill="#8884d8"
              shape="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}; 