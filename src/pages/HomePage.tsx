import React from 'react';
import { WorkoutSession } from '../types/workout';
import Layout from '../components/common/Layout';

const dummyWorkouts: WorkoutSession[] = [
  {
    id: '1',
    userId: 'dummy-user',
    date: new Date().toISOString(),
    part: 'chest',
    mainExercise: {
      name: '벤치 프레스',
      sets: [
        { weight: 60, reps: 10, isSuccess: true },
        { weight: 60, reps: 10, isSuccess: true },
        { weight: 60, reps: 10, isSuccess: true }
      ],
      weight: 60,
      rest: 90
    },
    accessoryExercises: [],
    isAllSuccess: true
  },
  {
    id: '2',
    userId: 'dummy-user',
    date: new Date().toISOString(),
    part: 'back',
    mainExercise: {
      name: '랫 풀다운',
      sets: [
        { weight: 45, reps: 12, isSuccess: true },
        { weight: 45, reps: 12, isSuccess: true },
        { weight: 45, reps: 12, isSuccess: true }
      ],
      weight: 45,
      rest: 90
    },
    accessoryExercises: [],
    isAllSuccess: true
  }
];

// 더미 식사 데이터
const dummyMeals = [
  {
    id: '1',
    userId: 'dummy-user',
    date: new Date().toISOString(),
    name: '닭가슴살 샐러드',
    calories: 350,
    protein: 40,
    carbs: 15,
    fat: 10,
    type: '점심'
  },
  {
    id: '2',
    userId: 'dummy-user',
    date: new Date(new Date().setHours(new Date().getHours() - 4)).toISOString(),
    name: '단백질 쉐이크',
    calories: 180,
    protein: 30,
    carbs: 5,
    fat: 3,
    type: '아침'
  },
  {
    id: '3',
    userId: 'dummy-user',
    date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    name: '현미밥과 닭고기 볶음',
    calories: 550,
    protein: 35,
    carbs: 65,
    fat: 15,
    type: '저녁'
  }
];

const dummyProfile = {
  displayName: '홍길동',
  email: 'example@example.com',
  height: 175,
  weight: 70,
  age: 25,
  gender: 'male'
};

const HomePage = () => {
  return (
    <Layout>
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
                  <p className="font-medium">{dummyProfile.displayName}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">이메일</p>
                  <p className="font-medium">{dummyProfile.email}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium">신체 정보</h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-gray-600 dark:text-gray-300">키</p>
                  <p className="font-medium">{dummyProfile.height}cm</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">몸무게</p>
                  <p className="font-medium">{dummyProfile.weight}kg</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">나이</p>
                  <p className="font-medium">{dummyProfile.age}세</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">성별</p>
                  <p className="font-medium">{dummyProfile.gender === 'male' ? '남성' : '여성'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 운동 기록 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">최근 운동 기록</h2>
          <div className="space-y-4">
            {dummyWorkouts.map((workout) => (
              <div key={workout.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{workout.mainExercise.name}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(workout.date).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {workout.mainExercise.sets.length}세트 x {workout.mainExercise.sets[0].reps}회 ({workout.mainExercise.sets[0].weight}kg)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 식사 기록 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">최근 식사 기록</h2>
          <div className="space-y-4">
            {dummyMeals.map((meal) => (
              <div key={meal.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{meal.name}</h3>
                    <span className="text-sm text-blue-500 dark:text-blue-400">{meal.type}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(meal.date).toLocaleDateString('ko-KR')}
                  </span>
                </div>
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage; 