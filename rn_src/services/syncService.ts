import NetInfo from '@react-native-community/netinfo';
import { getUnsyncedWorkouts, deleteUnsyncedWorkout } from '../utils/database';
import { addWorkoutLog } from './workoutService';

let unsubscribeFromNetInfo;

export const startSyncService = () => {
  if (unsubscribeFromNetInfo) {
    // Already running
    return;
  }

  unsubscribeFromNetInfo = NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable) {
      console.log('Online, attempting to sync data...');
      syncOfflineData();
    } else {
      console.log('Offline, sync paused.');
    }
  });

  console.log('Sync service started.');
};

export const stopSyncService = () => {
  if (unsubscribeFromNetInfo) {
    unsubscribeFromNetInfo();
    unsubscribeFromNetInfo = null;
    console.log('Sync service stopped.');
  }
};

const syncOfflineData = async () => {
  // Sync workouts
  const unsyncedWorkouts = await getUnsyncedWorkouts();
  if (unsyncedWorkouts.length > 0) {
    console.log(`Syncing ${unsyncedWorkouts.length} workout(s)...`);
    for (const record of unsyncedWorkouts) {
      try {
        const workoutData = JSON.parse(record.workout_data);
        await addWorkoutLog(workoutData);
        // If successful, delete from local DB
        await deleteUnsyncedWorkout(record.id);
        console.log(`Successfully synced and deleted local workout record ID: ${record.id}`);
      } catch (error) {
        console.error(`Failed to sync workout record ID: ${record.id}`, error);
      }
    }
  }

  // We can add sync logic for other data types (e.g., food logs) here
}; 