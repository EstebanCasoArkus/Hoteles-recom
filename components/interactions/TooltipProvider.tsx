import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  MapPin, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Users,
  Clock,
  DollarSign,
  Info
} from 'lucide-react';

interface TooltipData {
  title: string;
  subtitle?: string;
  content: React.ReactNode | string;
  type?: 'info' | 'warning' | 'success' | 'error';
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  showArrow?: boolean;
  maxWidth?: number;
}

interface HotelTooltipData {
  hotelName: string;
  roomType: string;
  originalPrice: number;
  adjustedPrice: number;
  percentChange: number;
  rating: number;
  events: Array<{ title: string; attendees: number }>;
  amenities: string[];
  availability: number;
  lastUpdated: string;
}

interface RichTooltipProps {
  data: TooltipData;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  disabled?: boolean;
}

export const RichTooltip: React.FC<RichTooltipProps> = ({
  data,
  children,
  className,
  delay = 300,
  disabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(() => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition({
          x: rect.left + rect.width / 2,
          y: rect.top
        });
        setIsVisible(true);
      }
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const getTypeStyles = () => {
    switch (data.type) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      default:
        return 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800';
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={className}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: position.x,
            top: position.y - 10,
            transform: 'translateX(-50%) translateY(-100%)',
            maxWidth: data.maxWidth || 320
          }}
        >
          <Card className={cn('shadow-lg', getTypeStyles())}>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {data.title}
                  </h4>
                  {data.subtitle && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {data.subtitle}
                    </p>
                  )}
                </div>
                
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {data.content}
                </div>
              </div>
            </CardContent>
            
            {data.showArrow !== false && (
              <div 
                className="absolute top-full left-1/2 transform -translate-x-1/2"
                style={{ 
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid rgb(229 231 235)',
                }}
              />
            )}
          </Card>
        </div>
      )}
    </>
  );
};

// Specialized tooltip for hotel data
export const HotelTooltip: React.FC<{
  data: HotelTooltipData;
  children: React.ReactNode;
  className?: string;
}> = ({ data, children, className }) => {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
    }).format(price * 17);

  const formatHotelName = (name: string) =>
    name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const tooltipContent = (
    <div className="space-y-3">
      {/* Header */}
      <div className="space-y-1">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          {formatHotelName(data.hotelName)}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {data.roomType}
        </p>
        
        {/* Rating */}
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={cn(
              "w-3 h-3",
              i < Math.floor(data.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
            )} />
          ))}
          <span className="text-xs text-gray-600 ml-1">{data.rating}</span>
        </div>
      </div>
      
      {/* Pricing */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Precio actual:</span>
          <span className="font-semibold">{formatPrice(data.adjustedPrice)}</span>
        </div>
        
        {data.adjustedPrice !== data.originalPrice && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Original:</span>
            <span className="text-sm line-through text-gray-500">
              {formatPrice(data.originalPrice)}
            </span>
          </div>
        )}
        
        {data.percentChange !== 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Cambio:</span>
            <div className="flex items-center space-x-1">
              {data.percentChange > 0 ? (
                <TrendingUp className="w-3 h-3 text-red-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-green-600" />
              )}
              <span className={cn(
                "text-sm font-medium",
                data.percentChange > 0 ? "text-red-600" : "text-green-600"
              )}>
                {data.percentChange > 0 ? '+' : ''}{data.percentChange.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Events */}
      {data.events && data.events.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Eventos ({data.events.length})
            </span>
          </div>
          <div className="space-y-1">
            {data.events.slice(0, 2).map((event, index) => (
              <div key={index} className="text-xs text-gray-600">
                • {event.title}
                {event.attendees && (
                  <span className="text-gray-500"> ({event.attendees} asistentes)</span>
                )}
              </div>
            ))}
            {data.events.length > 2 && (
              <div className="text-xs text-gray-500">
                +{data.events.length - 2} más
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Availability */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Disponibilidad:</span>
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-gray-200 rounded-full h-1.5">
            <div 
              className={cn(
                "h-1.5 rounded-full",
                data.availability > 70 ? "bg-green-500" :
                data.availability > 30 ? "bg-yellow-500" : "bg-red-500"
              )}
              style={{ width: `${data.availability}%` }}
            />
          </div>
          <span className="text-xs font-medium">{data.availability}%</span>
        </div>
      </div>
      
      {/* Amenities */}
      {data.amenities && data.amenities.length > 0 && (
        <div className="space-y-1">
          <span className="text-sm font-medium text-gray-700">Amenidades:</span>
          <div className="flex flex-wrap gap-1">
            {data.amenities.slice(0, 4).map((amenity, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {data.amenities.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{data.amenities.length - 4}
              </Badge>
            )}
          </div>
        </div>
      )}
      
      {/* Last Updated */}
      <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>Actualizado: {data.lastUpdated}</span>
        </div>
      </div>
    </div>
  );

  return (
    <RichTooltip
      data={{
        title: formatHotelName(data.hotelName),
        subtitle: data.roomType,
        content: tooltipContent,
        maxWidth: 350
      }}
      className={className}
    >
      {children}
    </RichTooltip>
  );
};

// Tooltip for price changes
export const PriceChangeTooltip: React.FC<{
  originalPrice: number;
  adjustedPrice: number;
  breakdown: Record<string, any>;
  children: React.ReactNode;
  className?: string;
}> = ({ originalPrice, adjustedPrice, breakdown, children, className }) => {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
    }).format(price * 17);

  const difference = adjustedPrice - originalPrice;
  const percentChange = ((difference / originalPrice) * 100);

  const tooltipContent = (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Precio original:</span>
          <span className="font-medium">{formatPrice(originalPrice)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Precio ajustado:</span>
          <span className="font-medium">{formatPrice(adjustedPrice)}</span>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-sm font-medium">Diferencia:</span>
          <div className="flex items-center space-x-1">
            {difference > 0 ? (
              <TrendingUp className="w-3 h-3 text-red-600" />
            ) : difference < 0 ? (
              <TrendingDown className="w-3 h-3 text-green-600" />
            ) : null}
            <span className={cn(
              "font-semibold",
              difference > 0 ? "text-red-600" : difference < 0 ? "text-green-600" : "text-gray-600"
            )}>
              {difference > 0 ? '+' : ''}{formatPrice(Math.abs(difference))}
            </span>
            <span className="text-sm text-gray-500">
              ({percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
      
      {Object.keys(breakdown).length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700">Desglose:</span>
          <div className="space-y-1">
            {Object.entries(breakdown).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-gray-600">{key}:</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <RichTooltip
      data={{
        title: "Detalles del Precio",
        content: tooltipContent,
        type: difference > 0 ? 'warning' : difference < 0 ? 'success' : 'info'
      }}
      className={className}
    >
      {children}
    </RichTooltip>
  );
}; 