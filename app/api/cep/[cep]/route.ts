import { NextRequest, NextResponse } from 'next/server';

export interface CEPResponse {
  cep: string;
  street: string;
  city: string;
  state: string;
  error?: string;
}

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

function validateCEP(cep: string): boolean {
  // Remove any non-digit characters
  const digits = cep.replace(/\D/g, '');
  
  // Check if it has exactly 8 digits
  return digits.length === 8;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { cep: string } }
) {
  try {
    const { cep } = params;

    // Validate CEP format
    if (!validateCEP(cep)) {
      return NextResponse.json(
        { error: 'CEP inválido. Deve conter 8 dígitos.' },
        { status: 400 }
      );
    }

    // Remove any non-digit characters
    const cleanCEP = cep.replace(/\D/g, '');

    // Fetch from ViaCEP API
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar CEP');
    }

    const data: ViaCEPResponse = await response.json();

    // Check if CEP was found
    if (data.erro) {
      return NextResponse.json(
        { error: 'CEP não encontrado.' },
        { status: 404 }
      );
    }

    // Transform the response to our format
    const result: CEPResponse = {
      cep: data.cep,
      street: data.logradouro,
      city: data.localidade,
      state: data.uf,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching CEP:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar CEP.' },
      { status: 500 }
    );
  }
}