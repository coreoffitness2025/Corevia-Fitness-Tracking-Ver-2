// App.tsx 상단 주석 추가
// Updated to trigger redeploy

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { useAuthStore } from './stores/authStore';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import SelectPage from './pages/SelectPage';
import RecordPage from './pages/RecordPage';
import FeedbackPage from './pages/FeedbackPage';
import GraphPage from './pages/GraphPage';
import QnaPage from './pages/QnaPage';
import SettingsPage from './pages/SettingsPage';

const App = () => {
  const { setUser } = useAuthStore();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          displayName: user.displayName || '사용자',
          email: user.email || '',
          photoURL: user.photoURL || undefined
        });
      } else {
        setUser(null);
      }
    });
    
    return () => unsubscribe();
  }, [setUser]);
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <SelectPage />
          </ProtectedRoute>
        } />
        
        <Route path="/record" element={
          <ProtectedRoute>
            <RecordPage />
          </ProtectedRoute>
        } />
        
        <Route path="/feedback" element={
          <ProtectedRoute>
            <FeedbackPage />
          </ProtectedRoute>
        } />
        
        <Route path="/graph" element={
          <ProtectedRoute>
            <GraphPage />
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
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
