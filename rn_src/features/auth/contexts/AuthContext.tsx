import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { auth } from '../../lib/firebase';
import { getUserProfile, updateUserProfile } from '../services';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { runMigrations } from '../../../lib/migrationService';

interface UserProfile {
  goal?: string;
  weight?: number;
}

interface AuthContextType {
  currentUser: FirebaseAuthTypes.User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  updateProfile: (profileData: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        await runMigrations(); // Run migrations after user is authenticated
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const updateProfile = useCallback(async (profileData: UserProfile) => {
    if (!currentUser) return;
    await updateUserProfile(profileData);
    const updatedProfile = await getUserProfile(currentUser.uid);
    setUserProfile(updatedProfile);
  }, [currentUser]);

  const value = {
    currentUser,
    userProfile,
    loading,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 