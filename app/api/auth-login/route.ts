import { supabase } from '../../../lib/supabase';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 401 });
  }

  return new Response(JSON.stringify({ user: data.user, session: data.session }), { status: 200 });
} 