'use client'

import { motion, useScroll, useSpring } from 'framer-motion'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.2,
  })

  return (
    <motion.div
      className='fixed left-0 right-0 top-0 z-50 h-[3px] origin-left bg-[linear-gradient(90deg,#0ea5e9,#22c55e,#f59e0b)]'
      style={{ scaleX }}
    />
  )
}

export default ScrollProgress
