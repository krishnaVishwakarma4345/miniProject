'use client'

import { motion } from 'framer-motion'

export interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
}

export function AnimatedText({ text, className = '', delay = 0 }: AnimatedTextProps) {
  const words = text.split(' ')

  return (
    <h1 className={className}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className='mr-3 inline-block overflow-hidden'>
          <motion.span
            className='inline-block'
            initial={{ y: 56, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: delay + index * 0.08 }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </h1>
  )
}

export default AnimatedText
