"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"

type DentistProfile = {
  id: string
  name: string
  email: string
  specialty: string | null
  registration_number: string | null
  is_admin: boolean
}

type AuthContextType = {
  user: User | null
  dentist: DentistProfile | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshDentistProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [dentist, setDentist] = useState<DentistProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Fetch dentist profile data with better error handling
  const fetchDentistProfile = async (userId: string) => {
    try {
      console.log("Fetching dentist profile for user ID:", userId)

      // Try to get the dentist record directly
      const { data, error } = await supabase.from("dentists").select("*").eq("id", userId).limit(1)

      // Log the raw response for debugging
      console.log("Dentist query response:", { data, error })

      if (error) {
        console.error("Error fetching dentist profile:", error)
        return null
      }

      // Check if we got any data back
      if (!data || data.length === 0) {
        console.log("No dentist record found for user ID:", userId)
        return null
      }

      // Return the first record
      console.log("Dentist profile fetched successfully:", data[0])
      return data[0] as DentistProfile
    } catch (error) {
      console.error("Exception in fetchDentistProfile:", error)
      return null
    }
  }

  // Refresh dentist profile
  const refreshDentistProfile = async () => {
    if (user) {
      const profile = await fetchDentistProfile(user.id)
      setDentist(profile)
    }
  }

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)

      try {
        // Check for existing session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("Auth session check:", session ? "Session exists" : "No session")

        if (session?.user) {
          console.log("User from session:", session.user)
          setUser(session.user)
          const profile = await fetchDentistProfile(session.user.id)
          setDentist(profile)
        }

        // Set up auth state listener
        const {
          data: { subscription },
        } = await supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state change event:", event)

          if (session?.user) {
            console.log("User from auth change:", session.user)
            setUser(session.user)
            const profile = await fetchDentistProfile(session.user.id)
            setDentist(profile)
          } else {
            setUser(null)
            setDentist(null)

            // Redirect to login page if not already there
            if (pathname !== "/admin") {
              router.push("/admin")
            }
          }
        })

        // Clean up subscription
        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [supabase, router, pathname])

  // Sign in function with better error handling
  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting sign in for:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Sign in error:", error)
        return { error }
      }

      console.log("Sign in successful, user:", data.user)

      if (data.user) {
        // Wait a moment to ensure auth state is updated
        await new Promise((resolve) => setTimeout(resolve, 500))

        const profile = await fetchDentistProfile(data.user.id)
        console.log("Fetched profile after sign in:", profile)

        // If no dentist profile exists, return an error
        if (!profile) {
          console.log("No dentist profile found, signing out")
          await supabase.auth.signOut() // Sign out the user
          return { error: { message: "Usuário não encontrado como dentista. Entre em contato com o administrador." } }
        }

        setDentist(profile)
      }

      return { error: null }
    } catch (error) {
      console.error("Exception in signIn:", error)
      return { error }
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setDentist(null)

      // Force redirect to login page
      router.push("/admin")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const value = {
    user,
    dentist,
    isLoading,
    signIn,
    signOut,
    refreshDentistProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
