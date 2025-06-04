import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { auth, db, getUserProfile, updateUserProfile as updateFirebaseProfile } from '../firebase/firebaseConfig';
import { UserProfile, UserSettings } from '../types';
import { 
  calculateBMR, 
  calculateNutritionGoals,
  activityMultipliers, 
  goalMultipliers,
  ActivityLevel,
  FitnessGoal
} from '../utils/nutritionUtils';

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

// Firestore에 저장할 수 없는 undefined 값을 제거하는 함수
const removeUndefined = (obj: any): any => {
  if (obj === undefined) return null;
  
  if (typeof obj !== 'object' || obj === null) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefined(item));
  }
  
  const result: any = {};
  for (const key in obj) {
    const value = removeUndefined(obj[key]);
    if (value !== undefined) {
      result[key] = value;
    }
  }
  
  return result;
};

// 목표 칼로리 계산 함수를 nutritionUtils의 것을 활용하도록 수정 또는 대체
const calculateTargetCaloriesInContext = (
  height: number,
  weight: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: ActivityLevel, // 타입 변경
  fitnessGoal: FitnessGoal      // 타입 변경
): number => {
  const bmr = calculateBMR(gender, weight, height, age); // nutritionUtils의 calculateBMR 사용
  const tdee = bmr * (activityMultipliers[activityLevel] || activityMultipliers.moderate); // nutritionUtils의 activityMultipliers 사용
  
  let targetCalories = tdee;
  if (goalMultipliers[fitnessGoal]) { // nutritionUtils의 goalMultipliers 사용
    targetCalories = tdee * goalMultipliers[fitnessGoal];
  }
  return Math.round(targetCalories);
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
      
      console.log('AuthContext: 이전 프로필 데이터', previousData);
      
      // 체중 변경 감지 및 기록 저장
      const oldWeight = previousData?.weight;
      const newWeight = profile.weight;
      
      if (newWeight && oldWeight !== newWeight) {
        console.log('AuthContext: 체중 변경 감지', { oldWeight, newWeight });
        
        try {
          // weightRecords 컬렉션에 새로운 체중 기록 추가
          await addDoc(collection(db, 'weightRecords'), {
            userId: currentUser.uid,
            weight: newWeight,
            date: new Date(),
            createdAt: new Date()
          });
          console.log('AuthContext: 체중 기록 저장 완료');
        } catch (weightError) {
          console.error('체중 기록 저장 중 오류:', weightError);
          // 체중 기록 저장 실패해도 프로필 업데이트는 계속 진행
        }
      }
      
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
      
      // 목표 칼로리 계산 로직 수정
      if (profile.height || profile.weight || profile.activityLevel || profile.gender || profile.age || profile.fitnessGoal) {
        const height = Number(updatedProfile.height) || defaultProfile.height;
        const weight = Number(updatedProfile.weight) || defaultProfile.weight;
        const age = Number(updatedProfile.age) || defaultProfile.age;
        const gender = updatedProfile.gender || defaultProfile.gender;
        // activityLevel과 fitnessGoal은 UserProfile 타입에 이미 ActivityLevel, FitnessGoal로 정의되어 있어야 함
        const activityLevelValue = updatedProfile.activityLevel || defaultProfile.activityLevel;
        const fitnessGoalValue = updatedProfile.fitnessGoal || defaultProfile.fitnessGoal;
        
        try {
          // 수정된 calculateTargetCaloriesInContext 함수 사용
          const targetCalories = calculateTargetCaloriesInContext(
            height,
            weight,
            age,
            gender,
            activityLevelValue,
            fitnessGoalValue
          );
          
          if (!isNaN(targetCalories) && targetCalories > 0) {
            if (!profile.targetCalories) {
              updatedProfile.targetCalories = targetCalories;
            }
          }
        } catch (err) {
          console.error('목표 칼로리 계산 중 오류 (AuthContext):', err);
        }
      }
      
      console.log('AuthContext: 업데이트할 프로필 데이터', updatedProfile);
      
      // undefined 값을 모두 제거 (Firestore는 undefined 값을 저장할 수 없음)
      const cleanProfile = removeUndefined(updatedProfile);
      console.log('AuthContext: 정제된 프로필 데이터 (Firestore 저장 직전)', JSON.stringify(cleanProfile, null, 2));
      
      // Firestore에 전체 업데이트된 프로필 저장 - merge 옵션 추가
      await setDoc(userDocRef, cleanProfile, { merge: true });
      console.log('AuthContext: Firestore 저장 완료');
      
      // 로컬 상태 업데이트
      console.log('AuthContext: setUserProfile 호출 직전, updatedProfile 내용:', JSON.stringify(updatedProfile, null, 2));
      setUserProfile(updatedProfile);
      // setUserProfile은 비동기적으로 작동하므로, 바로 다음 줄에서 userProfile을 찍어도 이전 값이 나올 수 있습니다.
      // 실제 변경은 다음 렌더링 사이클에서 반영됩니다.
      console.log('AuthContext: setUserProfile 호출 완료 (다음 렌더링 시 updatedProfile 반영 예정)');
      
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
      
      const updatedSettings: UserSettings = {
        ...(userSettings || defaultSettings),
        ...settings
      };
      
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
