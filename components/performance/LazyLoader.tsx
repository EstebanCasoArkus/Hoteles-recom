"use client";

import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { SkeletonLoader } from './SkeletonLoader';

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  delay?: number;
  placeholder?: 'skeleton' | 'spinner' | 'custom';
  skeletonVariant?: 'hotel-card' | 'dashboard-metrics' | 'chart' | 'table' | 'list';
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

// Hook for intersection observer
const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
};

export const LazyLoader: React.FC<LazyLoaderProps> = ({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  className = '',
  delay = 0,
  placeholder = 'skeleton',
  skeletonVariant = 'hotel-card',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  const { hasIntersected } = useIntersectionObserver(ref, {
    threshold,
    rootMargin
  });

  useEffect(() => {
    if (hasIntersected && !isLoaded) {
      const timer = setTimeout(() => {
        try {
          setIsLoaded(true);
          onLoad?.();
        } catch (error) {
          setIsError(true);
          onError?.(error as Error);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [hasIntersected, isLoaded, delay, onLoad, onError]);

  const renderPlaceholder = () => {
    if (fallback) return fallback;
    
    switch (placeholder) {
      case 'skeleton':
        return <SkeletonLoader variant={skeletonVariant} />;
      case 'spinner':
        return (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        );
      case 'custom':
        return (
          <div className="flex items-center justify-center p-8 text-gray-500">
            Cargando...
          </div>
        );
      default:
        return <SkeletonLoader variant={skeletonVariant} />;
    }
  };

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        Error al cargar el contenido
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      {isLoaded ? children : renderPlaceholder()}
    </div>
  );
};

// Lazy load components
const LazyHotelCard = lazy(() => import('../hotel/HotelCardEnhanced').then(module => ({ default: module.HotelCardEnhanced })));
const LazyPriceChart = lazy(() => import('../charts/PriceHeatmap').then(module => ({ default: module.PriceHeatmap })));
const LazySparklines = lazy(() => import('../charts/TrendSparklines').then(module => ({ default: module.TrendSparklines })));
const LazyModal = lazy(() => import('../interactions/HotelDetailsModal').then(module => ({ default: module.HotelDetailsModal })));

// Specialized lazy loaders for different components
export const LazyHotelCardLoader: React.FC<{ 
  hotelData: any;
  className?: string;
}> = ({ hotelData, className }) => (
  <LazyLoader 
    placeholder="skeleton" 
    skeletonVariant="hotel-card"
    className={className}
  >
    <Suspense fallback={<SkeletonLoader variant="hotel-card" />}>
      <LazyHotelCard {...hotelData} />
    </Suspense>
  </LazyLoader>
);

export const LazyChartLoader: React.FC<{ 
  chartData: any;
  className?: string;
}> = ({ chartData, className }) => (
  <LazyLoader 
    placeholder="skeleton" 
    skeletonVariant="chart"
    className={className}
  >
    <Suspense fallback={<SkeletonLoader variant="chart" />}>
      <LazyPriceChart {...chartData} />
    </Suspense>
  </LazyLoader>
);

export const LazySparklineLoader: React.FC<{ 
  sparklineData: any;
  className?: string;
}> = ({ sparklineData, className }) => (
  <LazyLoader 
    placeholder="skeleton" 
    skeletonVariant="chart"
    className={className}
  >
    <Suspense fallback={<SkeletonLoader variant="chart" />}>
      <LazySparklines {...sparklineData} />
    </Suspense>
  </LazyLoader>
);

// Advanced lazy loading with virtualization for large lists
interface VirtualizedLazyListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
  className?: string;
}

export const VirtualizedLazyList = <T,>({
  items,
  renderItem,
  itemHeight = 200,
  containerHeight = 600,
  overscan = 5,
  className = ''
}: VirtualizedLazyListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleStartIndex = Math.floor(scrollTop / itemHeight);
  const visibleEndIndex = Math.min(
    visibleStartIndex + Math.ceil(containerHeight / itemHeight) + overscan,
    items.length - 1
  );

  const visibleItems = items.slice(
    Math.max(0, visibleStartIndex - overscan),
    visibleEndIndex + 1
  );

  const offsetY = Math.max(0, visibleStartIndex - overscan) * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => {
            const actualIndex = Math.max(0, visibleStartIndex - overscan) + index;
            return (
              <div
                key={actualIndex}
                style={{ height: itemHeight }}
                className="flex items-center"
              >
                <LazyLoader
                  threshold={0.1}
                  rootMargin="100px"
                  placeholder="skeleton"
                  skeletonVariant="hotel-card"
                >
                  {renderItem(item, actualIndex)}
                </LazyLoader>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Image lazy loading component
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjYWFhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2VuPC90ZXh0Pjwvc3ZnPg==',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder);
  const imgRef = useRef<HTMLImageElement>(null);

  const { hasIntersected } = useIntersectionObserver(imgRef, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  useEffect(() => {
    if (hasIntersected && !isLoaded && !isError) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        onLoad?.();
      };
      img.onerror = () => {
        setIsError(true);
        onError?.();
      };
      img.src = src;
    }
  }, [hasIntersected, isLoaded, isError, src, onLoad, onError]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-70'} transition-opacity duration-300`}
      width={width}
      height={height}
      loading="lazy"
    />
  );
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<{
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
  }>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    const startTime = performance.now();
    
    const updateMetrics = () => {
      const loadTime = performance.now() - startTime;
      const renderTime = performance.now();
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
      
      setMetrics({
        loadTime,
        renderTime,
        memoryUsage
      });
    };

    const observer = new PerformanceObserver((list) => {
      updateMetrics();
    });

    observer.observe({ entryTypes: ['measure', 'navigation'] });

    return () => {
      observer.disconnect();
    };
  }, []);

  return metrics;
};

// Bundle splitting helper
export const createLazyComponent = (
  importFn: () => Promise<{ default: React.ComponentType<any> }>,
  FallbackComponent: React.ComponentType = () => <div>Loading...</div>
) => {
  const LazyComponent = lazy(importFn);
  
  return (props: any) => (
    <Suspense fallback={<FallbackComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default LazyLoader; 