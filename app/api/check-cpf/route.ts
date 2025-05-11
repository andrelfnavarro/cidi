import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { cpf } = await request.json();

    if (!cpf) {
      return NextResponse.json(
        { valid: false, message: 'CPF não fornecido' },
        { status: 400 }
      );
    }

    // Remove non-numeric characters
    const cleanedCPF = cpf.replace(/\D/g, '').trim();

    if (cleanedCPF.length !== 11) {
      return NextResponse.json(
        { valid: false, message: 'CPF deve ter 11 dígitos' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if CPF already exists
    const { data, error } = await supabase
      .from('patients')
      .select('id')
      .eq('cpf', cleanedCPF)
      .maybeSingle();

    if (error) {
      console.error('Erro ao verificar CPF:', error);
      return NextResponse.json(
        { error: 'Erro ao verificar CPF' },
        { status: 500 }
      );
    }

    return NextResponse.json({ exists: !!data });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { valid: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
