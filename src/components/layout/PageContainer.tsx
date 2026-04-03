import { ReactNode } from 'react'

export interface PageContainerProps {
	children: ReactNode
	className?: string
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
	return <main className={`mx-auto w-full max-w-7xl min-w-0 overflow-x-clip px-4 py-6 sm:px-6 lg:px-8 ${className}`}>{children}</main>
}

export default PageContainer
