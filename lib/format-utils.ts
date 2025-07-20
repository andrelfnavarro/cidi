/**
 * Validates a CPF using the official algorithm
 */
export function validateCPF(cpf: string | null | undefined): boolean {
  if (!cpf) return false

  // Remove any non-digit characters
  const digits = cpf.replace(/\D/g, "")

  // Check if it has 11 digits
  if (digits.length !== 11) return false

  // Check for known invalid CPFs (all same digits)
  if (/^(\d)\1{10}$/.test(digits)) return false

  // Validate first check digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i)
  }
  let remainder = sum % 11
  let firstCheckDigit = remainder < 2 ? 0 : 11 - remainder

  if (parseInt(digits[9]) !== firstCheckDigit) return false

  // Validate second check digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i)
  }
  remainder = sum % 11
  let secondCheckDigit = remainder < 2 ? 0 : 11 - remainder

  return parseInt(digits[10]) === secondCheckDigit
}

/**
 * Formats a CPF string with dots and dash (e.g., "123.456.789-00")
 */
export function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return ""

  // Remove any non-digit characters
  const digits = cpf.replace(/\D/g, "")

  // If it's not 11 digits, return as is
  if (digits.length !== 11) return cpf

  // Format as XXX.XXX.XXX-XX
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

/**
 * Formats a phone number string with parentheses and dash
 * (e.g., "(11) 98765-4321" or "(11) 1234-5678")
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return ""

  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, "")

  // Format based on length
  if (digits.length === 11) {
    // Mobile phone: (XX) XXXXX-XXXX
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  } else if (digits.length === 10) {
    // Landline: (XX) XXXX-XXXX
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  }

  // If it doesn't match expected formats, return as is
  return phone
}

/**
 * Formats a CEP string with dash (e.g., "12345-678")
 */
export function formatCEP(cep: string | null | undefined): string {
  if (!cep) return ""

  // Remove any non-digit characters
  const digits = cep.replace(/\D/g, "")

  // If it's not 8 digits, return as is
  if (digits.length !== 8) return cep

  // Format as XXXXX-XXX
  return digits.replace(/(\d{5})(\d{3})/, "$1-$2")
}

/**
 * Interface for CEP API response
 */
export interface CEPResponse {
  cep: string;
  street: string;
  city: string;
  state: string;
  error?: string;
}

/**
 * Fetches address information from our internal API
 */
export async function fetchAddressByCEP(cep: string): Promise<CEPResponse | null> {
  try {
    // Remove any non-digit characters
    const cleanCEP = cep.replace(/\D/g, "")

    // Validate CEP format (8 digits)
    if (cleanCEP.length !== 8) {
      throw new Error("CEP inválido")
    }

    // Fetch from our internal API route
    const response = await fetch(`/api/cep/${cleanCEP}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Erro ao buscar CEP")
    }

    const data: CEPResponse = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching CEP:", error)
    return null
  }
}
