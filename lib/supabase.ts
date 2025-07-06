import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltan variables de entorno de Supabase. Revisa tu archivo .env")
}

console.log('🔧 Supabase URL:', supabaseUrl)
console.log('🔑 Supabase Key configured:', !!supabaseKey)

export const supabase = createClient(supabaseUrl, supabaseKey) 