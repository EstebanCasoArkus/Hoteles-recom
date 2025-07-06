import React, { useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Star,
  Bookmark,
  Share2,
  ExternalLink,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Event } from '@/lib/hotel-correlation';

interface HotelCardEnhancedProps {
  name: string;
  roomType: string;
  date: string;
  originalPrice: number;
  adjustedPrice: number;
  percentIncrease: number;
  avgPrice: number;
  hasEvent: boolean;
  eventDetails?: Event[];
  impactLevel?: "alto" | "medium" | "low" | "none";
  isPrincipal?: boolean;
  onSelect?: (hotelId: string) => void;
  onBookmark?: (hotelId: string) => void;
  isSelected?: boolean;
  isBookmarked?: boolean;
  className?: string;
}

const formatHotelName = (name: string) =>
  name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(price * 17);

const impactConfig = {
  alto: { color: "text-red-600", bg: "bg-red-50", icon: <Zap className="w-4 h-4" /> },
  medium: { color: "text-orange-600", bg: "bg-orange-50", icon: <AlertTriangle className="w-4 h-4" /> },
  low: { color: "text-yellow-600", bg: "bg-yellow-50", icon: <TrendingUp className="w-4 h-4" /> },
  none: { color: "text-gray-600", bg: "bg-gray-50", icon: <CheckCircle className="w-4 h-4" /> }
};

export const HotelCardEnhanced = memo<HotelCardEnhancedProps>(({
  name,
  roomType,
  date,
  originalPrice,
  adjustedPrice,
  percentIncrease,
  avgPrice,
  hasEvent,
  eventDetails = [],
  impactLevel = "none",
  isPrincipal,
  onSelect,
  onBookmark,
  isSelected,
  isBookmarked,
  className
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const hotelId = `${name}-${roomType}-${date}`;
  const hasAdjustment = adjustedPrice !== originalPrice;
  const priceDifference = adjustedPrice - avgPrice;
  const priceDifferencePercent = ((priceDifference / avgPrice) * 100);
  const impact = impactConfig[impactLevel];

  return (
    <Card 
      className={cn(
        "group relative transition-all duration-300 hover:shadow-xl border-l-4 bg-white dark:bg-gray-800 cursor-pointer",
        isPrincipal ? "border-l-blue-500 ring-2 ring-blue-200" : hasAdjustment ? "border-l-orange-400" : "border-l-gray-300",
        isSelected && "ring-2 ring-blue-400",
        className
      )}
      onClick={() => onSelect?.(hotelId)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200">
              {formatHotelName(name)}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn("w-4 h-4", i < 4 ? "text-yellow-400 fill-current" : "text-gray-300")} />
                ))}
              </div>
              <span className="text-sm text-gray-600">4.5</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">{roomType}</p>
          </div>
          
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onBookmark?.(hotelId); }}>
              <Bookmark className={cn("h-4 w-4", isBookmarked && "text-yellow-600")} />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Pricing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Precio actual:</span>
            <span className="text-2xl font-bold text-gray-900">{formatPrice(adjustedPrice)}</span>
          </div>
          
          {hasAdjustment && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Original:</span>
              <span className="text-gray-500 line-through">{formatPrice(originalPrice)}</span>
            </div>
          )}
          
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">vs Promedio:</span>
              <div className="flex items-center space-x-1">
                {priceDifference > 0 ? <TrendingUp className="w-4 h-4 text-red-500" /> : <TrendingDown className="w-4 h-4 text-green-500" />}
                <span className={cn("text-sm font-medium", priceDifference > 0 ? "text-red-600" : "text-green-600")}>
                  {priceDifference > 0 ? "+" : ""}{priceDifferencePercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Events */}
        {hasEvent && eventDetails.length > 0 && (
          <div className="p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Eventos ({eventDetails.length})</span>
            </div>
            <div className="text-xs text-blue-700">
              {eventDetails.slice(0, 2).map((event, i) => (
                <div key={i}>• {event.titulo}</div>
              ))}
            </div>
          </div>
        )}

        {/* Impact Level */}
        {impactLevel !== 'none' && (
          <Badge className={cn("flex items-center gap-1", impact.color, impact.bg)}>
            {impact.icon}
            Impacto {impactLevel}
          </Badge>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <Button size="sm" className="flex-1">Ver disponibilidad</Button>
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}); 