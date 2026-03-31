"use client"

import { useEffect } from 'react'
import usePortfolio from '@/features/portfolio/hooks/usePortfolio'
import PortfolioPreview from '@/features/portfolio/components/PortfolioPreview'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { ErrorState } from '@/components/data-display/ErrorState'

export default function SharedPortfolioPage({ params }: { params: { studentId: string } }) {
	const { portfolio, isLoading, error, generate } = usePortfolio()

	useEffect(() => {
		void generate(params.studentId)
	}, [params.studentId, generate])

	if (isLoading && !portfolio) {
		return (
			<div className='rounded-3xl border border-slate-200 bg-white p-6'>
				<LoadingSkeleton lines={6} />
			</div>
		)
	}

	if (error && !portfolio) {
		return <ErrorState title='Portfolio unavailable' message={error} />
	}

	if (!portfolio) {
		return null
	}

	return (
		<div className='space-y-6'>
			<div className='rounded-[32px] border border-slate-200 bg-white/90 p-8 text-center shadow-sm'>
				<p className='text-xs uppercase tracking-[0.4em] text-slate-400'>Shared portfolio</p>
				<h1 className='text-2xl font-semibold text-slate-900'>Student achievements</h1>
				<p className='text-sm text-slate-500'>Approved activities curated for mentors and recruiters.</p>
			</div>
			<PortfolioPreview data={portfolio} />
		</div>
	)
}
