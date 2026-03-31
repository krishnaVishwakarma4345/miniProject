'use client'

import { ReactNode, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export interface FloatingCardProps {
  title: string
  subtitle: string
  children?: ReactNode
}

export function FloatingCard({ title, subtitle, children }: FloatingCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), {
    stiffness: 240,
    damping: 26,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 240,
    damping: 26,
  })

  const onMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const element = ref.current
    if (!element) return

    const rect = element.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const onLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className='relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur'
    >
      <p className='text-xs uppercase tracking-[0.18em] text-cyan-200'>{subtitle}</p>
      <h3 className='mt-2 text-xl font-semibold'>{title}</h3>
      {children ? <div className='mt-3 text-sm text-slate-200'>{children}</div> : null}
      <div className='pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-300/20 blur-2xl' />
    </motion.div>
  )
}

export default FloatingCard
