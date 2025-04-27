import { createClient } from "@supabase/supabase-js"

// Criando cliente do Supabase para o lado do servidor
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseKey)
}

// Criando cliente do Supabase para o lado do cliente
// Usando singleton pattern para evitar múltiplas instâncias
let clientSupabaseClient: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  if (clientSupabaseClient) return clientSupabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  clientSupabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return clientSupabaseClient
}
