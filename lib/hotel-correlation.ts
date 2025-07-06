// Lógica de correlación de hoteles y eventos para frontend
// Sistema de correlación automática hoteles-eventos

export interface RoomPrice {
  date: string;
  price: number;
}

export interface Room {
  type: string;
  prices: RoomPrice[];
}

export interface Hotel {
  name: string;
  rooms: Room[];
  source?: string;
  image?: string; // opcional para UI
  ubicacion?: { lat: number; lng: number };
}

export interface Event {
  titulo: string;
  fecha?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  lugar?: string;
  direccion?: string;
  artista_principal?: string;
  genero?: string;
  tipo_evento?: string;
  estado?: string;
  precios?: Record<string, string | undefined>;
  precio?: string;
  artistas?: string[];
  [key: string]: any;
}

export interface PriceAdjustmentResult {
  basePrice: number;
  adjustedPrice: number;
  percentIncrease: number;
  reason: string;
  breakdown: Record<string, any>;
}

export interface AjusteResultado {
  hotel: string;
  roomType: string;
  date: string;
  precioOriginal: number;
  precioAjustado: number;
  porcentajeAumento: string;
  desglose: Record<string, any>;
}

// Reglas de correlación actualizadas y mejoradas
const correlationRules = {
  eventImpact: {
    high: {
      multiplier: 1.4, // 40% aumento base
      venues: ["CECUT", "Palenque", "Centro de Convenciones"],
      eventTypes: ["convención", "festival"],
      priceThreshold: 2000, // Precios VIP > $2000
      artists: ["internacional", "susana zabaleta"]
    },
    medium: {
      multiplier: 1.25, // 25% aumento base
      eventTypes: ["concierto", "show en vivo"],
      genres: ["regional mexicano", "boleros y música romántica"],
      priceThreshold: 800, // Precios > $800
    },
    low: {
      multiplier: 1.1, // 10% aumento base
      eventTypes: ["campamento de verano", "estreno cinematográfico"],
      freeEvents: true, // Eventos gratuitos
    },
  },
  additionalFactors: {
    weekend: 1.15, // +15% fin de semana
    holiday: 1.3,
    highSeason: 1.15,
    simultaneousEvents: 1.2, // +20% eventos simultáneos
    cancelledEvent: 0.95, // -5% para eventos cancelados (mantiene algo de anticipación)
  },
  anticipation: {
    30: 0.02, // +2% 30 días antes
    15: 0.05, // +5% 15 días antes
    7: 0.10,  // +10% 7 días antes
    3: 0.15,  // +15% 3 días antes
    1: 0.20,  // +20% 1 día antes
  },
  maxFactor: 2.0, // Máximo 100% de aumento
};

function deg2rad(deg: number) {
  return (deg * Math.PI) / 180;
}

