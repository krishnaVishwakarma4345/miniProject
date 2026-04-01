"use client"

import { ReactNode, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/hooks/useAuth"

const NAV_LINKS = [
	{ href: "/admin/dashboard", label: "Dashboard" },
	{ href: "/admin/analytics", label: "Analytics" },
	{ href: "/admin/reports", label: "Reports" },
	{ href: "/admin/users", label: "Users" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
	const { user, logout } = useAuth()
	const [isSigningOut, setIsSigningOut] = useState(false)

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
						<p className="text-xs uppercase tracking-[0.4em] text-slate-400">Admin</p>
						<h1 className="text-2xl font-semibold text-slate-900">Control center</h1>
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
							<p className="text-sm font-semibold text-slate-900">{user?.displayName || "Admin"}</p>
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
	);
}
