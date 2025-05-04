import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebaseService';
import toast from 'react-hot-toast';

interface AppSettings {
  darkMode: boolean;
  notifications: {
    workoutReminder: boolean;
    mealReminder: boolean;
    progressUpdate: boolean;
  };
  units: {
    weight: 'kg' | 'lbs';
    height: 'cm' | 'ft';
  };
  language: 'ko' | 'en';
}

const SettingPage = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: userProfile?.settings?.darkMode ?? false,
    notifications: {
      workoutReminder: userProfile?.settings?.notifications?.workoutReminder ?? true,
      mealReminder: userProfile?.settings?.notifications?.mealReminder ?? true,
      progressUpdate: userProfile?.settings?.notifications?.progressUpdate ?? true,
    },
    units: {
      weight: userProfile?.settings?.units?.weight ?? 'kg',
      height: userProfile?.settings?.units?.height ?? 'cm',
    },
    language: userProfile?.settings?.language ?? 'ko',
  });

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

  const handleSettingChange = async (key: keyof AppSettings, value: any) => {
    if (!currentUser) return;

    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        settings: newSettings,
      });

      toast.success('설정이 저장되었습니다.');
    } catch (error) {
      toast.error('설정 저장에 실패했습니다.');
      console.error('설정 저장 실패:', error);
    }
  };

  const handleNotificationChange = async (key: keyof AppSettings['notifications'], value: boolean) => {
    if (!currentUser) return;

    try {
      const newNotifications = { ...settings.notifications, [key]: value };
      const newSettings = { ...settings, notifications: newNotifications };
      setSettings(newSettings);

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        'settings.notifications': newNotifications,
      });

      toast.success('알림 설정이 저장되었습니다.');
    } catch (error) {
      toast.error('알림 설정 저장에 실패했습니다.');
      console.error('알림 설정 저장 실패:', error);
    }
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
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.darkMode}
                  onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* 알림 설정 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">알림 설정</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>운동 알림</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications.workoutReminder}
                    onChange={(e) => handleNotificationChange('workoutReminder', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span>식사 알림</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications.mealReminder}
                    onChange={(e) => handleNotificationChange('mealReminder', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span>진행 상황 알림</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications.progressUpdate}
                    onChange={(e) => handleNotificationChange('progressUpdate', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 단위 설정 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">단위 설정</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>무게 단위</span>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  value={settings.units.weight}
                  onChange={(e) => handleSettingChange('units', { ...settings.units, weight: e.target.value as 'kg' | 'lbs' })}
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span>키 단위</span>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  value={settings.units.height}
                  onChange={(e) => handleSettingChange('units', { ...settings.units, height: e.target.value as 'cm' | 'ft' })}
                >
                  <option value="cm">cm</option>
                  <option value="ft">ft</option>
                </select>
              </div>
            </div>
          </div>

          {/* 언어 설정 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">언어 설정</h2>
            <div className="flex items-center justify-between">
              <span>앱 언어</span>
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value as 'ko' | 'en')}
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
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