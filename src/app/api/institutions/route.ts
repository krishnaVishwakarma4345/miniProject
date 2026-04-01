import { NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { ApiResponse } from '@/types'

type InstitutionItem = {
  id: string
  name: string
  isActive: boolean
}

const DEFAULT_INSTITUTION = {
  id: 'terna-engineering-college',
  name: 'Terna Engineering College',
}

export async function GET() {
  try {
    const adminDb = getAdminFirestore()
    let snapshot = await adminDb
      .collection('institutions')
      .where('isActive', '==', true)
      .get()

    if (snapshot.empty) {
      const now = new Date()
      await adminDb.collection('institutions').doc(DEFAULT_INSTITUTION.id).set(
        {
          id: DEFAULT_INSTITUTION.id,
          name: DEFAULT_INSTITUTION.name,
          isActive: true,
          createdBy: 'system-seed',
          createdAt: now,
          updatedAt: now,
        },
        { merge: true }
      )

      snapshot = await adminDb
        .collection('institutions')
        .where('isActive', '==', true)
        .get()
    }

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
