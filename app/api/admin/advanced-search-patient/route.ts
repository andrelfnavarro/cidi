import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { searchTerm } = await request.json();

    if (!searchTerm || searchTerm.trim() === '') {
      return NextResponse.json({ patients: [] });
    }

    const supabase = await createClient();

    // Get the current session to verify the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Get the current dentist's company_id
    const { data: currentDentist, error: dentistError } = await supabase
      .from('dentists')
      .select('company_id')
      .eq('id', session.user.id)
      .single();

    if (dentistError || !currentDentist) {
      return NextResponse.json({ error: 'Dentista não encontrado' }, { status: 404 });
    }

    // Normalize the search term by removing all non-alphanumeric characters
    const normalizedSearchTerm = searchTerm.replace(/\D/g, '');

    // Create a query to search by name, email, CPF, or phone within the dentist's company
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('company_id', currentDentist.company_id)
      .or(
        `name.ilike.%${searchTerm}%,` +
          `email.ilike.%${searchTerm}%,` +
          `cpf.ilike.%${normalizedSearchTerm}%,` +
          `phone.ilike.%${normalizedSearchTerm}%`
      )
      .order('name')
      .limit(20);

    if (error) {
      console.error('Erro ao buscar pacientes:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar pacientes' },
        { status: 500 }
      );
    }

    // For CPF and phone, we need to do additional filtering since Supabase
    // doesn't support removing formatting in the query
    let filteredData = data;

    if (normalizedSearchTerm.length > 0) {
      // Additional filtering for CPF and phone
      filteredData = data.filter(patient => {
        // Normalize stored CPF and phone by removing non-digits
        const normalizedCpf = patient.cpf ? patient.cpf.replace(/\D/g, '') : '';
        const normalizedPhone = patient.phone
          ? patient.phone.replace(/\D/g, '')
          : '';

        // Check if normalized values contain the normalized search term
        return (
          normalizedCpf.includes(normalizedSearchTerm) ||
          normalizedPhone.includes(normalizedSearchTerm) ||
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (patient.email &&
            patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }

    return NextResponse.json({ patients: filteredData });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
