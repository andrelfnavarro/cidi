import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { cpf } = await request.json();

    if (!cpf) {
      return NextResponse.json({ error: 'CPF é obrigatório' }, { status: 400 });
    }

    // Normalize CPF by removing all non-digit characters
    const normalizedCpf = cpf.replace(/\D/g, '');

    const supabase = await createClient();

    // Buscar paciente pelo CPF
    const { data, error } = await supabase
      .from('patients')
      .select('id')
      .eq('cpf', normalizedCpf)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Código para "não encontrado" no Supabase
        return NextResponse.json({ patient: null });
      }

      console.error('Erro ao buscar paciente:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar paciente' },
        { status: 500 }
      );
    }

    return NextResponse.json({ patient: data });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
