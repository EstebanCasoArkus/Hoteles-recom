import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/ui/sidebar';
import { SmartBreadcrumb } from '@/components/ui/breadcrumb';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  UserCircle, 
  Search, 
  Menu,
  X,
  Settings,
  HelpCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EnhancedLayoutProps {
  children: React.ReactNode;
  currentSection?: string;
  currentSubSection?: string;
  currentItem?: string;
  onSectionChange?: (section: string, subSection?: string) => void;
  showSidebar?: boolean;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  alerts?: Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: string;
  }>;
}

export const EnhancedLayout: React.FC<EnhancedLayoutProps> = ({
  children,
  currentSection = 'dashboard',
  currentSubSection,
  currentItem,
  onSectionChange,
  showSidebar = true,
  title,
  subtitle,
  headerActions,
  alerts = []
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSectionChange = (section: string, subSection?: string) => {
    onSectionChange?.(section, subSection);
    setShowMobileMenu(false);
  };

  const unreadAlertsCount = alerts.filter(alert => alert.type === 'warning' || alert.type === 'error').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 transition-colors duration-300">
      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Sidebar */}
      {showSidebar && (
        <div className={cn(
          'fixed left-0 top-0 h-full z-50 lg:z-20 transition-transform duration-300',
          showMobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}>
          <Sidebar
            isCollapsed={sidebarCollapsed}
            onToggle={setSidebarCollapsed}
            currentSection={currentSection}
            onSectionChange={handleSectionChange}
          />
        </div>
      )}

      {/* Main Content */}
      <div className={cn(
        'transition-all duration-300',
        showSidebar ? (sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64') : 'ml-0'
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Toggle */}
              {showSidebar && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="lg:hidden"
                >
                  {showMobileMenu ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              )}

              {/* Title */}
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title || 'Hotel Dashboard'}
                </h1>
                {subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              {/* Search */}
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>

              {/* Fullscreen */}
              <Button variant="ghost" size="sm" onClick={handleFullscreen}>
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>

              {/* Notifications */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="h-4 w-4" />
                  {unreadAlertsCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                    >
                      {unreadAlertsCount}
                    </Badge>
                  )}
                </Button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Notificaciones
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {alerts.length > 0 ? (
                        alerts.map((alert) => (
                          <div key={alert.id} className="p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                            <div className="flex items-start space-x-2">
                              <div className={cn(
                                'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                                alert.type === 'error' ? 'bg-red-500' :
                                alert.type === 'warning' ? 'bg-yellow-500' :
                                alert.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                              )} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {alert.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {alert.message}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {alert.timestamp}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No hay notificaciones
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Switcher */}
              <ThemeSwitcher />

              {/* Settings */}
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>

              {/* Profile */}
              <Button variant="ghost" size="sm">
                <UserCircle className="h-4 w-4" />
              </Button>

              {/* Custom Actions */}
              {headerActions}
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="px-4 pb-3">
            <SmartBreadcrumb
              currentSection={currentSection}
              currentSubSection={currentSubSection}
              currentItem={currentItem}
              onNavigate={handleSectionChange}
            />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}; 