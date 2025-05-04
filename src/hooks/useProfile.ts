import { useCallback } from 'react';
import { UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useProfile() {
  const { updateProfile } = useAuth();

  const handleSaveProfile = useCallback(async (profile: Omit<UserProfile, 'uid' | 'displayName' | 'email' | 'photoURL'>) => {
    try {
      await updateProfile(profile);
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  }, [updateProfile]);

  return {
    handleSaveProfile
  };
} 