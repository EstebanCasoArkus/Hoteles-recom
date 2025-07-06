import React from "react";

interface QuickComparisonProps {
  roomTypes: string[];
  roomTypeCompare: string;
  setRoomTypeCompare: (v: string) => void;
  comparisonPrices: {
    main: { nombre: string; precio: number };
    barato: { nombre: string; precio: number };
    caro: { nombre: string; precio: number };
  };
}

export const QuickComparison: React.FC<QuickComparisonProps> = ({ roomTypes, roomTypeCompare, setRoomTypeCompare, comparisonPrices }) => (
  <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700 dark:text-gray-200">Comparar tipo de habitación:</span>
      <select
        className="bg-white dark:bg-blue-900 border rounded px-2 py-1 text-sm"
        value={roomTypeCompare}
        onChange={e => setRoomTypeCompare(e.target.value)}
      >
        {roomTypes.map(rt => (
          <option key={rt} value={rt}>{rt}</option>
        ))}
      </select>
    </div>
    <div className="flex flex-col md:flex-row gap-2 items-center">
      <span className="text-xs text-gray-500">Hotel principal:</span>
      <span className="font-bold text-blue-700 dark:text-blue-200">{comparisonPrices.main.nombre} (${comparisonPrices.main.precio.toFixed(2)})</span>
      <span className="text-xs text-gray-500">vs. más barato:</span>
      <span className={`font-bold ${comparisonPrices.main.precio < comparisonPrices.barato.precio ? "text-green-700" : comparisonPrices.main.precio > comparisonPrices.barato.precio ? "text-red-700" : "text-gray-700"}`}>
        {comparisonPrices.main.precio === comparisonPrices.barato.precio ? "Igual" : `$${Math.abs(comparisonPrices.main.precio - comparisonPrices.barato.precio).toFixed(2)} ${comparisonPrices.main.precio < comparisonPrices.barato.precio ? "más barato" : "más caro"}`}
        <span className="ml-1 text-xs text-gray-500">({comparisonPrices.barato.nombre})</span>
      </span>
      <span className="text-xs text-gray-500">vs. más caro:</span>
      <span className={`font-bold ${comparisonPrices.main.precio > comparisonPrices.caro.precio ? "text-green-700" : comparisonPrices.main.precio < comparisonPrices.caro.precio ? "text-red-700" : "text-gray-700"}`}>
        {comparisonPrices.main.precio === comparisonPrices.caro.precio ? "Igual" : `$${Math.abs(comparisonPrices.main.precio - comparisonPrices.caro.precio).toFixed(2)} ${comparisonPrices.main.precio > comparisonPrices.caro.precio ? "más caro" : "más barato"}`}
        <span className="ml-1 text-xs text-gray-500">({comparisonPrices.caro.nombre})</span>
      </span>
    </div>
  </div>
); 