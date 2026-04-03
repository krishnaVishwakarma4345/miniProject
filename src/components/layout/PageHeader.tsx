import { ReactNode } from 'react'

export interface PageHeaderProps {
	title: string
	subtitle?: string
	actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
	return (
		<header className='mb-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
			<div className='min-w-0'>
				<h1 className='text-2xl font-bold tracking-tight text-slate-900'>{title}</h1>
				{subtitle ? <p className='mt-1 text-sm text-slate-600'>{subtitle}</p> : null}
			</div>
			{actions ? <div className='flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end'>{actions}</div> : null}
		</header>
	)
}

export default PageHeader
