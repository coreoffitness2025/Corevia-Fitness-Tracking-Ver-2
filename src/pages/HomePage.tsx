import React, { useState, useEffect } from 'react';
import { Session, Food } from '../types';
import Layout from '../components/common/Layout';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import LoadingSpinner, { LoadingScreen } from '../components/common/LoadingSpinner';
import { UserProfile } from '../types';
import { TrendingUp, UserCircle, Zap, Target, BookOpen, CalendarDays, Utensils, Activity, Settings, X, Scale, Plus, Camera, User, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutSettings } from '../hooks/useWorkoutSettings';
import Button from '../components/common/Button';
import { getFoodRecords, FoodRecord } from '../utils/indexedDB';
import PersonalizationModal from '../components/auth/PersonalizationModal';
import BodyPhotoForm from '../components/body/BodyPhotoForm';
import BodyProgressView from '../components/body/BodyProgressView';
import { toast } from 'react-hot-toast';
import WeightRecordForm from '../components/body/WeightRecordForm';
import { formatDate, isToday } from '../utils/dateUtils';
import { getBodyPhotoRecords } from '../services/bodyService';

// 어제 날짜 구하기 함수
const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  return yesterday;
};

// NutritionGuide.tsx 또는 FoodForm.tsx의 매크로 계산 로직과 동일하게 정의
const calculateMacrosForHome = (targetCalories: number, weight_kg: number | undefined) => {
  if (!weight_kg || weight_kg <= 0) {
    // 체중 정보가 없으면 매크로 계산 불가 (또는 기본값 사용)
    return { protein: 0, carbs: 0, fat: 0, proteinPerMeal: 0, carbsPerMeal: 0, fatPerMeal: 0 };
  }
  const proteinGrams = Math.round(weight_kg * 1.6);
  const proteinCalories = proteinGrams * 4;
  const remainingCalories = Math.max(0, targetCalories - proteinCalories);
  const carbsCalories = Math.max(0, remainingCalories * 0.55);
  const fatCalories = Math.max(0, remainingCalories * 0.30);
  
  const protein = proteinGrams;
  const carbs = Math.round(carbsCalories / 4);
  const fat = Math.round(fatCalories / 9);

  return {
    protein,
    carbs,
    fat,
    proteinPerMeal: Math.round(protein / 3),
    carbsPerMeal: Math.round(carbs / 3),
    fatPerMeal: Math.round(fat / 3),
  };
};

// getYesterdayDate 함수를 getRecentDates로 수정
const getRecentDates = (daysCount = 7) => {
  const dates = [];
  for (let i = 0; i <= daysCount; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    dates.push(date);
  }
  return dates;
};

// 날짜별 식단 기록을 그룹화하는 함수 추가
const groupFoodsByDate = (foods: Food[]) => {
  const grouped: Record<string, Food[]> = {};
  
  foods.forEach(food => {
    // 날짜를 YYYY-MM-DD 형식의 문자열로 변환
    const dateStr = food.date instanceof Date
      ? food.date.toISOString().split('T')[0]
      : new Date(food.date).toISOString().split('T')[0];
    
    if (!grouped[dateStr]) {
      grouped[dateStr] = [];
    }
    
    grouped[dateStr].push(food);
  });
  
  return grouped;
};

