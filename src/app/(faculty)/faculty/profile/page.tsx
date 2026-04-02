import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import ProfileSection from '@/features/users/components/ProfileSection'
import { FACULTY_ROUTES } from '@/constants/routes'

export default function FacultyProfilePage() {
	return (
		<PageContainer>
			<PageHeader
				title='Profile'
				subtitle='Keep your faculty profile current so your department, designation, and availability stay accurate.'
				actions={
					<Link href={FACULTY_ROUTES.PROFILE_EDIT} className='inline-flex'>
						<Button>Edit basic info</Button>
					</Link>
				}
			/>
			<ProfileSection role='faculty' mode='overview' viewHref={FACULTY_ROUTES.PROFILE} editHref={FACULTY_ROUTES.PROFILE_EDIT} />
		</PageContainer>
	)
}