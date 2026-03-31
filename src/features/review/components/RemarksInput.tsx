import { Textarea } from '@/components/ui/Textarea'
import { motion } from 'framer-motion'

interface RemarksInputProps {
	label?: string
	value: string
	placeholder?: string
	maxLength?: number
	onChange: (value: string) => void
}

export function RemarksInput({ label = 'Remarks', value, placeholder, maxLength = 500, onChange }: RemarksInputProps) {
	const remaining = maxLength - value.length
	const safeValue = remaining >= 0 ? remaining : 0

	return (
		<div className='space-y-2'>
			<Textarea
				label={label}
				value={value}
				onChange={(event) => {
					if (event.target.value.length <= maxLength) {
						onChange(event.target.value)
					}
				}}
				placeholder={placeholder || 'Share context for your decision'}
				rows={4}
			/>
			<motion.span
				initial={{ opacity: 0, y: 4 }}
				animate={{ opacity: 1, y: 0 }}
				className={`text-xs ${safeValue < 50 ? 'text-rose-500' : 'text-slate-500'}`}
			>
				{safeValue} characters left
			</motion.span>
		</div>
	)
}

export default RemarksInput
