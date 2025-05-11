import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { searchTerm } = await request.json();

    if (!searchTerm || searchTerm.trim() === '') {
      return NextResponse.json({ patients: [] });
    }

    const supabase = await createClient();

    // Normalize the search term by removing all non-alphanumeric characters
    const normalizedSearchTerm = searchTerm.replace(/\D/g, '');

    // Create a query to search by name, email, CPF, or phone
    const { data, error } = await supabase
      .from('patients')
      .select('*')
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
