'use client'

import Image from 'next/image'

export interface AvatarProps {
	src?: string | null
	alt: string
	size?: 'sm' | 'md' | 'lg'
	className?: string
	fallback?: string
}

const sizeClass = {
	sm: 'h-8 w-8 text-xs',
	md: 'h-10 w-10 text-sm',
	lg: 'h-14 w-14 text-base',
}

const fallbackText = (alt: string) =>
	alt
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join('')

export function Avatar({ src, alt, size = 'md', className = '', fallback }: AvatarProps) {
	return (
		<span className={`relative inline-flex overflow-hidden rounded-full bg-slate-200 text-slate-700 ${sizeClass[size]} ${className}`}>
			{src ? (
				<Image src={src} alt={alt} fill sizes='64px' className='object-cover' />
			) : (
				<span className='grid h-full w-full place-items-center font-semibold'>{fallback || fallbackText(alt)}</span>
			)}
		</span>
	)
}

export default Avatar
