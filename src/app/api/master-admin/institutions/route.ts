import { NextRequest, NextResponse } from 'next/server'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { ApiResponse } from '@/types'
import { UserRole } from '@/types/user.types'

type InstitutionBody = {
  name?: string
  code?: string
}

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const isMasterAdmin = async (uid: string): Promise<boolean> => {
  const adminDb = getAdminFirestore()
  const profile = await adminDb.collection('users').doc(uid).get()
  return profile.exists && profile.data()?.role === UserRole.MASTER_ADMIN
}

export async function POST(request: NextRequest) {
  try {
    const session = parseSessionCookie(request.headers)
    if (!session) {
      return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Unauthorized', timestamp: Date.now(), statusCode: 401 }, { status: 401 })
    }

    const decoded = await verifySessionCookie(session, true)
    const allowed = await isMasterAdmin(decoded.uid)
    if (!allowed) {
      return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Forbidden', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
    }

    const body = (await request.json()) as InstitutionBody
    const name = body.name?.trim()
    if (!name) {
      return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Institution name is required', timestamp: Date.now(), statusCode: 400 }, { status: 400 })
    }

    const institutionId = slugify(body.code?.trim() || name)
    if (!institutionId) {
      return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Invalid institution code', timestamp: Date.now(), statusCode: 400 }, { status: 400 })
    }

    const adminDb = getAdminFirestore()
    await adminDb.collection('institutions').doc(institutionId).set(
      {
        id: institutionId,
        name,
        isActive: true,
        createdBy: decoded.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    )

    return NextResponse.json<ApiResponse<{ id: string }>>({
      success: true,
      data: { id: institutionId },
      message: 'Institution saved',
      timestamp: Date.now(),
      statusCode: 200,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Failed to save institution',
      timestamp: Date.now(),
      statusCode: 500,
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = parseSessionCookie(request.headers)
    if (!session) {
      return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Unauthorized', timestamp: Date.now(), statusCode: 401 }, { status: 401 })
    }

    const decoded = await verifySessionCookie(session, true)
    const allowed = await isMasterAdmin(decoded.uid)
    if (!allowed) {
      return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Forbidden', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institutionId')
    if (!institutionId) {
      return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'institutionId is required', timestamp: Date.now(), statusCode: 400 }, { status: 400 })
    }

    const adminDb = getAdminFirestore()
    await adminDb.collection('institutions').doc(institutionId).set(
      {
        isActive: false,
        updatedAt: new Date(),
      },
      { merge: true }
    )

    return NextResponse.json<ApiResponse<{ id: string }>>({
      success: true,
      data: { id: institutionId },
      message: 'Institution disabled',
      timestamp: Date.now(),
      statusCode: 200,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Failed to disable institution',
      timestamp: Date.now(),
      statusCode: 500,
    }, { status: 500 })
  }
}
