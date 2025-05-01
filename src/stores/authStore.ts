import { create } from 'zustand';

interface User {
  uid: string;
  displayName: string;
  email: string;
}

interface AuthState {
  user: User;      // null 대신 기본 사용자
  logout: () => void;
}

export const useAuthStore = create<AuthState>(() => ({
  user: {
    uid: 'dev-user',
    displayName: '개발자',
    email: 'dev@corevia.app',
  },
  logout: () => {
    /* 혼자 쓰는 버전은 로그아웃 불필요 */
  },
}));
