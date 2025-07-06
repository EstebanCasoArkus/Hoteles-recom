"use client";

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Bookmark, 
  BookmarkCheck, 
  Plus, 
  Star, 
  Heart, 
  Calendar, 
  MapPin, 
  Filter, 
  Edit2, 
  Trash2, 
  Share2, 
  Download,
  Upload,
  Search,
  Tag,
  Clock,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardState } from '@/hooks/use-dashboard-state';

interface BookmarkItem {
  id: string;
  name: string;
  description?: string;
  category: 'filters' | 'hotels' | 'searches' | 'custom';
  filters: {
    searchName: string;
    selectedRoomType: string;
    selectedDate: string;
    priceRange: [number, number];
    showOnlyAdjusted: boolean;
    filterEvents: boolean;
  };
  metadata: {
    createdAt: string;
    lastUsed?: string;
    useCount: number;
    tags: string[];
  };
  isStarred: boolean;
}

interface BookmarkManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: any;
  onApplyBookmark: (filters: any) => void;
}

export const BookmarkManager: React.FC<BookmarkManagerProps> = ({
  isOpen,
  onClose,
  currentFilters,
  onApplyBookmark
}) => {
  const [activeTab, setActiveTab] = useState('my-bookmarks');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newBookmark, setNewBookmark] = useState({
    name: '',
    description: '',
    category: 'filters' as const,
    tags: ''
  });

  const { bookmarks, addBookmark, removeBookmark } = useDashboardState();

  // Mock data for demonstration
  const mockBookmarks: BookmarkItem[] = [
    {
      id: '1',
      name: 'Hoteles Premium Julio',
      description: 'Búsqueda de hoteles premium durante eventos de julio',
      category: 'filters',
      filters: {
        searchName: 'Grand',
        selectedRoomType: 'Suite',
        selectedDate: '2025-07-04',
        priceRange: [2000, 3000],
        showOnlyAdjusted: true,
        filterEvents: true
      },
      metadata: {
        createdAt: '2025-01-15T10:00:00Z',
        lastUsed: '2025-01-16T14:30:00Z',
        useCount: 5,
        tags: ['premium', 'eventos', 'julio']
      },
      isStarred: true
    },
    {
      id: '2',
      name: 'Hoteles Económicos',
      description: 'Opciones económicas sin ajustes de eventos',
      category: 'filters',
      filters: {
        searchName: 'all',
        selectedRoomType: 'Habitación Estándar',
        selectedDate: '2025-07-01',
        priceRange: [1500, 2000],
        showOnlyAdjusted: false,
        filterEvents: false
      },
      metadata: {
        createdAt: '2025-01-14T09:15:00Z',
        lastUsed: '2025-01-15T11:20:00Z',
        useCount: 8,
        tags: ['economico', 'estandar']
      },
      isStarred: false
    },
    {
      id: '3',
      name: 'Hotel Lucerna Favorito',
      description: 'Mi hotel favorito para viajes de negocios',
      category: 'hotels',
      filters: {
        searchName: 'Lucerna',
        selectedRoomType: 'Habitación Doble',
        selectedDate: '2025-07-12',
        priceRange: [1800, 2500],
        showOnlyAdjusted: false,
        filterEvents: false
      },
      metadata: {
        createdAt: '2025-01-10T16:45:00Z',
        lastUsed: '2025-01-16T09:10:00Z',
        useCount: 12,
        tags: ['favorito', 'negocios', 'lucerna']
      },
      isStarred: true
    }
  ];

  const filteredBookmarks = useMemo(() => {
    let filtered = mockBookmarks;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(bookmark => 
        bookmark.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(bookmark => bookmark.category === selectedCategory);
    }

    return filtered;
  }, [searchTerm, selectedCategory]);

  const handleCreateBookmark = () => {
    if (!newBookmark.name.trim()) return;

    const bookmark: BookmarkItem = {
      id: Date.now().toString(),
      name: newBookmark.name,
      description: newBookmark.description,
      category: newBookmark.category,
      filters: currentFilters,
      metadata: {
        createdAt: new Date().toISOString(),
        useCount: 0,
        tags: newBookmark.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      },
      isStarred: false
    };

    addBookmark(bookmark);
    setNewBookmark({
      name: '',
      description: '',
      category: 'filters',
      tags: ''
    });
    setIsCreating(false);
  };

  const handleApplyBookmark = (bookmark: BookmarkItem) => {
    onApplyBookmark(bookmark.filters);
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const categoryColors = {
    filters: 'bg-blue-100 text-blue-800',
    hotels: 'bg-green-100 text-green-800',
    searches: 'bg-purple-100 text-purple-800',
    custom: 'bg-orange-100 text-orange-800'
  };

  const categoryIcons = {
    filters: <Filter className="w-4 h-4" />,
    hotels: <MapPin className="w-4 h-4" />,
    searches: <Search className="w-4 h-4" />,
    custom: <User className="w-4 h-4" />
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bookmark className="w-6 h-6" />
            <span>Gestor de Marcadores</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-bookmarks">Mis Marcadores</TabsTrigger>
            <TabsTrigger value="starred">Favoritos</TabsTrigger>
            <TabsTrigger value="recent">Recientes</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar marcadores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Todas las categorías</option>
              <option value="filters">Filtros</option>
              <option value="hotels">Hoteles</option>
              <option value="searches">Búsquedas</option>
              <option value="custom">Personalizados</option>
            </select>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear
            </Button>
          </div>

          <TabsContent value="my-bookmarks" className="space-y-4">
            {isCreating && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Crear Nuevo Marcador</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bookmark-name">Nombre</Label>
                      <Input
                        id="bookmark-name"
                        placeholder="Nombre del marcador"
                        value={newBookmark.name}
                        onChange={(e) => setNewBookmark(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bookmark-category">Categoría</Label>
                      <select
                        id="bookmark-category"
                        value={newBookmark.category}
                        onChange={(e) => setNewBookmark(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="filters">Filtros</option>
                        <option value="hotels">Hoteles</option>
                        <option value="searches">Búsquedas</option>
                        <option value="custom">Personalizado</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bookmark-description">Descripción</Label>
                    <Input
                      id="bookmark-description"
                      placeholder="Descripción opcional"
                      value={newBookmark.description}
                      onChange={(e) => setNewBookmark(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bookmark-tags">Tags</Label>
                    <Input
                      id="bookmark-tags"
                      placeholder="tag1, tag2, tag3"
                      value={newBookmark.tags}
                      onChange={(e) => setNewBookmark(prev => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreating(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateBookmark}>
                      Crear Marcador
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBookmarks.map((bookmark) => (
                <Card key={bookmark.id} className="group hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <span>{bookmark.name}</span>
                          {bookmark.isStarred && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{bookmark.description}</p>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Badge className={categoryColors[bookmark.category]}>
                          {categoryIcons[bookmark.category]}
                          <span className="ml-1 capitalize">{bookmark.category}</span>
                        </Badge>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(bookmark.metadata.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {bookmark.metadata.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-sm text-gray-600">
                        <div>Hotel: {bookmark.filters.searchName}</div>
                        <div>Tipo: {bookmark.filters.selectedRoomType}</div>
                        <div>Fecha: {bookmark.filters.selectedDate}</div>
                        <div>Precio: ${bookmark.filters.priceRange[0]} - ${bookmark.filters.priceRange[1]}</div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Usado {bookmark.metadata.useCount} veces</span>
                        <span>Última vez: {bookmark.metadata.lastUsed ? formatDate(bookmark.metadata.lastUsed) : 'Nunca'}</span>
                      </div>

                      <Separator />

                      <div className="flex space-x-2">
                        <Button 
                          className="flex-1" 
                          size="sm"
                          onClick={() => handleApplyBookmark(bookmark)}
                        >
                          <BookmarkCheck className="w-4 h-4 mr-1" />
                          Aplicar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredBookmarks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No se encontraron marcadores</p>
                <p className="text-sm">Crea tu primer marcador para comenzar</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="starred" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBookmarks.filter(b => b.isStarred).map((bookmark) => (
                <Card key={bookmark.id} className="group hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{bookmark.name}</span>
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{bookmark.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Badge className={categoryColors[bookmark.category]}>
                          {categoryIcons[bookmark.category]}
                          <span className="ml-1 capitalize">{bookmark.category}</span>
                        </Badge>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(bookmark.metadata.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          className="flex-1" 
                          size="sm"
                          onClick={() => handleApplyBookmark(bookmark)}
                        >
                          <BookmarkCheck className="w-4 h-4 mr-1" />
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBookmarks
                .sort((a, b) => new Date(b.metadata.lastUsed || b.metadata.createdAt).getTime() - new Date(a.metadata.lastUsed || a.metadata.createdAt).getTime())
                .slice(0, 6)
                .map((bookmark) => (
                  <Card key={bookmark.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <span>{bookmark.name}</span>
                            {bookmark.isStarred && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{bookmark.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Badge className={categoryColors[bookmark.category]}>
                            {categoryIcons[bookmark.category]}
                            <span className="ml-1 capitalize">{bookmark.category}</span>
                          </Badge>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>Última vez: {bookmark.metadata.lastUsed ? formatDate(bookmark.metadata.lastUsed) : 'Nunca'}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            className="flex-1" 
                            size="sm"
                            onClick={() => handleApplyBookmark(bookmark)}
                          >
                            <BookmarkCheck className="w-4 h-4 mr-1" />
                            Aplicar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
          </div>
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 