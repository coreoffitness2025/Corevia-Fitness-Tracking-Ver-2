import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseService';

interface UserProfile {
  name: string;
  email: string;
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  settings?: {
    darkMode: boolean;
    notifications: {
      workoutReminder: boolean;
      mealReminder: boolean;
      progressUpdate: boolean;
    };
    units: {
      weight: 'kg' | 'lbs';
      height: 'cm' | 'ft';
    };
    language: 'ko' | 'en';
  };
}

interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

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
  gender: 'male',
  age: 25,
  height: 170,
  weight: 70,
  activityLevel: 'moderate',
  fitnessGoal: 'maintain'
};

const defaultSettings: UserSettings = {
  theme: 'light',
  notifications: true,
  language: 'ko'
};

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  userSettings: null,
  loading: true,
  error: null,
  updateProfile: async () => {},
  updateSettings: async () => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
          // 사용자 프로필 로드
          const profileDoc = await getDoc(doc(db, 'users', user.uid));
          if (profileDoc.exists()) {
            const profileData = profileDoc.data();
            setUserProfile({
              ...defaultProfile,
              ...profileData.profile
            });
            setUserSettings({
              ...defaultSettings,
              ...profileData.settings
            });
          } else {
            // 새 사용자일 경우 기본 프로필 생성
            await setDoc(doc(db, 'users', user.uid), {
              profile: defaultProfile,
              settings: defaultSettings
            });
            setUserProfile(defaultProfile);
            setUserSettings(defaultSettings);
          }
        } catch (err) {
          setError('프로필 로드 중 오류가 발생했습니다.');
          console.error('프로필 로드 실패:', err);
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
      const updatedProfile = { ...userProfile, ...profile };
      await setDoc(doc(db, 'users', currentUser.uid), {
        profile: updatedProfile,
        settings: userSettings
      }, { merge: true });
      setUserProfile(updatedProfile);
    } catch (err) {
      setError('프로필 업데이트 중 오류가 발생했습니다.');
      console.error('프로필 업데이트 실패:', err);
    }
  };

  const updateSettings = async (settings: Partial<UserSettings>) => {
    if (!currentUser) return;
    
    try {
      const updatedSettings = { ...userSettings, ...settings };
      await setDoc(doc(db, 'users', currentUser.uid), {
        profile: userProfile,
        settings: updatedSettings
      }, { merge: true });
      setUserSettings(updatedSettings);
    } catch (err) {
      setError('설정 업데이트 중 오류가 발생했습니다.');
      console.error('설정 업데이트 실패:', err);
    }
  };

  const logout = async () => {
    await signOut(auth);
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
      {!loading && children}
    </AuthContext.Provider>
  );
}; 