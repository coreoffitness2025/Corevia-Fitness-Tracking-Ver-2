import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, getUserProfile, updateUserProfile as updateFirebaseProfile } from '../firebase/firebaseConfig';
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
  isAuthenticated: boolean;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthenticated(!!user);
      
      if (user) {
        try {
          // 여러 데이터 병렬로 가져오기
          const userDocRef = doc(db, 'users', user.uid);
          const settingsDocRef = doc(db, 'userSettings', user.uid);
          
          // Promise.all을 사용하여 두 요청을 병렬로 실행
          const [profileDoc, settingsDoc] = await Promise.all([
            getDoc(userDocRef),
            getDoc(settingsDocRef)
          ]);
          
          // 사용자 프로필 처리
          if (profileDoc.exists()) {
            setUserProfile(profileDoc.data() as UserProfile);
          } else {
            // 프로필이 없으면 기본 프로필 생성
            const newProfile: UserProfile = {
              ...defaultProfile,
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL
            };
            
            // Firestore에 저장
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
          
          // 사용자 설정 처리
          if (settingsDoc.exists()) {
            setUserSettings(settingsDoc.data() as UserSettings);
          } else {
            // 설정이 없으면 기본 설정 생성
            await setDoc(settingsDocRef, defaultSettings);
            setUserSettings(defaultSettings);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError(err instanceof Error ? err.message : '사용자 데이터를 가져오는 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      } else {
        // 로그아웃 시 상태 초기화
        setUserProfile(null);
        setUserSettings(null);
        setLoading(false);
      }
    });
    
    return unsubscribe;
  }, []);

  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      console.log('AuthContext: 프로필 업데이트 시작', profile);
      
      // 현재 프로필과 새 데이터 병합
      const updatedProfile: UserProfile = {
        ...(userProfile || defaultProfile),
        ...profile,
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL
      };
      
      // Firestore 업데이트 - 객체 그대로가 아니라 필요한 필드만 업데이트
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, profile as { [x: string]: any });
      console.log('AuthContext: Firestore 업데이트 완료', profile);
      
      // 로컬 상태는 완전한 객체로 업데이트
      setUserProfile(updatedProfile);
      console.log('AuthContext: 로컬 상태 업데이트 완료');
      setError(null);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : '프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (settings: Partial<UserSettings>) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // 현재 설정과 새 데이터 병합
      const updatedSettings: UserSettings = {
        ...(userSettings || defaultSettings),
        ...settings
      };
      
      // Firestore 업데이트
      await updateDoc(doc(db, 'userSettings', currentUser.uid), settings);
      
      setUserSettings(updatedSettings);
      setError(null);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err instanceof Error ? err.message : '설정 업데이트 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setCurrentUser(null);
      setUserProfile(null);
      setUserSettings(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err.message : '로그아웃 중 오류가 발생했습니다.');
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
    logout,
    isAuthenticated
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
