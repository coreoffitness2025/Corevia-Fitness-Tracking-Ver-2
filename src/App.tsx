import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import GraphPage from './pages/GraphPage'; // WorkoutPage 대신 GraphPage
import WorkoutDetailPage from './pages/WorkoutDetailPage';
import WorkoutNewPage from './pages/WorkoutNewPage';
import WorkoutEditPage from './pages/WorkoutEditPage';
import WorkoutStartPage from './pages/WorkoutStartPage';
import WorkoutResultPage from './pages/WorkoutResultPage';
import WorkoutRecordPage from './pages/WorkoutRecordPage';
import FoodLogPage from './pages/FoodLogPage';
import FoodRecordPage from './pages/FoodRecordPage';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
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
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Graph/운동일지 */}
            <Route path="/graph" element={<GraphPage />} />
            
            {/* Workout Routes */}
            <Route path="/workout" element={<WorkoutRecordPage />} />
            <Route path="/workout/:id" element={<WorkoutDetailPage />} />
            <Route path="/workout/new" element={<WorkoutNewPage />} />
            <Route path="/workout/:id/edit" element={<WorkoutEditPage />} />
            <Route path="/workout/:id/start" element={<WorkoutStartPage />} />
            <Route path="/workout/:id/result" element={<WorkoutResultPage />} />
            <Route path="/workout/record" element={<WorkoutRecordPage />} />
            
            {/* Food Routes */}
            <Route path="/foodlog" element={<FoodRecordPage />} />
            <Route path="/food" element={<FoodLogPage />} />
            <Route path="/food/record" element={<FoodRecordPage />} />
            
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
