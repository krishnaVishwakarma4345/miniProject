import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import ProfileSection from '@/features/users/components/ProfileSection'
import { FACULTY_ROUTES } from '@/constants/routes'
import { ScrollReveal } from '@/features/landing/components/ScrollReveal'

export default function FacultyProfilePage() {
	return (
		<PageContainer>
			<ScrollReveal from='left'>
				<PageHeader
					title='Profile'
					subtitle='Keep your faculty profile current so your department, designation, and availability stay accurate.'
					actions={
						<Link href={FACULTY_ROUTES.PROFILE_EDIT} className='inline-flex'>
							<Button className='w-full sm:w-auto'>Edit basic info</Button>
						</Link>
					}
				/>
			</ScrollReveal>
			<ScrollReveal from='right'>
				<ProfileSection role='faculty' mode='overview' viewHref={FACULTY_ROUTES.PROFILE} editHref={FACULTY_ROUTES.PROFILE_EDIT} />
			</ScrollReveal>
		</PageContainer>
	)
}