import type { Firestore, DocumentData, DocumentReference, CollectionReference } from 'firebase-admin/firestore'

export const getInstitutionActivitiesCollection = (adminDb: Firestore, institutionId: string): CollectionReference<DocumentData> => {
	return adminDb.collection('institutions').doc(institutionId).collection('activities')
}

export const getInstitutionActivityDoc = (adminDb: Firestore, institutionId: string, activityId: string): DocumentReference<DocumentData> => {
	return getInstitutionActivitiesCollection(adminDb, institutionId).doc(activityId)
}

export const mirrorActivityDocument = async (
	adminDb: Firestore,
	institutionId: string,
	activityId: string,
	data: Record<string, unknown>,
): Promise<void> => {
	await getInstitutionActivityDoc(adminDb, institutionId, activityId).set(data, { merge: true })
}

export const ensureInstitutionActivityMirror = async (adminDb: Firestore, institutionId: string): Promise<void> => {
	const localSnapshot = await getInstitutionActivitiesCollection(adminDb, institutionId).limit(1).get()
	if (!localSnapshot.empty) {
		return
	}

	const globalSnapshot = await adminDb
		.collection('activities')
		.where('institutionId', '==', institutionId)
		.get()

	await Promise.all(
		globalSnapshot.docs.map((doc) =>
			getInstitutionActivityDoc(adminDb, institutionId, doc.id).set({ id: doc.id, ...doc.data() }, { merge: true })
		)
	)
}
