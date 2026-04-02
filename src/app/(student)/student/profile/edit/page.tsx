import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import ProfileSection from '@/features/users/components/ProfileSection'
import { STUDENT_ROUTES } from '@/constants/routes'

export default function StudentProfileEditPage() {
	return (
		<PageContainer>
			<PageHeader
				title='Edit profile'
				subtitle='Update the information that identifies you and helps faculty understand your background.'
				actions={
					<Link href={STUDENT_ROUTES.PROFILE} className='inline-flex'>
						<Button variant='outline'>Back to profile</Button>
					</Link>
				}
			/>
			<ProfileSection role='student' mode='edit' viewHref={STUDENT_ROUTES.PROFILE} editHref={STUDENT_ROUTES.PROFILE_EDIT} />
		</PageContainer>
	)
}