import { create } from 'zustand';

interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;          // ← 다시 둡니다(더미라도 OK)
}

interface AuthState {
  user: User;
  isAuthenticated: boolean;   // ← 추가
  setUser: (u: User) => void; // ← 추가
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    uid: 'dev-user',
    displayName: '개발자',
    email: 'dev@corevia.app',
    photoURL: undefined,
  },
  isAuthenticated: true,        // 항상 로그인된 상태
  setUser: (u) => set({ user: u, isAuthenticated: true }),
  logout: () => {
    /* 혼자 쓰니까 noop */
  },
}));
