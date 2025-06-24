import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/common/Layout';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { db } from '../firebase/firebaseConfig';
import { UserProfile, UserSettings } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PersonalizationModal from '../components/auth/PersonalizationModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { LogOut, Settings, FileText, Info, TrendingUp, X, Trash2 } from 'lucide-react';
import WorkoutSetConfig from '../components/settings/WorkoutSetConfig';
import { toast } from 'react-hot-toast';
import InfoItem from '../components/common/InfoItem';
import SyncToggle from '../components/common/SyncToggle';

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
  
  // 체중 추이 분석 관련 상태
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightHistory, setWeightHistory] = useState<Array<{
    date: Date;
    weight: number;
  }>>([]);
  const [isLoadingWeightHistory, setIsLoadingWeightHistory] = useState(false);

  // 회원탈퇴 관련 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (authUserProfile) {
      setUserProfileState(authUserProfile);
    }
    if (authUserSettings) {
      setCurrentSettings(authUserSettings);
    }
    
    setIsLoading(false); 
  }, [authUserProfile, authUserSettings, currentUser?.uid]);

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

  // 체중 기록 조회 함수
  const fetchWeightHistory = async () => {
    if (!currentUser) return;
    
    setIsLoadingWeightHistory(true);
    try {
      const q = query(
        collection(db, 'weightRecords'),
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc'),
        limit(30) // 최근 30개 기록
      );
      
      const querySnapshot = await getDocs(q);
      const records = querySnapshot.docs.map(doc => ({
        date: doc.data().date.toDate(),
        weight: doc.data().weight
      }));
      
      setWeightHistory(records);
    } catch (error) {
      console.error('체중 기록 조회 중 오류:', error);
      toast.error('체중 기록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingWeightHistory(false);
    }
  };

  // 회원탈퇴 함수
  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    
    if (deleteConfirmText !== '회원탈퇴') {
      toast.error('확인 문구를 정확히 입력해주세요.');
      return;
    }
    
    setIsDeleting(true);
    try {
      // 1. Firestore에서 모든 사용자 데이터 삭제
      const collections = [
        'users',
        'userSettings', 
        'workouts',
        'workoutRecords',
        'weightRecords',
        'bodyChecks',
        'dietLogs'
      ];
      
      for (const collectionName of collections) {
        if (collectionName === 'workouts' || 
            collectionName === 'workoutRecords' || 
            collectionName === 'weightRecords' ||
            collectionName === 'bodyChecks' ||
            collectionName === 'dietLogs') {
          // userId 필드로 필터링되는 컬렉션들
          const q = query(
            collection(db, collectionName),
            where('userId', '==', currentUser.uid)
          );
          const querySnapshot = await getDocs(q);
          
          for (const docSnapshot of querySnapshot.docs) {
            await deleteDoc(docSnapshot.ref);
          }
        } else {
          // 사용자 ID를 문서 ID로 사용하는 컬렉션들
          const docRef = doc(db, collectionName, currentUser.uid);
          const docSnapshot = await getDoc(docRef);
          if (docSnapshot.exists()) {
            await deleteDoc(docRef);
          }
        }
      }
      
      // 2. Firebase Auth에서 사용자 계정 삭제
      await deleteUser(currentUser);
      
      toast.success('회원탈퇴가 완료되었습니다.');
      navigate('/auth');
      
    } catch (error: any) {
      console.error('회원탈퇴 중 오류:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error('보안을 위해 최근에 로그인한 사용자만 탈퇴할 수 있습니다. 다시 로그인 후 시도해주세요.');
        logout();
        navigate('/auth');
      } else {
        toast.error('회원탈퇴 중 오류가 발생했습니다.');
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmText('');
    }
  };

  // 체중 추이 분석 버튼 클릭 핸들러
  const handleWeightTrendClick = () => {
    setShowWeightModal(true);
    fetchWeightHistory();
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
  
  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-2 sm:px-4 py-4 sm:py-8 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
          설정
        </h1>

        {/* 프로필 정보 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || '사용자'}
                className="w-12 h-12 rounded-full mr-4"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold mr-4 flex-shrink-0">
                {currentUser?.displayName?.[0] || 'U'}
              </div>
            )}
            <div className="flex-grow">
              <h2 className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 truncate">
                {currentUser?.displayName || '로그인 필요'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{currentUser?.email || '로그인하여 설정을 저장하세요'}</p>
            </div>
          </div>
        </div>

        {/* 기본 정보 설정 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-0">
              기본 정보
            </h3>
            <Button
              onClick={() => setIsPersonalizationModalOpen(true)}
              variant="primary"
              size="sm"
            >
              기본 정보 변경
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-sm">
            <InfoItem label="신장" value={userProfile?.height ? `${userProfile.height} cm` : '미설정'} />
            <InfoItem label="체중" value={userProfile?.weight ? `${userProfile.weight} kg` : '미설정'} />
            <InfoItem label="나이" value={userProfile?.age ? `${userProfile.age} 세` : '미설정'} />
            <InfoItem label="성별" value={userProfile?.gender === 'male' ? '남성' : '여성'} />
            <InfoItem label="피트니스 목표" value={userProfile?.fitnessGoal === 'loss' ? '체중 감소' : userProfile?.fitnessGoal === 'maintain' ? '체중 유지' : '체중 증가'} />
            <InfoItem label="활동 수준" value={userProfile?.activityLevel === 'sedentary' ? '거의 안함' : userProfile?.activityLevel === 'light' ? '가벼운 활동' : userProfile?.activityLevel === 'moderate' ? '보통' : userProfile?.activityLevel === 'active' ? '활동적' : '매우 활동적'} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
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
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">체중</p>
                        <p className="font-medium">{userProfile.weight || '설정되지 않음'} kg</p>
                      </div>
                      {userProfile.weight && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleWeightTrendClick}
                          icon={<TrendingUp size={16} />}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-600 dark:hover:bg-blue-900/20"
                        >
                          추이
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">나이</p>
                    <p className="font-medium">{userProfile.age || '설정되지 않음'}세</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">성별</p>
                    <p className="font-medium">
                      {userProfile.gender === 'male' && '남성'}
                      {userProfile.gender === 'female' && '여성'}
                      {!userProfile.gender && '설정되지 않음'}
                    </p>
                  </div>
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
        </div>
        
        {/* 운동 세트 설정 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            운동 세트 설정
          </h3>
          <WorkoutSetConfig />
        </div>
        
        {/* 계정 관리 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            계정 관리
          </h3>
          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleLogout}
            >
              로그아웃
            </Button>
            <Button
              variant="danger"
              className="w-full"
              onClick={() => setShowDeleteModal(true)}
            >
              회원탈퇴
            </Button>
          </div>
        </div>

        {/* 법적 정보 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            법적 정보
          </h3>
          <div className="space-y-2">
            <Button
              onClick={() => navigate('/legal/privacy')}
              variant="text"
              className="w-full justify-start"
            >
              개인정보처리방침
            </Button>
            <Button
              onClick={() => navigate('/legal/terms')}
              variant="text"
              className="w-full justify-start"
            >
              이용약관
            </Button>
          </div>
        </div>

      </div>
      
      <PersonalizationModal
        isOpen={isPersonalizationModalOpen}
        onClose={() => setIsPersonalizationModalOpen(false)}
        onSave={handleSavePersonalization}
        userProfile={userProfile}
      />
      
      {/* 체중 추이 분석 모달 */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">체중 변화 추이</h3>
              <button
                onClick={() => setShowWeightModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            {isLoadingWeightHistory ? (
              <div className="flex justify-center items-center h-48">
                <LoadingSpinner />
              </div>
            ) : weightHistory.length > 0 ? (
              <div className="space-y-6">
                {/* 체중 변화 그래프 */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">체중 변화 그래프</h4>
                  
                  {/* 간단한 선형 그래프 표현 */}
                  <div className="relative h-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                    <div className="absolute inset-4">
                      {/* Y축 라벨 */}
                      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
                        {(() => {
                          const weights = weightHistory.map(h => h.weight);
                          const minWeight = Math.min(...weights);
                          const maxWeight = Math.max(...weights);
                          const range = maxWeight - minWeight || 1;
                          return [
                            <span key="max">{maxWeight.toFixed(1)}kg</span>,
                            <span key="mid">{((maxWeight + minWeight) / 2).toFixed(1)}kg</span>,
                            <span key="min">{minWeight.toFixed(1)}kg</span>
                          ];
                        })()}
                      </div>
                      
                      {/* 그래프 영역 */}
                      <div className="ml-12 mr-4 h-full relative">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          {/* 그리드 라인 */}
                          <defs>
                            <pattern id="weight-grid" width="10" height="25" patternUnits="userSpaceOnUse">
                              <path d="M 10 0 L 0 0 0 25" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                            </pattern>
                          </defs>
                          <rect width="100" height="100" fill="url(#weight-grid)" />
                          
                          {/* 체중 변화 라인 */}
                          {weightHistory.length > 1 && (() => {
                            const weights = weightHistory.map(h => h.weight);
                            const minWeight = Math.min(...weights);
                            const maxWeight = Math.max(...weights);
                            const range = maxWeight - minWeight || 1;
                            
                            const points = weightHistory.map((record, index) => {
                              const x = (index / (weightHistory.length - 1)) * 100;
                              const y = 100 - ((record.weight - minWeight) / range) * 100;
                              return `${x},${y}`;
                            }).join(' ');
                            
                            return (
                              <>
                                <polyline
                                  fill="none"
                                  stroke="#3b82f6"
                                  strokeWidth="2"
                                  points={points}
                                />
                                {/* 데이터 포인트 */}
                                {weightHistory.map((record, index) => {
                                  const x = (index / (weightHistory.length - 1)) * 100;
                                  const y = 100 - ((record.weight - minWeight) / range) * 100;
                                  return (
                                    <circle
                                      key={index}
                                      cx={x}
                                      cy={y}
                                      r="2.5"
                                      fill="#3b82f6"
                                      stroke="#ffffff"
                                      strokeWidth="1"
                                    />
                                  );
                                })}
                              </>
                            );
                          })()}
                        </svg>
                      </div>
                      
                      {/* X축 라벨 (날짜) */}
                      <div className="absolute bottom-0 left-12 right-4 flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {weightHistory.length > 1 && (
                          <>
                            <span>{weightHistory[0]?.date.toLocaleDateString()}</span>
                            <span>{weightHistory[weightHistory.length - 1]?.date.toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* 통계 정보 */}
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {(() => {
                      const weights = weightHistory.map(h => h.weight);
                      const minWeight = Math.min(...weights);
                      const maxWeight = Math.max(...weights);
                      const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
                      const weightChange = weights[weights.length - 1] - weights[0];
                      
                      return (
                        <>
                          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="text-blue-600 dark:text-blue-400 font-semibold text-lg">{minWeight.toFixed(1)}kg</div>
                            <div className="text-gray-500 dark:text-gray-400">최저</div>
                          </div>
                          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="text-blue-600 dark:text-blue-400 font-semibold text-lg">{maxWeight.toFixed(1)}kg</div>
                            <div className="text-gray-500 dark:text-gray-400">최고</div>
                          </div>
                          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="text-blue-600 dark:text-blue-400 font-semibold text-lg">{avgWeight.toFixed(1)}kg</div>
                            <div className="text-gray-500 dark:text-gray-400">평균</div>
                          </div>
                          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className={`font-semibold text-lg ${weightChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                              {weightChange >= 0 ? '+' : ''}{weightChange.toFixed(1)}kg
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">전체 변화</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
                
                {/* 최근 기록 목록 */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">최근 기록</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {weightHistory.slice(-10).reverse().map((record, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">{record.date.toLocaleDateString()}</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{record.weight.toFixed(1)}kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">체중 기록이 없습니다</p>
                <p className="text-gray-400 dark:text-gray-500">운동 기록 페이지에서 체중을 기록해보세요.</p>
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <Button
                variant="primary"
                onClick={() => setShowWeightModal(false)}
                className="px-6 py-2"
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 회원탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
                ⚠️ 회원탈퇴
              </h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  <strong>주의:</strong> 회원탈퇴 시 다음 데이터가 영구적으로 삭제됩니다:
                </p>
                <ul className="list-disc list-inside mt-2 text-red-700 dark:text-red-300 text-sm space-y-1">
                  <li>개인 프로필 및 설정</li>
                  <li>모든 운동 기록</li>
                  <li>체중 기록 및 변화 추이</li>
                  <li>식단 기록 및 사진</li>
                  <li>바디 체크 사진</li>
                </ul>
                <p className="text-red-800 dark:text-red-200 text-sm mt-2">
                  <strong>삭제된 데이터는 복구할 수 없습니다.</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  탈퇴를 원하시면 아래에 <strong>"회원탈퇴"</strong>를 정확히 입력해주세요:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="회원탈퇴"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1"
                  disabled={isDeleting}
                >
                  취소
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteAccount}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  disabled={isDeleting || deleteConfirmText !== '회원탈퇴'}
                >
                  {isDeleting ? '탈퇴 중...' : '탈퇴하기'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SettingsPage;
