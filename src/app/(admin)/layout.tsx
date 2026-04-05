"use client"

import { ReactNode, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/hooks/useAuth"

const NAV_LINKS = [
	{ href: "/admin/dashboard", label: "Dashboard" },
	{ href: "/admin/analytics", label: "Analytics" },
	{ href: "/admin/student-progress", label: "Student progress" },
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
		<div className="min-h-screen overflow-x-hidden bg-slate-50">
			<div className="mx-auto flex max-w-6xl flex-col gap-6 px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
				<header className="rounded-3xl border border-slate-200 bg-white/80 px-4 py-4 shadow-sm sm:px-6 sm:py-5">
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p className="text-xs uppercase tracking-[0.4em] text-slate-400">Admin</p>
								<h1 className="text-2xl font-semibold text-slate-900">Control center</h1>
							</div>
							<div className="flex flex-wrap items-center gap-2 text-left sm:justify-end">
								<div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
									<p className="text-sm font-semibold text-slate-900">{user?.displayName || 'Admin'}</p>
									<p className="text-xs text-slate-500 break-all">{user?.email || ''}</p>
								</div>
								<Button variant="outline" size="sm" loading={isSigningOut} onClick={handleLogout}>
									Logout
								</Button>
							</div>
						</div>
						<nav className="flex gap-2 overflow-x-auto pb-1 text-sm font-semibold text-slate-500 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
							{NAV_LINKS.map((link) => (
								<Link key={link.href} href={link.href} className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 hover:bg-slate-100">
									{link.label}
								</Link>
							))}
						</nav>
					</div>
				</header>
				<main className="min-w-0 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-6">{children}</main>
			</div>
		</div>
	);
}
