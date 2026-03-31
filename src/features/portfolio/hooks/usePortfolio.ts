'use client'

import { useCallback, useState } from 'react'
import portfolioService, { PortfolioData } from '@/features/portfolio/services/portfolio.service'

export function usePortfolio() {
	const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const generate = useCallback(async (studentId: string) => {
		setIsLoading(true)
		setError(null)
		try {
			const result = await portfolioService.generate(studentId)
			setPortfolio(result)
			return result
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to generate portfolio')
			throw err
		} finally {
			setIsLoading(false)
		}
	}, [])

	return {
		portfolio,
		isLoading,
		error,
		generate,
	}
}

export default usePortfolio
