"use client"

import { ReactNode, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { Button } from '@/components/ui/Button'

const NAV_LINKS = [
	{ href: '/student/dashboard', label: 'Dashboard' },
	{ href: '/student/activities', label: 'Activities' },
	{ href: '/student/portfolio', label: 'Portfolio' },
]

export default function StudentLayout({ children }: { children: ReactNode }) {
	const pathname = usePathname()
	const router = useRouter()
	const { user, logout } = useAuth()
	const { isStudent } = useRole()

	useEffect(() => {
		if (!isStudent) {
			router.replace('/login')
		}
	}, [isStudent, router])

	return (
		<div className='flex min-h-screen bg-slate-50'>
			<aside className='hidden w-64 flex-col border-r border-slate-200 bg-white/80 p-6 lg:flex'>
				<p className='text-xs uppercase tracking-[0.4em] text-slate-400'>Student</p>
				<h1 className='mt-2 text-xl font-semibold text-slate-900'>Smart Hub</h1>
				<nav className='mt-8 space-y-1'>
					{NAV_LINKS.map((link) => {
						const active = pathname?.startsWith(link.href)
						return (
							<Link key={link.href} href={link.href} className='block'>
								<motion.span
									className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
									layout
								>
									{link.label}
									{active ? <span>●</span> : null}
								</motion.span>
							</Link>
						)
					})}
				</nav>
				<div className='mt-auto space-y-3 text-sm text-slate-600'>
					<p className='font-semibold text-slate-900'>{user?.displayName || 'Student'}</p>
					<p className='text-xs text-slate-500'>{user?.email}</p>
					<Button
						variant='outline'
						size='sm'
						onClick={() => {
							void logout()
						}}
					>
						Logout
					</Button>
				</div>
			</aside>
			<main className='flex-1'>
				<header className='sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur'>
					<div className='flex items-center justify-between px-6 py-4'>
						<div>
							<p className='text-xs uppercase tracking-[0.4em] text-slate-400'>Smart Student Hub</p>
							<h2 className='text-lg font-semibold text-slate-900'>{NAV_LINKS.find((link) => pathname?.startsWith(link.href))?.label || 'Student'}</h2>
						</div>
						<Button variant='outline' size='sm' className='lg:hidden' onClick={() => router.push('/student/activities/add')}>
							+ Add activity
						</Button>
					</div>
				</header>
				<div className='px-4 py-6 sm:px-6 lg:px-8'>{children}</div>
			</main>
		</div>
	)
}
