// page.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TabbedDashboard } from "@/components/TabbedDashboard";
import { SessionContextProvider } from '@supabase/auth-helpers-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };
    getSession();
    // Suscribirse a cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (!mounted) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      setError(error.message || "Error al iniciar sesión");
    } else {
      setSession(data.session);
      router.push("/");
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;
  }

  if (session) {
    return (
      <SessionContextProvider supabaseClient={supabase} initialSession={session}>
        <TabbedDashboard />
      </SessionContextProvider>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form onSubmit={handleLogin} className="bg-card p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h1>
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
        {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
        <Button type="submit" className="w-full mb-2">Entrar</Button>
        <div className="text-center text-sm mt-2">
          ¿No tienes cuenta?{' '}
          <a href="/signup" className="text-primary underline">Regístrate</a>
        </div>
      </form>
    </div>
  );
}
