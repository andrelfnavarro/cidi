// Mock API function to check if a CPF exists in the system
export async function checkCPF(cpf: string): Promise<boolean> {
  // This is a mock implementation
  // In a real application, this would make an API call to your backend

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // For demonstration purposes:
  // CPFs ending with odd digits are considered "existing patients"
  // CPFs ending with even digits are considered "new patients"
  const lastDigit = Number.parseInt(cpf.charAt(cpf.length - 1))
  return lastDigit % 2 !== 0
}
