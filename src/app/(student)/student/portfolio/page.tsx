"use client"

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import usePortfolio from '@/features/portfolio/hooks/usePortfolio'
import PortfolioPreview from '@/features/portfolio/components/PortfolioPreview'
import ShareLinkModal from '@/features/portfolio/components/ShareLinkModal'
import { Button } from '@/components/ui/Button'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'

export default function StudentPortfolioPage() {
	const { user } = useAuth()
	const { portfolio, isLoading, error, generate } = usePortfolio()
	const [shareOpen, setShareOpen] = useState(false)

	const handleGenerate = async () => {
		if (!user?.id) return
		await generate(user.id)
	}

	return (
		<div className='space-y-6'>
			<section className='rounded-4xl border border-slate-200 bg-white/90 p-8 shadow-sm'>
				<h1 className='text-2xl font-semibold text-slate-900'>Portfolio</h1>
				<p className='text-sm text-slate-500'>Generate a curated page of approved activities — perfect for placements and internships.</p>
				<div className='mt-4 flex flex-wrap gap-3'>
					<Button onClick={handleGenerate} loading={isLoading || !user}>
						Generate portfolio
					</Button>
					<Button variant='outline' disabled={!portfolio} onClick={() => setShareOpen(true)}>
						Share link
					</Button>
				</div>
				{error ? <p className='mt-3 text-sm text-rose-600'>{error}</p> : null}
			</section>

			{isLoading && !portfolio ? (
				<div className='rounded-3xl border border-slate-200 bg-white p-6'>
					<LoadingSkeleton lines={6} />
				</div>
			) : null}

			{portfolio ? (
				<PortfolioPreview data={portfolio} studentName={user?.displayName || user?.fullName} onShare={() => setShareOpen(true)} />
			) : null}

			<ShareLinkModal open={shareOpen} onClose={() => setShareOpen(false)} sharePath={portfolio?.shareUrl || '/student/portfolio'} />
		</div>
	)
}
