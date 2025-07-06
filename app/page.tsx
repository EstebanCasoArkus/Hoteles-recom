// page.tsx
"use client";

import { useState, useMemo } from "react";
import { FilterBar } from "@/components/FilterBar";
import { HotelCard } from "@/components/HotelCard";
import { PriceChart } from "@/components/PriceChart";
import { EventsSection } from "@/components/EventsSection";
import { calculateAdjustedPrice, Hotel } from "@/lib/hotel-correlation";
import type { Event } from "@/lib/hotel-correlation";
import { Button } from "@/components/ui/button";
import { Building2, BedDouble, Calendar, MapPin } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DashboardSummary } from "@/components/DashboardSummary";
import { QuickComparison } from "@/components/QuickComparison";
import { MiniPriceChart } from "@/components/MiniPriceChart";
import { HotelMap } from "@/components/HotelMap";
import { Calendar as DatePicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sun, Moon } from "lucide-react";
import { TabbedDashboard } from '../components/TabbedDashboard'

export default function Home() {
  return <TabbedDashboard />
}
