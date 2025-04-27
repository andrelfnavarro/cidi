import PatientSearch from "@/components/admin/patient-search"
import AuthCheck from "@/components/admin/auth-check"

export default function PatientsPage() {
  return (
    <AuthCheck>
      <div className="mx-auto max-w-3xl">
        <PatientSearch />
      </div>
    </AuthCheck>
  )
}