function calcularDistancia(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = deg2rad(coord2.lat - coord1.lat);
  const dLon = deg2rad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coord1.lat)) * Math.cos(deg2rad(coord2.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isWeekend(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDay();
  return day === 5 || day === 6 || day === 0; // Fri/Sat/Sun
}

function getAnticipationFactor(dateStr: string, today: Date = new Date()) {
  const eventDate = new Date(dateStr);
  const days = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Si el evento ya pasó, no hay factor de anticipación
  if (days < 0) return 1;
  
  let factor = 0;
  const anticipationObj = correlationRules.anticipation as Record<string, number>;
  for (const key of Object.keys(anticipationObj).map(Number).sort((a, b) => a - b)) {
    if (days <= key) {
      factor = anticipationObj[String(key)];
      break;
    }
  }
  return 1 + factor;
}

// Función mejorada para clasificar impacto de eventos
function classifyEventImpact(event: Event): "high" | "medium" | "low" {
  const { high, medium, low } = correlationRules.eventImpact;
  
  // Verificar si el evento está cancelado - reduce impacto
  if (event.estado === "CANCELADO") {
    return "low";
  }
  
  // Alto impacto - Eventos en venues principales, tipos importantes, artistas reconocidos
  if (
    (event.lugar && high.venues.some((v) => event.lugar && event.lugar.includes(v))) ||
    (event.tipo_evento && high.eventTypes.some(t => event.tipo_evento && event.tipo_evento.toLowerCase().includes(t))) ||
    (event.artista_principal && high.artists.some(a => event.artista_principal && event.artista_principal.toLowerCase().includes(a))) ||
    hasHighPriceTickets(event, high.priceThreshold)
  ) {
    return "high";
  }
  
  // Medio impacto - Conciertos, géneros específicos, precios medios
  if (
    (event.tipo_evento && medium.eventTypes.some(t => event.tipo_evento && event.tipo_evento.toLowerCase().includes(t))) ||
    (event.genero && medium.genres && medium.genres.some(g => event.genero && event.genero.toLowerCase().includes(g))) ||
    hasHighPriceTickets(event, medium.priceThreshold)
  ) {
    return "medium";
  }
  
  return "low";
}

// Función auxiliar para verificar precios de boletos
function hasHighPriceTickets(event: Event, threshold: number): boolean {
  if (!event.precios) return false;
  
  for (const [category, price] of Object.entries(event.precios)) {
    if (price && typeof price === 'string') {
      // Extraer número del precio (ej: "$1,200" -> 1200)
      const numericPrice = parseFloat(price.replace(/[$,]/g, ''));
      if (!isNaN(numericPrice) && numericPrice >= threshold) {
        return true;
      }
    }
  }
  return false;
}

function getSimultaneousEvents(events: Event[], dateStr: string) {
  return events.filter((e) => {
    const eventDate = e.fecha || e.fecha_inicio;
    if (!eventDate) return false;
    
    // Para eventos de múltiples días, verificar si la fecha está en el rango
    if (e.fecha_inicio && e.fecha_fin) {
      return dateStr >= e.fecha_inicio && dateStr <= e.fecha_fin;
    }
    
    return eventDate === dateStr;
  });
}

export function calculateAdjustedPrice(
  basePrice: number,
  date: string,
  events: Event[],
  mainEvent?: Event,
  today: Date = new Date()
): PriceAdjustmentResult {
  // 1. Buscar eventos relevantes para la fecha
  const dateEvents = getSimultaneousEvents(events, date);
  const event = mainEvent || dateEvents[0];
  
  if (!event) {
    return {
      basePrice,
      adjustedPrice: basePrice,
      percentIncrease: 0,
      reason: "Sin eventos",
      breakdown: {},
    };
  }

  // 2. Clasificar impacto del evento principal
  const impact = classifyEventImpact(event);
  let factor = correlationRules.eventImpact[impact].multiplier;
  let reason = `Evento de impacto ${impact}`;

  // 3. Factor de anticipación
  const anticipation = getAnticipationFactor(date, today);
  factor *= anticipation;

  // 4. Factor fin de semana
  const weekend = isWeekend(date) ? correlationRules.additionalFactors.weekend : 1;
  factor *= weekend;

  // 5. Eventos simultáneos
  const simultaneous = dateEvents.length > 1 ? correlationRules.additionalFactors.simultaneousEvents : 1;
  factor *= simultaneous;

  // 6. Evento cancelado
  if (event.estado === "CANCELADO") {
    factor *= correlationRules.additionalFactors.cancelledEvent;
    reason += " (cancelado)";
  }

  // 7. Evento gratuito
  if (event.precio === "Entrada libre") {
    factor *= 0.9; // Reducir impacto para eventos gratuitos
    reason += " (gratuito)";
  }

  // 8. Limitar factor máximo
  factor = Math.min(factor, correlationRules.maxFactor);

  const adjustedPrice = Math.round(basePrice * factor * 100) / 100;
  const percentIncrease = Math.round(((adjustedPrice - basePrice) / basePrice) * 10000) / 100;

  return {
    basePrice,
    adjustedPrice,
    percentIncrease,
    reason,
    breakdown: {
      impact,
      baseFactor: correlationRules.eventImpact[impact].multiplier,
      anticipation,
      weekend,
      simultaneous,
      totalFactor: factor,
      eventTitle: event.titulo,
      eventType: event.tipo_evento,
      eventState: event.estado,
      venue: event.lugar,
    },
  };
}

export function calcularAjustesParaHoteles(
  hoteles: Hotel[],
  eventos: Event[],
  fechas: string[]
): AjusteResultado[] {
  const resultados: AjusteResultado[] = [];
  
  for (const hotel of hoteles) {
    for (const room of hotel.rooms) {
      for (const fecha of fechas) {
        const precioObj = room.prices.find((p) => p.date === fecha);
        if (!precioObj) continue;
        
        // Usar la función unificada de cálculo de precios ajustados
        const adjustment = calculateAdjustedPrice(
          precioObj.price,
          fecha,
          eventos,
          undefined, // Dejar que tome el evento principal automáticamente
          new Date()
        );
        
        // Factor adicional por tipo de habitación
        let roomTypeFactor = 1;
        const roomTypeLower = room.type.toLowerCase();
        if (roomTypeLower.includes('suite') || roomTypeLower.includes('vip') || roomTypeLower.includes('presidencial')) {
          roomTypeFactor = 1.1; // Suites y habitaciones premium suben 10% más
        } else if (roomTypeLower.includes('standard') || roomTypeLower.includes('sencilla') || roomTypeLower.includes('económica')) {
          roomTypeFactor = 0.95; // Habitaciones básicas suben 5% menos
        }
        
        // Factor adicional por hotel premium
        let hotelFactor = 1;
        if (hotel.name.toLowerCase().includes('grand') || 
            hotel.name.toLowerCase().includes('luxury') || 
            hotel.name.toLowerCase().includes('lucerna')) {
          hotelFactor = 1.05; // Hoteles premium suben 5% más
        }
        
        // Calcular precio final con todos los factores
        const finalAdjustment = adjustment.adjustedPrice * roomTypeFactor * hotelFactor;
        const finalPrice = Math.round(finalAdjustment * 100) / 100;
        
        // Calcular porcentaje total de aumento
        const totalIncrease = ((finalPrice / precioObj.price - 1) * 100);
        const porcentajeAumento = totalIncrease.toFixed(1) + "%";
        
        // Desglose detallado
        const desglose = {
          precioBase: precioObj.price,
          impactoEvento: adjustment.breakdown.impact,
          factorBaseEvento: adjustment.breakdown.baseFactor,
          factorAnticipacion: adjustment.breakdown.anticipation,
          factorFinDeSemana: adjustment.breakdown.weekend,
          factorEventosSimultaneos: adjustment.breakdown.simultaneous,
          factorTipoHabitacion: roomTypeFactor,
          factorHotel: hotelFactor,
          factorTotal: adjustment.breakdown.totalFactor * roomTypeFactor * hotelFactor,
          eventoTitulo: adjustment.breakdown.eventTitle,
          eventoTipo: adjustment.breakdown.eventType,
          eventoEstado: adjustment.breakdown.eventState,
          eventoLugar: adjustment.breakdown.venue,
          razon: adjustment.reason,
        };
        
        resultados.push({
          hotel: hotel.name,
          roomType: room.type,
          date: fecha,
          precioOriginal: precioObj.price,
          precioAjustado: finalPrice,
          porcentajeAumento: porcentajeAumento,
          desglose: desglose,
        });
      }
    }
  }
  
  return resultados;
} 