import { firestore } from './firebase';
import { auth } from './firebase';

const getFoodLogCollection = () => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return firestore.collection('users').doc(userId).collection('foodlogs');
};

export const addFoodLogToServer = async (foodData: any) => {
  try {
    const foodLogCollection = getFoodLogCollection();
    const docRef = await foodLogCollection.add({
      ...foodData,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    console.log('Food log added with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding food log: ', error);
    throw error;
  }
};

export const getFoodLogsByDate = async (date: string) => {
  try {
    const foodLogCollection = getFoodLogCollection();
    const snapshot = await foodLogCollection.where('date', '==', date).get();
    
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return logs;
  } catch (error) {
    console.error('Error fetching food logs: ', error);
    throw error;
  }
}; 