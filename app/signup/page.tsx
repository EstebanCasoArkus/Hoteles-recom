"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [hotel, setHotel] = useState("");
  const [hotels, setHotels] = useState<any[]>([]);
  const [hotelSearch, setHotelSearch] = useState("");
  const [selectedHotelObj, setSelectedHotelObj] = useState<any>(null);
  const [error, setError] = useState("");
  const [geoError, setGeoError] = useState("");
  const [loadingHotels, setLoadingHotels] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setGeoError("");
    if (navigator.geolocation) {
      setLoadingHotels(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          console.log("Ubicación obtenida:", pos);
          setGeoError(""); // Limpiar error si se obtiene ubicación
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch("/api/hotels", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lat: latitude, lon: longitude, name: "" })
            });
            if (!res.ok) {
              setGeoError("No se pudo obtener la lista de hoteles. Intenta de nuevo.");
              setLoadingHotels(false);
              return;
            }
            const data = await res.json();
            setHotels(data.hotels || []);
          } catch (e) {
            setGeoError("No se pudo obtener la lista de hoteles. Intenta de nuevo.");
          }
          setLoadingHotels(false);
        },
        (err) => {
          console.log("Error de geolocalización:", err);
          setGeoError("Debes permitir el acceso a tu ubicación para buscar hoteles cercanos.");
          setLoadingHotels(false);
        }
      );
    } else {
      setGeoError("Tu navegador no soporta geolocalización.");
    }
  }, []);

  const filteredHotels = hotelSearch
    ? hotels.filter(h => h.name.toLowerCase().includes(hotelSearch.toLowerCase()))
    : hotels;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Guardar todos los campos del hotel seleccionado en user_metadata
    const hotelMetadata = selectedHotelObj ? { ...selectedHotelObj } : {};
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name, // nombre real del usuario
          Phone: phone,       // teléfono
          hotel_name: hotel,  // nombre del hotel
          ...hotelMetadata
        }
      }
    });
    if (error) {
      setError(error.message || "Error al registrarse");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form onSubmit={handleSignup} className="bg-card p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Registro</h1>
        <Input
          type="text"
          placeholder="Nombre completo"
          value={name}
          onChange={e => setName(e.target.value)}
          className="mb-4"
          required
        />
        <Input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="mb-4"
          required
        />
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="mb-4"
          required
        />
        <Input
          type="tel"
          placeholder="Teléfono"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="mb-4"
          required
        />
        <div className="mb-4 relative">
          <Input
            type="text"
            placeholder="Buscar hotel"
            value={hotelSearch.length > 0 ? hotelSearch : hotel}
            onChange={e => {
              setHotelSearch(e.target.value);
              setHotel(""); // Borra selección previa si el usuario escribe
            }}
            disabled={loadingHotels || !!geoError}
            className="mb-2"
          />
          {/* Mostrar la lista solo si el usuario está escribiendo y no hay error */}
          {hotelSearch.length > 0 && !geoError && (
            <div className="max-h-40 overflow-y-auto border rounded bg-background absolute z-10 w-full max-w-full left-0 top-full shadow-lg">
              {loadingHotels && <div className="p-2 text-sm">Buscando hoteles cerca...</div>}
              {!loadingHotels && filteredHotels.map(h => (
                <div
                  key={h.hotelId}
                  className={`p-2 cursor-pointer hover:bg-accent ${hotel === h.name ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => {
                    setHotel(h.name);
                    setHotelSearch(""); // Oculta la lista al seleccionar
                    setSelectedHotelObj(h); // Guardar objeto completo
                  }}
                >
                  {h.name}
                </div>
              ))}
              {!loadingHotels && filteredHotels.length === 0 && <div className="p-2 text-sm">No se encontraron hoteles</div>}
            </div>
          )}
          {geoError && <div className="p-2 text-sm text-red-500">{geoError}</div>}
        </div>
        {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
        <Button type="submit" className="w-full mb-2">Registrarse</Button>
        <div className="text-center text-sm mt-2">
          ¿Ya tienes cuenta?{' '}
          <a href="/" className="text-primary underline">Inicia sesión</a>
        </div>
      </form>
    </div>
  );
} 