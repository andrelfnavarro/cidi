import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    if (!data.treatmentId) {
      return NextResponse.json({ error: "ID do tratamento é obrigatório" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Verificar se já existe anamnese para este tratamento
    const { data: existingAnamnesis, error: checkError } = await supabase
      .from("anamnesis")
      .select("id")
      .eq("treatment_id", data.treatmentId)
      .maybeSingle()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Erro ao verificar anamnese existente:", checkError)
      return NextResponse.json({ error: "Erro ao verificar anamnese existente" }, { status: 500 })
    }

    let result

    // Preparar dados para inserção/atualização
    const anamnesisRecord = {
      treatment_id: data.treatmentId,
      // Saúde Geral
      medical_treatment: data.medicalTreatment,
      medical_treatment_desc: data.medicalTreatmentDesc,
      medication: data.medication,
      medication_desc: data.medicationDesc,
      allergy: data.allergy,
      allergy_desc: data.allergyDesc,
      pregnant: data.pregnant,
      breastfeeding: data.breastfeeding,
      smoker: data.smoker,
      osteoporosis: data.osteoporosis,
      alcohol: data.alcohol,
      diabetes: data.diabetes,
      surgery: data.surgery,
      surgery_desc: data.surgeryDesc,
      bleeding_healing_issues: data.bleedingHealingIssues,
      blood_transfusion: data.bloodTransfusion,
      blood_transfusion_reason: data.bloodTransfusionReason,
      hypertension: data.hypertension,
      asthma: data.asthma,
      psychological_issues: data.psychologicalIssues,
      psychological_issues_desc: data.psychologicalIssuesDesc,
      pacemaker: data.pacemaker,
      infectious_disease: data.infectiousDisease,
      infectious_disease_desc: data.infectiousDiseaseDesc,
      other_health_issues: data.otherHealthIssues,
      other_health_issues_desc: data.otherHealthIssuesDesc,
      additional_health_info: data.additionalHealthInfo,
      // Saúde Bucal
      last_dental_visit: data.lastDentalVisit,
      last_treatment: data.lastTreatment,
      anesthesia: data.anesthesia,
      anesthesia_reaction: data.anesthesiaReaction,
      bleeding_after_extraction: data.bleedingAfterExtraction,
      brushing_frequency: data.brushingFrequency,
      mouthwash: data.mouthwash,
      teeth_grinding: data.teethGrinding,
      coffee_tea: data.coffeeTea,
      bleeding_gums: data.bleedingGums,
      jaw_pain: data.jawPain,
      mouth_breathing: data.mouthBreathing,
      dental_floss: data.dentalFloss,
      tongue_cleaning: data.tongueCleaning,
      sweets: data.sweets,
      additional_dental_info: data.additionalDentalInfo,
      updated_at: new Date().toISOString(),
    }

    if (existingAnamnesis) {
      // Atualizar anamnese existente
      const { data: updateData, error: updateError } = await supabase
        .from("anamnesis")
        .update(anamnesisRecord)
        .eq("id", existingAnamnesis.id)
        .select()

      if (updateError) {
        console.error("Erro ao atualizar anamnese:", updateError)
        return NextResponse.json({ error: "Erro ao atualizar anamnese" }, { status: 500 })
      }

      result = updateData
    } else {
      // Inserir nova anamnese
      const { data: insertData, error: insertError } = await supabase
        .from("anamnesis")
        .insert({
          ...anamnesisRecord,
          created_at: new Date().toISOString(),
        })
        .select()

      if (insertError) {
        console.error("Erro ao inserir anamnese:", insertError)
        return NextResponse.json({ error: "Erro ao inserir anamnese" }, { status: 500 })
      }

      result = insertData
    }

    return NextResponse.json({ success: true, anamnesis: result[0] })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
