import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Filter } from "lucide-react"

interface FilterBarProps {
  hoteles: string[]
  habitaciones: string[]
  rangosFechas: string[]
  tipoEvento: string
  onHotelChange: (hotel: string) => void
  onHabitacionChange: (habitacion: string) => void
  onRangoFechasChange: (rango: string) => void
  onTipoEventoChange: (tipo: string) => void
  selectedHotel: string
  selectedHabitacion: string
  selectedRangoFechas: string
  selectedTipoEvento: string
}

export function FilterBar({
  hoteles,
  habitaciones,
  rangosFechas,
  tipoEvento,
  onHotelChange,
  onHabitacionChange,
  onRangoFechasChange,
  onTipoEventoChange,
  selectedHotel,
  selectedHabitacion,
  selectedRangoFechas,
  selectedTipoEvento,
}: FilterBarProps) {
  return (
    <div className="w-full bg-blue-900/80 rounded-2xl p-4 flex flex-col gap-4 md:flex-row md:items-center md:gap-6 shadow-md mb-6">
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs text-blue-100 mb-1">Hotel principal</label>
        <Select value={selectedHotel} onValueChange={onHotelChange}>
          <SelectTrigger className="w-full bg-blue-800 text-blue-100 border-blue-700">
            <SelectValue placeholder="Selecciona hotel" />
          </SelectTrigger>
          <SelectContent>
            {hoteles.map((hotel) => (
              <SelectItem key={hotel} value={hotel}>{hotel}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs text-blue-100 mb-1">Tipo de habitación</label>
        <Select value={selectedHabitacion} onValueChange={onHabitacionChange}>
          <SelectTrigger className="w-full bg-blue-800 text-blue-100 border-blue-700">
            <SelectValue placeholder="Selecciona tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Todas</SelectItem>
            {habitaciones.map((h) => (
              <SelectItem key={h} value={h}>{h}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs text-blue-100 mb-1">Rango de fechas</label>
        <Select value={selectedRangoFechas} onValueChange={onRangoFechasChange}>
          <SelectTrigger className="w-full bg-blue-800 text-blue-100 border-blue-700">
            <SelectValue placeholder="Selecciona rango" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Día</SelectItem>
            <SelectItem value="week1">Semana 1 (1-7 Jul)</SelectItem>
            <SelectItem value="week2">Semana 2 (8-14 Jul)</SelectItem>
            <SelectItem value="week3">Semana 3 (15-21 Jul)</SelectItem>
            <SelectItem value="week4">Semana 4 (22-31 Jul)</SelectItem>
            <SelectItem value="month">Mes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs text-blue-100 mb-1">Tipo de evento</label>
        <Select value={selectedTipoEvento} onValueChange={onTipoEventoChange}>
          <SelectTrigger className="w-full bg-blue-800 text-blue-100 border-blue-700">
            <SelectValue placeholder="Selecciona tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="con-eventos">Con eventos</SelectItem>
            <SelectItem value="sin-eventos">Sin eventos</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 