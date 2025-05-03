import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SelectPage from './pages/SelectPage';
import RecordPage from './pages/RecordPage';
import FeedbackPage from './pages/FeedbackPage';
import GraphPage from './pages/GraphPage';
import QnaPage from './pages/QnaPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage'; // 로그인 페이지만 추가
// import AdminFaqPage from './pages/AdminFaqPage'; // 주석 처리
import ProtectedRoute from './components/auth/ProtectedRoute';
// import { useAuthState } from 'react-firebase-hooks/auth'; // 주석 처리
// import { getAuth } from 'firebase/auth'; // 주석 처리

/*
// 관리자 라우트 - 나중에 추가
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  return children;
};
*/

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
        
        {/* 로그인 페이지 추가 */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* 관리자 페이지 - 나중에 추가 
        <Route
          path="/admin/faq"
          element={
            <AdminRoute>
              <AdminFaqPage />
            </AdminRoute>
          }
        />
        */}
        
        {/* 잘못된 경로는 / 로 돌려보냄 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
