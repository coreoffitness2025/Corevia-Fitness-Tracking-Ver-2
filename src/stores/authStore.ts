import { create } from 'zustand';

interface User {
  uid: string;
  displayName: string;
  email: string;
}

interface AuthState {
  user: User;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(() => ({
  user: {
    uid: 'dev-user',
    displayName: '개발자',
    email: 'dev@corevia.app',
  },
  logout: () => {
    /* 빈 함수: 로그아웃 버튼을 눌러도 아무 일 안 함 */
  },
}));
