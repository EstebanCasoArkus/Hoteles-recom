import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Bookmark, 
  Star, 
  Trash2, 
  Edit, 
  Search,
  Plus,
  Clock,
  Filter,
  TrendingUp,
  Calendar,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HotelFilters } from '@/hooks/use-hotel-data';

interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: HotelFilters;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  category: 'general' | 'events' | 'pricing' | 'location' | 'custom';
  usageCount: number;
  tags: string[];
}

interface FilterPresetsProps {
  presets: FilterPreset[];
  onApplyPreset: (preset: FilterPreset) => void;
  onSavePreset: (name: string, filters: HotelFilters) => void;
  onUpdatePreset: (id: string, updates: Partial<FilterPreset>) => void;
  onDeletePreset: (id: string) => void;
  currentFilters: HotelFilters;
  className?: string;
}

const categoryConfig = {
  general: { icon: Filter, label: 'General', color: 'bg-gray-100 text-gray-800' },
  events: { icon: Calendar, label: 'Eventos', color: 'bg-blue-100 text-blue-800' },
  pricing: { icon: TrendingUp, label: 'Precios', color: 'bg-green-100 text-green-800' },
  location: { icon: Building2, label: 'Ubicación', color: 'bg-orange-100 text-orange-800' },
  custom: { icon: Star, label: 'Personalizado', color: 'bg-purple-100 text-purple-800' }
};

const defaultPresets: FilterPreset[] = [
  {
    id: 'events-high-impact',
    name: 'Eventos de Alto Impacto',
    description: 'Hoteles con eventos que tienen alto impacto en precios',
    filters: {
      searchName: 'all',
      selectedRoomType: 'Todas',
      selectedDate: new Date().toISOString().split('T')[0],
      showOnlyAdjusted: false,
      selectedPrincipalHotel: 'none',
      priceRange: [1700, 2600],
      filterEvents: true,
      filterAdjusted: true,
      filterSignificantDiff: true
    },
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    isFavorite: true,
    category: 'events',
    usageCount: 45,
    tags: ['eventos', 'alto-impacto', 'precios']
  },
  {
    id: 'premium-suites',
    name: 'Suites Premium',
    description: 'Análisis de suites con precios premium',
    filters: {
      searchName: 'all',
      selectedRoomType: 'Suite',
      selectedDate: new Date().toISOString().split('T')[0],
      showOnlyAdjusted: false,
      selectedPrincipalHotel: 'none',
      priceRange: [2500, 5000],
      filterEvents: false,
      filterAdjusted: false,
      filterSignificantDiff: false
    },
    createdAt: '2025-01-02',
    updatedAt: '2025-01-05',
    isFavorite: false,
    category: 'pricing',
    usageCount: 23,
    tags: ['suite', 'premium', 'lujo']
  },
  {
    id: 'budget-friendly',
    name: 'Opciones Económicas',
    description: 'Hoteles con mejores precios sin eventos',
    filters: {
      searchName: 'all',
      selectedRoomType: 'Todas',
      selectedDate: new Date().toISOString().split('T')[0],
      showOnlyAdjusted: false,
      selectedPrincipalHotel: 'none',
      priceRange: [1000, 2000],
      filterEvents: false,
      filterAdjusted: false,
      filterSignificantDiff: false
    },
    createdAt: '2025-01-03',
    updatedAt: '2025-01-03',
    isFavorite: true,
    category: 'pricing',
    usageCount: 67,
    tags: ['económico', 'presupuesto', 'mejor-precio']
  }
];

