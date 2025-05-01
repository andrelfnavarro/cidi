import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get the current session to verify the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all dentists
    const { data: dentists, error } = await supabase
      .from("dentists")
      .select("*")
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching dentists:", error)
      return NextResponse.json({ error: "Error fetching dentists" }, { status: 500 })
    }

    return NextResponse.json({ dentists })
  } catch (error) {
    console.error("Error in list-dentists:", error)
    return NextResponse.json(
      { error: "Internal server error: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}
