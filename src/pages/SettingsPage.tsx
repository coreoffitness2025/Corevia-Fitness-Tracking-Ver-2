import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Layout from '../components/common/Layout';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { UserProfile } from '../types';
import Card from '../components/common/Card';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [userProfile, setUserProfile] = useState<Partial<UserProfile> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as Partial<UserProfile>);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleLogout = async () => {
    logout();
    navigate('/login');
  };

  // 메인 운동 이름 가져오기
  const getMainExerciseName = (key: string | undefined) => {
    if (!key) return '설정되지 않음';
    
    const exerciseNames: Record<string, string> = {
      // 가슴 운동
      'benchPress': '벤치 프레스',
      'inclineBenchPress': '인클라인 벤치 프레스',
      'declineBenchPress': '디클라인 벤치 프레스',
      // 등 운동
      'deadlift': '데드리프트',
      'pullUp': '턱걸이',
      'bentOverRow': '벤트오버 로우',
      // 어깨 운동
      'overheadPress': '오버헤드 프레스',
      'lateralRaise': '레터럴 레이즈',
      'facePull': '페이스 풀',
      // 하체 운동
      'squat': '스쿼트',
      'legPress': '레그 프레스',
      'lungue': '런지',
      // 이두 운동
      'dumbbellCurl': '덤벨 컬',
      'barbelCurl': '바벨 컬',
      'hammerCurl': '해머 컬',
      // 삼두 운동
      'cablePushdown': '케이블 푸시다운',
      'overheadExtension': '오버헤드 익스텐션',
      'lyingExtension': '라잉 익스텐션'
    };
    
    return exerciseNames[key] || key;
  };

  // 세트 구성 설명 가져오기
  const getSetConfigDescription = (config: string | undefined) => {
    if (!config) return '설정되지 않음';
    
    const configDesc: Record<string, string> = {
      '5x5': '5세트 5회 (강도: 중상)',
      '10x5': '10세트 5회 (강도: 상)',
      '6x5': '6세트 5회 (강도: 중)',
      'custom': '커스텀 설정'
    };
    
    return configDesc[config] || config;
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
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || '사용자'}
                className="w-12 h-12 rounded-full mr-4"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold mr-4">
                {user?.displayName?.[0] || 'U'}
              </div>
            )}

            <div>
              <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                {user?.displayName || '사용자'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* 개인화 설정 정보 표시 */}
        {!isLoading && userProfile && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
              운동 개인화 설정
            </h3>
            
            <div className="space-y-4">
              {/* 신체 정보 */}
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
              
              {/* 목표 및 활동 수준 */}
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
                    {userProfile.activityLevel === 'low' && '낮음'}
                    {userProfile.activityLevel === 'moderate' && '보통'}
                    {userProfile.activityLevel === 'high' && '높음'}
                    {!userProfile.activityLevel && '설정되지 않음'}
                  </p>
                </div>
              </div>
              
              {/* 메인 운동 설정 */}
              {userProfile.preferredExercises && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">메인 운동 선택</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">가슴</p>
                      <p className="font-medium">{getMainExerciseName(userProfile.preferredExercises.chest)}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">등</p>
                      <p className="font-medium">{getMainExerciseName(userProfile.preferredExercises.back)}</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">어깨</p>
                      <p className="font-medium">{getMainExerciseName(userProfile.preferredExercises.shoulder)}</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">하체</p>
                      <p className="font-medium">{getMainExerciseName(userProfile.preferredExercises.leg)}</p>
                    </div>
                    <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">이두</p>
                      <p className="font-medium">{getMainExerciseName(userProfile.preferredExercises.biceps)}</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">삼두</p>
                      <p className="font-medium">{getMainExerciseName(userProfile.preferredExercises.triceps)}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 세트 구성 */}
              {userProfile.setConfiguration && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">세트 구성</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <p className="text-gray-500 dark:text-gray-400">선호하는 세트 구성</p>
                      <p className="font-medium">{getSetConfigDescription(userProfile.setConfiguration.preferredSetup)}</p>
                    </div>
                    
                    {userProfile.setConfiguration.preferredSetup === 'custom' && (
                      <div className="mt-2 flex justify-between">
                        <p className="text-gray-500 dark:text-gray-400">커스텀 설정</p>
                        <p className="font-medium">
                          {userProfile.setConfiguration.customSets || 0}세트 x {userProfile.setConfiguration.customReps || 0}회
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* 1RM 정보 */}
              {userProfile.oneRepMax && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">1RM (최대 중량)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">벤치 프레스</p>
                      <p className="font-medium">{userProfile.oneRepMax.bench || 0} kg</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">스쿼트</p>
                      <p className="font-medium">{userProfile.oneRepMax.squat || 0} kg</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">데드리프트</p>
                      <p className="font-medium">{userProfile.oneRepMax.deadlift || 0} kg</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">오버헤드 프레스</p>
                      <p className="font-medium">{userProfile.oneRepMax.overheadPress || 0} kg</p>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => navigate('/login')}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                개인화 설정 변경
              </button>
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          <button
            onClick={handleLogout}
            className="w-full text-left px-6 py-4 text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
          >
            로그아웃
          </button>

          <a
            href="https://corevia.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-6 py-4 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            개인정보 처리방침
          </a>

          <a
            href="https://corevia.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-6 py-4 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            이용약관
          </a>
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
    </Layout>
  );
};

export default SettingsPage;
