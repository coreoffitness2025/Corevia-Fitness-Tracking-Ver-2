import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseService';
import { UserProfile, UserSettings } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  userSettings: UserSettings | null;
  loading: boolean;
  error: string | null;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultProfile: UserProfile = {
  uid: '',
  displayName: null,
  email: null,
  photoURL: null,
  height: 170,
  weight: 70,
  age: 25,
  gender: 'male',
  activityLevel: 'moderate',
  fitnessGoal: 'maintain',
  experience: {
    years: 0,
    level: 'beginner',
    squat: {
      maxWeight: 0,
      maxReps: 0
    }
  }
};

const defaultSettings: UserSettings = {
  theme: 'light',
  darkMode: false,
  notifications: {
    workoutReminder: true,
    mealReminder: true,
    progressUpdate: true
  },
  units: {
    weight: 'kg',
    height: 'cm'
  },
  language: 'ko'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profileDoc = await getDoc(doc(db, 'users', user.uid));
          const settingsDoc = await getDoc(doc(db, 'settings', user.uid));
          
          if (profileDoc.exists()) {
            const profileData = profileDoc.data();
            const userProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              height: profileData.height || defaultProfile.height,
              weight: profileData.weight || defaultProfile.weight,
              age: profileData.age || defaultProfile.age,
              gender: profileData.gender || defaultProfile.gender,
              activityLevel: profileData.activityLevel || defaultProfile.activityLevel,
              fitnessGoal: profileData.fitnessGoal || defaultProfile.fitnessGoal,
              experience: profileData.experience || defaultProfile.experience
            };
            setUserProfile(userProfile);
          } else {
            const newProfile: UserProfile = {
              ...defaultProfile,
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL
            };
            await setDoc(doc(db, 'users', user.uid), newProfile);
            setUserProfile(newProfile);
          }

          if (settingsDoc.exists()) {
            const settingsData = settingsDoc.data();
            const userSettings: UserSettings = {
              theme: settingsData.theme || defaultSettings.theme,
              darkMode: settingsData.darkMode || defaultSettings.darkMode,
              notifications: settingsData.notifications || defaultSettings.notifications,
              units: settingsData.units || defaultSettings.units,
              language: settingsData.language || defaultSettings.language
            };
            setUserSettings(userSettings);
          } else {
            await setDoc(doc(db, 'settings', user.uid), defaultSettings);
            setUserSettings(defaultSettings);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } else {
        setUserProfile(null);
        setUserSettings(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const currentProfile = userProfile || defaultProfile;
      
      const updatedProfile: UserProfile = {
        ...currentProfile,
        ...profile,
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL
      };

      await setDoc(userRef, updatedProfile, { merge: true });
      setUserProfile(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateSettings = async (settings: Partial<UserSettings>) => {
    if (!currentUser) return;
    try {
      const settingsRef = doc(db, 'settings', currentUser.uid);
      const currentSettings = userSettings || defaultSettings;
      
      const updatedSettings: UserSettings = {
        ...currentSettings,
        ...settings
      };

      await setDoc(settingsRef, updatedSettings, { merge: true });
      setUserSettings(updatedSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setUserSettings(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const value = {
    currentUser,
    userProfile,
    userSettings,
    loading,
    error,
    updateProfile,
    updateSettings,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 