import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import WorkoutRecordPage from './pages/WorkoutRecordPage';
import FoodLogPage from './pages/FoodLogPage';
import FoodRecordPage from './pages/FoodRecordPage';
import QnaPage from './pages/QnaPage';
import SettingPage from './pages/SettingPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

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

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/workout" element={<WorkoutPage />} />
              <Route path="/workout/:id" element={<WorkoutDetailPage />} />
              <Route path="/workout/new" element={<WorkoutNewPage />} />
              <Route path="/workout/:id/edit" element={<WorkoutEditPage />} />
              <Route path="/workout/:id/start" element={<WorkoutStartPage />} />
              <Route path="/workout/:id/result" element={<WorkoutResultPage />} />
              <Route path="/workout/record" element={<WorkoutRecordPage />} />
              <Route path="/food" element={<FoodLogPage />} />
              <Route path="/food/record" element={<FoodRecordPage />} />
              <Route path="/qna" element={<QnaPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/:tab" element={<SettingPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
