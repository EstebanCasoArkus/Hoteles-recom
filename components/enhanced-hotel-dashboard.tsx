"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { calcularAjustesParaHoteles, Hotel, AjusteResultado, type Event } from "../lib/hotel-correlation"
import { Calendar, Filter, BarChart3, Building2, Star } from "lucide-react"

// Empty data structures since simulated data has been removed
const hotelData = {
  data: {
    hotels: [] as Hotel[]
  }
}

const eventsData = {
  eventos_julio_2025: [] as Event[]
}

type EventExt = {
  attendees?: number;
  asistentes?: number;
} & import("../lib/hotel-correlation").Event;

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price)
}

const getWeekDates = (weekNumber: number) => {
  const startDay = (weekNumber - 1) * 7 + 1
  const endDay = Math.min(weekNumber * 7, 31)
  const dates = []
  for (let day = startDay; day <= endDay; day++) {
    dates.push(`2025-07-${day.toString().padStart(2, "0")}`)
  }
  return dates
}

const getAllDates = () => {
  const dates = []
  for (let day = 1; day <= 31; day++) {
    dates.push(`2025-07-${day.toString().padStart(2, "0")}`)
  }
  return dates
}

const getDateRangeLabel = (dateRange: string) => {
  switch (dateRange) {
    case "week1":
      return "Semana 1 (1-7 Jul)"
    case "week2":
      return "Semana 2 (8-14 Jul)"
    case "week3":
      return "Semana 3 (15-21 Jul)"
    case "week4":
      return "Semana 4 (22-28 Jul)"
    case "week5":
      return "Semana 5 (29-31 Jul)"
    case "month":
      return "Mes Completo"
    default:
      return "Día Específico"
  }
}

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "alto":
      return "bg-red-100 text-red-800 border-red-200"
    case "medio":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "bajo":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

function getExplicacionFactores(desglose: any) {
  const explicaciones = [];
  if (desglose.factorEvento > 0) explicaciones.push("Aumento por evento importante");
  if (desglose.factorFinDeSemana > 0) explicaciones.push("Ajuste por fin de semana");
  if (desglose.factorAnticipacion > 0.5) explicaciones.push("Reserva de último minuto");
  else if (desglose.factorAnticipacion > 0) explicaciones.push("Reserva con poca anticipación");
  if (desglose.factorOcupacion > 0) explicaciones.push("Alta ocupación");
  return explicaciones.join(", ");
}

