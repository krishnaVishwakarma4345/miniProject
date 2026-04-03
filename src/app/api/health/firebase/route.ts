import { NextResponse } from 'next/server'
import { FIREBASE_ADMIN_CONFIG } from '@/config/firebase.admin.config'

export async function GET() {
  const clientProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || ''
  const adminProjectId = FIREBASE_ADMIN_CONFIG.projectId?.trim() || ''

  const projectMismatch = Boolean(
    clientProjectId && adminProjectId && clientProjectId !== adminProjectId
  )

  return NextResponse.json(
    {
      success: true,
      data: {
        clientProjectId: clientProjectId || null,
        adminProjectId: adminProjectId || null,
        projectMismatch,
        hasAdminClientEmail: Boolean(FIREBASE_ADMIN_CONFIG.clientEmail),
        hasAdminPrivateKey: Boolean(FIREBASE_ADMIN_CONFIG.privateKey),
      },
      message: projectMismatch
        ? 'Firebase client/admin project mismatch detected'
        : 'Firebase env alignment looks good',
      timestamp: Date.now(),
      statusCode: 200,
    },
    { status: 200 }
  )
}
