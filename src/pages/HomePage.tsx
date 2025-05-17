import React, { useState, useEffect } from 'react';
import { Session, Food } from '../types';
import Layout from '../components/common/Layout';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { UserProfile } from '../types';
import { TrendingUp, UserCircle, Zap, Target, BookOpen, CalendarDays, Utensils, Activity, Weight, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutSettings } from '../hooks/useWorkoutSettings';

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
  for (let i = 1; i <= daysCount; i++) {
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

// LoadingScreen 컴포넌트 추가
const LoadingScreen = () => (
  <div className="flex flex-col justify-center items-center h-96 animate-pulse">
    <div className="mb-6">
      <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
    </div>
    <p className="text-lg text-gray-600 dark:text-gray-300 animate-bounce">데이터를 불러오는 중입니다...</p>
  </div>
);

const HomePage = () => {
  const { userProfile, loading: authLoading } = useAuth();
  const { settings: workoutSettings, isLoading: isLoadingSettings } = useWorkoutSettings();
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [recentMeals, setRecentMeals] = useState<Food[]>([]); // 어제 식단 -> 최근 식단
  const [groupedMeals, setGroupedMeals] = useState<Record<string, Food[]>>({}); // 날짜별 그룹화된 식단
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nutrients, setNutrients] = useState({ protein: 0, carbs: 0, fat: 0, proteinPerMeal: 0, carbsPerMeal: 0, fatPerMeal: 0 });
  const navigate = useNavigate();

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
        
        setRecentSessions(sessionsData);
        
        // 최근 7일 식사 기록 불러오기
        const recentDates = getRecentDates(7);
        const lastWeekStart = recentDates[recentDates.length - 1]; // 7일 전
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        
        const mealsQuery = query(
          collection(db, 'foods'),
          where('userId', '==', userProfile.uid),
          where('date', '>=', lastWeekStart),
          where('date', '<=', todayEnd),
          orderBy('date', 'desc'),
          limit(30)  // 충분한 수의 식단 기록 가져오기
        );
        
        const mealsSnapshot = await getDocs(mealsQuery);
        const mealsData = mealsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)
          } as Food;
        });
        
        setRecentMeals(mealsData);
        
        // 날짜별로 식단 그룹화
        const grouped = groupFoodsByDate(mealsData);
        setGroupedMeals(grouped);
        
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
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-md" role="alert">
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
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 rounded-lg shadow-lg text-white">
        <h1 className="text-3xl font-bold mb-1">
          안녕하세요, {userProfile.displayName || '회원님'}!
        </h1>
        <p className="text-blue-100 dark:text-blue-200 text-lg">
          오늘도 건강한 하루 보내세요. Corevia가 함께합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 프로필 정보 카드 */} 
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <UserCircle size={28} className="text-blue-500 mr-3" />
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
            <Target size={28} className="text-green-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">일일 목표</h2>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">목표 칼로리</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {userProfile?.targetCalories && !isNaN(userProfile.targetCalories) ? `${userProfile.targetCalories} kcal` : '미설정'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">운동 목표: {userProfile?.fitnessGoal ? (userProfile.fitnessGoal === 'loss' ? '체중 감량' : userProfile.fitnessGoal === 'maintain' ? '체중 유지' : '근력 증가') : '-'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">활동량: {userProfile?.activityLevel ? (userProfile.activityLevel === 'sedentary' ? '매우 적음' : userProfile.activityLevel === 'light' ? '적음' : userProfile.activityLevel === 'moderate' ? '보통' : userProfile.activityLevel === 'active' ? '많음' : '매우 많음') : '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center bg-green-50 dark:bg-green-900/30 p-3 rounded-md">
                <p className="text-sm text-green-700 dark:text-green-300 font-semibold">단백질</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{nutrients.protein}g</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">({nutrients.proteinPerMeal}g/끼니)</p>
              </div>
              <div className="text-center bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-md">
                <p className="text-sm text-yellow-700 dark:text-yellow-300 font-semibold">탄수화물</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{nutrients.carbs}g</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">({nutrients.carbsPerMeal}g/끼니)</p>
              </div>
              <div className="text-center bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
                <p className="text-sm text-red-700 dark:text-red-300 font-semibold">지방</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{nutrients.fat}g</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">({nutrients.fatPerMeal}g/끼니)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 선호하는 세트 구성 표시 섹션 */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center mb-4">
          <Settings size={28} className="text-blue-500 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">메인 운동 세트 설정</h2>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
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
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{workoutSettings?.customSets || 5}</p>
              </div>
              <div className="mx-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">반복 횟수</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{workoutSettings?.customReps || 10}</p>
              </div>
              <button 
                onClick={() => navigate('/settings')}
                className="ml-6 bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-200 py-2 px-4 rounded-lg text-sm transition-colors duration-300"
              >
                변경하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 예상 1RM 표시 섹션 */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center mb-4">
          <Weight size={28} className="text-indigo-500 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">현재 예상 1RM</h2>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-md bg-gray-100 dark:bg-gray-600 transition-all duration-300">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">스쿼트</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{userProfile?.oneRepMax?.squat || 0} kg</p>
            </div>
            
            <div className="text-center p-3 rounded-md bg-gray-100 dark:bg-gray-600 transition-all duration-300">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">데드리프트</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{userProfile?.oneRepMax?.deadlift || 0} kg</p>
            </div>
            
            <div className="text-center p-3 rounded-md bg-gray-100 dark:bg-gray-600 transition-all duration-300">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">벤치프레스</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{userProfile?.oneRepMax?.bench || 0} kg</p>
            </div>
            
            <div className="text-center p-3 rounded-md bg-gray-100 dark:bg-gray-600 transition-all duration-300">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">오버헤드프레스</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{userProfile?.oneRepMax?.overheadPress || 0} kg</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 최근 운동 기록 카드 */} 
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <TrendingUp size={28} className="text-purple-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">최근 운동</h2>
          </div>
          <div className="space-y-4">
            {recentSessions.length > 0 ? (
              recentSessions.map((session) => (
                <div key={session.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-lg text-purple-600 dark:text-purple-400">
                      {session.part === 'chest' ? '가슴' :
                       session.part === 'back' ? '등' :
                       session.part === 'shoulder' ? '어깨' :
                       session.part === 'leg' ? '하체' :
                       session.part === 'biceps' ? '이두' :
                       session.part === 'triceps' ? '삼두' : '기타'} 운동
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <CalendarDays size={14} className="mr-1" />
                      {session.date.toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {session.mainExercise?.name || '메인 운동'}: {session.mainExercise?.sets?.length || 0}세트
                    {session.mainExercise?.sets?.length > 0 && session.mainExercise.sets[0] && (
                      <span className="text-xs text-gray-500 dark:text-gray-400"> (대표: {session.mainExercise.sets[0].reps}회 x {session.mainExercise.sets[0].weight}kg)</span>
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
            <Utensils size={28} className="text-orange-500 mr-3" />
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
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => navigate('/food')}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg text-orange-600 dark:text-orange-400">
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
                          <span className="bg-orange-100 dark:bg-orange-800/40 text-orange-800 dark:text-orange-200 py-1 px-2 rounded-full text-xs">
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
    </Layout>
  );
};

export default HomePage; 