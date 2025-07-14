import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
// Firestore 플러그인 import
import { FirebaseFirestore } from '@capacitor-firebase/firestore';

export const useWorkoutSettings = () => {
  const { user } = useAuth();
  // ...

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    try {
      const docSnap = await FirebaseFirestore.getDocument({
        collection: 'workoutSettings',
        id: user.uid,
      });
      // ...
    } catch (error) {
      // ...
    }
  }, [user]);

  const updateSettings = async (newSettings) => {
    if (!user) return;
    try {
      await FirebaseFirestore.updateDocument({
        collection: 'workoutSettings',
        id: user.uid,
        data: newSettings,
      });
      // ...
    } catch (error) {
      // ...
    }
  };

  // ...
}; 