"use client"

import { ReactNode, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Spinner } from "@/components/ui/Spinner"
import { useAuth } from "@/hooks/useAuth"
import { useRole } from "@/hooks/useRole"

interface FacultyLayoutProps {
	children: ReactNode
}

const NAV_LINKS = [
	{ label: "Overview", href: "/faculty/dashboard" },
	{ label: "Review queue", href: "/faculty/review" },
	{ label: "Analytics", href: "/faculty/analytics" },
	{ label: "Profile", href: "/faculty/profile" },
]

export default function FacultyLayout({ children }: FacultyLayoutProps) {
	const router = useRouter()
	const pathname = usePathname()
	const { user, isLoading, logout } = useAuth()
	const { isFaculty } = useRole()
	const [isSigningOut, setIsSigningOut] = useState(false)

	useEffect(() => {
		if (!isLoading && !user) {
			router.replace("/login?next=/faculty/dashboard")
		}
	}, [isLoading, user, router])

	useEffect(() => {
		if (!user || isFaculty) return
		router.replace("/")
	}, [user, isFaculty, router])

	const initials = useMemo(() => {
		if (!user?.displayName) return "?"
		const parts = user.displayName.split(" ").filter(Boolean)
		if (!parts.length) return user.displayName.slice(0, 2).toUpperCase()
		return parts
			.slice(0, 2)
			.map((chunk) => chunk.charAt(0).toUpperCase())
			.join("")
	}, [user?.displayName])

	const handleLogout = async () => {
		setIsSigningOut(true)
		try {
			await logout()
		} finally {
			setIsSigningOut(false)
		}
	}

	if (isLoading || (!user && !isLoading)) {
		return (
			<div className="grid min-h-screen place-items-center bg-slate-50">
				<Spinner size="lg" label="Preparing faculty workspace" />
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
			<header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
				<div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="text-xs uppercase tracking-[0.2em] text-slate-400">Faculty workspace</p>
							<h1 className="text-2xl font-semibold text-slate-900">Smart Student Hub</h1>
							<p className="text-sm text-slate-500">Coordinate reviews, manage assignments, and keep student submissions moving.</p>
						</div>
						<div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
							<div className="h-10 w-10 rounded-2xl bg-slate-900 text-center text-sm font-semibold uppercase leading-10 text-white">{initials}</div>
							<div className="min-w-40">
								<p className="text-sm font-semibold text-slate-900">{user?.displayName ?? "Faculty"}</p>
								<p className="text-xs text-slate-500">{user?.email}</p>
							</div>
							<Button variant="outline" size="sm" onClick={() => router.push("/faculty/profile")}>Profile</Button>
							<Button variant="outline" size="sm" loading={isSigningOut} onClick={handleLogout}>
								Logout
							</Button>
						</div>
					</div>
					<nav className="flex flex-wrap gap-2">
						{NAV_LINKS.map((item) => {
							const isActive = pathname?.startsWith(item.href)
							return (
								<Link key={item.href} href={item.href} className="relative rounded-full">
									{isActive ? (
										<motion.span layoutId="faculty-nav-pill" className="absolute inset-0 rounded-full bg-slate-900/90" transition={{ type: "spring", stiffness: 320, damping: 28 }} />
									) : null}
									<span className={`relative z-10 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? "text-white" : "text-slate-600 hover:text-slate-900"}`}>
										{item.label}
									</span>
								</Link>
							)
						})}
					</nav>
				</div>
			</header>
			<div className="pb-10 pt-6">
				{children}
			</div>
		</div>
	)
}
