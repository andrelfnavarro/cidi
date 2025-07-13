import { Toaster } from '@/components/ui/toaster';
import PatientForm from '@/components/patient-form';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-800 md:text-4xl">
            Sistema de Cadastro de Pacientes
          </h1>
          <p className="mt-2 text-gray-600">
            Plataforma para clínicas odontológicas
          </p>
          <div className="mt-6 rounded-lg bg-blue-50 p-4 text-blue-800">
            <p className="text-sm">
              <strong>Atenção:</strong> Para se cadastrar como paciente, utilize o link específico 
              fornecido pela sua clínica odontológica.
            </p>
            <p className="mt-2 text-sm">
              Se você é um dentista, acesse o{' '}
              <a href="/admin" className="font-medium underline">
                portal administrativo
              </a>
              .
            </p>
          </div>
        </div>

        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} Sistema de Cadastro de Pacientes. 
            Todos os direitos reservados.
          </p>
        </footer>
      </div>
      <Toaster />
    </main>
  );
}
