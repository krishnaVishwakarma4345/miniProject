import { CTASection } from '@/features/landing/components/CTASection'
import { FeaturesSection } from '@/features/landing/components/FeaturesSection'
import { HeroSection } from '@/features/landing/components/HeroSection'
import { HowItWorks } from '@/features/landing/components/HowItWorks'
import { ScrollProgress } from '@/features/landing/components/ScrollProgress'
import { StatsSection } from '@/features/landing/components/StatsSection'
import { TestimonialsSection } from '@/features/landing/components/TestimonialsSection'
import { Plus_Jakarta_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
})

export default function LandingPage() {
  return (
    <div className={jakarta.className}>
      <ScrollProgress />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <HowItWorks />
      <TestimonialsSection />
      <CTASection />
    </div>
  )
}
