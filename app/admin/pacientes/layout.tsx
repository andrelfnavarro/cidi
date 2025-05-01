import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import AuthCheck from "@/components/admin/auth-check"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Create the Supabase client
  const supabase = await createClient()
  
  // Get the session
  const { data: { session } } = await supabase.auth.getSession()
  
  // If we don't have a session, the user isn't logged in
  if (!session) {
    redirect('/admin')
  }
  
  // Check if the user is a dentist to ensure proper access
  const { data: dentistData } = await supabase
    .from('dentists')
    .select('*')
    .eq('id', session.user.id)
    .single()
    
  if (!dentistData) {
    // The user isn't a dentist, so log them out
    await supabase.auth.signOut()
    redirect('/admin')
  }

  return <AuthCheck>{children}</AuthCheck>
}