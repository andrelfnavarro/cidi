"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { createClientSupabaseClient } from "@/lib/supabase"

// Profile schema
const profileSchema = z
  .object({
    name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
    specialty: z.string().optional(),
    registration_number: z.string().optional(),
    current_password: z.string().optional().or(z.literal("")),
    new_password: z
      .string()
      .min(6, { message: "Nova senha deve ter pelo menos 6 caracteres" })
      .optional()
      .or(z.literal("")),
    confirm_password: z.string().optional().or(z.literal("")),
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
  const [error, setError] = useState<string | null>(null)
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
      setError(null)

      if (!dentist) {
        throw new Error("Perfil de dentista não encontrado")
      }

      // Check if we're trying to update the password
      const passwordUpdateRequested = !!(data.current_password && data.new_password && data.confirm_password)

      // If password update is requested, handle it first
      if (passwordUpdateRequested) {
        // Step 1: Verify current password
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email: dentist.email,
          password: data.current_password!,
        })

        if (signInError || !authData.user) {
          toast({
            title: "Senha incorreta",
            description: "A senha atual informada está incorreta. Por favor, verifique e tente novamente.",
            variant: "destructive",
          })
          setError("Senha atual incorreta. Por favor, verifique e tente novamente.")
          setIsSaving(false)
          return
        }

        // Step 2: Update password
        const { error: passwordError } = await supabase.auth.updateUser({
          password: data.new_password!,
        })

        if (passwordError) {
          toast({
            title: "Erro ao atualizar senha",
            description: passwordError.message,
            variant: "destructive",
          })
          setError(`Erro ao atualizar senha: ${passwordError.message}`)
          setIsSaving(false)
          return
        }

        // Password updated successfully, now update profile
        toast({
          title: "Senha atualizada",
          description: "Sua senha foi atualizada com sucesso.",
        })
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
        toast({
          title: "Erro ao atualizar perfil",
          description: updateError.message,
          variant: "destructive",
        })
        throw new Error(`Erro ao atualizar perfil: ${updateError.message}`)
      }

      // Show success message for profile update
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
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar perfil. Tente novamente."
      setError(errorMessage)

      // Only show toast if we haven't already shown one for a specific error
      if (!errorMessage.includes("Senha atual incorreta") && !errorMessage.includes("Erro ao atualizar senha")) {
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
      }
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

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
                <h3 className="mb-4 font-medium">Alterar Senha (Opcional)</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Deixe os campos abaixo em branco se não desejar alterar sua senha.
                </p>
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
