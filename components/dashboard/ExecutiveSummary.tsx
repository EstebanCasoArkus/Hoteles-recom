import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb,
  Target,
  Calendar,
  DollarSign,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightItem {
  id: string;
  type: 'opportunity' | 'warning' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  actionable: boolean;
  metrics?: {
    label: string;
    value: string;
    change?: number;
  }[];
}

interface ExecutiveSummaryProps {
  insights: InsightItem[];
  keyFindings: {
    bestPerformingCategory: string;
    worstPerformingCategory: string;
    averagePriceChange: number;
    totalRevenue: number;
    occupancyRate: number;
  };
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedImpact: string;
    timeframe: string;
  }>;
}

const priorityConfig = {
  urgent: { color: 'text-red-600', bg: 'bg-red-50', label: 'Urgente' },
  high: { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Alta' },
  medium: { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Media' },
  low: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Baja' }
};

const typeConfig = {
  opportunity: { icon: Target, color: 'text-green-600', label: 'Oportunidad' },
  warning: { icon: AlertTriangle, color: 'text-red-600', label: 'Alerta' },
  trend: { icon: TrendingUp, color: 'text-blue-600', label: 'Tendencia' },
  recommendation: { icon: Lightbulb, color: 'text-purple-600', label: 'Recomendación' }
};

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  insights,
  keyFindings,
  recommendations
}) => {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat("es-MX", { 
      style: "currency", 
      currency: "MXN", 
      minimumFractionDigits: 0 
    }).format(value);

  const sortedInsights = insights
    .sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 6); // Show top 6 insights

  const topRecommendations = recommendations
    .filter(r => r.priority === 'high')
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Key Findings Header */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Resumen Ejecutivo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {keyFindings.averagePriceChange > 0 ? '+' : ''}{keyFindings.averagePriceChange.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cambio promedio en precios</div>
              <div className="flex items-center justify-center mt-1">
                {keyFindings.averagePriceChange > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {keyFindings.occupancyRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tasa de ocupación</div>
              <Badge 
                variant={keyFindings.occupancyRate > 85 ? "default" : "secondary"}
                className="mt-1"
              >
                {keyFindings.occupancyRate > 85 ? 'Excelente' : 'Buena'}
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(keyFindings.totalRevenue)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ingresos estimados</div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">del día</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sortedInsights.map((insight) => {
          const typeInfo = typeConfig[insight.type];
          const priorityInfo = priorityConfig[insight.priority];
          const Icon = typeInfo.icon;

          return (
            <Card key={insight.id} className="transition-all duration-200 hover:shadow-md">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={cn('p-1.5 rounded-lg', 
                        insight.type === 'opportunity' ? 'bg-green-100 text-green-600' :
                        insight.type === 'warning' ? 'bg-red-100 text-red-600' :
                        insight.type === 'trend' ? 'bg-blue-100 text-blue-600' :
                        'bg-purple-100 text-purple-600'
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {insight.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {typeInfo.label}
                          </Badge>
                          <Badge className={cn("text-xs", priorityInfo.color, priorityInfo.bg)}>
                            {priorityInfo.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {insight.description}
                  </p>

                  {/* Metrics */}
                  {insight.metrics && insight.metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {insight.metrics.map((metric, index) => (
                        <div key={index} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {metric.value}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {metric.label}
                          </div>
                          {metric.change && (
                            <div className={cn(
                              "text-xs",
                              metric.change > 0 ? "text-green-600" : "text-red-600"
                            )}>
                              {metric.change > 0 ? '+' : ''}{metric.change}%
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Button */}
                  {insight.actionable && (
                    <Button variant="outline" size="sm" className="w-full">
                      Ver detalles
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <span>Recomendaciones Prioritarias</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topRecommendations.map((rec, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {rec.title}
                  </h4>
                  <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                    {rec.priority === 'high' ? 'Alta prioridad' : rec.priority}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {rec.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center space-x-2">
                    <Target className="w-3 h-3 text-blue-600" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Impacto estimado: <span className="font-medium">{rec.estimatedImpact}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3 text-green-600" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Plazo: <span className="font-medium">{rec.timeframe}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {recommendations.length > 3 && (
              <Button variant="outline" className="w-full">
                Ver todas las recomendaciones ({recommendations.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 