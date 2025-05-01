"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/admin/login-form"
import { useAuth } from "@/contexts/auth-context"

export default function AdminPage() {
  const { user, dentist, isLoading } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user && dentist) {
      router.push("/admin/pacientes")
    }
  }, [user, dentist, isLoading, router])

  // Show login form if not authenticated or still loading
  return (
    <div className="mx-auto max-w-md">
      {!isLoading && !user && <LoginForm />}
      {isLoading && (
        <div className="flex h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
        </div>
      )}
    </div>
  )
}
