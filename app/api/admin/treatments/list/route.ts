import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const patientId = url.searchParams.get("patientId")
    const status = url.searchParams.get("status")

    // Create the Supabase client using the new SSR integration
    const supabase = await createClient()

    let query = supabase
      .from("treatments")
      .select(
        `
        *,
        dentist:dentist_id(name),
        patient:patient_id(name)
      `
      )
      .order("created_at", { ascending: false })

    if (patientId) {
      query = query.eq("patient_id", patientId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching treatments:", error)
      return NextResponse.json({ error: "Error fetching treatments" }, { status: 500 })
    }

    return NextResponse.json({ treatments: data })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
