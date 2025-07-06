import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
  showHome?: boolean;
  onNavigate?: (href: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className,
  separator = <ChevronRight className="h-4 w-4" />,
  showHome = true,
  onNavigate
}) => {
  const handleClick = (href: string) => {
    if (onNavigate && href) {
      onNavigate(href);
    }
  };

  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)}>
      {showHome && (
        <>
          <button
            onClick={() => handleClick('/')}
            className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <Home className="h-4 w-4" />
          </button>
          {items.length > 0 && (
            <span className="text-gray-400 dark:text-gray-500">
              {separator}
            </span>
          )}
        </>
      )}
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.href && !item.isActive ? (
            <button
              onClick={() => handleClick(item.href!)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors font-medium"
            >
              {item.label}
            </button>
          ) : (
            <span
              className={cn(
                'font-medium',
                item.isActive
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {item.label}
            </span>
          )}
          
          {index < items.length - 1 && (
            <span className="text-gray-400 dark:text-gray-500">
              {separator}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Enhanced Breadcrumb with auto-generated items
interface SmartBreadcrumbProps {
  currentSection: string;
  currentSubSection?: string;
  currentItem?: string;
  onNavigate?: (section: string, subSection?: string) => void;
}

const sectionLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  analysis: 'Análisis',
  hotels: 'Hoteles',
  events: 'Eventos',
  trends: 'Tendencias',
  filters: 'Filtros',
  bookmarks: 'Favoritos',
  alerts: 'Alertas',
  settings: 'Configuración',
  help: 'Ayuda'
};

export const SmartBreadcrumb: React.FC<SmartBreadcrumbProps> = ({
  currentSection,
  currentSubSection,
  currentItem,
  onNavigate
}) => {
  const items: BreadcrumbItem[] = [];

  // Add main section
  items.push({
    label: sectionLabels[currentSection] || currentSection,
    href: currentSection,
    isActive: !currentSubSection && !currentItem
  });

  // Add sub-section if exists
  if (currentSubSection) {
    items.push({
      label: currentSubSection,
      href: `${currentSection}/${currentSubSection}`,
      isActive: !currentItem
    });
  }

  // Add current item if exists
  if (currentItem) {
    items.push({
      label: currentItem,
      isActive: true
    });
  }

  const handleNavigate = (href: string) => {
    const parts = href.split('/');
    onNavigate?.(parts[0], parts[1]);
  };

  return (
    <Breadcrumb
      items={items}
      onNavigate={handleNavigate}
      className="mb-4"
    />
  );
};
