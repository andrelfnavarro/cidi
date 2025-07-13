// Função para verificar se um CPF já existe
export async function checkCPF(cpf: string): Promise<boolean> {
  try {
    const response = await fetch('/api/check-cpf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cpf }),
    });

    const responseData = await response.json();
    console.log(responseData);

    // if (!responseData.ok) {
    //   throw new Error('Erro ao verificar CPF');
    // }

    return responseData.exists;
  } catch (error) {
    console.error('Erro ao verificar CPF:', error);
    throw error;
  }
}

// Função para registrar um novo paciente
export async function registerPatient(patientData: any, companySlug?: string): Promise<any> {
  try {
    const endpoint = companySlug 
      ? `/api/register-patient/${companySlug}` 
      : '/api/register-patient';
      
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao cadastrar paciente');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao cadastrar paciente:', error);
    throw error;
  }
}

// Função para buscar paciente por CPF (para o portal do dentista)
export async function searchPatientByCPF(cpf: string): Promise<any> {
  try {
    const response = await fetch('/api/admin/search-patient', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cpf }),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar paciente');
    }

    const data = await response.json();
    return data.patient;
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    throw error;
  }
}

// Função para buscar paciente por ID (para o portal do dentista)
export async function getPatientById(id: string): Promise<any> {
  try {
    const response = await fetch(`/api/admin/get-patient/${id}`);

    if (!response.ok) {
      throw new Error('Erro ao buscar paciente');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    throw error;
  }
}

// Função para criar um novo tratamento
export async function createTreatment(patientId: string): Promise<any> {
  try {
    const response = await fetch('/api/admin/treatments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patientId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar tratamento');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar tratamento:', error);
    throw error;
  }
}

// Função para listar tratamentos de um paciente
export async function listTreatments(patientId: string): Promise<any> {
  try {
    const response = await fetch('/api/admin/treatments/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patientId }),
    });

    if (!response.ok) {
      throw new Error('Erro ao listar tratamentos');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao listar tratamentos:', error);
    throw error;
  }
}

// Função para buscar um tratamento por ID
export async function getTreatmentById(id: string): Promise<any> {
  try {
    const response = await fetch(`/api/admin/treatments/get/${id}`);

    if (!response.ok) {
      throw new Error('Erro ao buscar tratamento');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar tratamento:', error);
    throw error;
  }
}

// Função para salvar anamnese
export async function saveAnamnesis(data: any): Promise<any> {
  try {
    const response = await fetch('/api/admin/treatments/save-anamnesis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao salvar anamnese');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao salvar anamnese:', error);
    throw error;
  }
}

// Função para salvar planejamento
export async function savePlanning(
  treatmentId: string,
  items: any[]
): Promise<any> {
  try {
    const response = await fetch('/api/admin/treatments/save-planning', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ treatmentId, items }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao salvar planejamento');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao salvar planejamento:', error);
    throw error;
  }
}

// Função para salvar pagamento
export async function savePayment(
  treatmentId: string,
  paymentMethod: string,
  installments: number,
  paymentDate: Date | null
) {
  try {
    const response = await fetch('/api/admin/treatments/save-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        treatmentId,
        paymentMethod,
        installments,
        paymentDate,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao salvar informações de pagamento');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao salvar pagamento:', error);
    throw error;
  }
}

// Função para finalizar tratamento
export async function finalizeTreatment(treatmentId: string): Promise<any> {
  try {
    const response = await fetch('/api/admin/treatments/finalize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        treatmentId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao finalizar tratamento');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao finalizar tratamento:', error);
    throw error;
  }
}

// Function to list dentists
export async function listDentists(): Promise<any> {
  try {
    const response = await fetch('/api/admin/list-dentists');

    if (!response.ok) {
      throw new Error('Erro ao listar dentistas');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao listar dentistas:', error);
    throw error;
  }
}

// Function to register a new dentist
export async function registerDentist(dentistData: any): Promise<any> {
  try {
    console.log('Registering dentist:', dentistData);

    const response = await fetch('/api/admin/register-dentist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dentistData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error response from server:', data);
      throw new Error(data.error || 'Erro ao registrar dentista');
    }

    return data;
  } catch (error) {
    console.error('Error registering dentist:', error);
    throw error;
  }
}

// Function to update a dentist
export async function updateDentist(dentistData: any): Promise<any> {
  try {
    const response = await fetch('/api/admin/update-dentist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dentistData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao atualizar dentista');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao atualizar dentista:', error);
    throw error;
  }
}

// Function to delete a dentist
export async function deleteDentist(id: string): Promise<any> {
  try {
    const response = await fetch('/api/admin/delete-dentist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao excluir dentista');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao excluir dentista:', error);
    throw error;
  }
}

// Função para busca avançada de pacientes
export async function advancedSearchPatients(
  searchTerm: string
): Promise<any[]> {
  try {
    const response = await fetch('/api/admin/advanced-search-patient', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ searchTerm }),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar pacientes');
    }

    const data = await response.json();
    return data.patients || [];
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    throw error;
  }
}

// Function to upload a file for a treatment
export async function uploadTreatmentFile(
  treatmentId: string,
  file: File,
  fileName?: string
): Promise<any> {
  try {
    console.log('Starting file upload:', { treatmentId, fileName: fileName || file.name, fileSize: file.size });
    
    const formData = new FormData();
    formData.append('treatmentId', treatmentId);
    formData.append('file', file);
    if (fileName) {
      formData.append('fileName', fileName);
    }

    console.log('FormData prepared, sending request...');
    
    const response = await fetch('/api/admin/treatments/upload-file', {
      method: 'POST',
      body: formData,
    });

    console.log('Response received:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Upload failed with error:', errorData);
      throw new Error(errorData.error || 'Erro ao enviar arquivo');
    }

    const result = await response.json();
    console.log('Upload successful:', result);
    return result;
  } catch (error) {
    console.error('Exception in uploadTreatmentFile:', error);
    throw error;
  }
}

// Function to get files for a treatment
export async function getTreatmentFiles(treatmentId: string): Promise<any> {
  try {
    const response = await fetch(`/api/admin/treatments/list-files/${treatmentId}`);

    if (!response.ok) {
      throw new Error('Erro ao buscar arquivos');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar arquivos:', error);
    throw error;
  }
}

// Function to get a presigned URL for a file
export async function getFilePresignedUrl(filePath: string): Promise<string> {
  try {
    const response = await fetch('/api/admin/treatments/presigned-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePath }),
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar URL para acesso ao arquivo');
    }

    const data = await response.json();
    return data.signedUrl;
  } catch (error) {
    console.error('Erro ao gerar URL:', error);
    throw error;
  }
}

// Function to delete a file
export async function deleteTreatmentFile(fileId: string): Promise<any> {
  try {
    const response = await fetch('/api/admin/treatments/delete-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao excluir arquivo');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao excluir arquivo:', error);
    throw error;
  }
}
