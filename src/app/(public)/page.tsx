import { CTASection } from '@/features/landing/components/CTASection'
import { FeaturesSection } from '@/features/landing/components/FeaturesSection'
import { HeroSection } from '@/features/landing/components/HeroSection'
import { HowItWorks } from '@/features/landing/components/HowItWorks'
import { ScrollProgress } from '@/features/landing/components/ScrollProgress'
import { StatsSection } from '@/features/landing/components/StatsSection'
import { TestimonialsSection } from '@/features/landing/components/TestimonialsSection'

export default function LandingPage() {
  return (
    <>
      <ScrollProgress />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <HowItWorks />
      <TestimonialsSection />
      <CTASection />
    </>
  )
}
