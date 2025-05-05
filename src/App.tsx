// 1단계: App.tsx 라우트 수정
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import QnaPage from './pages/QnaPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import WorkoutPage from './pages/workout/WorkoutPage';
import FoodPage from './pages/food/FoodPage';
import RegisterPage from './pages/RegisterPage';

// 더미 로그인 페이지 - 실제로는 항상 로그인된 것처럼 동작
const DummyLoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          개발 모드: 자동 로그인
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
          개발 모드에서는 자동으로 더미 계정으로 로그인됩니다.
        </p>
        <div className="flex justify-center mt-6">
          <a 
            href="/" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            홈으로 이동
          </a>
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { currentUser } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/workout" element={<WorkoutPage />} />
      <Route path="/food" element={<FoodPage />} />
      <Route path="/qna" element={<QnaPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<DummyLoginPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
