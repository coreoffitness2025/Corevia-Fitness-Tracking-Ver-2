import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { UserProfile, FAQ, ExercisePart, Session } from '../types';

// Firebase 설정 (비활성화)
const firebaseConfig = {
  apiKey: "dummy-api-key",
  authDomain: "dummy-domain",
  projectId: "dummy-project",
  storageBucket: "dummy-bucket",
  messagingSenderId: "dummy-sender-id",
  appId: "dummy-app-id",
  measurementId: "dummy-measurement-id"
};

// Firebase 서비스 더미 객체
export const auth = {} as any;
export const db = {} as any;
export const storage = {} as any;
export const analytics = {} as any;

// 인증 관련 더미 함수들
export const signInWithGoogle = async () => {
  console.log('Google 로그인 기능이 일시적으로 비활성화되었습니다.');
  return Promise.resolve({ user: null });
};

export const signInWithEmail = async (email: string, password: string) => {
  console.log('이메일 로그인 기능이 일시적으로 비활성화되었습니다.');
  return Promise.resolve({ user: null });
};

export const logout = async () => {
  console.log('로그아웃 기능이 일시적으로 비활성화되었습니다.');
  return Promise.resolve();
};

// 사용자 프로필 관련 더미 함수들
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  console.log('사용자 프로필 조회 기능이 일시적으로 비활성화되었습니다.');
  return Promise.resolve(null);
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>) => {
  console.log('프로필 업데이트 기능이 일시적으로 비활성화되었습니다.');
  return Promise.resolve();
};

// 운동 기록 관련 더미 함수들
export const getLastSession = async (userId: string): Promise<Session | null> => {
  console.log('운동 세션 조회 기능이 일시적으로 비활성화되었습니다.');
  return Promise.resolve(null);
};

// FAQ 관련 더미 함수들
export const getFAQs = async (part?: ExercisePart, type?: 'method' | 'sets'): Promise<FAQ[]> => {
  console.log('FAQ 조회 기능이 일시적으로 비활성화되었습니다.');
  return Promise.resolve([]);
};
