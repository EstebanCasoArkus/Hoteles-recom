import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Star, 
  Calendar, 
  Users, 
  Car, 
  Wifi, 
  Coffee,
  Dumbbell,
  Swimming,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Check,
  X,
  ExternalLink,
  Share2,
  Heart,
  BookOpen
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Event } from '@/lib/hotel-correlation';

interface HotelDetailsModalProps {
  hotel: {
    name: string;
    roomType: string;
    originalPrice: number;
    adjustedPrice: number;
    percentIncrease: number;
    hasEvent: boolean;
    eventDetails?: Event[];
    impactLevel?: "alto" | "medium" | "low" | "none";
    isPrincipal?: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
  priceHistory?: Array<{
    date: string;
    price: number;
    adjustedPrice: number;
    events: Event[];
  }>;
  similarHotels?: Array<{
    name: string;
    price: number;
    rating: number;
    distance: number;
  }>;
}

const formatHotelName = (name: string) => {
  return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export const HotelDetailsModal: React.FC<HotelDetailsModalProps> = ({
  hotel,
  isOpen,
  onClose,
  priceHistory = [],
  similarHotels = []
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const mockAmenities = [
    { icon: <Wifi className="w-4 h-4" />, name: "WiFi Gratis", available: true },
    { icon: <Car className="w-4 h-4" />, name: "Estacionamiento", available: true },
    { icon: <Coffee className="w-4 h-4" />, name: "Desayuno", available: true },
    { icon: <Dumbbell className="w-4 h-4" />, name: "Gimnasio", available: false },
    { icon: <Swimming className="w-4 h-4" />, name: "Piscina", available: true },
  ];

  const hotelRating = 4.2;
  const reviewCount = 1247;
  
  const priceChangeColor = hotel.percentIncrease > 0 ? 'text-red-600' : 
                          hotel.percentIncrease < 0 ? 'text-green-600' : 'text-gray-600';
  
  const impactColors = {
    alto: 'bg-red-100 text-red-800',
    medium: 'bg-orange-100 text-orange-800',
    low: 'bg-yellow-100 text-yellow-800',
    none: 'bg-gray-100 text-gray-800'
  };

  const chartData = useMemo(() => {
    return priceHistory.map(item => ({
      date: item.date,
      original: item.price,
      adjusted: item.adjustedPrice,
      hasEvent: item.events.length > 0
    }));
  }, [priceHistory]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {formatHotelName(hotel.name)}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(hotelRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
              <span className="text-sm text-gray-600 ml-1">{hotelRating} ({reviewCount} reseñas)</span>
            </div>
            <Badge variant="secondary">
              <MapPin className="w-3 h-3 mr-1" />
              Zona Centro
            </Badge>
            {hotel.isPrincipal && (
              <Badge className="bg-blue-100 text-blue-800">Hotel Principal</Badge>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="pricing">Precios</TabsTrigger>
            <TabsTrigger value="amenities">Servicios</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="similar">Comparar</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información de Precios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Precio Original:</span>
                      <span className="font-semibold">${hotel.originalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Precio Ajustado:</span>
                      <span className="font-semibold text-lg">${hotel.adjustedPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cambio:</span>
                      <span className={`font-semibold flex items-center ${priceChangeColor}`}>
                        {hotel.percentIncrease > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : 
                         hotel.percentIncrease < 0 ? <TrendingDown className="w-4 h-4 mr-1" /> : null}
                        {hotel.percentIncrease.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tipo de Habitación:</span>
                      <span className="font-medium">{hotel.roomType}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Impacto de Eventos:</span>
                      <Badge className={impactColors[hotel.impactLevel || 'none']}>
                        {hotel.impactLevel || 'none'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalles del Hotel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{reviewCount}</div>
                      <div className="text-sm text-gray-600">Reseñas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{hotelRating}</div>
                      <div className="text-sm text-gray-600">Calificación</div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Capacidad: 2-4 huéspedes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">2.5 km del centro</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Check-in: 15:00, Check-out: 11:00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-3">
                  <Button className="flex-1">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Reservar Ahora
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Ver Disponibilidad
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Agregar a Favoritos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Precios</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="original" stroke="#94a3b8" strokeWidth={2} name="Precio Original" />
                      <Line type="monotone" dataKey="adjusted" stroke="#3b82f6" strokeWidth={2} name="Precio Ajustado" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay datos de historial de precios disponibles
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="amenities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Servicios y Amenidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockAmenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className={`p-2 rounded-full ${amenity.available ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {amenity.icon}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{amenity.name}</span>
                      </div>
                      <div>
                        {amenity.available ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Eventos Relacionados</CardTitle>
              </CardHeader>
              <CardContent>
                {hotel.eventDetails && hotel.eventDetails.length > 0 ? (
                  <div className="space-y-3">
                    {hotel.eventDetails.map((event, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-lg">{event.titulo}</h4>
                        <p className="text-sm text-gray-600 mt-1">{event.descripcion}</p>
                        <div className="flex items-center space-x-4 mt-3">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{event.fecha}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{event.ubicacion}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{event.asistentes_estimados || 'N/A'} personas</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay eventos relacionados para esta fecha
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="similar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hoteles Similares</CardTitle>
              </CardHeader>
              <CardContent>
                {similarHotels.length > 0 ? (
                  <div className="space-y-3">
                    {similarHotels.map((similarHotel, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{formatHotelName(similarHotel.name)}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3 h-3 ${i < Math.floor(similarHotel.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                              <span className="text-sm text-gray-600">{similarHotel.rating}</span>
                            </div>
                            <span className="text-sm text-gray-600">• {similarHotel.distance} km</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">${similarHotel.price.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">por noche</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay hoteles similares disponibles
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}; 