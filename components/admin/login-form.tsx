"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { InfoIcon } from "lucide-react"

// Login schema
const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
})

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { signIn } = useAuth()

  // Login form
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Handle login submission
  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true)
      setLoginError(null)
      setDebugInfo(null)

      const { error } = await signIn(data.email, data.password)

      if (error) {
        if (error.message.includes("não encontrado como dentista")) {
          setLoginError("Sua conta existe, mas não está vinculada a um dentista. Entre em contato com o administrador.")

          // Try to get debug info
          try {
            const response = await fetch("/api/admin/debug-auth")
            if (response.ok) {
              const debugData = await response.json()
              setDebugInfo(debugData)
            }
          } catch (debugError) {
            console.error("Error fetching debug info:", debugError)
          }
        } else if (error.message.includes("Invalid login credentials")) {
          setLoginError("Email ou senha incorretos. Verifique suas credenciais e tente novamente.")
        } else {
          setLoginError(error.message || "Erro ao fazer login. Tente novamente.")
        }
        return
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao portal do dentista.",
      })

      // Redirecionar para a página de busca de pacientes
      router.push("/admin/pacientes")
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Acesse o portal do dentista</CardDescription>
      </CardHeader>
      <CardContent>
        {loginError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle className="flex items-center gap-2">
              <InfoIcon className="h-4 w-4" />
              Erro de autenticação
            </AlertTitle>
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        )}

        {debugInfo && (
          <div className="mb-4 p-4 bg-gray-100 rounded-md text-xs overflow-auto max-h-40">
            <p className="font-bold mb-2">Informações de depuração:</p>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="seu@email.com" {...field} />
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
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Sua senha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