export const FilterPresets: React.FC<FilterPresetsProps> = ({
  presets = defaultPresets,
  onApplyPreset,
  onSavePreset,
  onUpdatePreset,
  onDeletePreset,
  currentFilters,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingPreset, setEditingPreset] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const filteredPresets = presets.filter(preset => {
    const matchesSearch = preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         preset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         preset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const favoritePresets = filteredPresets.filter(p => p.isFavorite);
  const recentPresets = filteredPresets
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const handleApplyPreset = (preset: FilterPreset) => {
    onApplyPreset(preset);
    // Increment usage count
    onUpdatePreset(preset.id, { 
      usageCount: preset.usageCount + 1,
      updatedAt: new Date().toISOString()
    });
  };

  const handleToggleFavorite = (preset: FilterPreset) => {
    onUpdatePreset(preset.id, { isFavorite: !preset.isFavorite });
  };

  const handleEditPreset = (preset: FilterPreset) => {
    setEditingPreset(preset.id);
    setEditName(preset.name);
  };

  const handleSaveEdit = (preset: FilterPreset) => {
    if (editName.trim()) {
      onUpdatePreset(preset.id, { 
        name: editName,
        updatedAt: new Date().toISOString()
      });
    }
    setEditingPreset(null);
    setEditName('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getActiveFiltersCount = (filters: HotelFilters) => {
    let count = 0;
    if (filters.searchName !== 'all') count++;
    if (filters.selectedRoomType !== 'Todas') count++;
    if (filters.filterEvents) count++;
    if (filters.filterAdjusted) count++;
    if (filters.filterSignificantDiff) count++;
    return count;
  };

  const PresetCard = ({ preset }: { preset: FilterPreset }) => {
    const categoryInfo = categoryConfig[preset.category];
    const CategoryIcon = categoryInfo.icon;
    const activeFilters = getActiveFiltersCount(preset.filters);

    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {editingPreset === preset.id ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(preset);
                        if (e.key === 'Escape') setEditingPreset(null);
                      }}
                    />
                    <Button size="sm" onClick={() => handleSaveEdit(preset)}>
                      ✓
                    </Button>
                  </div>
                ) : (
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {preset.name}
                  </h4>
                )}
                
                {preset.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {preset.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleFavorite(preset)}
                  className="p-1"
                >
                  <Star className={cn(
                    "w-4 h-4",
                    preset.isFavorite ? "text-yellow-500 fill-current" : "text-gray-400"
                  )} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditPreset(preset)}
                  className="p-1"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeletePreset(preset.id)}
                  className="p-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Category and Metrics */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge className={cn("text-xs", categoryInfo.color)}>
                  <CategoryIcon className="w-3 h-3 mr-1" />
                  {categoryInfo.label}
                </Badge>
                
                <Badge variant="outline" className="text-xs">
                  {activeFilters} filtros
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatDate(preset.updatedAt)}</span>
                <span>•</span>
                <span>{preset.usageCount} usos</span>
              </div>
            </div>

            {/* Tags */}
            {preset.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {preset.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {preset.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{preset.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Apply Button */}
            <Button
              size="sm"
              onClick={() => handleApplyPreset(preset)}
              className="w-full"
            >
              Aplicar Preset
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bookmark className="w-5 h-5" />
          <span>Presets de Filtros</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar presets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              Todos
            </Button>
            {Object.entries(categoryConfig).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className="flex items-center space-x-1"
                >
                  <Icon className="w-3 h-3" />
                  <span>{config.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Favorites Section */}
        {favoritePresets.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Favoritos</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {favoritePresets.map((preset) => (
                <PresetCard key={preset.id} preset={preset} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Section */}
        {recentPresets.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Recientes</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentPresets.map((preset) => (
                <PresetCard key={preset.id} preset={preset} />
              ))}
            </div>
          </div>
        )}

        {/* All Presets */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Todos los Presets ({filteredPresets.length})
          </h3>
          
          {filteredPresets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay presets disponibles</p>
              <p className="text-xs">Crea filtros y guárdalos como presets</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPresets.map((preset) => (
                <PresetCard key={preset.id} preset={preset} />
              ))}
            </div>
          )}
        </div>

        {/* Save Current Filters */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => onSavePreset('Nuevo Preset', currentFilters)}
            className="w-full flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Guardar Filtros Actuales como Preset</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 