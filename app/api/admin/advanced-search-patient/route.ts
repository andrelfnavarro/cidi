import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const searchTerm = url.searchParams.get("query")

    if (!searchTerm || searchTerm.trim().length < 3) {
      return NextResponse.json({ patients: [] })
    }

    // Create the Supabase client using the new SSR integration
    const supabase = await createClient()

    // We'll search across multiple fields
    const normalizedSearch = searchTerm.toLowerCase().trim()

    // First try to find by exact match on CPF
    const { data: cpfMatches, error: cpfError } = await supabase
      .from("patients")
      .select("*")
      .ilike("cpf", `%${normalizedSearch}%`)

    if (cpfError) {
      console.error("Error searching patients by CPF:", cpfError)
      return NextResponse.json({ error: "Error searching patients" }, { status: 500 })
    }

    // Then search by name
    const { data: nameMatches, error: nameError } = await supabase
      .from("patients")
      .select("*")
      .ilike("name", `%${normalizedSearch}%`)

    if (nameError) {
      console.error("Error searching patients by name:", nameError)
      return NextResponse.json({ error: "Error searching patients" }, { status: 500 })
    }

    // Then search by email
    const { data: emailMatches, error: emailError } = await supabase
      .from("patients")
      .select("*")
      .ilike("email", `%${normalizedSearch}%`)

    if (emailError) {
      console.error("Error searching patients by email:", emailError)
      return NextResponse.json({ error: "Error searching patients" }, { status: 500 })
    }

    // Then search by phone
    const { data: phoneMatches, error: phoneError } = await supabase
      .from("patients")
      .select("*")
      .ilike("phone", `%${normalizedSearch}%`)

    if (phoneError) {
      console.error("Error searching patients by phone:", phoneError)
      return NextResponse.json({ error: "Error searching patients" }, { status: 500 })
    }

    // Combine results and remove duplicates
    const allMatches = [...cpfMatches, ...nameMatches, ...emailMatches, ...phoneMatches]
    const uniquePatients = Array.from(new Map(allMatches.map(item => [item.id, item])).values())

    return NextResponse.json({ patients: uniquePatients })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
