import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import WorkoutPage from './pages/WorkoutPage';
import WorkoutDetailPage from './pages/WorkoutDetailPage';
import WorkoutNewPage from './pages/WorkoutNewPage';
import WorkoutEditPage from './pages/WorkoutEditPage';
import WorkoutStartPage from './pages/WorkoutStartPage';
import WorkoutResultPage from './pages/WorkoutResultPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from './contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

// 인증이 필요한 라우트를 위한 컴포넌트
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// 인증 컨텍스트 외부 컴포넌트
const AppRoutes = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/login" element={
          currentUser ? <Navigate to="/" /> : <LoginPage />
        } />
        <Route path="/register" element={
          currentUser ? <Navigate to="/" /> : <RegisterPage />
        } />
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
        <Route path="/workout" element={
          <ProtectedRoute>
            <WorkoutPage />
          </ProtectedRoute>
        } />
        <Route path="/workout/:id" element={
          <ProtectedRoute>
            <WorkoutDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/workout/new" element={
          <ProtectedRoute>
            <WorkoutNewPage />
          </ProtectedRoute>
        } />
        <Route path="/workout/:id/edit" element={
          <ProtectedRoute>
            <WorkoutEditPage />
          </ProtectedRoute>
        } />
        <Route path="/workout/:id/start" element={
          <ProtectedRoute>
            <WorkoutStartPage />
          </ProtectedRoute>
        } />
        <Route path="/workout/:id/result" element={
          <ProtectedRoute>
            <WorkoutResultPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
};

function App() {
  // 배포 환경에 따른 basename 설정
  // import.meta.env.BASE_URL 값은 vite.config.ts에서 설정됨
  const basename = import.meta.env.BASE_URL || '/';
  
  return (
    <Router basename={basename}>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
