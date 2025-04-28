"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, dentist, isLoading } = useAuth()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!user || !dentist) {
        router.push("/admin")
      } else {
        setIsAuthenticated(true)
      }
    }
  }, [user, dentist, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
