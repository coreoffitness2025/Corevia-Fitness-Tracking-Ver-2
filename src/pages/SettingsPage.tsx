import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/common/Layout';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { UserProfile } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PersonalizationModal from '../components/auth/PersonalizationModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { LogOut, Settings, FileText, Info } from 'lucide-react';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile: authUserProfile, logout, updateProfile } = useAuth();
  const [userSettings, setUserSettings] = useState<Partial<UserProfile> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPersonalizationModalOpen, setIsPersonalizationModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserSettings(userDoc.data() as Partial<UserProfile>);
          } else if (authUserProfile) {
            // 파이어스토어에 문서가 없지만 AuthContext에 userProfile이 있는 경우
            setUserSettings(authUserProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // 로딩 상태 해제
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser, authUserProfile]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 중 오류가 발생했습니다:', error);
    }
  };

  // 개인화 설정 저장 핸들러
  const handleSavePersonalization = async (profile: Partial<UserProfile>) => {
    try {
      console.log('개인화 설정 저장 시도:', profile);
      
      // 로그인한 사용자인 경우 파이어스토어에 저장
      if (currentUser?.uid) {
        // context의 updateProfile 사용 (이것이 AuthContext 내부에서 Firestore 업데이트 처리)
        await updateProfile(profile);
        console.log('개인화 설정 저장 성공');
        
        // 로컬 상태 업데이트
        setUserSettings(prev => ({...prev, ...profile}));
        setIsPersonalizationModalOpen(false);
        
        // 성공 메시지
        alert('설정이 성공적으로 저장되었습니다.');
      } else {
        console.error('로그인된 사용자가 없습니다.');
        alert('로그인 후 설정을 저장할 수 있습니다.');
      }
    } catch (error) {
      console.error('Error saving personalization settings:', error);
      alert('설정을 저장하는 중 오류가 발생했습니다.');
    }
  };

  // 전체 로딩 중이면 로딩 표시
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

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

  // 사용자 프로필 데이터 (AuthContext의 userProfile과 파이어스토어에서 불러온 데이터 병합)
  const userProfile = userSettings || authUserProfile;

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

        {/* 개인화 설정 정보 표시 */}
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
                    {userProfile.activityLevel === 'sedentary' && '거의 안함 (좌식생활)'}
                    {userProfile.activityLevel === 'light' && '가벼운 활동 (주 1-3회 운동)'}
                    {userProfile.activityLevel === 'moderate' && '보통 활동 (주 3-5회 운동)'}
                    {userProfile.activityLevel === 'active' && '활동적 (주 6-7회 운동)'}
                    {userProfile.activityLevel === 'veryActive' && '매우 활동적 (하루 2회 이상 운동)'}
                    {!userProfile.activityLevel && '설정되지 않음'}
                  </p>
                </div>
              </div>
              
              {/* 목표 칼로리 정보 */}
              {userProfile.targetCalories !== undefined && (
                <div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">일일 목표 칼로리</p>
                    <p className="font-medium">{isNaN(userProfile.targetCalories) ? '목표 칼로리를 설정해주세요' : `${userProfile.targetCalories} kcal`}</p>
                  </div>
                </div>
              )}
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    운동 세부 설정
                  </h3>
                  <Button
                    onClick={() => navigate('/workout/guide')}
                    variant="primary"
                    size="md"
                  >
                    운동 설정 구성하기
                  </Button>
                </div>
                
                {/* 운동 세부 정보 안내 */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    이 섹션에서는 운동 관련 세부 설정(메인 운동 선택, 1RM, 세트 구성 등)을 관리할 수 있습니다.
                    세부 설정은 '운동 설정 구성하기' 버튼을 통해 한번에 진행할 수 있습니다.
                  </p>
                </div>
                
                {/* 메인 운동 설정 */}
                {userProfile.preferredExercises && (
                  <div className="mb-6">
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
                
                {/* 1RM 정보 */}
                {userProfile.oneRepMax && (
                  <div className="mb-6">
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
                
                {/* 세트 구성 정보 */}
                {userProfile.setConfiguration && (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">세트 구성 설정</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">선호하는 세트 구성</p>
                      <p className="font-medium">{getSetConfigDescription(userProfile.setConfiguration.preferredSetup)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {!isLoading && !userProfile && (
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400 mb-4">아직 설정된 개인화 정보가 없습니다.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">개인화 설정을 통해 더 맞춤형 경험을 제공받을 수 있습니다.</p>
            </div>
          )}
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {currentUser && (
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="md"
              className="w-full text-left px-6 py-4 text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
              icon={<LogOut size={16} />}
            >
              로그아웃
            </Button>
          )}

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
      
      {/* 개인화 모달 */}
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