export default function EnhancedHotelDashboard() {
  const [primaryHotel, setPrimaryHotel] = useState<string>("Grand Hotel Tijuana")
  const [selectedRoomType, setSelectedRoomType] = useState<string>("Suite")
  const [dateRange, setDateRange] = useState<string>("week1")
  const [specificDate, setSpecificDate] = useState<string>("2025-07-01")
  const [selectedEvent, setSelectedEvent] = useState<string>("all")

  const hotels = hotelData.data.hotels
  const roomTypes = ["Todas", "Habitación Estándar", "Habitación Doble", "Habitación Queen", "Suite"]

  const eventos: EventExt[] = eventsData.eventos_julio_2025

  // Get dates based on selected range
  const selectedDates = useMemo(() => {
    if (dateRange === "month") {
      return getAllDates()
    } else if (dateRange.startsWith("week")) {
      const weekNum = Number.parseInt(dateRange.replace("week", ""))
      return getWeekDates(weekNum)
    } else {
      return [specificDate]
    }
  }, [dateRange, specificDate])

  // Obtener lista de eventos únicos
  const eventosUnicos = Array.from(new Set(eventos.map(e => e.titulo)))

  // Obtener fechas de los eventos seleccionados
  const fechasEventoSeleccionado = useMemo(() => {
    if (selectedEvent === "all") return []
    return eventos
      .filter(e => e.titulo === selectedEvent)
      .map(e => e.fecha || e.fecha_inicio)
      .filter(Boolean) as string[]
  }, [selectedEvent, eventos])

  // Fechas a mostrar: si hay evento seleccionado, usar solo esas fechas; si no, usar selectedDates
  const fechasFiltradas = selectedEvent !== "all" && fechasEventoSeleccionado.length > 0 ? fechasEventoSeleccionado : selectedDates

  // Calcular ajustes para todos los hoteles, habitaciones y fechas seleccionadas
  const ajustes: AjusteResultado[] = useMemo(() => {
    return calcularAjustesParaHoteles(hotels, eventos, fechasFiltradas)
  }, [hotels, eventos, fechasFiltradas])

  // Helper para obtener los ajustes de un hotel y tipo de habitación
  function getAjustesHotel(hotelName: string, roomType: string) {
    return ajustes.filter(a => a.hotel === hotelName && (roomType === "Todas" || a.roomType === roomType))
  }

  // Helper para obtener el evento principal de un ajuste
  function getEventoParaAjuste(ajuste: AjusteResultado) {
    return eventos.find(e =>
      (e.fecha && e.fecha === ajuste.date) ||
      (e.fecha_inicio && e.fecha_fin && ajuste.date >= e.fecha_inicio && ajuste.date <= e.fecha_fin)
    )
  }

  // Nueva función para obtener el precio ajustado de un hotel, habitación y fecha
  function getPrecioAjustado(hotelName: string, roomType: string, date: string) {
    const ajuste = ajustes.find(a => a.hotel === hotelName && a.roomType === roomType && a.date === date)
    return ajuste ? ajuste.precioAjustado : null
  }

  // Prepare chart data usando precios ajustados
  const chartData = useMemo(() => {
    const data: any[] = []
    fechasFiltradas.forEach((date) => {
      const dataPoint: any = { date: date.split("-")[2] }
      hotels.forEach((hotel) => {
        const price = getPrecioAjustado(hotel.name, selectedRoomType, date)
        if (price !== null) {
          dataPoint[hotel.name] = price
        }
      })
      data.push(dataPoint)
    })
    return data
  }, [fechasFiltradas, selectedRoomType, hotels, ajustes])

  // Get primary hotel data
  const primaryHotelData = hotels.find((h) => h.name === primaryHotel)
  const competitorHotels = hotels.filter((h) => h.name !== primaryHotel)

  // Calculate average prices for comparison
  const getAveragePrice = (hotelName: string, roomType: string) => {
    const hotel = hotels.find((h) => h.name === hotelName)
    const room = hotel?.rooms.find((r) => r.type === roomType)
    if (!room) return 0

    const relevantPrices = room.prices.filter((p) => fechasFiltradas.includes(p.date))
    const sum = relevantPrices.reduce((acc, p) => acc + p.price, 0)
    return sum / relevantPrices.length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Comparación de Precios por Habitación</h1>
                <p className="mt-2 text-gray-600">Analiza y compara precios de diferentes tipos de habitaciones</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="px-3 py-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  {getDateRangeLabel(dateRange)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros de Comparación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Hotel Principal</label>
                <Select value={primaryHotel} onValueChange={setPrimaryHotel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.map((hotel) => (
                      <SelectItem key={hotel.name} value={hotel.name}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tipo de Habitación</label>
                <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Período</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week1">Semana 1 (1-7 Jul)</SelectItem>
                    <SelectItem value="week2">Semana 2 (8-14 Jul)</SelectItem>
                    <SelectItem value="week3">Semana 3 (15-21 Jul)</SelectItem>
                    <SelectItem value="week4">Semana 4 (22-28 Jul)</SelectItem>
                    <SelectItem value="week5">Semana 5 (29-31 Jul)</SelectItem>
                    <SelectItem value="month">Mes Completo</SelectItem>
                    <SelectItem value="specific">Día Específico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateRange === "specific" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Fecha Específica</label>
                  <Select value={specificDate} onValueChange={setSpecificDate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar fecha" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAllDates().map((date) => (
                        <SelectItem key={date} value={date}>
                          {new Date(date).toLocaleDateString("es-MX", {
                            month: "short",
                            day: "numeric",
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Evento</label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los eventos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los eventos</SelectItem>
                    {eventosUnicos.map((titulo) => (
                      <SelectItem key={titulo} value={titulo}>{titulo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Comparison Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Comparación de Precios - {selectedRoomType}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [formatPrice(value), ""]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={primaryHotel}
                    stroke="#2563eb"
                    strokeWidth={3}
                    name={`${primaryHotel} (Principal)`}
                  />
                  {competitorHotels.slice(0, 4).map((hotel, index) => (
                    <Line
                      key={hotel.name}
                      type="monotone"
                      dataKey={hotel.name}
                      stroke={`hsl(${(index + 1) * 60}, 70%, 50%)`}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name={hotel.name}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hotel Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Primary Hotel Card */}
          <Card className="rounded-2xl shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{primaryHotel}</h3>
                    <Badge className="bg-blue-600 text-white">Hotel Principal</Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">4.5</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {getAjustesHotel(primaryHotel, selectedRoomType)
                .filter(ajuste => fechasFiltradas.includes(ajuste.date))
                .map((ajuste) => {
                  const evento = getEventoParaAjuste(ajuste)
                    return (
                    <div key={ajuste.roomType + ajuste.date} className="p-4 bg-white rounded-lg mb-2 border">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-blue-700">{ajuste.roomType}</div>
                          <div className="text-xs text-gray-500">Fecha: {ajuste.date}</div>
                            </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">${ajuste.precioAjustado}</div>
                          <div className="text-xs text-gray-500 line-through">${ajuste.precioOriginal}</div>
                          <div className="text-xs text-green-700 font-semibold">{ajuste.porcentajeAumento} de aumento</div>
                        </div>
                      </div>
                      {/* Razón mejorada: evento y asistentes */}
                      <div className="mt-2 text-xs text-gray-700">
                        <span className="font-semibold">Razón:</span> {evento ? (
                          <>
                            Evento: <span className="font-semibold">{evento.titulo}</span>
                            {(evento.attendees || evento.asistentes) ? ` (${evento.attendees || evento.asistentes} asistentes)` : ""}
                            {" | "}
                            {getExplicacionFactores(ajuste.desglose)}
                            <br />
                            {Object.entries(ajuste.desglose).map(([k, v], idx, arr) => (
                              <span key={k}>
                                {k}: {String(v)}{idx < arr.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </>
                        ) : (
                          <>
                            Sin evento | {getExplicacionFactores(ajuste.desglose)}
                            <br />
                            {Object.entries(ajuste.desglose).map(([k, v], idx, arr) => (
                              <span key={k}>
                                {k}: {String(v)}{idx < arr.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </>
                        )}
                        </div>
                      </div>
                    )
                  })}
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Seleccionar {primaryHotel}</Button>
            </CardContent>
          </Card>

          {/* Competitor Hotels: solo mostrar precios base para comparar */}
          {competitorHotels.map((hotel) => (
            <Card key={hotel.name} className="rounded-2xl shadow-md bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
                      <Badge variant="secondary" className="text-xs">Competencia</Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">4.2</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {hotel.rooms
                  .filter(room => selectedRoomType === "Todas" || room.type === selectedRoomType)
                  .map(room => (
                    <div key={room.type}>
                      <div className="font-semibold text-gray-700 mb-1">{room.type}</div>
                      {fechasFiltradas.map(date => {
                        const priceObj = room.prices.find(p => p.date === date)
                        return priceObj ? (
                          <div key={date} className="p-4 bg-white rounded-lg mb-2 border flex justify-between items-center">
                            <div>
                              <div className="text-xs text-gray-500">Fecha: {date}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">${priceObj.price}</div>
                  </div>
                </div>
                        ) : null
                      })}
                </div>
                  ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
