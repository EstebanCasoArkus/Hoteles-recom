import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Calendar, 
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon: React.ReactNode;
  trend?: Array<{ period: string; value: number }>;
  status?: 'good' | 'warning' | 'critical' | 'neutral';
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  status = 'neutral',
  className 
}) => {
  const statusConfig = {
    good: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10',
    warning: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10',
    critical: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10',
    neutral: 'border-gray-200 dark:border-gray-700'
  };

  return (
    <Card className={cn('transition-all duration-200 hover:shadow-md', statusConfig[status], className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                {icon}
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              
              {change && (
                <div className="flex items-center space-x-1">
                  {change.type === 'increase' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : change.type === 'decrease' ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : (
                    <Activity className="w-4 h-4 text-gray-600" />
                  )}
                  <span className={cn(
                    "text-sm font-medium",
                    change.type === 'increase' ? 'text-green-600 dark:text-green-400' :
                    change.type === 'decrease' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-600 dark:text-gray-400'
                  )}>
                    {change.value > 0 ? '+' : ''}{change.value}% vs {change.period}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {status !== 'neutral' && (
            <div className="ml-4">
              {status === 'good' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {status === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
              {status === 'critical' && <Zap className="w-5 h-5 text-red-600" />}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface MetricsOverviewProps {
  stats: {
    totalHotels: number;
    hotelsWithAdjustment: number;
    hotelsWithEvents: number;
    avgIncrease: number;
    eventsToday: number;
    impactDistribution: {
      alto: number;
      medium: number;
      low: number;
      none: number;
    };
  };
  priceRange: {
    min: number;
    max: number;
    avg: number;
  };
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ stats, priceRange }) => {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat("es-MX", { 
      style: "currency", 
      currency: "MXN", 
      minimumFractionDigits: 0 
    }).format(value * 17);

  const adjustmentRate = (stats.hotelsWithAdjustment / stats.totalHotels) * 100;
  const eventRate = (stats.hotelsWithEvents / stats.totalHotels) * 100;
  const highImpactRate = (stats.impactDistribution.alto / stats.totalHotels) * 100;

  const metrics = [
    {
      title: "Total de Hoteles",
      value: stats.totalHotels,
      icon: <Building2 className="w-5 h-5" />,
      change: {
        value: 5.2,
        type: 'increase' as const,
        period: 'mes anterior'
      },
      status: 'good' as const
    },
    {
      title: "Precio Promedio",
      value: formatCurrency(priceRange.avg),
      icon: <DollarSign className="w-5 h-5" />,
      change: {
        value: stats.avgIncrease,
        type: stats.avgIncrease > 0 ? 'increase' as const : 'decrease' as const,
        period: 'precio base'
      },
      status: stats.avgIncrease > 15 ? 'critical' as const : 
              stats.avgIncrease > 5 ? 'warning' as const : 'good' as const
    },
    {
      title: "Hoteles con Ajustes",
      value: `${stats.hotelsWithAdjustment} (${adjustmentRate.toFixed(1)}%)`,
      icon: <TrendingUp className="w-5 h-5" />,
      status: adjustmentRate > 60 ? 'warning' as const : 'neutral' as const
    },
    {
      title: "Eventos Hoy",
      value: `${stats.eventsToday} eventos`,
      icon: <Calendar className="w-5 h-5" />,
      change: {
        value: eventRate,
        type: 'neutral' as const,
        period: `${eventRate.toFixed(1)}% hoteles afectados`
      },
      status: stats.eventsToday > 3 ? 'warning' as const : 'good' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Impact Distribution */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Distribución de Impacto
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.impactDistribution.alto}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Alto Impacto</div>
                <Badge variant="destructive" className="mt-1">
                  {((stats.impactDistribution.alto / stats.totalHotels) * 100).toFixed(1)}%
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.impactDistribution.medium}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Impacto Medio</div>
                <Badge variant="secondary" className="mt-1">
                  {((stats.impactDistribution.medium / stats.totalHotels) * 100).toFixed(1)}%
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.impactDistribution.low}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Bajo Impacto</div>
                <Badge variant="outline" className="mt-1">
                  {((stats.impactDistribution.low / stats.totalHotels) * 100).toFixed(1)}%
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.impactDistribution.none}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sin Impacto</div>
                <Badge variant="default" className="mt-1">
                  {((stats.impactDistribution.none / stats.totalHotels) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
            
            {/* Impact Level Indicator */}
            <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nivel de Impacto General:
                </span>
                <Badge className={cn(
                  highImpactRate > 30 ? 'bg-red-100 text-red-800 border-red-300' :
                  highImpactRate > 15 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                  'bg-green-100 text-green-800 border-green-300'
                )}>
                  {highImpactRate > 30 ? 'Crítico' : 
                   highImpactRate > 15 ? 'Moderado' : 'Estable'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 