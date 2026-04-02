import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import ProfileSection from '@/features/users/components/ProfileSection'
import { FACULTY_ROUTES } from '@/constants/routes'

export default function FacultyProfileEditPage() {
	return (
		<PageContainer>
			<PageHeader
				title='Edit profile'
				subtitle='Update your teaching details, office information, and expertise areas.'
				actions={
					<Link href={FACULTY_ROUTES.PROFILE} className='inline-flex'>
						<Button variant='outline'>Back to profile</Button>
					</Link>
				}
			/>
			<ProfileSection role='faculty' mode='edit' viewHref={FACULTY_ROUTES.PROFILE} editHref={FACULTY_ROUTES.PROFILE_EDIT} />
		</PageContainer>
	)
}