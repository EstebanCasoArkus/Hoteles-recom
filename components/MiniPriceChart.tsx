import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export interface MiniPriceChartProps {
  data: { date: string; price: number }[];
}

export const MiniPriceChart: React.FC<MiniPriceChartProps> = ({ data }) => (
  <div className="w-full h-32 bg-white dark:bg-blue-950 rounded-xl shadow p-2">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" fontSize={10} tick={{ fill: '#64748b' }} />
        <YAxis fontSize={10} tick={{ fill: '#64748b' }} />
        <Tooltip />
        <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
); 