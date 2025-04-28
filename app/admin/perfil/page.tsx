import DentistProfile from "@/components/admin/dentist-profile"
import AuthCheck from "@/components/admin/auth-check"

export default function ProfilePage() {
  return (
    <AuthCheck>
      <div className="mx-auto max-w-2xl">
        <DentistProfile />
      </div>
    </AuthCheck>
  )
}
