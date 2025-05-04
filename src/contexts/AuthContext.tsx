import React, { createContext, useContext, useState, useEffect } from 'react';
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
  displayName: '',
  email: '',
  profile: {
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
  }
};

const defaultSettings: UserSettings = {
  theme: 'light',
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
            const userProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName || '',
              email: user.email || '',
              photoURL: user.photoURL || undefined,
              profile: {
                ...defaultProfile.profile,
                ...profileData.profile
              }
            };
            const userSettings: UserSettings = {
              ...defaultSettings,
              ...profileData.settings
            };
            setUserProfile(userProfile);
            setUserSettings(userSettings);
          } else {
            // 새 사용자일 경우 기본 프로필 생성
            const newProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName || '',
              email: user.email || '',
              photoURL: user.photoURL || undefined,
              profile: defaultProfile.profile
            };
            await setDoc(doc(db, 'users', user.uid), {
              profile: newProfile.profile,
              settings: defaultSettings
            });
            setUserProfile(newProfile);
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
      const userRef = doc(db, 'users', currentUser.uid);
      const currentProfile = userProfile || defaultProfile;
      
      const updatedProfile: UserProfile = {
        ...currentProfile,
        ...profile,
        uid: currentUser.uid,
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        photoURL: currentUser.photoURL || undefined,
        profile: {
          ...currentProfile.profile,
          ...profile.profile
        }
      };

      await setDoc(userRef, {
        profile: updatedProfile.profile,
        settings: userSettings || defaultSettings
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
      const userRef = doc(db, 'users', currentUser.uid);
      const currentSettings = userSettings || defaultSettings;
      
      const updatedSettings: UserSettings = {
        ...currentSettings,
        ...settings
      };

      await setDoc(userRef, {
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