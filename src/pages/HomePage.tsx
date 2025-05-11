import React, { useState, useEffect } from 'react';
import { Session, Food } from '../types';
import Layout from '../components/common/Layout';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { UserProfile } from '../types';

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

const HomePage = () => {
  const { userProfile, loading: authLoading } = useAuth();
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [yesterdayMeals, setYesterdayMeals] = useState<Food[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nutrients, setNutrients] = useState({ protein: 0, carbs: 0, fat: 0, proteinPerMeal: 0, carbsPerMeal: 0, fatPerMeal: 0 });

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
        
        // 어제의 식사 기록 불러오기
        const yesterday = getYesterdayDate();
        const todayStart = new Date(yesterday);
        todayStart.setDate(todayStart.getDate() + 1);
        
        const mealsQuery = query(
          collection(db, 'foods'),
          where('userId', '==', userProfile.uid),
          where('date', '>=', yesterday),
          where('date', '<', todayStart),
          orderBy('date', 'asc'),
          limit(10)  // 최대 10개만 가져오도록 제한
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
        
        setYesterdayMeals(mealsData);
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

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!userProfile) {
    return (
      <Layout>
        <div className="text-center py-10">
          <p className="text-lg text-gray-600 dark:text-gray-300">로그인이 필요합니다.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 사용자 프로필 섹션 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">프로필</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">기본 정보</h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-gray-600 dark:text-gray-300">이름</p>
                  <p className="font-medium">{userProfile.displayName || '미설정'}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">이메일</p>
                  <p className="font-medium">{userProfile.email || '미설정'}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium">신체 정보</h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-gray-600 dark:text-gray-300">키</p>
                  <p className="font-medium">{userProfile.height}cm</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">몸무게</p>
                  <p className="font-medium">{userProfile.weight}kg</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">나이</p>
                  <p className="font-medium">{userProfile.age}세</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">성별</p>
                  <p className="font-medium">{userProfile.gender === 'male' ? '남성' : '여성'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 목표 칼로리 섹션 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">목표 칼로리</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {userProfile?.targetCalories && !isNaN(userProfile.targetCalories) ? `${userProfile.targetCalories} kcal/일` : '목표 칼로리를 설정해주세요'}
                </p>
                <span className="text-xs text-gray-500">
                  활동 수준: {userProfile?.activityLevel ? (
                    userProfile.activityLevel === 'low' ? '낮음' : 
                    userProfile.activityLevel === 'moderate' ? '보통' : '높음'
                  ) : '미설정'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                목표: {userProfile?.fitnessGoal ? (
                  userProfile.fitnessGoal === 'loss' ? '체중 감량' : 
                  userProfile.fitnessGoal === 'maintain' ? '체중 유지' : '근육 증가'
                ) : '미설정'}
              </p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                  <p className="text-xs text-gray-500">단백질</p>
                  <p className="font-medium">{nutrients.protein}g/일</p>
                  <p className="text-xs text-gray-400">({nutrients.proteinPerMeal}g/끼니)</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                  <p className="text-xs text-gray-500">탄수화물</p>
                  <p className="font-medium">{nutrients.carbs}g/일</p>
                  <p className="text-xs text-gray-400">({nutrients.carbsPerMeal}g/끼니)</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                  <p className="text-xs text-gray-500">지방</p>
                  <p className="font-medium">{nutrients.fat}g/일</p>
                  <p className="text-xs text-gray-400">({nutrients.fatPerMeal}g/끼니)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 운동 기록 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">최근 운동 기록</h2>
          <div className="space-y-4">
            {recentSessions.length > 0 ? (
              recentSessions.map((session) => (
                <div key={session.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">
                      {session.part === 'chest' ? '가슴' :
                       session.part === 'back' ? '등' :
                       session.part === 'shoulder' ? '어깨' :
                       session.part === 'leg' ? '하체' :
                       session.part === 'biceps' ? '이두' :
                       session.part === 'triceps' ? '삼두' : '기타'} 운동
                    </h3>
                    <span className="text-sm text-gray-500">
                      {session.date.toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {session.mainExercise?.sets?.length || 0}세트 
                      {session.mainExercise?.sets?.length > 0 && (
                        <>
                          {' x '}
                          {session.mainExercise.sets[0].reps}회 
                          {' ('}
                          {session.mainExercise.sets[0].weight}kg{')'}
                        </>
                      )}
                    </p>
                    {session.accessoryExercises?.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        보조 운동: {session.accessoryExercises.map(ex => ex.name).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">최근 운동 기록이 없습니다.</p>
            )}
          </div>
        </div>

        {/* 어제의 식사 기록 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">어제의 식사 기록</h2>
          <div className="space-y-6">
            {yesterdayMeals.length > 0 ? (
              yesterdayMeals.map((meal) => (
                <div key={meal.id} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-medium">{meal.name}</h3>
                      <span className="text-sm text-blue-500 dark:text-blue-400">{meal.type || '식사'}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {meal.date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {meal.imageUrl && (
                    <div className="mt-2 mb-3">
                      <img 
                        src={meal.imageUrl} 
                        alt={meal.name} 
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <span className="text-xs text-gray-500">칼로리</span>
                      <p className="font-medium">{meal.calories} kcal</p>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-gray-500">단백질</span>
                      <p className="font-medium">{meal.protein}g</p>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-gray-500">탄수화물</span>
                      <p className="font-medium">{meal.carbs}g</p>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-gray-500">지방</span>
                      <p className="font-medium">{meal.fat}g</p>
                    </div>
                  </div>
                  {meal.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {meal.notes}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">어제의 식사 기록이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage; 