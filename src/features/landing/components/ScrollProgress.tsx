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
      className='fixed left-0 right-0 top-0 z-50 h-[2px] origin-left bg-cyan-300'
      style={{ scaleX }}
    />
  )
}

export default ScrollProgress
