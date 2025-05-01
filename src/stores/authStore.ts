import { create } from 'zustand';

interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    uid: 'dev-user',
    displayName: '개발자',
    email: 'dev@corevia.app',
  }, // 항상 로그인된 상태처럼
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
