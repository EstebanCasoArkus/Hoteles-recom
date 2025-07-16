import React, { useState } from "react";

interface PrecioPorDia {
  fecha: string;
  precio: number;
  tipo?: string; // 'real' o 'predicho'
}

interface CustomHotelCalendarProps {
  precios_por_dia: PrecioPorDia[];
  fecha_inicio?: Date; // Por defecto hoy
}

const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const matrix: (Date | null)[][] = [];
  let week: (Date | null)[] = [];
  let dayOfWeek = (firstDay.getDay() + 6) % 7;
  for (let i = 0; i < dayOfWeek; i++) week.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    matrix.push(week);
  }
  return matrix;
}

const CustomHotelCalendar: React.FC<CustomHotelCalendarProps> = ({ precios_por_dia, fecha_inicio }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>((fecha_inicio || today).getMonth());
  const [currentYear, setCurrentYear] = useState<number>((fecha_inicio || today).getFullYear());

  // Mapeo de precios: precios_por_dia es lista de {fecha, precio, tipo}
  const preciosMap = new Map<string, PrecioPorDia>();
  if (Array.isArray(precios_por_dia)) {
    for (const entry of precios_por_dia) {
      if (entry && entry.fecha && entry.precio !== undefined) {
        preciosMap.set(entry.fecha, entry);
      }
    }
  }

  const matrix = getMonthMatrix(currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  return (
    <div className="bg-[#181f2a] rounded-lg shadow-lg p-4 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <button onClick={handlePrevMonth} className="text-blue-400 hover:text-blue-600 px-2 py-1 rounded transition">
          &lt;
        </button>
        <span className="text-lg font-semibold text-white">
          {new Date(currentYear, currentMonth).toLocaleString("es-MX", { month: "long", year: "numeric" })}
        </span>
        <button onClick={handleNextMonth} className="text-blue-400 hover:text-blue-600 px-2 py-1 rounded transition">
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {diasSemana.map(dia => (
          <div key={dia} className="text-xs text-blue-200 text-center font-bold py-1">{dia}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {matrix.map((week, i) =>
          week.map((date, j) => {
            if (!date) return <div key={i + '-' + j} className="h-14" />;
            const iso = date.toISOString().slice(0, 10);
            const precioObj = preciosMap.get(iso);
            const isToday = date.toDateString() === today.toDateString();
            return (
              <div
                key={iso}
                className={`flex flex-col items-center justify-center h-14 rounded-lg border transition
                  ${isToday ? "border-blue-400 bg-blue-900" : "border-transparent"}
                  ${precioObj ? "bg-[#1e293b]" : "bg-[#232b3b] text-gray-500"}`}
              >
                <span className={`text-base font-semibold ${isToday ? "text-blue-300" : "text-white"}`}>{date.getDate()}</span>
                {precioObj !== undefined ? (
                  <span
                    className={`text-xs font-bold mt-1 ${precioObj.tipo === "real" ? "text-green-500" : "text-orange-400"}`}
                    title={`${precioObj.tipo === "real" ? "Precio real" : "Precio predicho"} para el ${precioObj.fecha}`}
                  >
                    ${precioObj.precio}
                  </span>
                ) : (
                  <span className="text-xs mt-1">-</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CustomHotelCalendar; 