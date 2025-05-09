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

// 새로운 helper 함수들 추가
const isObject = (item: any) => {
  return (item && typeof item === 'object' && !Array.isArray(item));
};

const deepMerge = (target: any, source: any) => {
  const output = Object.assign({}, target);
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
};

// 목표 칼로리 계산 함수
const calculateTargetCalories = (
  height: number,
  weight: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive',
  fitnessGoal: 'lose' | 'maintain' | 'gain'
): number => {
  // 기초 대사량(BMR) 계산 - 해리스-베네딕트 공식
  let bmr = 0;
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
  
  // 활동 계수
  const activityFactors = {
    sedentary: 1.2,    // 거의 운동 안함
    light: 1.375,      // 가벼운 운동 (주 1-3회)
    moderate: 1.55,    // 중간 정도 운동 (주 3-5회)
    active: 1.725,     // 활발한 운동 (주 6-7회)
    veryActive: 1.9    // 매우 활발한 운동 (하루 2회 이상)
  };
  
  // 일일 필요 칼로리 (TDEE)
  const tdee = bmr * activityFactors[activityLevel];
  
  // 목표에 따른 조정
  const goalFactors = {
    lose: 0.8,        // 체중 감량 (20% 적게)
    maintain: 1.0,     // 체중 유지
    gain: 1.15         // 체중 증가 (15% 많게)
  };
  
  return Math.round(tdee * goalFactors[fitnessGoal]);
};

// 개인화 필요 여부 확인 함수
const checkPersonalizationNeeded = async (uid: string) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    // 사용자 정보가 없거나 필수 정보가 없으면 개인화 필요
    if (!userDoc.exists() || 
        !userDoc.data().height || 
        !userDoc.data().weight ||
        !userDoc.data().setConfiguration) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('개인화 필요 여부 확인 중 오류:', error);
    return true; // 오류 발생 시 개인화 필요
  }
};

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
          
          // 개인화 필요 여부 확인
          const needsPersonalization = await checkPersonalizationNeeded(user.uid);
          if (needsPersonalization) {
            // PersonalizationModal 표시 신호 설정
            sessionStorage.setItem('needsPersonalization', 'true');
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
      
      // 이전 프로필 데이터 가져오기
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      const previousData = userDoc.exists() ? userDoc.data() as UserProfile : null;
      
      // 새 데이터 병합 (중첩된 객체도 올바르게 병합)
      const updatedProfile = deepMerge(
        previousData || defaultProfile,
        {
          ...profile,
          // 타임스탬프 추가로 최신 데이터 확인 가능
          lastUpdated: new Date().toISOString()
        }
      );
      
      // 필수 사용자 정보 유지
      updatedProfile.uid = currentUser.uid;
      if (currentUser.displayName) updatedProfile.displayName = currentUser.displayName;
      if (currentUser.email) updatedProfile.email = currentUser.email;
      if (currentUser.photoURL) updatedProfile.photoURL = currentUser.photoURL;
      
      // 키, 몸무게, 활동 수준 등에 따라 목표 칼로리 계산
      if (profile.height || profile.weight || profile.activityLevel || profile.gender || profile.age || profile.fitnessGoal) {
        const targetCalories = calculateTargetCalories(
          updatedProfile.height,
          updatedProfile.weight,
          updatedProfile.age,
          updatedProfile.gender,
          updatedProfile.activityLevel,
          updatedProfile.fitnessGoal
        );
        // 사용자가 직접 설정한 칼로리가 있으면 그 값을 우선함
        if (!profile.targetCalories) {
          updatedProfile.targetCalories = targetCalories;
        }
      }
      
      // Firestore에 전체 업데이트된 프로필 저장 - merge:true로 일부 필드만 업데이트하지 않고 전체 문서 저장
      await setDoc(userDocRef, updatedProfile);
      
      // 로컬 상태 업데이트
      setUserProfile(updatedProfile);
      console.log('AuthContext: 프로필 업데이트 완료', updatedProfile);
      
      // 이벤트 발생 - 다른 컴포넌트에게 프로필 업데이트 알림
      window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
        detail: { profile: updatedProfile } 
      }));
      
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
