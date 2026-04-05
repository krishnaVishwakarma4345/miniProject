"use client"

import { ReactNode, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/hooks/useAuth"
import { UserRole } from "@/types/user.types"

const NAV_LINKS = [
  { href: "/master-admin/institutions", label: "Institutions" },
  { href: "/master-admin/users", label: "Users" },
]

export default function MasterAdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.replace("/login")
      return
    }

    if (user.role !== UserRole.MASTER_ADMIN) {
      router.replace("/")
    }
  }, [isLoading, router, user])

  const handleLogout = async () => {
    setIsSigningOut(true)
    try {
      await logout()
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/80 px-6 py-5 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Master Admin</p>
            <h1 className="text-2xl font-semibold text-slate-900">Institution control</h1>
          </div>
          <div className="flex items-center gap-3">
            <nav className="flex flex-wrap gap-3 text-sm font-semibold text-slate-500">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-full px-4 py-2 hover:bg-slate-100">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-slate-900">{user?.displayName || "Master Admin"}</p>
              <p className="text-xs text-slate-500">{user?.email || ""}</p>
            </div>
            <Button variant="outline" size="sm" loading={isSigningOut} onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>
        <main className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">{children}</main>
      </div>
    </div>
  )
}
