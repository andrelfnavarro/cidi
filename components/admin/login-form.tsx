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
import { useToast } from "@/hooks/use-toast"

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, { message: "Nome de usuário é obrigatório" }),
  password: z.string().min(1, { message: "Senha é obrigatória" }),
})

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Login form
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  // Handle login submission
  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true)

      // Simulação de login - em produção, isso seria uma chamada de API real
      // Para fins de demonstração, aceitamos qualquer login
      if (data.username && data.password) {
        // Simular um pequeno atraso para mostrar o estado de carregamento
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Armazenar estado de login no localStorage
        localStorage.setItem("dentist_logged_in", "true")

        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao portal do dentista.",
        })

        // Redirecionar para a página de busca de pacientes
        router.push("/admin/pacientes")
      } else {
        throw new Error("Credenciais inválidas")
      }
    } catch (error) {
      toast({
        title: "Erro de login",
        description: error instanceof Error ? error.message : "Credenciais inválidas. Tente novamente.",
        variant: "destructive",
      })
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de usuário</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome de usuário" {...field} />
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
