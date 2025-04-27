import type React from "react"
import { Toaster } from "@/components/ui/toaster"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-800 md:text-4xl">C.I.D.I - Portal do Dentista</h1>
          <p className="mt-2 text-gray-600">Área restrita para profissionais</p>
        </div>

        {children}

        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} C.I.D.I - Centro Integrado de Implantes. Todos os direitos reservados.</p>
        </footer>
      </div>
      <Toaster />
    </div>
  )
}
