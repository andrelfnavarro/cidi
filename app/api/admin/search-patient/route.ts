import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const searchTerm = url.searchParams.get("query")

    if (!searchTerm || searchTerm.trim().length === 0) {
      return NextResponse.json({ patients: [] })
    }

    // Create the Supabase client using the new SSR integration
    const supabase = await createClient()

    // We'll search across multiple fields
    const normalizedSearch = searchTerm.toLowerCase().trim()

    // First try to find by exact match on CPF or if is a numeric search
    const isCPFSearch = normalizedSearch.replace(/\D/g, "").length > 0

    if (isCPFSearch) {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .filter("cpf", "ilike", `%${normalizedSearch.replace(/\D/g, "")}%`)
        .limit(10)

      if (error) {
        console.error("Error searching patients by CPF:", error)
        return NextResponse.json({ error: "Error searching patients" }, { status: 500 })
      }

      if (data.length > 0) {
        return NextResponse.json({ patients: data })
      }
    }

    // If not found by CPF, or not a CPF search, search by name
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .ilike("name", `%${normalizedSearch}%`)
      .limit(10)

    if (error) {
      console.error("Error searching patients:", error)
      return NextResponse.json({ error: "Error searching patients" }, { status: 500 })
    }

    return NextResponse.json({ patients: data })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
