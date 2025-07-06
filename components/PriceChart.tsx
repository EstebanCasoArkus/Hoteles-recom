import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface PriceChartProps {
  data: Array<{ date: string; [hotel: string]: number | string }>
  hotels: string[]
  roomType: string
  mainHotel: string
}

export function PriceChart({ data, hotels, roomType, mainHotel }: PriceChartProps) {
  const colors = [
    '#60a5fa', // blue-400
    '#fbbf24', // yellow-400
    '#34d399', // green-400
    '#f472b6', // pink-400
    '#a78bfa', // purple-400
    '#fca5a5', // red-300
    '#fcd34d', // yellow-300
    '#a3e635', // lime-400
    '#38bdf8', // sky-400
    '#f9a8d4', // pink-300
  ];
  return (
    <div className="w-full h-[320px] bg-white rounded-xl p-4 shadow-md">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', color: '#334155' }}
            labelStyle={{ color: '#334155' }}
            itemStyle={{ color: '#334155' }}
          />
          <Legend wrapperStyle={{ color: '#334155' }} />
          {hotels.map((hotel, idx) => (
            <Line
              key={hotel}
              type="monotone"
              dataKey={hotel}
              stroke={hotel === mainHotel ? colors[0] : colors[(idx + 1) % colors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 7 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 