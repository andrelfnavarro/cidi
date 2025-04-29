"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { advancedSearchPatients } from "@/lib/api"
import { formatCPF, formatPhone } from "@/lib/format-utils"

export default function AdvancedPatientSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const router = useRouter()
  const { toast } = useToast()

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    try {
      setIsSearching(true)
      const patients = await advancedSearchPatients(searchTerm)
      setSearchResults(patients)

      if (patients.length === 0) {
        toast({
          title: "Nenhum resultado encontrado",
          description: "Tente outro termo de busca.",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível realizar a busca. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Navigate to patient details
  const goToPatient = (patientId: string) => {
    router.push(`/admin/pacientes/${patientId}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Busca Avançada de Pacientes</CardTitle>
        <CardDescription>
          Busque pacientes por nome, email, CPF ou telefone. Para CPF e telefone, você pode digitar com ou sem
          formatação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            placeholder="Nome, email, CPF ou telefone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? "Buscando..." : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Resultados da busca</h3>
            <div className="divide-y rounded-md border">
              {searchResults.map((patient) => (
                <div
                  key={patient.id}
                  className="flex cursor-pointer items-center justify-between p-3 hover:bg-gray-50"
                  onClick={() => goToPatient(patient.id)}
                >
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-gray-500">CPF: {formatCPF(patient.cpf)}</p>
                    {patient.email && <p className="text-sm text-gray-500">Email: {patient.email}</p>}
                    {patient.phone && <p className="text-sm text-gray-500">Telefone: {formatPhone(patient.phone)}</p>}
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
