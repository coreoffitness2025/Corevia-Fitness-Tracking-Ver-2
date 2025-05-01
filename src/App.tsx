import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SelectPage from './pages/SelectPage';
import RecordPage from './pages/RecordPage';
import FeedbackPage from './pages/FeedbackPage';
import GraphPage from './pages/GraphPage';
import QnaPage from './pages/QnaPage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* /login 라우트 삭제 */}
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
        {/* 잘못된 경로는 / 로 돌려보냄 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
