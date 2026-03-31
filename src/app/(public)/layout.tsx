"use client"

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface PublicLayoutProps {
  children: ReactNode
}

/**
 * Public Layout
 * Layout for authentication pages (login, register)
 * Provides centered card layout with branding
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  const pathname = usePathname()
  const isAuthRoute = pathname === '/login' || pathname === '/register'

  if (isAuthRoute) {
    return (
      <div className='min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4'>
        <div className='text-center mb-12'>
          <div className='text-4xl font-bold text-gray-900 mb-2'>
            Smart Student Hub
          </div>
          <p className='text-gray-600'>
            Manage your academic achievements and build your portfolio
          </p>
        </div>

        <div className='w-full max-w-md'>
          {children}
        </div>

        <div className='mt-12 text-center text-sm text-gray-500'>
          <p>
            Smart Student Hub - Empowering Higher Education
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-950 text-white'>
      <header className='sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur'>
        <div className='mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
          <Link href='/' className='text-lg font-semibold tracking-tight'>
            Smart Student Hub
          </Link>
          <nav className='flex items-center gap-2'>
            <Link href='/login' className='rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/10'>
              Login
            </Link>
            <Link href='/register' className='rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100'>
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <div>
        {children}
      </div>

      <footer className='border-t border-white/10 py-8'>
        <div className='mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-400 sm:flex-row sm:px-6 lg:px-8'>
          <p>Smart Student Hub - Production SaaS for HEIs</p>
          <div className='flex items-center gap-4'>
            <Link href='/login' className='hover:text-white'>Login</Link>
            <Link href='/register' className='hover:text-white'>Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
