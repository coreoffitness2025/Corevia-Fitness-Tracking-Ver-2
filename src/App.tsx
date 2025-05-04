import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SelectPage from './pages/SelectPage';
import WorkoutPage from './pages/WorkoutPage';
import FeedbackPage from './pages/FeedbackPage';
import WorkoutRecordPage from './pages/WorkoutRecordPage';
import QnaPage from './pages/QnaPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import FoodLogPage from './pages/FoodLogPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import BottomNavBar from './components/layout/BottomNavBar';

function App() {
  return (
    <AuthProvider>
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
                path="/workout"
                element={
                  <ProtectedRoute>
                    <WorkoutPage />
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
                path="/workout-record"
                element={
                  <ProtectedRoute>
                    <WorkoutRecordPage />
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
              
              {/* 식단 기록 페이지 */}
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
            <BottomNavBar />
          </Router>
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
