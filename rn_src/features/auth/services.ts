import { auth, firestore } from '../../lib/firebase';
import { Alert } from 'react-native';

export const signUp = async (email, password) => {
    try {
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        // You can create a user profile document here if you want
        await firestore().collection('users').doc(userCredential.user.uid).set({
            email: userCredential.user.email,
            createdAt: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        return userCredential;
    } catch (error) {
        Alert.alert('Sign Up Error', error.message);
        throw error;
    }
};

export const signIn = async (email, password) => {
    try {
        return await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
        Alert.alert('Sign In Error', error.message);
        throw error;
    }
};

export const updateUserProfile = async (profileData: any) => {
    // ... (existing function)
};

export const getUserProfile = async (userId: string) => {
    // ... (existing function)
};

export const deleteUserAccount = async () => {
    const user = auth().currentUser;
    if (!user) {
        throw new Error("로그인된 사용자가 없습니다.");
    }

    try {
        const userId = user.uid;
        const batch = firestore().batch();

        // 1. Delete user profile
        const userRef = firestore().collection('users').doc(userId);
        batch.delete(userRef);

        // 2. Delete workout logs (assuming a 'workouts' collection)
        const workoutsQuery = firestore().collection('workouts').where('userId', '==', userId);
        const workoutsSnapshot = await workoutsQuery.get();
        workoutsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        // 3. Delete food logs (assuming a 'foodLogs' collection)
        const foodLogsQuery = firestore().collection('foodLogs').where('userId', '==', userId);
        const foodLogsSnapshot = await foodLogsQuery.get();
        foodLogsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // ... (Add other data deletions here, e.g., body photos from storage)

        // Commit all deletions
        await batch.commit();

        // 4. Delete the user from Firebase Auth
        await user.delete();

    } catch (error) {
        console.error("Failed to delete user account: ", error);
        // Re-authentication might be required for security-sensitive operations
        if (error.code === 'auth/requires-recent-login') {
            throw new Error('계정을 삭제하려면 최근에 다시 로그인해야 합니다.');
        }
        throw new Error('계정 삭제에 실패했습니다. 다시 시도해주세요.');
    }
}; 