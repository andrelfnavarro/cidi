import DentistManagement from "@/components/admin/dentist-management"
import AuthCheck from "@/components/admin/auth-check"

export default function DentistsPage() {
  return (
    <AuthCheck>
      <div className="mx-auto max-w-4xl">
        <DentistManagement />
      </div>
    </AuthCheck>
  )
}
