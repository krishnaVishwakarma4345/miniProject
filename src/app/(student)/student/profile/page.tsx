import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import ProfileSection from '@/features/users/components/ProfileSection'
import { STUDENT_ROUTES } from '@/constants/routes'
import { ScrollReveal } from '@/features/landing/components/ScrollReveal'

export default function StudentProfilePage() {
	return (
		<PageContainer>
			<ScrollReveal from='left'>
				<PageHeader
					title='Profile'
					subtitle='Add your basic information, academic details, and a short bio that appears across student-facing screens.'
					actions={
						<Link href={STUDENT_ROUTES.PROFILE_EDIT} className='inline-flex'>
							<Button className='w-full sm:w-auto'>Edit basic info</Button>
						</Link>
					}
				/>
			</ScrollReveal>
			<ScrollReveal from='right'>
				<ProfileSection role='student' mode='overview' viewHref={STUDENT_ROUTES.PROFILE} editHref={STUDENT_ROUTES.PROFILE_EDIT} />
			</ScrollReveal>
		</PageContainer>
	)
}