import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/common/Layout';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { UserProfile, UserSettings } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PersonalizationModal from '../components/auth/PersonalizationModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { LogOut, Settings, FileText, Info } from 'lucide-react';
import WorkoutSetConfig from '../components/settings/WorkoutSetConfig';
import { toast } from 'react-hot-toast';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    userProfile: authUserProfile, 
    userSettings: authUserSettings,
    logout, 
    updateProfile, 
    updateSettings
  } = useAuth();
  
  const [userProfile, setUserProfileState] = useState<Partial<UserProfile> | null>(null);
  const [currentSettings, setCurrentSettings] = useState<UserSettings | null>(authUserSettings);

  const [isLoading, setIsLoading] = useState(true);
  const [isPersonalizationModalOpen, setIsPersonalizationModalOpen] = useState(false);

  useEffect(() => {
    if (authUserProfile) {
      setUserProfileState(authUserProfile);
    }
    if (authUserSettings) {
      setCurrentSettings(authUserSettings);
    }
    setIsLoading(false); 
  }, [authUserProfile, authUserSettings]);

  const handleAppSettingChange = async (key: keyof UserSettings, value: any) => {
    if (!currentSettings) return;
    const newAppSettings = { ...currentSettings, [key]: value };
    try {
      await updateSettings(newAppSettings);
      setCurrentSettings(newAppSettings);
      toast.success('설정이 저장되었습니다.');
    } catch (error) {
      toast.error('설정 저장에 실패했습니다.');
      console.error('앱 설정 저장 실패:', error);
    }
  };

  const handleNotificationSettingChange = async (key: keyof UserSettings['notifications'], value: boolean) => {
    if (!currentSettings) return;
    const newNotifications = { ...currentSettings.notifications, [key]: value };
    const newAppSettings = { ...currentSettings, notifications: newNotifications };
    try {
      await updateSettings(newAppSettings);
      setCurrentSettings(newAppSettings);
      toast.success('알림 설정이 저장되었습니다.');
    } catch (error) {
      toast.error('알림 설정 저장에 실패했습니다.');
    }
  };

  const handleUnitSettingChange = async (key: keyof UserSettings['units'], value: 'kg' | 'lbs' | 'cm' | 'ft') => {
    if (!currentSettings) return;
    const newUnits = { ...currentSettings.units, [key]: value };
    const newAppSettings = { ...currentSettings, units: newUnits };
    try {
      await updateSettings(newAppSettings);
      setCurrentSettings(newAppSettings);
      toast.success('단위 설정이 저장되었습니다.');
    } catch (error) {
      toast.error('단위 설정 저장에 실패했습니다.');
    }
  };
  
  const handleSavePersonalization = async (profileDataToSave: Partial<UserProfile>) => {
    try {
      if (currentUser?.uid) {
        await updateProfile(profileDataToSave);
        setIsPersonalizationModalOpen(false);
        toast.success('개인 정보가 성공적으로 저장되었습니다.');
      } else {
        toast.error('로그인 후 설정을 저장할 수 있습니다.');
      }
    } catch (error) {
      console.error('Error saving personalization settings:', error);
      toast.error('개인 정보 저장 중 오류가 발생했습니다.');
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 중 오류가 발생했습니다:', error);
      toast.error('로그아웃 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }
  
  const displaySettings = currentSettings || {
    darkMode: false,
    notifications: { workoutReminder: true, mealReminder: true, progressUpdate: true },
    units: { weight: 'kg', height: 'cm' },
    language: 'ko'
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          설정
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || '사용자'}
                className="w-12 h-12 rounded-full mr-4"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold mr-4">
                {currentUser?.displayName?.[0] || 'U'}
              </div>
            )}

            <div>
              <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                {currentUser?.displayName || '로그인하지 않음'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{currentUser?.email || '로그인하여 설정을 저장하세요'}</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
              기본 정보 설정
            </h3>
            <Button
              onClick={() => setIsPersonalizationModalOpen(true)}
              variant="primary"
              size="md"
            >
              기본 정보 변경
            </Button>
          </div>
          
          {!isLoading && userProfile && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">신장</p>
                  <p className="font-medium">{userProfile.height || '설정되지 않음'} cm</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">체중</p>
                  <p className="font-medium">{userProfile.weight || '설정되지 않음'} kg</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">나이</p>
                  <p className="font-medium">{userProfile.age || '설정되지 않음'}세</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">피트니스 목표</p>
                  <p className="font-medium">
                    {userProfile.fitnessGoal === 'loss' && '체중 감소'}
                    {userProfile.fitnessGoal === 'maintain' && '체중 유지'}
                    {userProfile.fitnessGoal === 'gain' && '체중 증가'}
                    {!userProfile.fitnessGoal && '설정되지 않음'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">활동 수준</p>
                  <p className="font-medium">
                    {userProfile.activityLevel === 'sedentary' && '거의 안함 (좌식생활)'}
                    {userProfile.activityLevel === 'light' && '가벼운 활동 (주 1-3회 운동)'}
                    {userProfile.activityLevel === 'moderate' && '보통 활동 (주 3-5회 운동)'}
                    {userProfile.activityLevel === 'active' && '활동적 (주 6-7회 운동)'}
                    {userProfile.activityLevel === 'veryActive' && '매우 활동적 (하루 2회 이상 운동)'}
                    {!userProfile.activityLevel && '설정되지 않음'}
                  </p>
                </div>
              </div>
              
              {userProfile.targetCalories !== undefined && (
                <div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">일일 목표 칼로리</p>
                    <p className="font-medium">{isNaN(userProfile.targetCalories) ? '목표 칼로리를 설정해주세요' : `${userProfile.targetCalories} kcal`}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {!isLoading && !userProfile && (
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400 mb-4">아직 설정된 개인화 정보가 없습니다.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">개인화 설정을 통해 더 맞춤형 경험을 제공받을 수 있습니다.</p>
            </div>
          )}
        </div>
        
        {!isLoading && userProfile && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                운동 세트 설정
              </h3>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                메인 운동의 세트와 반복 횟수를 설정합니다. 선택한 세트 구성은 운동 입력 화면에 자동으로 반영됩니다.
                5x5, 10x5, 15x5, 6x3 세트 중 목표에 맞는 구성을 선택하세요.
              </p>
            </div>
            
            <WorkoutSetConfig />
          </div>
        )}

        {!isLoading && (
          <>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                테마 설정
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">다크 모드</span>
                <button
                  onClick={() => handleAppSettingChange('darkMode', !displaySettings.darkMode)}
                  className={`px-4 py-2 rounded font-medium transition-colors duration-150 ease-in-out ${
                    displaySettings.darkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {displaySettings.darkMode ? '켜짐' : '꺼짐'}
                </button>
              </div>
            </div>

            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                알림 설정
              </h3>
              <div className="space-y-4">
                {[
                  { key: 'workoutReminder', label: '운동 알림' },
                  { key: 'mealReminder', label: '식사 알림' },
                  { key: 'progressUpdate', label: '진행 상황 알림' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                    <button
                      onClick={() => handleNotificationSettingChange(item.key as keyof UserSettings['notifications'], !displaySettings.notifications[item.key as keyof UserSettings['notifications']])}
                      className={`px-4 py-2 rounded font-medium transition-colors duration-150 ease-in-out ${
                        displaySettings.notifications[item.key as keyof UserSettings['notifications']] 
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                          : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {displaySettings.notifications[item.key as keyof UserSettings['notifications']] ? '켜짐' : '꺼짐'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                언어 설정
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">언어</span>
                <select
                  value={displaySettings.language}
                  onChange={(e) => handleAppSettingChange('language', e.target.value as 'ko' | 'en')}
                  className="block w-auto px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100"
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                단위 설정
              </h3>
              <div className="space-y-4">
                {[
                  { key: 'weight', label: '무게 단위', options: [{value: 'kg', label: 'kg'}, {value: 'lbs', label: 'lbs'}] },
                  { key: 'height', label: '키 단위', options: [{value: 'cm', label: 'cm'}, {value: 'ft', label: 'ft'}] },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                    <select
                      value={displaySettings.units[item.key as keyof UserSettings['units']]}
                      onChange={(e) => handleUnitSettingChange(item.key as keyof UserSettings['units'], e.target.value as any)}
                      className="block w-auto px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100"
                    >
                      {item.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
              계정 관리
            </h3>
            <Button
              onClick={handleLogout}
              variant="danger"
              size="md"
              icon={<LogOut size={18} />}
              className="w-full md:w-auto"
            >
              로그아웃
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
              법적 정보
            </h3>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/legal/privacy')}
                variant="text"
                size="md"
                icon={<FileText size={18} />}
                className="w-full text-left justify-start"
              >
                개인정보처리방침
              </Button>
              <Button
                onClick={() => navigate('/legal/terms')}
                variant="text"
                size="md"
                icon={<FileText size={18} />}
                className="w-full text-left justify-start"
              >
                이용약관
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
          앱 정보
        </h3>

        <div className="space-y-2 text-gray-600 dark:text-gray-400">
          <p>Corevia Training Tracker</p>
          <p>버전: 1.0.0</p>
          <p>© 2025 Corevia. All rights reserved.</p>
        </div>
      </div>
      
      <PersonalizationModal
        isOpen={isPersonalizationModalOpen}
        onClose={() => setIsPersonalizationModalOpen(false)}
        onSave={handleSavePersonalization}
        userProfile={userProfile}
      />
    </Layout>
  );
};

export default SettingsPage;
