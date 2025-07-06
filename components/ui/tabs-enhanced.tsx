"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  disabled?: boolean;
  closable?: boolean;
}

interface EnhancedTabsProps {
  items: TabItem[];
  defaultActiveTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onTabAdd?: () => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  showAddButton?: boolean;
  scrollable?: boolean;
}

export const EnhancedTabs: React.FC<EnhancedTabsProps> = ({
  items,
  defaultActiveTab,
  activeTab: controlledActiveTab,
  onTabChange,
  onTabClose,
  onTabAdd,
  className,
  variant = 'default',
  size = 'md',
  showAddButton = false,
  scrollable = true
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultActiveTab || items[0]?.id
  );

  const activeTab = controlledActiveTab || internalActiveTab;

  const handleTabClick = (tabId: string) => {
    if (items.find(item => item.id === tabId)?.disabled) return;
    
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };

  const handleTabClose = (tabId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onTabClose?.(tabId);
  };

  const getTabClassName = (item: TabItem) => {
    const isActive = activeTab === item.id;
    const baseClasses = [
      'relative inline-flex items-center justify-center whitespace-nowrap transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ];

    // Size classes
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    // Variant classes
    const variantClasses = {
      default: cn(
        'border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600',
        isActive && 'border-blue-500 text-blue-600 dark:text-blue-400',
        !isActive && 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
      ),
      pills: cn(
        'rounded-full',
        isActive && 'bg-blue-600 text-white shadow-sm',
        !isActive && 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      ),
      underline: cn(
        'border-b-2 border-transparent',
        isActive && 'border-blue-500 text-blue-600 dark:text-blue-400',
        !isActive && 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
      )
    };

    return cn(
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      item.disabled && 'opacity-50 cursor-not-allowed'
    );
  };

  const activeTabContent = items.find(item => item.id === activeTab)?.content;

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div className={cn(
        'flex items-center border-b border-gray-200 dark:border-gray-700',
        scrollable && 'overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600'
      )}>
        <div className="flex items-center space-x-1 min-w-max">
          {items.map((item) => {
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                disabled={item.disabled}
                className={getTabClassName(item)}
              >
                <div className="flex items-center space-x-2">
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  {item.closable && (
                    <button
                      onClick={(e) => handleTabClose(item.id, e)}
                      className="ml-2 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Add Tab Button */}
        {showAddButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onTabAdd}
            className="ml-2 p-2 h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTabContent}
      </div>
    </div>
  );
};

// Preset tabs for the hotel dashboard
export const DashboardTabs: React.FC<{
  activeTab: string;
  onTabChange: (tab: string) => void;
}> = ({ activeTab, onTabChange }) => {
  const dashboardTabItems: TabItem[] = [
    {
      id: 'overview',
      label: 'Resumen',
      content: <div>Dashboard Overview Content</div>,
    },
    {
      id: 'analytics',
      label: 'Análisis',
      content: <div>Analytics Content</div>,
      badge: 'Nuevo'
    },
    {
      id: 'hotels',
      label: 'Hoteles',
      content: <div>Hotels Content</div>,
    },
    {
      id: 'events',
      label: 'Eventos',
      content: <div>Events Content</div>,
      badge: 3
    },
    {
      id: 'reports',
      label: 'Reportes',
      content: <div>Reports Content</div>,
    }
  ];

  return (
    <EnhancedTabs
      items={dashboardTabItems}
      activeTab={activeTab}
      onTabChange={onTabChange}
      variant="underline"
      size="md"
      scrollable={true}
    />
  );
}; 