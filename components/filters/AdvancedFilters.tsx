import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Filter, 
  Search, 
  X, 
  Calendar as CalendarIcon,
  DollarSign,
  Building2,
  Tag,
  Users,
  MapPin,
  Star,
  TrendingUp,
  Save,
  RotateCcw,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HotelFilters } from '@/hooks/use-hotel-data';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
  description?: string;
}

interface FilterSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  type: 'select' | 'multiselect' | 'range' | 'date' | 'toggle' | 'search';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
}

interface AdvancedFiltersProps {
  filters: HotelFilters;
  onFiltersChange: (filters: Partial<HotelFilters>) => void;
  onResetFilters: () => void;
  onSavePreset: (name: string, filters: HotelFilters) => void;
  availableOptions: {
    hotelNames: string[];
    roomTypes: string[];
    dates: string[];
    locations: string[];
    amenities: string[];
  };
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onResetFilters,
  onSavePreset,
  availableOptions,
  className,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>(filters.priceRange);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [presetName, setPresetName] = useState('');

  const filterSections: FilterSection[] = [
    {
      id: 'search',
      title: 'Búsqueda',
      icon: <Search className="w-4 h-4" />,
      type: 'search'
    },
    {
      id: 'hotel',
      title: 'Hotel',
      icon: <Building2 className="w-4 h-4" />,
      type: 'select',
      options: [
        { value: 'all', label: 'Todos los hoteles' },
        ...availableOptions.hotelNames.map(name => ({
          value: name,
          label: name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
        }))
      ]
    },
    {
      id: 'roomType',
      title: 'Tipo de Habitación',
      icon: <Tag className="w-4 h-4" />,
      type: 'select',
      options: [
        { value: 'Todas', label: 'Todas las habitaciones' },
        ...availableOptions.roomTypes.map(type => ({
          value: type,
          label: type
        }))
      ]
    },
    {
      id: 'priceRange',
      title: 'Rango de Precio (MXN)',
      icon: <DollarSign className="w-4 h-4" />,
      type: 'range',
      min: 0,
      max: 10000,
      step: 100
    },
    {
      id: 'date',
      title: 'Fecha',
      icon: <CalendarIcon className="w-4 h-4" />,
      type: 'date'
    }
  ];

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchName !== 'all') count++;
    if (filters.selectedRoomType !== 'Todas') count++;
    if (filters.filterEvents) count++;
    if (filters.filterAdjusted) count++;
    if (filters.filterSignificantDiff) count++;
    if (selectedAmenities.length > 0) count++;
    return count;
  }, [filters, selectedAmenities]);

  const handleFilterChange = (key: keyof HotelFilters, value: any) => {
    onFiltersChange({ [key]: value });
  };

  const handlePriceRangeChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
    onFiltersChange({ priceRange: newRange });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Implement smart search logic here
    if (query) {
      const matchingHotel = availableOptions.hotelNames.find(name => 
        name.toLowerCase().includes(query.toLowerCase())
      );
      if (matchingHotel) {
        onFiltersChange({ searchName: matchingHotel });
      }
    }
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      onSavePreset(presetName, filters);
      setPresetName('');
      setShowPresetDialog(false);
    }
  };

  const formatPrice = (price: number) => 
    new Intl.NumberFormat("es-MX", { 
      style: "currency", 
      currency: "MXN", 
      minimumFractionDigits: 0 
    }).format(price);

  if (isCollapsed) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Filtros</span>
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtros Avanzados</span>
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="text-xs">
                {activeFiltersCount} activos
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowPresetDialog(true)}>
              <Save className="w-4 h-4 mr-1" />
              Guardar
            </Button>
            <Button variant="outline" size="sm" onClick={onResetFilters}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Limpiar
            </Button>
            {onToggleCollapse && (
              <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Smart Search */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span>Búsqueda Inteligente</span>
          </Label>
          <Input
            placeholder="Buscar hoteles, ubicaciones, amenidades..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full"
          />
          {searchQuery && (
            <div className="text-xs text-gray-500">
              Resultados se filtran automáticamente mientras escribes
            </div>
          )}
        </div>

        {/* Hotel Selection */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>Hotel</span>
          </Label>
          <Select value={filters.searchName} onValueChange={(value) => handleFilterChange('searchName', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los hoteles</SelectItem>
              {availableOptions.hotelNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Room Type */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Tag className="w-4 h-4" />
            <span>Tipo de Habitación</span>
          </Label>
          <Select value={filters.selectedRoomType} onValueChange={(value) => handleFilterChange('selectedRoomType', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas las habitaciones</SelectItem>
              {availableOptions.roomTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Rango de Precio</span>
          </Label>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
            <Slider
              min={0}
              max={10000}
              step={100}
              value={priceRange}
              onValueChange={(value) => handlePriceRangeChange(value as [number, number])}
              className="w-full"
            />
          </div>
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4" />
            <span>Fecha</span>
          </Label>
          <Select value={filters.selectedDate} onValueChange={(value) => handleFilterChange('selectedDate', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64 overflow-y-auto">
              {availableOptions.dates.map((date) => (
                <SelectItem key={date} value={date}>
                  {date}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Filters */}
        <div className="space-y-3">
          <Label>Filtros Rápidos</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="events-filter" className="text-sm">Solo con eventos</Label>
              <Switch
                id="events-filter"
                checked={filters.filterEvents}
                onCheckedChange={(checked) => handleFilterChange('filterEvents', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="adjusted-filter" className="text-sm">Solo con ajustes de precio</Label>
              <Switch
                id="adjusted-filter"
                checked={filters.filterAdjusted}
                onCheckedChange={(checked) => handleFilterChange('filterAdjusted', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="significant-diff-filter" className="text-sm">Diferencia significativa (&gt;10%)</Label>
              <Switch
                id="significant-diff-filter"
                checked={filters.filterSignificantDiff}
                onCheckedChange={(checked) => handleFilterChange('filterSignificantDiff', checked)}
              />
            </div>
          </div>
        </div>

        {/* Principal Hotel Selection */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>Hotel Principal (para comparación)</span>
          </Label>
          <Select value={filters.selectedPrincipalHotel} onValueChange={(value) => handleFilterChange('selectedPrincipalHotel', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar hotel principal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin selección</SelectItem>
              {availableOptions.hotelNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Filtros Activos ({activeFiltersCount})
              </span>
              <Button variant="ghost" size="sm" onClick={onResetFilters}>
                <X className="w-3 h-3 mr-1" />
                Limpiar todos
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {filters.searchName !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Hotel: {filters.searchName.replace(/_/g, ' ')}
                </Badge>
              )}
              {filters.selectedRoomType !== 'Todas' && (
                <Badge variant="secondary" className="text-xs">
                  Habitación: {filters.selectedRoomType}
                </Badge>
              )}
              {filters.filterEvents && (
                <Badge variant="secondary" className="text-xs">Con eventos</Badge>
              )}
              {filters.filterAdjusted && (
                <Badge variant="secondary" className="text-xs">Con ajustes</Badge>
              )}
              {filters.filterSignificantDiff && (
                <Badge variant="secondary" className="text-xs">Diferencia &gt;10%</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Save Preset Dialog */}
      {showPresetDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Guardar Preset de Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preset-name">Nombre del preset</Label>
                <Input
                  id="preset-name"
                  placeholder="Ej: Hoteles con eventos de alto impacto"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowPresetDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
                  Guardar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
}; 