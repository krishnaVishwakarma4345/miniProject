'use client'

import { forwardRef, TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string
	error?: string
	hint?: string
	containerClassName?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
	{ label, error, hint, id, className = '', containerClassName = '', rows = 4, ...props },
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
			<textarea
				id={fieldId}
				ref={ref}
				rows={rows}
				className={`w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus-visible:ring-2 ${error ? 'border-rose-400 focus-visible:ring-rose-400/40' : 'border-slate-300 focus-visible:ring-slate-900/25'} ${className}`}
				{...props}
			/>
			{error ? <p className='mt-1 text-xs text-rose-600'>{error}</p> : null}
			{!error && hint ? <p className='mt-1 text-xs text-slate-500'>{hint}</p> : null}
		</div>
	)
})

export default Textarea
