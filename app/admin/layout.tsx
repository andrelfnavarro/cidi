import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import AdminHeader from "@/components/admin/header"
import AdminNavBar from "@/components/admin/nav-bar"
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Create the Supabase client
  const supabase = await createClient()
  
  // Get the session
  const { data: { session } } = await supabase.auth.getSession()
  
  // The root /admin path is the login page, so we don't redirect or check for a dentist profile
  // We only need to pass the children (LoginForm) with the auth provider
  
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Always show the header */}
        <AdminHeader />
        
        {/* Only show the navbar when logged in */}
        {session && <AdminNavBar />}
        
        <div className="container mx-auto px-4 py-8">{children}</div>
        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} C.I.D.I - Centro Integrado de Implantes. Todos os direitos reservados.</p>
        </footer>
      </div>
      <Toaster />
    </AuthProvider>
  )
}
