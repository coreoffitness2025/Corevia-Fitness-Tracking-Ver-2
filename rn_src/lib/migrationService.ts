import AsyncStorage from '@react-native-async-storage/async-storage';
import { firestore, auth } from './firebase';

const LATEST_DATA_VERSION = 1; // Increment this when data schema changes

// --- Migration Functions ---
// Each function should migrate from one version to the next.
// Example: Migrating from version 0 (or null) to version 1
const migrateV0toV1 = async () => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    // Example task: Ensure all workouts have a 'type' field.
    const workoutRef = firestore().collection('users').doc(userId).collection('workouts');
    const snapshot = await workoutRef.where('type', '==', null).get();

    if (snapshot.empty) return; // No migration needed

    const batch = firestore().batch();
    snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { type: 'main' }); // Default old workouts to 'main'
    });
    
    await batch.commit();
    console.log(`Migration V1 complete for ${snapshot.size} documents.`);
};


// --- Migration Runner ---
const MIGRATIONS = {
    1: migrateV0toV1,
    // Add more migration functions here, e.g., 2: migrateV1toV2
};

export const runMigrations = async () => {
    try {
        const currentVersionStr = await AsyncStorage.getItem('dataVersion');
        let currentVersion = currentVersionStr ? parseInt(currentVersionStr, 10) : 0;

        if (currentVersion >= LATEST_DATA_VERSION) {
            console.log('Data schema is up to date.');
            return;
        }

        console.log(`Current data version: ${currentVersion}. Latest version: ${LATEST_DATA_VERSION}. Starting migration...`);

        for (let v = currentVersion + 1; v <= LATEST_DATA_VERSION; v++) {
            if (MIGRATIONS[v]) {
                await MIGRATIONS[v]();
                await AsyncStorage.setItem('dataVersion', v.toString());
                console.log(`Successfully migrated to version ${v}.`);
            }
        }
    } catch (error) {
        console.error('Migration failed:', error);
        // In a real app, you might want to handle this more gracefully,
        // e.g., by logging the error to a service and notifying the user.
    }
}; 