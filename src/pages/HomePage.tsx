import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkoutStore } from '../stores/workoutStore';
import { useFoodLogStore } from '../stores/foodLogStore';
import { WorkoutSession } from '../types/workout';
import Layout from '../components/common/Layout';

interface FoodLog {
  id: string;
  date: string;
  mealType: string;
  totalCalories: number;
  foods: Array<{
    name: string;
    calories: number;
    quantity: number;
  }>;
}

const HomePage = () => {
  const { currentUser, userProfile } = useAuth();
  const { recentWorkouts, fetchRecentWorkouts } = useWorkoutStore();
  const { recentFoodLogs, fetchRecentFoodLogs } = useFoodLogStore();

  useEffect(() => {
    if (currentUser) {
      fetchRecentWorkouts();
      fetchRecentFoodLogs(currentUser);
    }
  }, [currentUser, fetchRecentWorkouts, fetchRecentFoodLogs]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
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
                    <p className="font-medium">{currentUser?.displayName || '이름 없음'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">이메일</p>
                    <p className="font-medium">{currentUser?.email}</p>
                  </div>
                </div>
              </div>
              {userProfile && (
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
              )}
            </div>
          </div>

          {/* 최근 운동 기록 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">최근 운동 기록</h2>
            <div className="space-y-4">
              {recentWorkouts.length > 0 ? (
                recentWorkouts.map((workout: WorkoutSession) => (
                  <div key={workout.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{workout.mainExercise.name}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(workout.date).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {workout.mainExercise.sets.length}세트, 
                        {workout.mainExercise.sets.reduce((acc, set) => acc + set.reps, 0)}회
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        성공률: {workout.mainExercise.sets.filter(set => set.isSuccess).length}/{workout.mainExercise.sets.length}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">아직 기록된 운동이 없습니다.</p>
              )}
            </div>
          </div>

          {/* 1RM 현황 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">1RM 현황</h2>
            <div className="space-y-4">
              {recentWorkouts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {recentWorkouts.map((workout: WorkoutSession) => (
                    <div key={workout.id}>
                      <p className="text-gray-600 dark:text-gray-300">{workout.mainExercise.name}</p>
                      <p className="font-medium">{workout.mainExercise.weight}kg</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">아직 기록된 1RM이 없습니다.</p>
              )}
            </div>
          </div>

          {/* 최근 식단 기록 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">최근 식단 기록</h2>
            <div className="space-y-4">
              {recentFoodLogs.length > 0 ? (
                recentFoodLogs.map((log: FoodLog) => (
                  <div key={log.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{log.mealType}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(log.date).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        총 칼로리: {log.totalCalories}kcal
                      </p>
                      <div className="mt-1">
                        {log.foods.map((food, index) => (
                          <p key={index} className="text-xs text-gray-500 dark:text-gray-400">
                            {food.name} ({food.quantity}g) - {food.calories}kcal
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">아직 기록된 식단이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage; 