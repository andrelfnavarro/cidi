"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { 
  Users, 
  UserCog,
  User
} from "lucide-react"

export default function AdminNavBar() {
  const pathname = usePathname()
  const { dentist } = useAuth()

  // If no dentist (not logged in), don't render navigation
  if (!dentist) {
    return null
  }

  // Navigation links with their paths and icons
  const navItems = [
    {
      title: "Pacientes",
      href: "/admin/pacientes",
      icon: Users,
      key: "patients",
      // This is visible to all users
    },
    {
      title: "Meu Perfil",
      href: "/admin/perfil",
      icon: User,
      key: "profile",
      // This is visible to all users
    },
    {
      title: "Gerenciar Dentistas",
      href: "/admin/dentistas",
      icon: UserCog,
      key: "manage-dentists",
      requiresAdmin: true
    },
  ]

  return (
    <div className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <nav className="flex space-x-4 overflow-x-auto">
          {navItems.map((item) => {
            // Skip admin-only items for non-admin users
            if (item.requiresAdmin && !dentist?.is_admin) {
              return null
            }

            // Check if this is the active path - it must match exactly or be a sub-path
            const isActive = pathname === item.href || 
              (pathname.startsWith(item.href + '/') && item.href !== '/admin/pacientes');
            
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex h-12 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "border-blue-700 text-blue-700"
                    : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
                )}
              >
                <item.icon size={16} />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}