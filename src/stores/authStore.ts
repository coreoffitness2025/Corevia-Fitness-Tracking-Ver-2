import { create } from 'zustand';
import { User } from 'firebase/auth';

// 개발용 더미 사용자 데이터
const dummyUser = {
  uid: 'dummy-user-id-123',
  email: 'user@example.com',
  displayName: '테스트 사용자',
  photoURL: null,
  emailVerified: true
} as User;

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

// 개발 환경에서는 더미 데이터 사용, 프로덕션에서는 null 사용
const initialUser = process.env.NODE_ENV === 'production' ? null : dummyUser;

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  loading: false, // 초기 로딩 상태를 false로 설정
  isAuthenticated: !!initialUser, // 더미 유저가 있으면 인증된 상태로 설정
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ user: null, isAuthenticated: false })
}));
