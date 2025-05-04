import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SelectPage from './pages/SelectPage';
import RecordPage from './pages/RecordPage';
import FeedbackPage from './pages/FeedbackPage';
import GraphPage from './pages/GraphPage';
import QnaPage from './pages/QnaPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import FoodLogPage from './pages/FoodLogPage'; // 새로 추가
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
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
            
            {/* 새로 추가한 FoodLogPage */}
            <Route
              path="/foodlog"
              element={
                <ProtectedRoute>
                  <FoodLogPage />
                </ProtectedRoute>
              }
            />
            
            {/* 로그인 페이지 */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* 잘못된 경로는 / 로 돌려보냄 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </div>
    </ThemeProvider>
  );
}
export default App;
