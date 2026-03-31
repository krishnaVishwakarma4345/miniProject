'use client'

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

export type LoadingSkeletonVariant = 'text' | 'card' | 'stat' | 'table'

export interface LoadingSkeletonProps {
	lines?: number
	className?: string
	variant?: LoadingSkeletonVariant
	showAvatar?: boolean
}

const shimmerClass =
	"relative isolate overflow-hidden rounded-xl bg-[linear-gradient(90deg,#e2e8f0_0%,#f8fafc_45%,#e2e8f0_100%)] bg-[length:1200px_100%] motion-safe:animate-[shimmer_1.6s_linear_infinite] motion-reduce:bg-slate-200 motion-reduce:animate-none"

export function LoadingSkeleton({
	lines = 4,
	className = '',
	variant = 'text',
	showAvatar = false,
}: LoadingSkeletonProps) {
	if (variant === 'card') {
		return (
			<div className={cx('w-full max-w-md rounded-3xl border border-slate-100 p-6 shadow-sm', className)} aria-label='Loading card' role='status'>
				<div className='flex items-center gap-4'>
					{showAvatar ? <span className={cx('h-14 w-14 rounded-2xl', shimmerClass)} aria-hidden /> : null}
					<div className='flex-1 space-y-2'>
						{Array.from({ length: 3 }).map((_, index) => (
							<span
								key={`card-${index}`}
								className={cx('block h-3', shimmerClass)}
								style={{ width: `${90 - index * 18}%`, animationDelay: `${index * 0.08}s` }}
								aria-hidden
							/>
						))}
					</div>
				</div>
				<div className='mt-6 grid grid-cols-3 gap-4'>
					{Array.from({ length: 3 }).map((_, index) => (
						<span key={`card-stat-${index}`} className={cx('h-10 rounded-2xl', shimmerClass)} aria-hidden />
					))}
				</div>
			</div>
		)
	}

	if (variant === 'stat') {
		return (
			<div className={cx('flex gap-4', className)} role='status' aria-label='Loading stats'>
				{Array.from({ length: lines }).map((_, index) => (
					<div key={`stat-${index}`} className='flex-1 space-y-3 rounded-2xl border border-slate-100 p-4'>
						<span className={cx('block h-3 w-1/3', shimmerClass)} aria-hidden />
						<span className={cx('block h-6 w-3/4', shimmerClass)} aria-hidden />
					</div>
				))}
			</div>
		)
	}

	if (variant === 'table') {
		return (
			<div className={cx('space-y-2 rounded-2xl border border-slate-100 p-4', className)} role='status' aria-label='Loading table'>
				<span className={cx('block h-4 w-1/5', shimmerClass)} aria-hidden />
				{Array.from({ length: lines }).map((_, index) => (
					<div key={`row-${index}`} className='flex items-center gap-4'>
						<span className={cx('h-10 w-10 rounded-2xl', shimmerClass)} aria-hidden />
						<span className={cx('h-3 flex-1 rounded-full', shimmerClass)} aria-hidden style={{ width: `${80 - index * 5}%` }} />
						<span className={cx('h-3 w-16 rounded-full', shimmerClass)} aria-hidden />
					</div>
				))}
			</div>
		)
	}

	return (
		<div className={cx('space-y-2', className)} aria-label='Loading content' role='status'>
			{Array.from({ length: lines }).map((_, index) => (
				<span
					key={`text-${index}`}
					className={cx('block h-3 rounded-full', shimmerClass)}
					style={{ width: `${95 - (index % 3) * 18}%`, animationDelay: `${index * 0.08}s` }}
					aria-hidden
				/>
			))}
		</div>
	)
}

export default LoadingSkeleton
