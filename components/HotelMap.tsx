import React from "react";

// Puedes usar @react-google-maps/api o el SDK de Google Maps JS. Aquí va un placeholder tipado:

export interface HotelMapProps {
  hotels: { name: string; lat: number; lng: number; price: number }[];
}

export const HotelMap: React.FC<HotelMapProps> = ({ hotels }) => {
  // Aquí iría la integración real con Google Maps
  return (
    <div className="w-full h-80 bg-gray-200 dark:bg-blue-950 rounded-xl flex items-center justify-center">
      <span className="text-gray-500">[Mapa interactivo de hoteles aquí]</span>
    </div>
  );
}; 