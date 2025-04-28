import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "No active session" }, { status: 401 })
    }

    const userId = session.user.id

    // Check if the user exists in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)

    if (authError) {
      return NextResponse.json({ error: "Error fetching auth user", details: authError }, { status: 500 })
    }

    // Check if the dentist record exists
    const { data: dentistData, error: dentistError } = await supabase.from("dentists").select("*").eq("id", userId)

    if (dentistError) {
      return NextResponse.json({ error: "Error fetching dentist", details: dentistError }, { status: 500 })
    }

    // Return all the debug information
    return NextResponse.json({
      session: {
        userId: session.user.id,
        email: session.user.email,
      },
      authUser: authUser
        ? {
            id: authUser.user.id,
            email: authUser.user.email,
            emailConfirmed: authUser.user.email_confirmed_at,
          }
        : null,
      dentistRecord: dentistData,
    })
  } catch (error) {
    console.error("Error in debug-auth:", error)
    return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 })
  }
}
