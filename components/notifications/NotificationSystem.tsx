"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bell, 
  BellOff, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  Settings,
  X,
  Star,
  Users,
  Zap,
  Clock,
  DollarSign,
  Target,
  Lightbulb,
  Mail,
  MessageSquare,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardState } from '@/hooks/use-dashboard-state';

interface Notification {
  id: string;
  type: 'price_change' | 'event_alert' | 'recommendation' | 'system' | 'booking' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: {
    hotelName?: string;
    oldPrice?: number;
    newPrice?: number;
    priceChange?: number;
    eventName?: string;
    eventDate?: string;
    recommendation?: string;
    actionRequired?: boolean;
    relatedId?: string;
  };
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive' | 'outline';
  }>;
}

interface NotificationPreferences {
  priceChanges: boolean;
  eventAlerts: boolean;
  recommendations: boolean;
  systemUpdates: boolean;
  bookingUpdates: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  priceChangeThreshold: number;
  eventProximityDays: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

interface NotificationSystemProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
}

const NotificationTypeIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'price_change':
      return <DollarSign className="w-4 h-4 text-green-600" />;
    case 'event_alert':
      return <Calendar className="w-4 h-4 text-blue-600" />;
    case 'recommendation':
      return <Lightbulb className="w-4 h-4 text-yellow-600" />;
    case 'system':
      return <Info className="w-4 h-4 text-gray-600" />;
    case 'booking':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    default:
      return <Bell className="w-4 h-4 text-gray-600" />;
  }
};

