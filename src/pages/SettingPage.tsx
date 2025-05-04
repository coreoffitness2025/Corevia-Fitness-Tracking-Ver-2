import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import toast from 'react-hot-toast';
import { UserSettings } from '../types';

const SettingPage = () => {
  const { currentUser, userProfile, logout, updateSettings } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>({
    darkMode: false,
    notifications: {
      workoutReminder: true,
      mealReminder: true,
      progressUpdate: true
    },
    units: {
      weight: 'kg',
      height: 'cm'
    },
    language: 'ko'
  });

  useEffect(() => {
    if (userProfile?.settings) {
      setSettings(userProfile.settings);
    }
  }, [userProfile]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('로그아웃되었습니다.');
      navigate('/login');
    } catch (error) {
      toast.error('로그아웃에 실패했습니다.');
      console.error('로그아웃 실패:', error);
    }
  };

  const handleSettingChange = async (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await updateSettings(newSettings);
  };

  const handleNotificationChange = async (key: keyof UserSettings['notifications'], value: boolean) => {
    const newNotifications = { ...settings.notifications, [key]: value };
    const newSettings = { ...settings, notifications: newNotifications };
    setSettings(newSettings);
    await updateSettings(newSettings);
  };

  const handleUnitChange = async (key: keyof UserSettings['units'], value: 'kg' | 'lbs' | 'cm' | 'ft') => {
    const newUnits = { ...settings.units, [key]: value };
    const newSettings = { ...settings, units: newUnits };
    setSettings(newSettings);
    await updateSettings(newSettings);
  };

  if (!currentUser) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600 dark:text-gray-400">로그인이 필요합니다.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">설정</h1>

        <div className="space-y-6">
          {/* 테마 설정 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">테마 설정</h2>
            <div className="flex items-center justify-between">
              <span>다크 모드</span>
              <button
                onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
                className={`px-4 py-2 rounded ${
                  settings.darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {settings.darkMode ? '켜짐' : '꺼짐'}
              </button>
            </div>
          </div>

          {/* 알림 설정 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">알림 설정</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>운동 알림</span>
                <button
                  onClick={() => handleNotificationChange('workoutReminder', !settings.notifications.workoutReminder)}
                  className={`px-4 py-2 rounded ${
                    settings.notifications.workoutReminder ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {settings.notifications.workoutReminder ? '켜짐' : '꺼짐'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>식사 알림</span>
                <button
                  onClick={() => handleNotificationChange('mealReminder', !settings.notifications.mealReminder)}
                  className={`px-4 py-2 rounded ${
                    settings.notifications.mealReminder ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {settings.notifications.mealReminder ? '켜짐' : '꺼짐'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>진행 상황 알림</span>
                <button
                  onClick={() => handleNotificationChange('progressUpdate', !settings.notifications.progressUpdate)}
                  className={`px-4 py-2 rounded ${
                    settings.notifications.progressUpdate ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {settings.notifications.progressUpdate ? '켜짐' : '꺼짐'}
                </button>
              </div>
            </div>
          </div>

          {/* 언어 설정 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">언어 설정</h2>
            <div className="flex items-center justify-between">
              <span>언어</span>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value as 'ko' | 'en')}
                className="px-4 py-2 rounded border"
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* 단위 설정 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">단위 설정</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>무게 단위</span>
                <select
                  value={settings.units.weight}
                  onChange={(e) => handleUnitChange('weight', e.target.value as 'kg' | 'lbs')}
                  className="px-4 py-2 rounded border"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span>키 단위</span>
                <select
                  value={settings.units.height}
                  onChange={(e) => handleUnitChange('height', e.target.value as 'cm' | 'ft')}
                  className="px-4 py-2 rounded border"
                >
                  <option value="cm">cm</option>
                  <option value="ft">ft</option>
                </select>
              </div>
            </div>
          </div>

          {/* 로그아웃 버튼 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingPage; 