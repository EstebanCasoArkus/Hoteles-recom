import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  X, 
  Star, 
  MapPin, 
  Calendar, 
  Users, 
  Wifi, 
  Car, 
  Coffee,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProcessedHotel } from '@/hooks/use-hotel-data';

interface HotelCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotels: ProcessedHotel[];
  onRemoveHotel: (hotelId: string) => void;
  onBookHotel: (hotelId: string) => void;
}

interface ComparisonMetric {
  label: string;
  key: keyof ProcessedHotel | 'rating' | 'amenities' | 'location';
  format?: (value: any) => string;
  isNumeric?: boolean;
  isBetter?: 'higher' | 'lower';
}

const comparisonMetrics: ComparisonMetric[] = [
  { 
    label: 'Precio Original', 
    key: 'originalPrice', 
    format: (value: number) => new Intl.NumberFormat("es-MX", {
      style: "currency", currency: "MXN", minimumFractionDigits: 0
    }).format(value * 17),
    isNumeric: true,
    isBetter: 'lower'
  },
  { 
    label: 'Precio Ajustado', 
    key: 'adjustedPrice', 
    format: (value: number) => new Intl.NumberFormat("es-MX", {
      style: "currency", currency: "MXN", minimumFractionDigits: 0
    }).format(value * 17),
    isNumeric: true,
    isBetter: 'lower'
  },
  { 
    label: 'Cambio %', 
    key: 'percentIncrease', 
    format: (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`,
    isNumeric: true
  },
  {
    label: 'Tipo de Habitación',
    key: 'roomType'
  },
  {
    label: 'Eventos',
    key: 'hasEvent',
    format: (value: boolean) => value ? 'Sí' : 'No'
  },
  {
    label: 'Nivel de Impacto',
    key: 'impactLevel',
    format: (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
  }
];

export const HotelCompareModal: React.FC<HotelCompareModalProps> = ({
  isOpen,
  onClose,
  hotels,
  onRemoveHotel,
  onBookHotel
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('adjustedPrice');
  
  const formatHotelName = (name: string) =>
    name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const getBestValue = (metric: ComparisonMetric, values: any[]) => {
    if (!metric.isNumeric || !metric.isBetter) return null;
    
    const numericValues = values.filter(v => typeof v === 'number');
    if (numericValues.length === 0) return null;
    
    return metric.isBetter === 'lower' 
      ? Math.min(...numericValues)
      : Math.max(...numericValues);
  };

  const isWinnerValue = (metric: ComparisonMetric, value: any, allValues: any[]) => {
    const bestValue = getBestValue(metric, allValues);
    return bestValue !== null && value === bestValue;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>Comparar Hoteles</span>
              <Badge variant="secondary">{hotels.length} hoteles</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotels.map((hotel) => {
              const hotelId = `${hotel.name}-${hotel.roomType}`;
              return (
                <Card key={hotelId} className="relative">
                  <CardContent className="p-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveHotel(hotelId)}
                      className="absolute top-2 right-2 p-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {formatHotelName(hotel.name)}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {hotel.roomType}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn(
                            "w-4 h-4",
                            i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                          )} />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">4.5</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Precio:</span>
                          <span className="font-semibold text-lg">
                            {new Intl.NumberFormat("es-MX", {
                              style: "currency", currency: "MXN", minimumFractionDigits: 0
                            }).format(hotel.adjustedPrice * 17)}
                          </span>
                        </div>
                        
                        {hotel.percentIncrease !== 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Cambio:</span>
                            <div className="flex items-center space-x-1">
                              {hotel.percentIncrease > 0 ? (
                                <TrendingUp className="w-3 h-3 text-red-600" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-green-600" />
                              )}
                              <span className={cn(
                                "text-sm font-medium",
                                hotel.percentIncrease > 0 ? "text-red-600" : "text-green-600"
                              )}>
                                {hotel.percentIncrease > 0 ? '+' : ''}{hotel.percentIncrease.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {hotel.hasEvent && (
                        <Badge variant="secondary" className="w-full justify-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {hotel.eventDetails.length} evento(s)
                        </Badge>
                      )}
                      
                      <Button
                        size="sm"
                        onClick={() => onBookHotel(hotelId)}
                        className="w-full"
                      >
                        Ver disponibilidad
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Detailed Comparison Table */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Comparación Detallada</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                        Característica
                      </th>
                      {hotels.map((hotel) => (
                        <th 
                          key={`${hotel.name}-${hotel.roomType}`}
                          className="text-center py-3 px-4 font-medium text-gray-700 dark:text-gray-300 min-w-[150px]"
                        >
                          <div className="space-y-1">
                            <div>{formatHotelName(hotel.name)}</div>
                            <div className="text-xs text-gray-500">{hotel.roomType}</div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonMetrics.map((metric) => {
                      const values = hotels.map(hotel => {
                        let value = hotel[metric.key as keyof ProcessedHotel];
                        
                        // Handle special cases
                        if (metric.key === 'rating') value = 4.5;
                        if (metric.key === 'location') value = 'Tijuana, BC';
                        if (metric.key === 'amenities') value = ['WiFi', 'Parking', 'Breakfast'];
                        
                        return value;
                      });
                      
                      return (
                        <tr key={metric.label} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                            {metric.label}
                          </td>
                          {values.map((value, index) => {
                            const hotel = hotels[index];
                            const isWinner = isWinnerValue(metric, value, values);
                            const formattedValue = metric.format ? metric.format(value) : String(value);
                            
                            return (
                              <td 
                                key={`${hotel.name}-${metric.label}`}
                                className={cn(
                                  "py-3 px-4 text-center",
                                  isWinner && "bg-green-50 dark:bg-green-900/20 font-semibold text-green-700 dark:text-green-400"
                                )}
                              >
                                <div className="flex items-center justify-center space-x-1">
                                  {isWinner && <Star className="w-3 h-3 text-green-600" />}
                                  <span>{formattedValue}</span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Comparando {hotels.length} hoteles • <Star className="w-3 h-3 inline text-green-600" /> = Mejor opción
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
              <Button>
                <ExternalLink className="w-4 h-4 mr-1" />
                Exportar Comparación
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 