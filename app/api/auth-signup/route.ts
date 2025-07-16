import { supabase } from '../../../lib/supabase';

export async function POST(request: Request) {
  const { email, password, name, phone, hotel } = await request.json();

  // Crear usuario en Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone, hotel }
    }
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ user: data.user }), { status: 200 });
} 