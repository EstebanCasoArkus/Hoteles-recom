import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  variant?: 'hotel-card' | 'dashboard-metrics' | 'chart' | 'table' | 'sidebar' | 'header' | 'filter-bar' | 'list';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'hotel-card',
  count = 1,
  className
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'hotel-card':
        return (
          <Card className={cn("w-full", className)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="flex items-center space-x-1">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-3 w-12 ml-2" />
                  </div>
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <div className="flex space-x-1">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-16" />
              </div>
            </CardContent>
          </Card>
        );

      case 'dashboard-metrics':
        return (
          <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'chart':
        return (
          <Card className={cn("w-full", className)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-[300px] w-full relative">
                  <Skeleton className="absolute bottom-0 left-0 h-full w-full" />
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between h-full px-4">
                    <Skeleton className="h-20 w-8 bg-gray-200" />
                    <Skeleton className="h-32 w-8 bg-gray-200" />
                    <Skeleton className="h-24 w-8 bg-gray-200" />
                    <Skeleton className="h-40 w-8 bg-gray-200" />
                    <Skeleton className="h-28 w-8 bg-gray-200" />
                    <Skeleton className="h-36 w-8 bg-gray-200" />
                    <Skeleton className="h-30 w-8 bg-gray-200" />
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-8">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'table':
        return (
          <Card className={cn("w-full", className)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-2 border rounded">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'sidebar':
        return (
          <div className={cn("w-64 border-r bg-white p-4 space-y-4", className)}>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'header':
        return (
          <div className={cn("flex items-center justify-between p-4 bg-white border-b", className)}>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        );

      case 'filter-bar':
        return (
          <Card className={cn("w-full", className)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'list':
        return (
          <div className={cn("space-y-3", className)}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className={cn("space-y-2", className)}>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        );
    }
  };

  return (
    <div className="animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={count > 1 ? "mb-4" : ""}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

// Specialized skeleton components for specific use cases
export const HotelCardSkeleton = () => (
  <SkeletonLoader variant="hotel-card" />
);

export const DashboardMetricsSkeleton = () => (
  <SkeletonLoader variant="dashboard-metrics" />
);

export const ChartSkeleton = () => (
  <SkeletonLoader variant="chart" />
);

export const TableSkeleton = () => (
  <SkeletonLoader variant="table" />
);

export const SidebarSkeleton = () => (
  <SkeletonLoader variant="sidebar" />
);

export const HeaderSkeleton = () => (
  <SkeletonLoader variant="header" />
);

export const FilterBarSkeleton = () => (
  <SkeletonLoader variant="filter-bar" />
);

export const ListSkeleton = ({ count = 5 }: { count?: number }) => (
  <SkeletonLoader variant="list" count={count} />
);

// Loading states for different pages
export const DashboardPageSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <HeaderSkeleton />
    <div className="flex">
      <SidebarSkeleton />
      <div className="flex-1 p-6 space-y-6">
        <FilterBarSkeleton />
        <DashboardMetricsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <HotelCardSkeleton />
          <HotelCardSkeleton />
          <HotelCardSkeleton />
          <HotelCardSkeleton />
          <HotelCardSkeleton />
          <HotelCardSkeleton />
        </div>
      </div>
    </div>
  </div>
);

export const HotelGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <HotelCardSkeleton key={i} />
    ))}
  </div>
);

export const AnalyticsPageSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    <DashboardMetricsSkeleton />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
    <ChartSkeleton />
    <TableSkeleton />
  </div>
);

export default SkeletonLoader; 