import { StatCard } from '@/components/data-display/StatCard'
import { ScrollReveal } from '@/features/landing/components/ScrollReveal'
import { ActivityStatus } from '@/types'
import { getAdminFirestore } from '@/lib/firebase/admin'

interface LandingStats {
  activeStudents: number
  monthlyReviews: number
  avgTurnaroundHours: number
  generatedReports: number
}

const DEFAULT_STATS: LandingStats = {
  activeStudents: 0,
  monthlyReviews: 0,
  avgTurnaroundHours: 0,
  generatedReports: 0,
}

async function getLandingStats(): Promise<LandingStats> {
  try {
    const adminDb = getAdminFirestore()
    const now = Date.now()
    const last30Days = now - 30 * 24 * 60 * 60 * 1000

    const usersRef = adminDb.collection('users')
    const activitiesRef = adminDb.collection('activities')

    const [activeStudentsAgg, monthlyReviewsAgg, generatedReportsAgg, reviewedActivitiesSnapshot] = await Promise.all([
      usersRef.where('role', '==', 'student').where('status', '==', 'active').count().get(),
      activitiesRef.where('reviewedAt', '>=', last30Days).count().get(),
      activitiesRef.where('status', '==', ActivityStatus.APPROVED).count().get(),
      activitiesRef
        .where('reviewedAt', '>=', last30Days)
        .orderBy('reviewedAt', 'desc')
        .limit(250)
        .get(),
    ])

    const shouldFallbackToActivityCollectionGroup =
      monthlyReviewsAgg.data().count === 0 &&
      generatedReportsAgg.data().count === 0 &&
      reviewedActivitiesSnapshot.empty

    const activitiesSource = shouldFallbackToActivityCollectionGroup
      ? adminDb.collectionGroup('activities')
      : activitiesRef

    const [resolvedMonthlyReviewsAgg, resolvedGeneratedReportsAgg, resolvedReviewedActivitiesSnapshot] =
      shouldFallbackToActivityCollectionGroup
        ? await Promise.all([
            activitiesSource.where('reviewedAt', '>=', last30Days).count().get(),
            activitiesSource.where('status', '==', ActivityStatus.APPROVED).count().get(),
            activitiesSource
              .where('reviewedAt', '>=', last30Days)
              .orderBy('reviewedAt', 'desc')
              .limit(250)
              .get(),
          ])
        : [monthlyReviewsAgg, generatedReportsAgg, reviewedActivitiesSnapshot]

    const reviewedActivities = resolvedReviewedActivitiesSnapshot.docs
      .map((doc) => doc.data() as { submittedAt?: number; createdAt?: number; reviewedAt?: number })
      .filter((activity) => typeof activity.reviewedAt === 'number')

    const validTurnaroundHours = reviewedActivities
      .map((activity) => {
        const reviewedAt = activity.reviewedAt as number
        const submittedAt =
          typeof activity.submittedAt === 'number'
            ? activity.submittedAt
            : typeof activity.createdAt === 'number'
              ? activity.createdAt
              : undefined

        if (!submittedAt || reviewedAt <= submittedAt) {
          return null
        }

        return (reviewedAt - submittedAt) / (1000 * 60 * 60)
      })
      .filter((value): value is number => value !== null)

    const avgTurnaroundHours = validTurnaroundHours.length
      ? Math.round(validTurnaroundHours.reduce((sum, hours) => sum + hours, 0) / validTurnaroundHours.length)
      : 0

    const activeStudents = activeStudentsAgg.data().count
    const monthlyReviews = resolvedMonthlyReviewsAgg.data().count
    const generatedReports = resolvedGeneratedReportsAgg.data().count

    return {
      activeStudents,
      monthlyReviews,
      avgTurnaroundHours,
      generatedReports,
    }
  } catch {
    return DEFAULT_STATS
  }
}

export async function StatsSection() {
  const stats = await getLandingStats()

  return (
    <section className='border-b border-slate-200 bg-white py-20'>
      <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
        <ScrollReveal from='right'>
          <h2 className='mb-8 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl'>
            Performance institutions can trust
          </h2>
        </ScrollReveal>

        <ScrollReveal from='left'>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <StatCard label='Active Students' value={stats.activeStudents} className='border border-amber-100 bg-amber-50' />
            <StatCard label='Monthly Reviews' value={stats.monthlyReviews} className='border border-sky-100 bg-sky-50' />
            <StatCard label='Avg Turnaround' value={stats.avgTurnaroundHours} suffix=' hrs' className='border border-emerald-100 bg-emerald-50' />
            <StatCard label='Generated Reports' value={stats.generatedReports} className='border border-violet-100 bg-violet-50' />
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default StatsSection
