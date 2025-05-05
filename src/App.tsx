import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import WorkoutPage from './pages/WorkoutPage'; // 운동 목록/입력 통합
import WorkoutDetailPage from './pages/WorkoutDetailPage';
import WorkoutNewPage from './pages/WorkoutNewPage';
import WorkoutEditPage from './pages/WorkoutEditPage';
import WorkoutStartPage from './pages/WorkoutStartPage';
import WorkoutResultPage from './pages/WorkoutResultPage';
import WorkoutRecordPage from './pages/WorkoutRecordPage'; // 운동 기록 (운동 일지)
import FoodLogPage from './pages/FoodLogPage'; // 식단 목록 
import FoodRecordPage from './pages/FoodRecordPage'; // 식단 기록
import QnaPage from './pages/QnaPage';
import SettingPage from './pages/SettingPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import BottomNavBar from './components/common/BottomNavBar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background pb-16">
      <main>
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <Layout>
          <Routes>
            {/* Home */}
            <Route path="/" element={<HomePage />} />
            
            {/* Profile */}
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Workout Routes */}
            <Route path="/workout" element={<WorkoutRecordPage />} /> {/* 운동 일지/기록 */}
            <Route path="/workout/:id" element={<WorkoutDetailPage />} />
            <Route path="/workout/new" element={<WorkoutNewPage />} />
            <Route path="/workout/:id/edit" element={<WorkoutEditPage />} />
            <Route path="/workout/:id/start" element={<WorkoutStartPage />} />
            <Route path="/workout/:id/result" element={<WorkoutResultPage />} />
            
            {/* Food Routes */}
            <Route path="/food" element={<FoodRecordPage />} /> {/* 식단 기록이 메인 */}
            <Route path="/food/history" element={<FoodLogPage />} /> {/* 식단 기록 내역 */}
            
            {/* Q&A */}
            <Route path="/qna" element={<QnaPage />} />
            
            {/* Settings */}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/:tab" element={<SettingPage />} />
            
            {/* 404 Must be at the end */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </ThemeProvider>
    </Router>
  );
}

export default App;
