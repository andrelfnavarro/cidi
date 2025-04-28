import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import AdminHeader from "@/components/admin/header"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8">{children}</div>
        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} C.I.D.I - Centro Integrado de Implantes. Todos os direitos reservados.</p>
        </footer>
      </div>
      <Toaster />
    </AuthProvider>
  )
}
