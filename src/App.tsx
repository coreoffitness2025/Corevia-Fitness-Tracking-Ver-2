// 1단계: App.tsx 라우트 수정
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

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

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* 보호된 라우트 */}
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/profile/*" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/workout/*" element={
            <ProtectedRoute>
              <WorkoutPage />
            </ProtectedRoute>
          } />
          <Route path="/food/*" element={
            <ProtectedRoute>
              <FoodPage />
            </ProtectedRoute>
          } />
          <Route path="/qna" element={
            <ProtectedRoute>
              <QnaPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          
          {/* 404 페이지 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
