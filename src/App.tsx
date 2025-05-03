import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SelectPage from './pages/SelectPage';
import RecordPage from './pages/RecordPage';
import FeedbackPage from './pages/FeedbackPage';
import GraphPage from './pages/GraphPage';
import QnaPage from './pages/QnaPage';
import SettingsPage from './pages/SettingsPage';
import AdminFaqPage from './pages/AdminFaqPage'; // 관리자 FAQ 페이지 추가
import LoginPage from './pages/LoginPage'; // 로그인 페이지 추가
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';

// 관리자 라우트를 위한 컴포넌트
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const auth = getAuth();
  const [user, loading] = useAuthState(auth);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }
  
  // 로그인 상태 확인
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // 관리자 권한 확인 (이메일 도메인 또는 다른 방식으로 확인)
  // 실제 구현에서는 Firebase Custom Claims 등으로 더 안전하게 구현 권장
  if (!user.email?.endsWith('@admin.com')) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 기존 사용자 라우트 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <SelectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/record"
          element={
            <ProtectedRoute>
              <RecordPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <FeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/graph"
          element={
            <ProtectedRoute>
              <GraphPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/qna"
          element={
            <ProtectedRoute>
              <QnaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        
        {/* 로그인 페이지 */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* 관리자 페이지 */}
        <Route
          path="/admin/faq"
          element={
            <AdminRoute>
              <AdminFaqPage />
            </AdminRoute>
          }
        />
        
        {/* 잘못된 경로는 / 로 돌려보냄 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
