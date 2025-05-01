import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  try {
    const treatment = await request.json()

    if (!treatment.patient_id || !treatment.dentist_id || !treatment.description) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Create the Supabase client using the new SSR integration
    const supabase = await createClient()

    // Insert treatment
    const { data, error } = await supabase
      .from("treatments")
      .insert({
        patient_id: treatment.patient_id,
        dentist_id: treatment.dentist_id,
        description: treatment.description,
        anamnesis: treatment.anamnesis || {},
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Error creating treatment:", error)
      return NextResponse.json({ error: "Error creating treatment" }, { status: 500 })
    }

    return NextResponse.json({ success: true, treatment: data[0] })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
