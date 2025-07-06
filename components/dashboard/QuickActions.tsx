import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Upload, 
  RefreshCw, 
  Settings, 
  Filter,
  Calendar,
  BarChart3,
  Mail,
  Share2,
  Bookmark,
  Plus,
  Search,
  Target,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  badge?: string;
  disabled?: boolean;
  shortcut?: string;
}

interface QuickActionsProps {
  onExportData: () => void;
  onImportData: () => void;
  onRefreshData: () => void;
  onOpenSettings: () => void;
  onOpenFilters: () => void;
  onScheduleReport: () => void;
  onCreateBookmark: () => void;
  onBulkUpdate: () => void;
  onQuickAnalysis: () => void;
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onExportData,
  onImportData,
  onRefreshData,
  onOpenSettings,
  onOpenFilters,
  onScheduleReport,
  onCreateBookmark,
  onBulkUpdate,
  onQuickAnalysis,
  className
}) => {
  const primaryActions: QuickActionItem[] = [
    {
      id: 'refresh',
      title: 'Actualizar Datos',
      description: 'Sincronizar con fuentes externas',
      icon: <RefreshCw className="w-4 h-4" />,
      onClick: onRefreshData,
      shortcut: 'Ctrl+R'
    },
    {
      id: 'quick-analysis',
      title: 'Análisis Rápido',
      description: 'Generar insights automáticos',
      icon: <Zap className="w-4 h-4" />,
      onClick: onQuickAnalysis,
      variant: 'default'
    },
    {
      id: 'filters',
      title: 'Filtros Avanzados',
      description: 'Personalizar vista de datos',
      icon: <Filter className="w-4 h-4" />,
      onClick: onOpenFilters,
      variant: 'outline'
    },
    {
      id: 'export',
      title: 'Exportar Reporte',
      description: 'Descargar datos en Excel/PDF',
      icon: <Download className="w-4 h-4" />,
      onClick: onExportData,
      variant: 'outline'
    }
  ];

  const secondaryActions: QuickActionItem[] = [
    {
      id: 'schedule-report',
      title: 'Programar Reporte',
      description: 'Envío automático por email',
      icon: <Mail className="w-4 h-4" />,
      onClick: onScheduleReport,
      variant: 'outline'
    },
    {
      id: 'bookmark',
      title: 'Guardar Vista',
      description: 'Crear marcador de filtros',
      icon: <Bookmark className="w-4 h-4" />,
      onClick: onCreateBookmark,
      variant: 'outline'
    },
    {
      id: 'bulk-update',
      title: 'Actualización Masiva',
      description: 'Modificar múltiples hoteles',
      icon: <Target className="w-4 h-4" />,
      onClick: onBulkUpdate,
      variant: 'outline',
      badge: 'Pro'
    },
    {
      id: 'import',
      title: 'Importar Datos',
      description: 'Cargar archivo CSV/Excel',
      icon: <Upload className="w-4 h-4" />,
      onClick: onImportData,
      variant: 'outline'
    }
  ];

  const quickFilters = [
    { label: 'Con eventos', count: 12, active: false },
    { label: 'Precio alto', count: 8, active: false },
    { label: 'Sin ajustes', count: 24, active: true },
    { label: 'Suite premium', count: 6, active: false }
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Primary Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {primaryActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                className="h-auto p-4 flex flex-col items-start space-y-2 text-left"
                onClick={action.onClick}
                disabled={action.disabled}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-2 rounded-lg bg-white/10">
                    {action.icon}
                  </div>
                  {action.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs opacity-80">{action.description}</div>
                  {action.shortcut && (
                    <div className="text-xs opacity-60 font-mono">
                      {action.shortcut}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtros Rápidos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter, index) => (
              <Button
                key={index}
                variant={filter.active ? "default" : "outline"}
                size="sm"
                className="flex items-center space-x-2"
              >
                <span>{filter.label}</span>
                <Badge 
                  variant={filter.active ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {filter.count}
                </Badge>
              </Button>
            ))}
            
            <Button variant="ghost" size="sm" className="text-blue-600">
              <Plus className="w-4 h-4 mr-1" />
              Crear filtro
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Herramientas Avanzadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {secondaryActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                className="h-auto p-3 flex items-center space-x-3 text-left justify-start"
                onClick={action.onClick}
                disabled={action.disabled}
              >
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  {action.icon}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{action.title}</div>
                    {action.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {action.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
          
          {/* Settings Access */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={onOpenSettings}
              className="w-full flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Configuración avanzada</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Estadísticas Rápidas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">47</div>
              <div className="text-xs text-gray-600">Hoteles activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">23</div>
              <div className="text-xs text-gray-600">Con ajustes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">8</div>
              <div className="text-xs text-gray-600">Eventos hoy</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 