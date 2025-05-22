// 1단계: App.tsx 라우트 수정
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 보호된 라우트 컴포넌트 import
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import QnaPage from './pages/QnaPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import WorkoutPage from './pages/workout/WorkoutPage';
import FoodPage from './pages/food/FoodPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
// import OneRmCalculatorPage from './pages/OneRmCalculatorPage';
import LegalPage from './pages/LegalPage';

// 플랫폼 독립적인 라우트 설정 (Web/Native 모두 사용 가능한 구조)
export interface AppRoute {
  path: string;
  component: React.ComponentType<any>;
  protected: boolean;
  children?: AppRoute[];
}

// 앱 라우트 설정을 비즈니스 로직으로부터 분리
export const appRoutes: AppRoute[] = [
  // 공개 라우트
  { path: '/login', component: LoginPage, protected: false },
  { path: '/register', component: RegisterPage, protected: false },
  
  // 보호된 라우트
  { path: '/', component: HomePage, protected: true },
  { path: '/profile', component: ProfilePage, protected: true },
  { path: '/profile/*', component: ProfilePage, protected: true },
  { path: '/workout/*', component: WorkoutPage, protected: true },
  { path: '/food/*', component: FoodPage, protected: true },
  { path: '/qna', component: QnaPage, protected: true },
  { path: '/settings', component: SettingsPage, protected: true },
  // { path: '/1rm-calculator', component: OneRmCalculatorPage, protected: true },
  // 법적 정보 페이지 라우트 추가
  { path: '/legal', component: LegalPage, protected: true },
  { path: '/legal/:type', component: LegalPage, protected: true },
  // WorkoutGuidePage 라우트 제거하고 SettingsPage로 리다이렉트
  { 
    path: '/workout/guide', 
    component: () => <Navigate to="/settings" replace />, 
    protected: true 
  },
  
  // 404 페이지
  { path: '*', component: NotFoundPage, protected: false }
];

// 웹 환경에서의 라우트 렌더링 (React Router DOM 사용)
const renderRoutes = (routes: AppRoute[]) => {
  return routes.map((route) => {
    const Component = route.component;

    if (route.protected) {
      return (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute>
              <Component />
            </ProtectedRoute>
          }
        />
      );
    }

    return (
      <Route
        key={route.path}
        path={route.path}
        element={<Component />}
      />
    );
  });
};

// QueryClient 인스턴스 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분간 데이터 신선함 유지
      gcTime: 1000 * 60 * 60, // 1시간 가비지 컬렉션 시간 (이전의 cacheTime)
      retry: 1, // 실패 시 1번만 재시도
      refetchOnWindowFocus: false, // 창 포커스 시 자동 리페치 비활성화
    },
  },
});

// 앱 환경 설정 및 프로바이더
const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-center" />
        {children}
      </QueryClientProvider>
    </AuthProvider>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppProviders>
        <Routes>
          {renderRoutes(appRoutes)}
        </Routes>
      </AppProviders>
    </Router>
  );
};

export default App;
