'use client'

import { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type RevealFrom = 'left' | 'right' | 'bottom'

export interface ScrollRevealProps {
  children: ReactNode
  from?: RevealFrom
  delay?: number
  className?: string
  amount?: number
}

export function ScrollReveal({
  children,
  from = 'left',
  delay = 0,
  className,
  amount = 0.25,
}: ScrollRevealProps) {
  const reduceMotion = useReducedMotion()

  const hiddenX = from === 'left' ? -72 : from === 'right' ? 72 : 0
  const hiddenY = from === 'bottom' ? 40 : 0

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: reduceMotion ? 0 : hiddenX,
        y: reduceMotion ? 0 : hiddenY,
      }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: false, amount }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default ScrollReveal