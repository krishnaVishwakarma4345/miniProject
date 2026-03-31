'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export interface DataTableColumn<T> {
	key: keyof T | string
	header: string
	sortable?: boolean
	render?: (row: T) => React.ReactNode
}

export interface DataTableProps<T extends { id?: string | number }> {
	data: T[]
	columns: DataTableColumn<T>[]
	rowKey?: (row: T, index: number) => string
	emptyMessage?: string
}

type SortDirection = 'asc' | 'desc'

export function DataTable<T extends { id?: string | number }>({
	data,
	columns,
	rowKey,
	emptyMessage = 'No records found',
}: DataTableProps<T>) {
	const [sortKey, setSortKey] = useState<string>('')
	const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

	const sortedData = useMemo(() => {
		if (!sortKey) return data
		const cloned = [...data]
		cloned.sort((a, b) => {
			const aValue = (a as Record<string, unknown>)[sortKey]
			const bValue = (b as Record<string, unknown>)[sortKey]
			if (aValue === bValue) return 0
			if (aValue === undefined || aValue === null) return 1
			if (bValue === undefined || bValue === null) return -1
			if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
			return sortDirection === 'asc' ? 1 : -1
		})
		return cloned
	}, [data, sortKey, sortDirection])

	const onSort = (key: string, sortable?: boolean) => {
		if (!sortable) return
		if (sortKey === key) {
			setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
			return
		}
		setSortKey(key)
		setSortDirection('asc')
	}

	return (
		<div className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
			<div className='overflow-x-auto'>
				<table className='min-w-full text-left text-sm'>
					<thead className='bg-slate-50'>
						<tr>
							{columns.map((column) => {
								const key = String(column.key)
								const active = sortKey === key
								return (
									<th key={key} className='px-4 py-3 font-semibold text-slate-700'>
										<button
											type='button'
											className={`inline-flex items-center gap-1 ${column.sortable ? 'hover:text-slate-900' : 'cursor-default'}`}
											onClick={() => onSort(key, column.sortable)}
										>
											{column.header}
											{column.sortable ? <span className='text-xs'>{active ? (sortDirection === 'asc' ? '^' : 'v') : '-'}</span> : null}
										</button>
									</th>
								)
							})}
						</tr>
					</thead>

					<tbody>
						<AnimatePresence initial={false}>
							{sortedData.length ? (
								sortedData.map((row, index) => {
									const key = rowKey ? rowKey(row, index) : String(row.id ?? index)
									return (
										<motion.tr
											key={key}
											initial={{ opacity: 0, y: 8 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -8 }}
											transition={{ duration: 0.16, delay: Math.min(index * 0.02, 0.14) }}
											className='border-t border-slate-100 hover:bg-slate-50/90'
										>
											{columns.map((column) => {
												const cellKey = String(column.key)
												const value = (row as Record<string, unknown>)[cellKey]
												return (
													<td key={cellKey} className='px-4 py-3 text-slate-700'>
														{column.render ? column.render(row) : (value as React.ReactNode)}
													</td>
												)
											})}
										</motion.tr>
									)
								})
							) : (
								<tr>
									<td className='px-4 py-10 text-center text-slate-500' colSpan={columns.length}>
										{emptyMessage}
									</td>
								</tr>
							)}
						</AnimatePresence>
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default DataTable
