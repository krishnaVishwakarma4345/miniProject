import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import ProfileSection from '@/features/users/components/ProfileSection'
import { STUDENT_ROUTES } from '@/constants/routes'

export default function StudentProfilePage() {
	return (
		<PageContainer>
			<PageHeader
				title='Profile'
				subtitle='Add your basic information, academic details, and a short bio that appears across student-facing screens.'
				actions={
					<Link href={STUDENT_ROUTES.PROFILE_EDIT} className='inline-flex'>
						<Button>Edit basic info</Button>
					</Link>
				}
			/>
			<ProfileSection role='student' mode='overview' viewHref={STUDENT_ROUTES.PROFILE} editHref={STUDENT_ROUTES.PROFILE_EDIT} />
		</PageContainer>
	)
}