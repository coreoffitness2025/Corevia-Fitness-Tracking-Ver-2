import NetInfo from '@react-native-community/netinfo';
import { getUnsyncedWorkouts, deleteUnsyncedWorkout } from '../utils/database';
import { addWorkoutLog } from '../features/workout/services/workoutService';

let unsubscribeFromNetInfo;

export const isSyncServiceRunning = () => {
    return !!unsubscribeFromNetInfo;
};

export const startSyncService = () => {
    if (isSyncServiceRunning()) {
        // ...
    }
    // ...
};

export const stopSyncService = () => {
    if (unsubscribeFromNetInfo) {
        unsubscribeFromNetInfo();
        unsubscribeFromNetInfo = null;
        console.log('Sync service stopped.');
    }
}; 