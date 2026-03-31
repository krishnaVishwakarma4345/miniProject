import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/types'
import { generateUploadSignature } from '@/lib/cloudinary/upload.service'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'

export async function POST(request: NextRequest) {
	try {
		const session = parseSessionCookie(request.headers)
		if (!session) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Unauthorized', timestamp: Date.now(), statusCode: 401 }, { status: 401 })
		}

		await verifySessionCookie(session, true)
		const body = (await request.json()) as { folder?: string; resourceType?: string }

		const signature = await generateUploadSignature({
			folder: body.folder || 'student_activities/proof',
			resourceType: body.resourceType || 'auto',
		})

		return NextResponse.json<ApiResponse<typeof signature>>({
			success: true,
			data: signature,
			message: 'Upload signature generated',
			timestamp: Date.now(),
			statusCode: 200,
		})
	} catch (error) {
		return NextResponse.json<ApiResponse<null>>({
			success: false,
			data: null,
			message: error instanceof Error ? error.message : 'Failed to generate signature',
			timestamp: Date.now(),
			statusCode: 500,
		}, { status: 500 })
	}
}
