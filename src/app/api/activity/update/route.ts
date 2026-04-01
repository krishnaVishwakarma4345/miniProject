import { NextRequest, NextResponse } from 'next/server'
import { Activity, ActivityStatus, ApiResponse } from '@/types'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'
import { mirrorActivityDocument } from '@/lib/firebase/firestore/activity-tenant.utils'

export async function PATCH(request: NextRequest) {
	try {
		const session = parseSessionCookie(request.headers)
		if (!session) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Unauthorized', timestamp: Date.now(), statusCode: 401 }, { status: 401 })
		}

		await verifySessionCookie(session, true)
		const body = (await request.json()) as {
			activityId: string
			updates?: Partial<Activity>
			status?: ActivityStatus
			remarks?: string
		}

		if (!body.activityId) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'activityId is required', timestamp: Date.now(), statusCode: 400 }, { status: 400 })
		}

		const adminDb = getAdminFirestore()
		const globalDoc = await adminDb.collection('activities').doc(body.activityId).get()
		if (!globalDoc.exists) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Activity not found', timestamp: Date.now(), statusCode: 404 }, { status: 404 })
		}

		const current = globalDoc.data() as Activity
		const institutionId = current.institutionId
		if (!institutionId) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Institution not found for activity', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		const updates: Record<string, unknown> = { updatedAt: Date.now() }
		if (body.status) {
			updates.status = body.status
			if (body.remarks) {
				updates.review = {
					...(current.review || {}),
					remarks: body.remarks,
				}
			}
			if (body.status === ActivityStatus.APPROVED || body.status === ActivityStatus.REJECTED) {
				updates.reviewedAt = Date.now()
			}
		} else if (body.updates) {
			Object.assign(updates, body.updates)
		}

		await adminDb.collection('activities').doc(body.activityId).set(updates, { merge: true })
		await mirrorActivityDocument(adminDb, institutionId, body.activityId, { ...current, ...updates, id: body.activityId })

		const updated = (await adminDb.collection('activities').doc(body.activityId).get()).exists
			? ({ id: body.activityId, ...(await adminDb.collection('activities').doc(body.activityId).get()).data() } as Activity)
			: null

		return NextResponse.json<ApiResponse<Activity | null>>({
			success: true,
			data: updated,
			message: 'Activity updated',
			timestamp: Date.now(),
			statusCode: 200,
		})
	} catch (error) {
		return NextResponse.json<ApiResponse<null>>({
			success: false,
			data: null,
			message: error instanceof Error ? error.message : 'Failed to update activity',
			timestamp: Date.now(),
			statusCode: 500,
		}, { status: 500 })
	}
}
