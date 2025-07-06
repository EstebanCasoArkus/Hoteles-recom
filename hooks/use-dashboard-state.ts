"use client";

import { useState, useCallback, useMemo } from 'react';

export interface DashboardState {
  currentSection: string;
  currentSubSection?: string;
  currentItem?: string;
  activeTab: string;
  sidebarCollapsed: boolean;
  showNotifications: boolean;
  selectedItems: string[];
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list' | 'table';
  itemsPerPage: number;
  currentPage: number;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive';
  }>;
}

export interface Bookmark {
  id: string;
  title: string;
  section: string;
  subSection?: string;
  filters: Record<string, any>;
  createdAt: string;
}

export const useDashboardState = () => {
  const [state, setState] = useState<DashboardState>({
    currentSection: 'dashboard',
    currentSubSection: undefined,
    currentItem: undefined,
    activeTab: 'overview',
    sidebarCollapsed: false,
    showNotifications: false,
    selectedItems: [],
    searchQuery: '',
    sortBy: 'name',
    sortOrder: 'asc',
    viewMode: 'grid',
    itemsPerPage: 12,
    currentPage: 1
  });

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Precios elevados detectados',
      message: 'Se detectaron 3 hoteles con precios 15% por encima del promedio',
      timestamp: '2025-01-08 10:30',
      read: false
    },
    {
      id: '2',
      type: 'info',
      title: 'Nuevo evento agregado',
      message: 'Conferencia Tech Baja agregada para el 15 de julio',
      timestamp: '2025-01-08 09:15',
      read: false
    },
    {
      id: '3',
      type: 'success',
      title: 'Análisis completado',
      message: 'Correlación de precios actualizada exitosamente',
      timestamp: '2025-01-08 08:45',
      read: true
    }
  ]);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([
    {
      id: '1',
      title: 'Hoteles con eventos - Julio',
      section: 'dashboard',
      filters: { filterEvents: true, selectedDate: '2025-07-15' },
      createdAt: '2025-01-07 14:30'
    },
    {
      id: '2',
      title: 'Suites premium - Análisis',
      section: 'analysis',
      filters: { selectedRoomType: 'Suite', priceRange: [2500, 5000] },
      createdAt: '2025-01-06 16:45'
    }
  ]);

  // State update functions
  const updateState = useCallback(<K extends keyof DashboardState>(
    key: K,
    value: DashboardState[K]
  ) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateMultipleState = useCallback((updates: Partial<DashboardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Navigation functions
  const navigateToSection = useCallback((section: string, subSection?: string, item?: string) => {
    updateMultipleState({
      currentSection: section,
      currentSubSection: subSection,
      currentItem: item,
      currentPage: 1 // Reset pagination when navigating
    });
  }, [updateMultipleState]);

  const navigateToTab = useCallback((tab: string) => {
    updateState('activeTab', tab);
  }, [updateState]);

  // Selection functions
  const toggleItemSelection = useCallback((itemId: string) => {
    setState(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.includes(itemId)
        ? prev.selectedItems.filter(id => id !== itemId)
        : [...prev.selectedItems, itemId]
    }));
  }, []);

  const selectAllItems = useCallback((itemIds: string[]) => {
    updateState('selectedItems', itemIds);
  }, [updateState]);

  const clearSelection = useCallback(() => {
    updateState('selectedItems', []);
  }, [updateState]);

  // Search and filtering
  const updateSearch = useCallback((query: string) => {
    updateMultipleState({
      searchQuery: query,
      currentPage: 1 // Reset pagination when searching
    });
  }, [updateMultipleState]);

  const updateSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    updateMultipleState({ sortBy, sortOrder });
  }, [updateMultipleState]);

  const toggleSortOrder = useCallback(() => {
    updateState('sortOrder', state.sortOrder === 'asc' ? 'desc' : 'asc');
  }, [updateState, state.sortOrder]);

  // View mode functions
  const setViewMode = useCallback((mode: 'grid' | 'list' | 'table') => {
    updateState('viewMode', mode);
  }, [updateState]);

  // Pagination functions
  const setCurrentPage = useCallback((page: number) => {
    updateState('currentPage', page);
  }, [updateState]);

  const setItemsPerPage = useCallback((count: number) => {
    updateMultipleState({
      itemsPerPage: count,
      currentPage: 1 // Reset to first page when changing items per page
    });
  }, [updateMultipleState]);

  // Alert functions
  const addAlert = useCallback((alert: Omit<Alert, 'id' | 'timestamp'>) => {
    const newAlert: Alert = {
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setAlerts(prev => [newAlert, ...prev]);
  }, []);

  const markAlertAsRead = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  }, []);

  const removeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Bookmark functions
  const addBookmark = useCallback((bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setBookmarks(prev => [newBookmark, ...prev]);
  }, []);

  const removeBookmark = useCallback((bookmarkId: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
  }, []);

  const applyBookmark = useCallback((bookmarkId: string) => {
    const bookmark = bookmarks.find(b => b.id === bookmarkId);
    if (bookmark) {
      navigateToSection(bookmark.section, bookmark.subSection);
      // Note: Bookmark filters would need to be applied to the hotel filters
      // This would require integration with the useHotelData hook
    }
  }, [bookmarks, navigateToSection]);

  // Computed values
  const unreadAlertsCount = useMemo(() => {
    return alerts.filter(alert => !alert.read).length;
  }, [alerts]);

  const criticalAlertsCount = useMemo(() => {
    return alerts.filter(alert => alert.type === 'error' || alert.type === 'warning').length;
  }, [alerts]);

  const hasSelection = useMemo(() => {
    return state.selectedItems.length > 0;
  }, [state.selectedItems]);

  const breadcrumbItems = useMemo(() => {
    const items = [];
    if (state.currentSection) {
      items.push({ label: state.currentSection, href: state.currentSection });
    }
    if (state.currentSubSection) {
      items.push({ 
        label: state.currentSubSection, 
        href: `${state.currentSection}/${state.currentSubSection}` 
      });
    }
    if (state.currentItem) {
      items.push({ label: state.currentItem, isActive: true });
    }
    return items;
  }, [state.currentSection, state.currentSubSection, state.currentItem]);

  return {
    // State
    state,
    alerts,
    bookmarks,
    
    // Computed values
    unreadAlertsCount,
    criticalAlertsCount,
    hasSelection,
    breadcrumbItems,
    
    // State management
    updateState,
    updateMultipleState,
    
    // Navigation
    navigateToSection,
    navigateToTab,
    
    // Selection
    toggleItemSelection,
    selectAllItems,
    clearSelection,
    
    // Search and filtering
    updateSearch,
    updateSort,
    toggleSortOrder,
    
    // View mode
    setViewMode,
    
    // Pagination
    setCurrentPage,
    setItemsPerPage,
    
    // Alerts
    addAlert,
    markAlertAsRead,
    removeAlert,
    clearAllAlerts,
    
    // Bookmarks
    addBookmark,
    removeBookmark,
    applyBookmark
  };
}; 