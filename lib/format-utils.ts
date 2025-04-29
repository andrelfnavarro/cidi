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
