import { firestore } from '../../../lib/firebase';
import { auth } from '../../../lib/firebase';

const getWorkoutCollection = () => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return firestore.collection('users').doc(userId).collection('workouts');
};

export const addWorkoutLog = async (workoutData: any) => {
  try {
    const workoutCollection = getWorkoutCollection();
    const docRef = await workoutCollection.add({
      ...workoutData,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    console.log('Workout added with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding workout: ', error);
    throw error;
  }
};

export const getWorkoutsByDate = async (date: string) => {
  try {
    const workoutCollection = getWorkoutCollection();
    // This query needs to be adapted based on how dates are stored (e.g., 'YYYY-MM-DD' string)
    const snapshot = await workoutCollection.where('date', '==', date).get();
    
    const workouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return workouts;
  } catch (error) {
    console.error('Error fetching workouts: ', error);
    throw error;
  }
};

// We will add update and delete functions later 