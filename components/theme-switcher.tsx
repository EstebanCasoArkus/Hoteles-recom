"use client";

import { useTheme } from "next-themes";
import { useState } from "react";
import { Sun, Moon, ChevronDown } from "lucide-react";

function setPrimaryColor(hue: number) {
  // Cambia el color principal en el root
  document.documentElement.style.setProperty('--primary', `${hue} 80% 50%`);
  // Guarda la preferencia
  localStorage.setItem('hotel-primary-hue', hue.toString());
}

function getPrimaryHue(): number {
  if (typeof window === 'undefined') return 220; // default
  const saved = localStorage.getItem('hotel-primary-hue');
  return saved ? parseInt(saved, 10) : 220;
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [hue, setHue] = useState(220); // default azul

  const icon = theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />;

  return (
    <div className="relative">
      <button
        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white dark:bg-blue-900 border border-gray-200 dark:border-blue-700 shadow hover:bg-gray-100 dark:hover:bg-blue-800 transition-all"
        onClick={() => setOpen((v) => !v)}
        aria-label="Cambiar tema"
        type="button"
      >
        {icon}
        <ChevronDown className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute mt-2 w-36 bg-white dark:bg-blue-900 border border-gray-200 dark:border-blue-700 rounded-lg shadow z-50">
          <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-blue-800" onClick={() => { setTheme("light"); setOpen(false); }}>
            <Sun className="w-4 h-4" /> Claro
          </button>
          <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-blue-800" onClick={() => { setTheme("dark"); setOpen(false); }}>
            <Moon className="w-4 h-4" /> Oscuro
          </button>
          <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-blue-800" onClick={() => { setTheme("system"); setOpen(false); }}>
            <Sun className="w-4 h-4 opacity-60" /> Sistema
          </button>
        </div>
      )}
    </div>
  );
} 