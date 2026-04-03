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
	{ href: '/student/profile', label: 'Profile' },
]

export default function StudentLayout({ children }: { children: ReactNode }) {
	const pathname = usePathname()
	const router = useRouter()
	const { user, logout, isLoading } = useAuth()
	const { role, isStudent } = useRole()

	useEffect(() => {
		if (isLoading) {
			return
		}

		if (!user) {
			router.replace('/login')
			return
		}

		if (!isStudent || role !== 'student') {
			router.replace('/login')
		}
	}, [isLoading, isStudent, role, router, user])

	return (
		<div className='flex min-h-screen overflow-x-hidden bg-slate-50'>
			<aside className='hidden w-72 flex-col border-r border-slate-200 bg-white/80 p-6 xl:flex'>
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
					<div className='flex flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8'>
						<div className='flex min-w-0 items-start justify-between gap-3'>
							<p className='text-xs uppercase tracking-[0.4em] text-slate-400'>Smart Student Hub</p>
							<h2 className='text-lg font-semibold text-slate-900'>{NAV_LINKS.find((link) => pathname?.startsWith(link.href))?.label || 'Student'}</h2>
						</div>
						<div className='flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end'>
							<Button
								variant='outline'
								size='sm'
								className='w-full sm:w-auto'
								onClick={() => router.push(pathname?.startsWith('/student/profile') ? '/student/profile/edit' : '/student/activities/add')}
							>
								{pathname?.startsWith('/student/profile') ? 'Edit profile' : '+ Add activity'}
							</Button>
						</div>
					</div>
					<div className='border-t border-slate-100 px-4 py-3 sm:px-6 lg:hidden'>
						<nav className='flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
							{NAV_LINKS.map((link) => {
								const active = pathname?.startsWith(link.href)
								return (
									<Link key={link.href} href={link.href} className='shrink-0'>
										<span className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold ${active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600'}`}>
											{link.label}
										</span>
									</Link>
								)
							})}
						</nav>
						<div className='mt-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3'>
							<div className='min-w-0'>
								<p className='truncate text-sm font-semibold text-slate-900'>{user?.displayName || 'Student'}</p>
								<p className='truncate text-xs text-slate-500'>{user?.email}</p>
							</div>
							<Button variant='outline' size='sm' onClick={() => { void logout() }}>
								Logout
							</Button>
						</div>
					</div>
				</header>
				<div className='min-w-0 px-4 py-6 sm:px-6 lg:px-8'>{children}</div>
			</main>
		</div>
	)
}