const PriorityBadge = ({ priority }: { priority: Notification['priority'] }) => {
  const colors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  return (
    <Badge className={cn('text-xs', colors[priority])}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
};

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences'>('notifications');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    priceChanges: true,
    eventAlerts: true,
    recommendations: true,
    systemUpdates: true,
    bookingUpdates: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    priceChangeThreshold: 10,
    eventProximityDays: 7,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00'
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;

  const sortedNotifications = [...notifications].sort((a, b) => {
    // Sort by priority first, then by timestamp
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES');
  };

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => (
    <div className={cn(
      'p-4 border rounded-lg hover:bg-gray-50 transition-colors',
      !notification.read && 'bg-blue-50 border-blue-200'
    )}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <NotificationTypeIcon type={notification.type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {notification.title}
            </h4>
            <div className="flex items-center space-x-2">
              <PriorityBadge priority={notification.priority} />
              <span className="text-xs text-gray-500">
                {formatTimestamp(notification.timestamp)}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
          
          {notification.metadata && (
            <div className="flex flex-wrap gap-2 mb-2">
              {notification.metadata.hotelName && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  {notification.metadata.hotelName}
                </Badge>
              )}
              {notification.metadata.priceChange && (
                <Badge variant="outline" className="text-xs">
                  {notification.metadata.priceChange > 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1 text-red-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1 text-green-500" />
                  )}
                  {Math.abs(notification.metadata.priceChange)}%
                </Badge>
              )}
              {notification.metadata.eventDate && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {notification.metadata.eventDate}
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {notification.actions?.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.action}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center space-x-1">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-xs"
                >
                  Marcar como leído
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteNotification(notification.id)}
                className="text-xs text-red-600 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notificaciones</span>
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex space-x-1 mt-2">
            <Button
              variant={activeTab === 'notifications' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('notifications')}
            >
              Notificaciones
            </Button>
            <Button
              variant={activeTab === 'preferences' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('preferences')}
            >
              <Settings className="w-4 h-4 mr-1" />
              Preferencias
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {activeTab === 'notifications' && (
            <div className="flex flex-col h-[60vh]">
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {notifications.length} notificaciones totales
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-sm text-blue-600">
                      {unreadCount} sin leer
                    </span>
                  )}
                  {urgentCount > 0 && (
                    <span className="text-sm text-red-600 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {urgentCount} urgentes
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
                      Marcar todas como leídas
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={onClearAll}>
                    Limpiar todas
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {sortedNotifications.length > 0 ? (
                    sortedNotifications.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No tienes notificaciones</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="p-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tipos de Notificaciones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Cambios de Precios</Label>
                        <p className="text-xs text-gray-600">Notificar cuando cambien los precios</p>
                      </div>
                      <Switch 
                        checked={preferences.priceChanges}
                        onCheckedChange={(checked) => updatePreference('priceChanges', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Alertas de Eventos</Label>
                        <p className="text-xs text-gray-600">Notificar sobre eventos próximos</p>
                      </div>
                      <Switch 
                        checked={preferences.eventAlerts}
                        onCheckedChange={(checked) => updatePreference('eventAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Recomendaciones</Label>
                        <p className="text-xs text-gray-600">Sugerencias inteligentes del sistema</p>
                      </div>
                      <Switch 
                        checked={preferences.recommendations}
                        onCheckedChange={(checked) => updatePreference('recommendations', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Actualizaciones del Sistema</Label>
                        <p className="text-xs text-gray-600">Notificaciones del sistema</p>
                      </div>
                      <Switch 
                        checked={preferences.systemUpdates}
                        onCheckedChange={(checked) => updatePreference('systemUpdates', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Canales de Notificación</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <div>
                          <Label className="text-sm font-medium">Email</Label>
                          <p className="text-xs text-gray-600">Recibir por correo electrónico</p>
                        </div>
                      </div>
                      <Switch 
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) => updatePreference('emailNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <div>
                          <Label className="text-sm font-medium">SMS</Label>
                          <p className="text-xs text-gray-600">Recibir por mensaje de texto</p>
                        </div>
                      </div>
                      <Switch 
                        checked={preferences.smsNotifications}
                        onCheckedChange={(checked) => updatePreference('smsNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-gray-600" />
                        <div>
                          <Label className="text-sm font-medium">Push</Label>
                          <p className="text-xs text-gray-600">Notificaciones push del navegador</p>
                        </div>
                      </div>
                      <Switch 
                        checked={preferences.pushNotifications}
                        onCheckedChange={(checked) => updatePreference('pushNotifications', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configuración Avanzada</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Umbral de Cambio de Precio (%)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={preferences.priceChangeThreshold}
                        onChange={(e) => updatePreference('priceChangeThreshold', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-600">Notificar solo si el cambio es mayor a este porcentaje</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Días de Anticipación para Eventos</Label>
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        value={preferences.eventProximityDays}
                        onChange={(e) => updatePreference('eventProximityDays', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-600">Notificar con esta anticipación sobre eventos</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Horas de Silencio</Label>
                        <p className="text-xs text-gray-600">No enviar notificaciones durante estas horas</p>
                      </div>
                      <Switch 
                        checked={preferences.quietHoursEnabled}
                        onCheckedChange={(checked) => updatePreference('quietHoursEnabled', checked)}
                      />
                    </div>
                    
                    {preferences.quietHoursEnabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Inicio</Label>
                          <Input
                            type="time"
                            value={preferences.quietHoursStart}
                            onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Fin</Label>
                          <Input
                            type="time"
                            value={preferences.quietHoursEnd}
                            onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Hook para generar notificaciones inteligentes
export const useNotificationGenerator = () => {
  const generatePriceChangeNotification = useCallback((
    hotelName: string,
    oldPrice: number,
    newPrice: number,
    eventName?: string
  ): Notification => {
    const priceChange = ((newPrice - oldPrice) / oldPrice) * 100;
    const isIncrease = priceChange > 0;
    
    return {
      id: Date.now().toString(),
      type: 'price_change',
      title: `Cambio de precio en ${hotelName}`,
      message: `El precio ${isIncrease ? 'aumentó' : 'disminuyó'} de $${oldPrice.toLocaleString()} a $${newPrice.toLocaleString()}${eventName ? ` debido al evento "${eventName}"` : ''}`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: Math.abs(priceChange) > 20 ? 'high' : Math.abs(priceChange) > 10 ? 'medium' : 'low',
      metadata: {
        hotelName,
        oldPrice,
        newPrice,
        priceChange: Math.round(priceChange * 100) / 100
      },
      actions: [
        {
          label: 'Ver detalles',
          action: () => console.log('Ver detalles del hotel'),
          variant: 'outline'
        },
        {
          label: 'Agregar a favoritos',
          action: () => console.log('Agregar a favoritos'),
          variant: 'default'
        }
      ]
    };
  }, []);

  const generateEventNotification = useCallback((
    eventName: string,
    eventDate: string,
    daysUntilEvent: number
  ): Notification => {
    return {
      id: Date.now().toString(),
      type: 'event_alert',
      title: `Evento próximo: ${eventName}`,
      message: `El evento "${eventName}" será en ${daysUntilEvent} días. Los precios pueden verse afectados.`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: daysUntilEvent <= 3 ? 'high' : daysUntilEvent <= 7 ? 'medium' : 'low',
      metadata: {
        eventName,
        eventDate
      },
      actions: [
        {
          label: 'Ver hoteles afectados',
          action: () => console.log('Ver hoteles afectados'),
          variant: 'default'
        }
      ]
    };
  }, []);

  const generateRecommendationNotification = useCallback((
    recommendation: string,
    hotelName?: string
  ): Notification => {
    return {
      id: Date.now().toString(),
      type: 'recommendation',
      title: 'Recomendación del Sistema',
      message: recommendation,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'medium',
      metadata: {
        hotelName,
        recommendation
      },
      actions: [
        {
          label: 'Aplicar recomendación',
          action: () => console.log('Aplicar recomendación'),
          variant: 'default'
        }
      ]
    };
  }, []);

  return {
    generatePriceChangeNotification,
    generateEventNotification,
    generateRecommendationNotification
  };
};

export default NotificationSystem; 