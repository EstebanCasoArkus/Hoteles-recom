"use client";

import { useState, useEffect, useCallback } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export interface Hotel {
  id?: number;
  nombre: string;
  estrellas: number;
  precio_promedio: number;
  noches_contadas: number;
  created_at?: string;
}

export interface HotelStats {
  total_hotels: number;
  avg_price: number;
  price_range: {
    min: number;
    max: number;
  };
  star_distribution: Record<number, number>;
  last_updated: string;
}

export const useBackendAPI = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<HotelStats | null>(null);

  // Fetch hotels from backend API
  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching hotels from backend API...');
      
      const response = await fetch(`${BACKEND_URL}/api/hotels`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const hotels = await response.json();
      
      console.log(`✅ Fetched ${hotels?.length || 0} hotels from backend API`);
      setHotels(hotels || []);
      
      // Calculate stats from hotels
      if (hotels && hotels.length > 0) {
        const prices = hotels.map((h: Hotel) => h.precio_promedio);
        const avgPrice = prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length;
        
        const newStats = {
          total_hotels: hotels.length,
          avg_price: avgPrice,
          price_range: {
            min: Math.min(...prices),
            max: Math.max(...prices)
          },
          star_distribution: hotels.reduce((acc: Record<number, number>, hotel: Hotel) => {
            acc[hotel.estrellas] = (acc[hotel.estrellas] || 0) + 1;
            return acc;
          }, {} as Record<number, number>),
          last_updated: new Date().toISOString()
        };
        
        setStats(newStats);
        console.log('📊 Stats updated:', newStats);
      } else {
        // Reset stats if no hotels
        setStats(null);
        console.log('📊 No hotels found, stats reset');
      }
      
    } catch (err) {
      console.error('❌ Error in fetchHotels:', err);
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Health check
  const healthCheck = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      const data = await response.json();
      return data;
    } catch (err) {
      return { status: 'unhealthy', error: err instanceof Error ? err.message : 'Network error' };
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  return {
    hotels,
    loading,
    error,
    stats,
    fetchHotels,
    healthCheck,
  };
}; 