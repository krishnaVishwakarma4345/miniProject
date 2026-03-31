import { Activity, ApiResponse } from '@/types'

const ensureSuccess = async <T>(response: Response): Promise<T> => {
	const payload = (await response.json()) as ApiResponse<T>
	if (!response.ok || !payload.success) {
		throw new Error(payload.message || 'Request failed')
	}
	return payload.data as T
}

export interface PortfolioData {
	studentId: string
	generatedAt: number
	approvedActivities: Activity[]
	totalApproved: number
	shareUrl: string
}

export const portfolioService = {
	async generate(studentId: string): Promise<PortfolioData> {
		const response = await fetch('/api/portfolio/generate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ studentId }),
		})

		return ensureSuccess<PortfolioData>(response)
	},
}

export default portfolioService
