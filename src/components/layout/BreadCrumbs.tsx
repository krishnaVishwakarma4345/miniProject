'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface Crumb {
	label: string
	href: string
}

export interface BreadCrumbsProps {
	items?: Crumb[]
}

const humanize = (segment: string) => segment.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

export function BreadCrumbs({ items }: BreadCrumbsProps) {
	const pathname = usePathname()

	const autoItems = pathname
		.split('/')
		.filter(Boolean)
		.map((segment, index, arr) => ({
			label: humanize(segment),
			href: `/${arr.slice(0, index + 1).join('/')}`,
		}))

	const crumbs = items && items.length ? items : [{ label: 'Home', href: '/' }, ...autoItems]

	return (
		<nav aria-label='Breadcrumb' className='mb-4'>
			<ol className='flex flex-wrap items-center gap-2 text-sm text-slate-500'>
				{crumbs.map((crumb, index) => {
					const isLast = index === crumbs.length - 1
					return (
						<li key={`${crumb.href}-${index}`} className='inline-flex items-center gap-2'>
							{isLast ? (
								<span className='font-medium text-slate-700'>{crumb.label}</span>
							) : (
								<Link className='hover:text-slate-800' href={crumb.href}>
									{crumb.label}
								</Link>
							)}
							{!isLast ? <span>/</span> : null}
						</li>
					)
				})}
			</ol>
		</nav>
	)
}

export default BreadCrumbs
