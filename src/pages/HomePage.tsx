import React, { useState, useEffect } from 'react';
import { Session, Food } from '../types';
import Layout from '../components/common/Layout';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import LoadingSpinner, { LoadingScreen } from '../components/common/LoadingSpinner';
import { UserProfile } from '../types';
import { TrendingUp, UserCircle, Zap, Target, BookOpen, CalendarDays, Utensils, Activity, Weight, Settings, X, Scale, Plus, Camera, User, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutSettings } from '../hooks/useWorkoutSettings';
import Button from '../components/common/Button';
import { getFoodRecords, FoodRecord } from '../utils/indexedDB';
import PersonalizationModal from '../components/auth/PersonalizationModal';
import BodyPhotoForm from '../components/body/BodyPhotoForm';
import BodyProgressView from '../components/body/BodyProgressView';
import { toast } from 'react-hot-toast';
import WeightRecordForm from '../components/body/WeightRecordForm';
import Greeting from '../components/home/Greeting';
import WorkoutSummary from '../components/home/WorkoutSummary';
import FoodSummary from '../components/home/FoodSummary';
import TodaySchedule from '../components/home/TodaySchedule';
import { formatDate, isToday, isTomorrow, isYesterday } from '../utils/dateUtils';
import { getTodaysWorkoutRecords, getTodaysFoodRecords, WorkoutRecord as DBWorkoutRecord } from '../utils/indexedDB';

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

  // 체중 기록 저장 핸들러
  const handleSaveWeightRecord = async (profileDataToSave: Partial<UserProfile>) => {
    try {
      if (userProfile?.uid) {
        await updateProfile(profileDataToSave);
        setShowWeightRecordModal(false);
        toast.success('체중이 성공적으로 기록되었습니다.');
      } else {
        toast.error('로그인 후 체중을 기록할 수 있습니다.');
      }
    } catch (error) {
      console.error('Error saving weight record:', error);
      toast.error('체중 기록 중 오류가 발생했습니다.');
    }
  };

  // 신체 사진 기록 성공 핸들러
  const handleBodyPhotoSuccess = () => {
    setShowBodyPhotoModal(false);
    toast.success('신체 사진이 성공적으로 기록되었습니다.');
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 프로필 정보 카드 */} 
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <UserCircle size={28} className="text-primary-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">내 프로필</h2>
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

      {/* 신체 변화 추이 섹션 (기존 체중 변화에서 변경) */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center mb-4">
          <User size={28} className="text-purple-500 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">내 신체 변화</h2>
        </div>
        <div className="bg-light-bg dark:bg-gray-700/50 p-4 rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                현재 체중
              </h3>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {userProfile?.weight ? `${userProfile.weight} kg` : '기록 없음'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                목표: {userProfile?.fitnessGoal === 'loss' ? '체중 감소' : 
                      userProfile?.fitnessGoal === 'maintain' ? '체중 유지' : 
                      userProfile?.fitnessGoal === 'gain' ? '체중 증가' : '설정되지 않음'}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                💡 신체 사진은 로컬 저장소에만 보관되어 개인정보를 안전하게 보호합니다
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleBodyPhotoClick}
                  icon={<Plus size={18} />}
                  className="text-purple-600 border-purple-300 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-600 dark:hover:bg-purple-900/20 whitespace-nowrap"
                >
                  신체 사진 기록
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleWeightRecordClick}
                  icon={<Plus size={18} />}
                  className="text-purple-600 border-purple-300 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-600 dark:hover:bg-purple-900/20 whitespace-nowrap"
                >
                  체중 기록
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleBodyProgressClick}
                  icon={<BarChart3 size={18} />}
                  className="text-purple-600 border-purple-300 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-600 dark:hover:bg-purple-900/20 whitespace-nowrap"
                >
                  변화 추이 보기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 선호하는 세트 구성 표시 섹션 */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center mb-4">
          <Settings size={28} className="text-primary-500 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">메인 운동 세트 설정</h2>
        </div>
        <div className="bg-light-bg dark:bg-gray-700/50 p-4 rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                현재 선호 세트 구성: {workoutSettings?.preferredSetup || '10x5'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {workoutSettings?.preferredSetup === '5x5' && '근력과 근비대 균형에 최적화된 구성 (5회 5세트)'}
                {workoutSettings?.preferredSetup === '10x5' && '근비대에 최적화된 구성 (10회 5세트)'}
                {workoutSettings?.preferredSetup === '15x5' && '근지구력 향상에 최적화된 구성 (15회 5세트)'}
                {workoutSettings?.preferredSetup === '6x3' && '근력 향상에 중점을 둔 구성 (6회 3세트)'}
              </p>
            </div>
            <div className="flex items-center mt-4 md:mt-0">
              <div className="mx-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">세트 수</p>
                <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{workoutSettings?.customSets || 5}</p>
              </div>
              <div className="mx-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">반복 횟수</p>
                <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{workoutSettings?.customReps || 10}</p>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings')}
                className="ml-6"
              >
                변경하기
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 예상 1RM 표시 섹션 */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center mb-4">
          <Weight size={28} className="text-secondary-500 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">현재 예상 1RM</h2>
        </div>
        <div className="bg-light-bg dark:bg-gray-700/50 p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 rounded-md bg-gray-100 dark:bg-gray-600 transition-all duration-300">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">스쿼트</p>
              <p className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">{userProfile?.oneRepMax?.squat || 0} kg</p>
            </div>
            
            <div className="text-center p-3 rounded-md bg-gray-100 dark:bg-gray-600 transition-all duration-300">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">데드리프트</p>
              <p className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">{userProfile?.oneRepMax?.deadlift || 0} kg</p>
            </div>
            
            <div className="text-center p-3 rounded-md bg-gray-100 dark:bg-gray-600 transition-all duration-300">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">벤치프레스</p>
              <p className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">{userProfile?.oneRepMax?.bench || 0} kg</p>
            </div>
            
            <div className="text-center p-3 rounded-md bg-gray-100 dark:bg-gray-600 transition-all duration-300">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">오버헤드프레스</p>
              <p className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">{userProfile?.oneRepMax?.overheadPress || 0} kg</p>
            </div>
            
            {/* 3대 합산 추가 */}
            <div className="text-center p-3 rounded-md bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-800/40 dark:to-yellow-700/40 border-2 border-yellow-300 dark:border-yellow-600 transition-all duration-300">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-bold">예상 3대</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {((userProfile?.oneRepMax?.squat || 0) + 
                  (userProfile?.oneRepMax?.deadlift || 0) + 
                  (userProfile?.oneRepMax?.bench || 0))} kg
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">S+D+B</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 최근 운동 기록 카드 */} 
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <TrendingUp size={28} className="text-primary-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">최근 운동</h2>
          </div>
          <div className="space-y-4">
            {recentSessions.length > 0 ? (
              recentSessions.map((session) => (
                <div 
                  key={session.id} 
                  className="p-4 bg-light-bg dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => navigate('/workout', { state: { activeTab: 'records', selectedDate: session.date } })}
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-lg text-primary-600 dark:text-primary-400">
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
                      {session.date.toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {session.mainExercise?.name || '메인 운동 정보 없음'}: {session.mainExercise?.sets?.length || 0}세트
                    {session.mainExercise?.sets?.length > 0 && session.mainExercise.sets[0] && (
                      <span className="text-xs text-gray-500 dark:text-gray-400"> (대표: {session.mainExercise.sets[0].reps}회 x {session.mainExercise.sets[0].weight}kg)</span>
                    )}
                    {/* 디버깅 정보 표시 (개발 모드에서만) */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-xs text-red-500 mt-1">
                        DEBUG: part={session.part}, mainExercise={JSON.stringify(session.mainExercise?.name || 'undefined')}
                      </div>
                    )}
                  </p>
                  {session.accessoryExercises?.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      보조 운동: {session.accessoryExercises.map(ex => ex.name).join(', ')}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">최근 운동 기록이 없습니다.</p>
            )}
          </div>
        </div>

        {/* 최근 식단 카드 */} 
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <Utensils size={28} className="text-warning-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">최근 식단</h2>
          </div>
          <div className="space-y-4">
            {Object.keys(groupedMeals).length > 0 ? (
              Object.keys(groupedMeals)
                .sort((a, b) => b.localeCompare(a)) // 최신 날짜순 정렬
                .map(dateStr => {
                  const meals = groupedMeals[dateStr];
                  const dateObj = new Date(dateStr);
                  const photoCount = meals.filter(meal => meal.imageUrl).length;
                  
                  return (
                    <div 
                      key={dateStr} 
                      className="p-4 bg-light-bg dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => navigate('/food', { state: { activeTab: 'records', selectedDate: dateObj } })}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg text-warning-600 dark:text-warning-400">
                          {dateObj.toLocaleDateString('ko-KR', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            weekday: 'long'
                          })}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Utensils size={14} className="mr-1" />
                          식사 기록 {meals.length}개
                        </span>
                      </div>
                      
                      {photoCount > 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                          <span className="bg-warning-100 dark:bg-warning-800/40 text-warning-800 dark:text-warning-200 py-1 px-2 rounded-full text-xs">
                            사진 {photoCount}개 저장됨
                          </span>
                        </p>
                      )}
                      
                      {/* 다른 요약 정보 - 선택적으로 표시 */}
                      {meals.some(meal => meal.calories > 0 || meal.protein > 0 || meal.carbs > 0 || meal.fat > 0) && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          영양 정보가 포함된 식사 {meals.filter(m => m.calories > 0 || m.protein > 0 || m.carbs > 0 || m.fat > 0).length}개
                        </div>
                      )}
                    </div>
                  );
                })
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">최근 식단 기록이 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {/* 신체 사진 기록 모달 */}
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
              onSuccess={() => {
                setShowWeightRecordModal(false);
                toast.success('체중이 성공적으로 기록되었습니다!');
              }}
              onCancel={() => setShowWeightRecordModal(false)}
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HomePage; 