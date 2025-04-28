"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { listDentists, registerDentist, updateDentist, deleteDentist } from "@/lib/api"

// Dentist schema
const dentistSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }).optional(),
  specialty: z.string().optional(),
  registration_number: z.string().optional(),
  is_admin: z.boolean().default(false),
})

type Dentist = {
  id: string
  name: string
  email: string
  specialty: string | null
  registration_number: string | null
  is_admin: boolean
}

export default function DentistManagement() {
  const [dentists, setDentists] = useState<Dentist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingDentist, setEditingDentist] = useState<Dentist | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { dentist: currentDentist } = useAuth()
  const { toast } = useToast()

  // Dentist form
  const form = useForm<z.infer<typeof dentistSchema>>({
    resolver: zodResolver(dentistSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      specialty: "",
      registration_number: "",
      is_admin: false,
    },
  })

  // Fetch dentists
  const fetchDentists = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { dentists: dentistsList } = await listDentists()
      setDentists(dentistsList)
    } catch (error) {
      console.error("Error fetching dentists:", error)
      setError("Não foi possível carregar a lista de dentistas.")
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de dentistas.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load dentists on mount
  useEffect(() => {
    if (currentDentist?.is_admin) {
      fetchDentists()
    }
  }, []) // Empty dependency array to run only once on mount

  // Reset form when editing dentist changes
  useEffect(() => {
    if (editingDentist) {
      form.reset({
        name: editingDentist.name,
        email: editingDentist.email,
        password: "",
        specialty: editingDentist.specialty || "",
        registration_number: editingDentist.registration_number || "",
        is_admin: editingDentist.is_admin,
      })
    } else {
      form.reset({
        name: "",
        email: "",
        password: "",
        specialty: "",
        registration_number: "",
        is_admin: false,
      })
    }
  }, [editingDentist, form]) // Only depend on editingDentist and form

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof dentistSchema>) => {
    try {
      setIsSaving(true)
      setError(null)

      if (editingDentist) {
        // Update existing dentist
        await updateDentist({
          id: editingDentist.id,
          name: data.name,
          specialty: data.specialty || null,
          registration_number: data.registration_number || null,
          is_admin: data.is_admin,
          password: data.password || undefined,
        })

        toast({
          title: "Dentista atualizado",
          description: "Os dados do dentista foram atualizados com sucesso.",
        })
      } else {
        // Create new dentist
        if (!data.password) {
          throw new Error("Senha é obrigatória para novos dentistas")
        }

        console.log("Submitting new dentist:", {
          name: data.name,
          email: data.email,
          // password is omitted for security
          specialty: data.specialty || null,
          registration_number: data.registration_number || null,
          is_admin: data.is_admin,
        })

        await registerDentist({
          name: data.name,
          email: data.email,
          password: data.password,
          specialty: data.specialty || null,
          registration_number: data.registration_number || null,
          is_admin: data.is_admin,
        })

        toast({
          title: "Dentista cadastrado",
          description: "O novo dentista foi cadastrado com sucesso.",
        })
      }

      // Reset form and refresh list
      setEditingDentist(null)
      fetchDentists()
    } catch (error) {
      console.error("Error saving dentist:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro ao salvar dentista. Tente novamente."
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete dentist
  const handleDelete = async (dentistId: string) => {
    if (confirm("Tem certeza que deseja excluir este dentista?")) {
      try {
        setError(null)
        await deleteDentist(dentistId)

        toast({
          title: "Dentista excluído",
          description: "O dentista foi excluído com sucesso.",
        })

        fetchDentists()
      } catch (error) {
        console.error("Error deleting dentist:", error)
        const errorMessage =
          error instanceof Error ? error.message : "Não foi possível excluir o dentista. Tente novamente."
        setError(errorMessage)
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
  }

  // Check if user is admin
  if (!currentDentist?.is_admin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Acesso Restrito</h2>
            <p className="mt-2 text-gray-600">Você não tem permissão para acessar esta página.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-800 md:text-3xl">Gerenciar Dentistas</h1>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{editingDentist ? "Editar Dentista" : "Novo Dentista"}</CardTitle>
          <CardDescription>
            {editingDentist ? "Atualize os dados do dentista" : "Cadastre um novo dentista no sistema"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do dentista" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} disabled={!!editingDentist} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{editingDentist ? "Nova Senha (opcional)" : "Senha"}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={editingDentist ? "Deixe em branco para manter a senha atual" : "Senha"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Especialidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registration_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Registro (CRO)</FormLabel>
                      <FormControl>
                        <Input placeholder="CRO" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_admin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Administrador</FormLabel>
                      <p className="text-sm text-gray-500">
                        Administradores podem gerenciar outros dentistas e configurações do sistema.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Salvando..." : editingDentist ? "Atualizar" : "Cadastrar"}
                </Button>
                {editingDentist && (
                  <Button type="button" variant="outline" onClick={() => setEditingDentist(null)}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dentistas Cadastrados</CardTitle>
          <CardDescription>Lista de dentistas da clínica</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
            </div>
          ) : dentists.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum dentista cadastrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dentists.map((dentist) => (
                <div key={dentist.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h3 className="font-medium">{dentist.name}</h3>
                    <p className="text-sm text-gray-500">{dentist.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {dentist.specialty && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {dentist.specialty}
                        </span>
                      )}
                      {dentist.is_admin && (
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingDentist(dentist)} title="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(dentist.id)}
                      title="Excluir"
                      disabled={dentist.id === currentDentist.id}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
