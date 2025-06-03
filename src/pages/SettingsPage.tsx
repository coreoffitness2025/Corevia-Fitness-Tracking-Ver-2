import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/common/Layout';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { UserProfile, UserSettings } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PersonalizationModal from '../components/auth/PersonalizationModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { LogOut, Settings, FileText, Info, TrendingUp, X } from 'lucide-react';
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
  
  // 체중 추이 분석 관련 상태
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightHistory, setWeightHistory] = useState<Array<{
    date: Date;
    weight: number;
  }>>([]);
  const [isLoadingWeightHistory, setIsLoadingWeightHistory] = useState(false);

  useEffect(() => {
    if (authUserProfile) {
      setUserProfileState(authUserProfile);
    }
    if (authUserSettings) {
      setCurrentSettings(authUserSettings);
    }
    setIsLoading(false); 
  }, [authUserProfile, authUserSettings]);

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

  // 체중 히스토리 가져오기 함수
  const fetchWeightHistory = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoadingWeightHistory(true);
      const q = query(
        collection(db, 'weightRecords'),
        where('userId', '==', currentUser.uid),
        limit(30) // 최근 30개 기록
      );
      
      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map(doc => ({
        date: doc.data().date.toDate(),
        weight: doc.data().weight
      }));
      
      // 클라이언트에서 날짜순으로 정렬
      history.sort((a, b) => a.date.getTime() - b.date.getTime());
      setWeightHistory(history);
    } catch (error) {
      console.error('체중 히스토리 로드 실패:', error);
      toast.error('체중 기록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingWeightHistory(false);
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
  
  const displaySettings = currentSettings || {
    units: { weight: 'kg', height: 'cm' }
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
    </Layout>
  );
};

export default SettingsPage;
