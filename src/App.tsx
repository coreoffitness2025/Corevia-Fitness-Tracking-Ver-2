import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import WorkoutPage from './pages/WorkoutPage';
import WorkoutRecordPage from './pages/WorkoutRecordPage';
import FoodRecordPage from './pages/FoodRecordPage';
import QnaPage from './pages/QnaPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/auth/PrivateRoute';
import RegisterPage from './pages/RegisterPage';
import SettingPage from './pages/SettingPage';

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="/" element={<HomePage />} />
              <Route path="/workout" element={<WorkoutPage />} />
              <Route path="/workout-record" element={<WorkoutRecordPage />} />
              <Route path="/foodlog" element={<FoodRecordPage />} />
              <Route path="/qna" element={<QnaPage />} />
              <Route path="/settings" element={<SettingPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
