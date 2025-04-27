// Função para verificar se um CPF já existe
export async function checkCPF(cpf: string): Promise<boolean> {
  try {
    const response = await fetch("/api/check-cpf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cpf }),
    })

    if (!response.ok) {
      throw new Error("Erro ao verificar CPF")
    }

    const data = await response.json()
    return data.exists
  } catch (error) {
    console.error("Erro ao verificar CPF:", error)
    throw error
  }
}

// Função para registrar um novo paciente
export async function registerPatient(patientData: any): Promise<any> {
  try {
    const response = await fetch("/api/register-patient", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patientData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Erro ao cadastrar paciente")
    }

    return await response.json()
  } catch (error) {
    console.error("Erro ao cadastrar paciente:", error)
    throw error
  }
}

// Função para buscar paciente por CPF (para o portal do dentista)
export async function searchPatientByCPF(cpf: string): Promise<any> {
  try {
    const response = await fetch("/api/admin/search-patient", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cpf }),
    })

    if (!response.ok) {
      throw new Error("Erro ao buscar paciente")
    }

    const data = await response.json()
    return data.patient
  } catch (error) {
    console.error("Erro ao buscar paciente:", error)
    throw error
  }
}

// Função para buscar paciente por ID (para o portal do dentista)
export async function getPatientById(id: string): Promise<any> {
  try {
    const response = await fetch(`/api/admin/get-patient/${id}`)

    if (!response.ok) {
      throw new Error("Erro ao buscar paciente")
    }

    return await response.json()
  } catch (error) {
    console.error("Erro ao buscar paciente:", error)
    throw error
  }
}

// Função para criar um novo tratamento
export async function createTreatment(patientId: string): Promise<any> {
  try {
    const response = await fetch("/api/admin/treatments/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ patientId }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Erro ao criar tratamento")
    }

    return await response.json()
  } catch (error) {
    console.error("Erro ao criar tratamento:", error)
    throw error
  }
}

// Função para listar tratamentos de um paciente
export async function listTreatments(patientId: string): Promise<any> {
  try {
    const response = await fetch("/api/admin/treatments/list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ patientId }),
    })

    if (!response.ok) {
      throw new Error("Erro ao listar tratamentos")
    }

    return await response.json()
  } catch (error) {
    console.error("Erro ao listar tratamentos:", error)
    throw error
  }
}

// Função para buscar um tratamento por ID
export async function getTreatmentById(id: string): Promise<any> {
  try {
    const response = await fetch(`/api/admin/treatments/get/${id}`)

    if (!response.ok) {
      throw new Error("Erro ao buscar tratamento")
    }

    return await response.json()
  } catch (error) {
    console.error("Erro ao buscar tratamento:", error)
    throw error
  }
}

// Função para salvar anamnese
export async function saveAnamnesis(data: any): Promise<any> {
  try {
    const response = await fetch("/api/admin/treatments/save-anamnesis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Erro ao salvar anamnese")
    }

    return await response.json()
  } catch (error) {
    console.error("Erro ao salvar anamnese:", error)
    throw error
  }
}

// Função para salvar planejamento
export async function savePlanning(treatmentId: string, items: any[]): Promise<any> {
  try {
    const response = await fetch("/api/admin/treatments/save-planning", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ treatmentId, items }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Erro ao salvar planejamento")
    }

    return await response.json()
  } catch (error) {
    console.error("Erro ao salvar planejamento:", error)
    throw error
  }
}

// Função para salvar pagamento
export async function savePayment(
  treatmentId: string,
  paymentMethod: string,
  installments: number,
  paymentDate: Date | null,
) {
  try {
    const response = await fetch("/api/admin/treatments/save-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        treatmentId,
        paymentMethod,
        installments,
        paymentDate,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Erro ao salvar informações de pagamento")
    }

    return await response.json()
  } catch (error) {
    console.error("Erro ao salvar pagamento:", error)
    throw error
  }
}

// Função para finalizar tratamento
export async function finalizeTreatment(treatmentId: string): Promise<any> {
  try {
    const response = await fetch("/api/admin/treatments/finalize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ treatmentId }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Erro ao finalizar tratamento")
    }

    return await response.json()
  } catch (error) {
    console.error("Erro ao finalizar tratamento:", error)
    throw error
  }
}
