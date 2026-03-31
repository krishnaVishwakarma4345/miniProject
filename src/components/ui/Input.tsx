'use client'

import { forwardRef, InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string
	error?: string
	hint?: string
	containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
	{ label, error, hint, id, className = '', containerClassName = '', ...props },
	ref
) {
	const fieldId = id || props.name

	return (
		<div className={`w-full ${containerClassName}`}>
			{label ? (
				<label htmlFor={fieldId} className='mb-1.5 block text-sm font-medium text-slate-700'>
					{label}
				</label>
			) : null}
			<input
				id={fieldId}
				ref={ref}
				className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus-visible:ring-2 ${error ? 'border-rose-400 focus-visible:ring-rose-400/40' : 'border-slate-300 focus-visible:ring-slate-900/25'} ${className}`}
				{...props}
			/>
			{error ? <p className='mt-1 text-xs text-rose-600'>{error}</p> : null}
			{!error && hint ? <p className='mt-1 text-xs text-slate-500'>{hint}</p> : null}
		</div>
	)
})

export default Input
