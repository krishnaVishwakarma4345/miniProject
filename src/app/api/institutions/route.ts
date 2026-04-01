import { NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { ApiResponse } from '@/types'

type InstitutionItem = {
  id: string
  name: string
  isActive: boolean
}

export async function GET() {
  try {
    const adminDb = getAdminFirestore()
    const snapshot = await adminDb
      .collection('institutions')
      .where('isActive', '==', true)
      .get()

    const institutions: InstitutionItem[] = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        name: String(doc.data().name || doc.id),
        isActive: doc.data().isActive !== false,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json<ApiResponse<InstitutionItem[]>>(
      {
        success: true,
        data: institutions,
        message: 'Institutions fetched',
        timestamp: Date.now(),
        statusCode: 200,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to fetch institutions',
        timestamp: Date.now(),
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
