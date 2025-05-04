import { UserProfile, FAQ, ExercisePart, Session } from '../types';

// Firebase 관련 함수들을 더미 함수로 대체
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    callback(null);
    return () => {};
  }
} as any;

export const db = {} as any;
export const storage = {} as any;
export const analytics = {} as any;

// 인증 관련 함수들
export const signInWithGoogle = async () => {
  return { user: null };
};

export const signInWithEmail = async (email: string, password: string) => {
  return { user: null };
};

export const logout = async () => {
  return;
};

// 사용자 프로필 관련 함수들
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  return null;
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>) => {
  return;
};

// 운동 기록 관련 함수들
export const getLastSession = async (userId: string): Promise<Session | null> => {
  return null;
};

// FAQ 관련 함수들
export const getFAQs = async (part?: ExercisePart, type?: 'method' | 'sets'): Promise<FAQ[]> => {
  return [];
};