const HomePage = () => {
  const { userProfile, loading: authLoading, updateProfile } = useAuth();
  const { settings: workoutSettings, isLoading: isLoadingSettings } = useWorkoutSettings();
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [recentMeals, setRecentMeals] = useState<Food[]>([]); // 어제 식단 -> 최근 식단
  const [groupedMeals, setGroupedMeals] = useState<Record<string, Food[]>>({}); // 날짜별 그룹화된 식단
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nutrients, setNutrients] = useState({ protein: 0, carbs: 0, fat: 0, proteinPerMeal: 0, carbsPerMeal: 0, fatPerMeal: 0 });
  
  // 신체 관련 상태변수들 (체중 → 신체 변화로 변경)
  const [showBodyProgressModal, setShowBodyProgressModal] = useState(false);
  const [showBodyPhotoModal, setShowBodyPhotoModal] = useState(false);
  const [showWeightRecordModal, setShowWeightRecordModal] = useState(false);
  const [weightHistory, setWeightHistory] = useState<Array<{
    date: Date;
    weight: number;
  }>>([]);
  const [isLoadingWeightHistory, setIsLoadingWeightHistory] = useState(false);
  const [bodyPhotoRecords, setBodyPhotoRecords] = useState<any[]>([]);
  const [isLoadingBodyPhotos, setIsLoadingBodyPhotos] = useState(false);
  
  const navigate = useNavigate();

  // 체중 히스토리 가져오기 함수
  const fetchWeightHistory = async () => {
    if (!userProfile) return;
    
    try {
      setIsLoadingWeightHistory(true);
      const q = query(
        collection(db, 'weightRecords'),
        where('userId', '==', userProfile.uid),
        orderBy('date', 'asc'),
        limit(30)
      );
      
      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map(doc => ({
        date: doc.data().date.toDate(),
        weight: doc.data().weight
      }));
      
      setWeightHistory(history);
    } catch (error) {
      console.error('체중 히스토리 로드 실패:', error);
      toast.error('체중 기록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingWeightHistory(false);
    }
  };

  // 신체 변화 추이 버튼 클릭 핸들러 (기존 체중 그래프 → 신체 변화 추이)
  const handleBodyProgressClick = () => {
    setShowBodyProgressModal(true);
  };

  // 신체 사진 기록하기 버튼 클릭 핸들러
  const handleBodyPhotoClick = () => {
    setShowBodyPhotoModal(true);
  };

  // 체중 기록하기 버튼 클릭 핸들러
  const handleWeightRecordClick = () => {
    setShowWeightRecordModal(true);
  };

  // 체중 기록 성공 핸들러 (개선)
  const handleWeightRecordSuccess = () => {
    setShowWeightRecordModal(false);
    // 체중 기록 후 히스토리 다시 로드
    fetchWeightHistory();
    toast.success('체중이 성공적으로 기록되었습니다!');
  };

  // 신체 사진 기록 성공 핸들러
  const handleBodyPhotoSuccess = () => {
    setShowBodyPhotoModal(false);
    // 토스트 메시지 제거 (이미 BodyPhotoForm 컴포넌트에서 표시됨)
    // 바디 체크 기록을 다시 불러옴
    fetchBodyPhotoRecords();
  };

  // 바디 체크 기록 불러오기
  const fetchBodyPhotoRecords = async () => {
    if (!userProfile) return;
    
    try {
      setIsLoadingBodyPhotos(true);
      const records = await getBodyPhotoRecords(userProfile.uid);
      console.log('바디 체크 기록 로드 완료:', records);
      setBodyPhotoRecords(records);
    } catch (error) {
      console.error('바디 체크 기록 로드 실패:', error);
    } finally {
      setIsLoadingBodyPhotos(false);
    }
  };

  // 페이지 로드 시 바디 체크 기록 불러오기
  useEffect(() => {
    if (userProfile) {
      fetchBodyPhotoRecords();
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !userProfile) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // 최근 운동 세션 불러오기
        const sessionsQuery = query(
          collection(db, 'sessions'),
          where('userId', '==', userProfile.uid),
          orderBy('date', 'desc'),
          limit(3)  // 최대 3개만 가져오도록 제한
        );
        
        const sessionsSnapshot = await getDocs(sessionsQuery);
        const sessionsData = sessionsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)
          } as Session;
        });
        
        // 디버깅: 가져온 운동 세션 데이터 확인
        console.log('[HomePage] 가져온 운동 세션 데이터:', sessionsData);
        sessionsData.forEach((session, index) => {
          console.log(`[HomePage] 세션 ${index + 1}:`, {
            part: session.part,
            mainExerciseName: session.mainExercise?.name,
            mainExerciseSetsCount: session.mainExercise?.sets?.length,
            mainExerciseSets: session.mainExercise?.sets,
            date: session.date
          });
        });
        
        setRecentSessions(sessionsData);
        
        // 식단 기록 불러오기 (IndexedDB에서만)
        const recentDates = getRecentDates(7);
        const lastWeekStart = recentDates[recentDates.length - 1]; // 7일 전
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        
        console.log('[HomePage] 식단 조회 범위:', {
          lastWeekStart: lastWeekStart.toISOString(),
          todayEnd: todayEnd.toISOString(),
          userProfileUid: userProfile.uid
        });
        
        // IndexedDB에서 식단 데이터 가져오기
        try {
          const indexedDBFoodRecords = await getFoodRecords();
          const mealsData = indexedDBFoodRecords
            .filter((record: FoodRecord) => {
              // 사용자 필터링 및 날짜 필터링
              const recordDate = new Date(record.date);
              return record.userId === userProfile.uid && 
                     recordDate >= lastWeekStart && 
                     recordDate <= todayEnd;
            })
            .map((record: FoodRecord) => ({
              id: record.id || `local-${Date.now()}-${Math.random()}`,
              name: record.name,
              description: record.description,
              calories: record.calories,
              protein: record.protein,
              carbs: record.carbs,
              fat: record.fat,
              date: new Date(record.date),
              imageUrl: record.imageId, // IndexedDB의 imageId를 imageUrl로 매핑
              imageId: record.imageId,
              userId: record.userId,
              source: 'indexeddb'
            } as Food & { source: string }))
            .sort((a, b) => b.date.getTime() - a.date.getTime()); // 최신순 정렬
          
          console.log('[HomePage] IndexedDB에서 가져온 식단 데이터:', mealsData.length, '개', mealsData.map(m => ({
            id: m.id,
            name: m.name,
            date: m.date.toISOString().split('T')[0],
            source: m.source
          })));
          
          setRecentMeals(mealsData);
          
          // 날짜별로 식단 그룹화
          const grouped = groupFoodsByDate(mealsData);
          console.log('[HomePage] 그룹화된 식단 데이터:', Object.keys(grouped));
          setGroupedMeals(grouped);
          
        } catch (indexedDBError) {
          console.warn('[HomePage] IndexedDB 접근 오류:', indexedDBError);
          // IndexedDB 접근 실패 시 빈 배열 사용
          setRecentMeals([]);
          setGroupedMeals({});
        }
        
      } catch (err) {
        console.error('Error fetching home page data:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userProfile, authLoading]);

  useEffect(() => {
    if (userProfile?.targetCalories) {
      const calculatedNutrients = calculateMacrosForHome(userProfile.targetCalories, userProfile.weight);
      setNutrients(calculatedNutrients);
    } else {
      // userProfile이 없거나 targetCalories가 없는 경우 기본값 또는 초기화
      setNutrients({ protein: 0, carbs: 0, fat: 0, proteinPerMeal: 0, carbsPerMeal: 0, fatPerMeal: 0 });
    }
  }, [userProfile]);

  if (authLoading || loading || isLoadingSettings) {
    return (
      <Layout>
        <LoadingScreen />
      </Layout>
    );
  }

  if (!userProfile) {
    return (
      <Layout>
        <div className="text-center py-10">
          <p className="text-lg text-gray-600 dark:text-gray-300">사용자 정보를 불러오는 중이거나 로그인이 필요합니다.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {error && (
        <div className="bg-danger-100 border-l-4 border-danger-500 text-danger-700 p-4 mb-6 rounded-md shadow-md" role="alert">
          <div className="flex">
            <div className="py-1"><Activity size={20} className="mr-3" /></div>
            <div>
              <p className="font-bold">오류 발생</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 환영 메시지 및 날짜 */} 
      <div className="mb-8 p-6 bg-gradient-to-r from-primary-400 to-primary-600 dark:from-primary-500 dark:to-primary-700 rounded-lg shadow-lg text-white">
        <h1 className="text-3xl font-bold mb-1">
          안녕하세요, {userProfile.displayName || '회원님'}!
        </h1>
        <p className="text-primary-100 dark:text-primary-200 text-lg">
          오늘도 건강한 하루 보내세요. Corevia가 함께합니다. 
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {/* 프로필 정보 카드 */} 
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <UserCircle size={28} className="text-primary-500 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">내 프로필</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/settings')}
              icon={<Settings size={16} />}
              className="text-primary-600 border-primary-300 hover:bg-primary-50 dark:text-primary-400 dark:border-primary-600 dark:hover:bg-primary-900/20"
            >
              설정
            </Button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">이름:</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">{userProfile.displayName || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">이메일:</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">{userProfile.email || '-'}</span>
            </div>
            <hr className="dark:border-gray-700"/>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">키:</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">{userProfile.height || '-'} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">몸무게:</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">{userProfile.weight || '-'} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">나이:</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">{userProfile.age || '-'} 세</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">성별:</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">{userProfile.gender === 'male' ? '남성' : userProfile.gender === 'female' ? '여성' : '-'}</span>
            </div>
          </div>
        </div>

        {/* 일일 목표 영양소 카드 */} 
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <Target size={28} className="text-success-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">일일 목표</h2>
          </div>
          <div className="bg-light-bg dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">목표 칼로리</p>
                <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                  {userProfile?.targetCalories && !isNaN(userProfile.targetCalories) ? `${userProfile.targetCalories} kcal` : '미설정'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">운동 목표: {userProfile?.fitnessGoal ? (userProfile.fitnessGoal === 'loss' ? '체중 감량' : userProfile.fitnessGoal === 'maintain' ? '체중 유지' : '근력 증가') : '-'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">활동량: {userProfile?.activityLevel ? (userProfile.activityLevel === 'sedentary' ? '매우 적음' : userProfile.activityLevel === 'light' ? '적음' : userProfile.activityLevel === 'moderate' ? '보통' : userProfile.activityLevel === 'active' ? '많음' : '매우 많음') : '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center bg-success-50 dark:bg-success-900/30 p-3 rounded-md">
                <p className="text-sm text-success-700 dark:text-success-300 font-semibold">단백질</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{nutrients.protein}g</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">({nutrients.proteinPerMeal}g/끼니)</p>
              </div>
              <div className="text-center bg-warning-50 dark:bg-warning-900/30 p-3 rounded-md">
                <p className="text-sm text-warning-700 dark:text-warning-300 font-semibold">탄수화물</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{nutrients.carbs}g</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">({nutrients.carbsPerMeal}g/끼니)</p>
              </div>
              <div className="text-center bg-danger-50 dark:bg-danger-900/30 p-3 rounded-md">
                <p className="text-sm text-danger-700 dark:text-danger-300 font-semibold">지방</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{nutrients.fat}g</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">({nutrients.fatPerMeal}g/끼니)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 신체 변화 추이 섹션 */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
        <div className="flex items-center mb-4">
          <User size={24} className="text-purple-500 mr-2" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">내 신체 변화</h2>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-base sm:text-lg font-semibold text-purple-600 dark:text-purple-400">
                현재 체중
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                {userProfile?.weight ? `${userProfile.weight} kg` : '기록 없음'}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBodyPhotoClick}
                icon={<Camera size={16} />}
                className="text-sm"
              >
                바디 체크
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleWeightRecordClick}
                icon={<Plus size={16} />}
                className="text-sm"
              >
                체중 기록
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBodyProgressClick}
                icon={<BarChart3 size={16} />}
                className="text-sm"
              >
                변화 추이
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 선호하는 세트 구성 표시 섹션 */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
        <div className="flex items-center mb-4">
          <Settings size={24} className="text-blue-500 mr-2" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">메인 운동 세트 설정</h2>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-base sm:text-lg font-bold text-blue-800 dark:text-blue-300">
                선호 세트: {workoutSettings?.preferredSetup || '10x5'}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {workoutSettings?.preferredSetup === '5x5' && '근력/근비대 균형 (5회 5세트)'}
                {workoutSettings?.preferredSetup === '10x5' && '근비대 집중 (10회 5세트)'}
                {workoutSettings?.preferredSetup === '15x5' && '근지구력 집중 (15회 5세트)'}
                {workoutSettings?.preferredSetup === '6x3' && '근력 집중 (6회 3세트)'}
              </p>
            </div>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => navigate('/settings')}
              className="w-full md:w-auto"
            >
              설정 변경하기
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* 최근 운동 기록 카드 */} 
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
          <div className="flex items-center mb-4">
            <TrendingUp size={24} className="text-blue-500 mr-2" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">최근 운동</h2>
          </div>
          <div className="space-y-3">
            {recentSessions.length > 0 ? (
              recentSessions.map((session) => (
                <div 
                  key={session.id} 
                  className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => navigate('/workout', { state: { activeTab: 'records', selectedDate: session.date } })}
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-sm sm:text-base text-blue-600 dark:text-blue-400">
                      {session.part === 'chest' ? '가슴' :
                        session.part === 'back' ? '등' :
                        session.part === 'shoulder' ? '어깨' :
                        session.part === 'leg' ? '하체' :
                        session.part === 'biceps' ? '이두' :
                        session.part === 'triceps' ? '삼두' :
                        session.part === 'complex' ? '복합' : '기타'} 운동
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <CalendarDays size={14} className="mr-1" />
                      {new Date(session.date).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    {session.mainExercise?.name || '메인 운동'}: {session.mainExercise?.sets?.length || 0}세트
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">최근 운동 기록이 없습니다.</p>
            )}
          </div>
        </div>

        {/* 최근 식단 카드 */} 
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
          <div className="flex items-center mb-4">
            <Utensils size={24} className="text-yellow-500 mr-2" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">최근 식단</h2>
          </div>
          <div className="space-y-3">
            {Object.keys(groupedMeals).length > 0 ? (
              Object.keys(groupedMeals)
                .sort((a, b) => b.localeCompare(a))
                .slice(0, 3) // 최근 3일치 기록만 표시
                .map(dateStr => {
                  const meals = groupedMeals[dateStr];
                  const dateObj = new Date(dateStr);
                  
                  return (
                    <div 
                      key={dateStr} 
                      className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => navigate('/food', { state: { activeTab: 'records', selectedDate: dateObj } })}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-sm sm:text-base text-yellow-600 dark:text-yellow-400">
                          {dateObj.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <Utensils size={14} className="mr-1" />
                          {meals.length}개 기록
                        </span>
                      </div>
                    </div>
                  );
                })
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">최근 식단 기록이 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {/* 바디 체크 모달 */}
      {showBodyPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <BodyPhotoForm 
              onSuccess={handleBodyPhotoSuccess}
              onCancel={() => setShowBodyPhotoModal(false)}
            />
          </div>
        </div>
      )}

      {/* 신체 변화 추이 모달 */}
      {showBodyProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-7xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <BodyProgressView onClose={() => setShowBodyProgressModal(false)} />
          </div>
        </div>
      )}

      {/* 체중 기록 모달 */}
      {showWeightRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md mx-4">
            <WeightRecordForm
              onSuccess={handleWeightRecordSuccess}
              onCancel={() => setShowWeightRecordModal(false)}
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HomePage; 
export default HomePage; 
