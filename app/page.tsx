import { Toaster } from "@/components/ui/toaster"
import PatientForm from "@/components/patient-form"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-800 md:text-4xl">C.I.D.I - Centro Integrado de Implantes</h1>
          <p className="mt-2 text-gray-600">Bem-vindo ao nosso sistema de cadastro de pacientes</p>
        </div>

        <div className="mx-auto max-w-md">
          <PatientForm />
        </div>

        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} C.I.D.I - Centro Integrado de Implantes. Todos os direitos reservados.</p>
        </footer>
      </div>
      <Toaster />
    </main>
  )
}
