import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

export interface MiniPriceChartProps {
  data: { date: string; price: number }[];
}

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-xs">
        <p className="font-medium text-gray-900 dark:text-gray-100">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const MiniPriceChart: React.FC<MiniPriceChartProps> = ({ data }) => (
  <div className="w-full h-32 bg-white dark:bg-blue-950 rounded-xl shadow p-2">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" fontSize={10} tick={{ fill: '#64748b' }} />
        <YAxis fontSize={10} tick={{ fill: '#64748b' }} />
        <CustomTooltip />
        <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
); 