import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xvwnwzlppenrtzxfwjax.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2d253emxwcGVucnR6eGZ3amF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjQyMzgsImV4cCI6MjA2NzE0MDIzOH0.e9rwMsihJfV8PIXX6mWLMtZS9KEO3R5GnE7tbcEapxA'

console.log('🔧 Supabase URL:', supabaseUrl)
console.log('🔑 Supabase Key configured:', !!supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 