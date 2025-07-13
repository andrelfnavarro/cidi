import { Toaster } from '@/components/ui/toaster';
import PatientForm from '@/components/patient-form';
import { validateCompanySlug } from '@/lib/company-utils';
import { notFound } from 'next/navigation';

interface CompanyPageProps {
  params: {
    companySlug: string;
  };
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { companySlug } = params;
  
  // Validate company slug
  const company = await validateCompanySlug(companySlug);
  
  if (!company) {
    notFound();
  }

  const displayName = company.display_name || company.name;
  const subtitle = company.subtitle || "Bem-vindo ao nosso sistema de cadastro de pacientes";
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          {company.logo_url && (
            <img 
              src={company.logo_url} 
              alt={`${displayName} logo`}
              className="mx-auto mb-4 h-16 w-auto object-contain"
            />
          )}
          <h1 
            className="text-3xl font-bold md:text-4xl"
            style={{ color: company.primary_color || '#1e40af' }}
          >
            {displayName}
          </h1>
          <p className="mt-2 text-gray-600">
            {subtitle}
          </p>
        </div>

        <div className="mx-auto max-w-md">
          <PatientForm 
            companySlug={company.slug} 
            companyName={displayName}
          />
        </div>

        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} {displayName}. Todos os direitos reservados.
          </p>
        </footer>
      </div>
      <Toaster />
    </main>
  );
}