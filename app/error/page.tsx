'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Oops! Ocorreu um erro</CardTitle>
          <CardDescription>
            Não foi possível completar sua solicitação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Desculpe pelo inconveniente. Pode ter ocorrido um erro na autenticação ou o link que você usou expirou.</p>
          <Button asChild className="w-full">
            <Link href="/login">Voltar para o login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}