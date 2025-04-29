import AdvancedPatientSearch from "@/components/admin/advanced-patient-search"
import PatientSearch from "@/components/admin/patient-search"
import AuthCheck from "@/components/admin/auth-check"

export default function PatientsPage() {
  return (
    <AuthCheck>
      <div className="mx-auto max-w-3xl space-y-6">
        <PatientSearch />
        <AdvancedPatientSearch />
      </div>
    </AuthCheck>
  )
}
