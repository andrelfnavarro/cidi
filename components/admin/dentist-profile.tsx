"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { createClientSupabaseClient } from "@/lib/supabase"

// Profile schema
const profileSchema = z
  .object({
    name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
    specialty: z.string().optional(),
    registration_number: z.string().optional(),
    current_password: z.string().min(1, { message: "Senha atual é obrigatória para alterar a senha" }).optional(),
    new_password: z.string().min(6, { message: "Nova senha deve ter pelo menos 6 caracteres" }).optional(),
    confirm_password: z.string().optional(),
  })
  .refine(
    (data) => {
      // If any password field is filled, all must be filled
      const hasPassword = !!data.current_password || !!data.new_password || !!data.confirm_password
      if (hasPassword) {
        return !!data.current_password && !!data.new_password && !!data.confirm_password
      }
      return true
    },
    {
      message: "Todos os campos de senha devem ser preenchidos para alterar a senha",
      path: ["current_password"],
    },
  )
  .refine(
    (data) => {
      // If changing password, new and confirm must match
      if (data.new_password && data.confirm_password) {
        return data.new_password === data.confirm_password
      }
      return true
    },
    {
      message: "As senhas não conferem",
      path: ["confirm_password"],
    },
  )

export default function DentistProfile() {
  const [isSaving, setIsSaving] = useState(false)
  const { dentist, refreshDentistProfile } = useAuth()
  const { toast } = useToast()
  const supabase = createClientSupabaseClient()

  // Profile form
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: dentist?.name || "",
      specialty: dentist?.specialty || "",
      registration_number: dentist?.registration_number || "",
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  })

  // Handle profile submission
  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      setIsSaving(true)

      if (!dentist) {
        throw new Error("Perfil de dentista não encontrado")
      }

      // Update profile data
      const { error: updateError } = await supabase
        .from("dentists")
        .update({
          name: data.name,
          specialty: data.specialty || null,
          registration_number: data.registration_number || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", dentist.id)

      if (updateError) {
        throw updateError
      }

      // Update password if provided
      if (data.current_password && data.new_password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: data.new_password,
        })

        if (passwordError) {
          throw passwordError
        }
      }

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      })

      // Reset password fields
      form.setValue("current_password", "")
      form.setValue("new_password", "")
      form.setValue("confirm_password", "")

      // Refresh dentist profile
      await refreshDentistProfile()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar perfil. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!dentist) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-800 md:text-3xl">Meu Perfil</h1>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualize suas informações de perfil</CardDescription>
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
                      <Input placeholder="Seu nome" {...field} />
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
                        <Input placeholder="Sua especialidade" {...field} />
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
                        <Input placeholder="Seu CRO" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-4 font-medium">Alterar Senha</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="current_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha Atual</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Sua senha atual" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="new_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Nova senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirme a nova senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
