import type { ReactNode } from "react";
import Link from "next/link";

const NAV_LINKS = [
	{ href: "/admin/dashboard", label: "Dashboard" },
	{ href: "/admin/analytics", label: "Analytics" },
	{ href: "/admin/reports", label: "Reports" },
	{ href: "/admin/users", label: "Users" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-slate-50">
			<div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
				<header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/80 px-6 py-5 shadow-sm">
					<div>
						<p className="text-xs uppercase tracking-[0.4em] text-slate-400">Admin</p>
						<h1 className="text-2xl font-semibold text-slate-900">Control center</h1>
					</div>
					<nav className="flex flex-wrap gap-3 text-sm font-semibold text-slate-500">
						{NAV_LINKS.map((link) => (
							<Link key={link.href} href={link.href} className="rounded-full px-4 py-2 hover:bg-slate-100">
								{link.label}
							</Link>
						))}
					</nav>
				</header>
				<main className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">{children}</main>
			</div>
		</div>
	);
}
