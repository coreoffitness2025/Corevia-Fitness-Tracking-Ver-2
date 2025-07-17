import { firestore, auth, storage } from './firebase';

const getBodyCollection = () => {
  const userId = auth().currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');
  return firestore().collection('users').doc(userId).collection('body_progress');
};

// --- Weight Management ---
export const addWeightRecord = async (weight: number) => {
  try {
    const collection = getBodyCollection();
    await collection.add({
      type: 'weight',
      value: weight,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    console.log('Weight record added successfully');
  } catch (error) {
    console.error('Error adding weight record: ', error);
    throw error;
  }
};

export const getWeightHistory = async () => {
  try {
    const collection = getBodyCollection();
    const snapshot = await collection
      .where('type', '==', 'weight')
      .orderBy('createdAt', 'desc')
      .get();
      
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching weight history: ', error);
    throw error;
  }
};

// --- Photo Management ---
export const addBodyPhotoUrl = async (url: string) => {
    try {
        const collection = getBodyCollection();
        await collection.add({
            type: 'photo',
            value: url,
            createdAt: firestore.FieldValue.serverTimestamp(),
        });
        console.log('Body photo URL added successfully');
    } catch (error) {
        console.error('Error adding body photo URL: ', error);
        throw error;
    }
}; 