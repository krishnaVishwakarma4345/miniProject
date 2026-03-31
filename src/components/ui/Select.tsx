'use client'

import { forwardRef, SelectHTMLAttributes } from 'react'

export interface SelectOption {
	label: string
	value: string
	disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
	label?: string
	error?: string
	hint?: string
	options: SelectOption[]
	placeholder?: string
	containerClassName?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
	{
		label,
		error,
		hint,
		id,
		className = '',
		options,
		placeholder,
		containerClassName = '',
		...props
	},
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
			<div className='relative'>
				<select
					id={fieldId}
					ref={ref}
					className={`h-11 w-full appearance-none rounded-xl border bg-white px-3 pr-9 text-sm text-slate-900 shadow-sm outline-none transition focus-visible:ring-2 ${error ? 'border-rose-400 focus-visible:ring-rose-400/40' : 'border-slate-300 focus-visible:ring-slate-900/25'} ${className}`}
					{...props}
				>
					{placeholder ? <option value=''>{placeholder}</option> : null}
					{options.map((option) => (
						<option key={option.value} value={option.value} disabled={option.disabled}>
							{option.label}
						</option>
					))}
				</select>
				<span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500'>
					v
				</span>
			</div>
			{error ? <p className='mt-1 text-xs text-rose-600'>{error}</p> : null}
			{!error && hint ? <p className='mt-1 text-xs text-slate-500'>{hint}</p> : null}
		</div>
	)
})

export default Select
