import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, getUserProfile } from '../firebase/firebaseConfig';
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
  const [currentUser, setCurrentUser] = useState<User | null>({
    uid: 'dummy-user-id',
    email: 'test@example.com',
    displayName: '테스트 사용자',
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    phoneNumber: null,
    providerId: 'password',
    delete: async () => {},
    getIdToken: async () => '',
    getIdTokenResult: async () => ({ 
      token: '', 
      expirationTime: '', 
      authTime: '', 
      issuedAtTime: '', 
      signInProvider: null, 
      signInSecondFactor: null,
      claims: {} 
    }),
    reload: async () => {},
    toJSON: () => ({}),
  } as User);
  const [userProfile, setUserProfile] = useState<UserProfile | null>({
    ...defaultProfile,
    uid: 'dummy-user-id',
    displayName: '테스트 사용자',
    email: 'test@example.com',
    height: 175,
    weight: 70,
    age: 28,
    gender: 'male',
    activityLevel: 'moderate',
    fitnessGoal: 'maintain',
    experience: {
      years: 2,
      level: 'intermediate',
      squat: {
        maxWeight: 100,
        maxReps: 8
      }
    }
  });
  const [userSettings, setUserSettings] = useState<UserSettings | null>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!currentUser) return;
    try {
      const updatedProfile: UserProfile = {
        ...(userProfile || defaultProfile),
        ...profile,
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL
      };
      setUserProfile(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateSettings = async (settings: Partial<UserSettings>) => {
    if (!currentUser) return;
    try {
      const updatedSettings: UserSettings = {
        ...(userSettings || defaultSettings),
        ...settings
      };
      setUserSettings(updatedSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const logout = async () => {
    try {
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
