import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Multi-tenant mode: redirect to company-specific registration
    return NextResponse.json(
      { 
        error: 'Este endpoint foi descontinuado. Por favor, utilize o link específico fornecido pela sua clínica odontológica para se cadastrar.',
        redirect: '/'
      }, 
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
