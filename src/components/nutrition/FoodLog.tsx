import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import CalorieCalculator from './CalorieCalculator';

interface NutritionGoal {
  targetCal: number;
  mealProtein: number;
  mealCarbs: number;
  mealFats: number;
  lastUpdated: Date;
}

const FoodLog = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth(); // Added userProfile from useAuth
  const [showCalculator, setShowCalculator] = useState(false);
  const [nutritionGoal, setNutritionGoal] = useState<NutritionGoal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNutritionGoal = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = doc(db, 'users', currentUser.uid);
        const userData = await getDoc(userDoc);
        
        if (userData.exists() && userData.data().nutritionGoal) {
          const goal = userData.data().nutritionGoal;
          setNutritionGoal({
            ...goal,
            lastUpdated: goal.lastUpdated.toDate()
          });
        }
      } catch (error) {
        console.error('목표 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNutritionGoal();
  }, [currentUser]);

  const handleCalculatorComplete = async (result: any) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const goal = {
      targetCal: result.targetCal,
      mealProtein: result.mealProtein,
      mealCarbs: result.mealCarbs,
      mealFats: result.mealFats,
      lastUpdated: new Date()
    };

    try {
      const userDoc = doc(db, 'users', currentUser.uid);
      await setDoc(userDoc, { nutritionGoal: goal }, { merge: true });
      setNutritionGoal(goal);
      setShowCalculator(false);
    } catch (error) {
      console.error('목표 저장 실패:', error);
      alert('목표 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          목표 설정을 위해서는 로그인이 필요합니다
        </p>
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          로그인하기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 목표 칼로리 섹션 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">오늘의 영양 목표</h2>
          <button
            onClick={() => setShowCalculator(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            {nutritionGoal ? '목표 수정하기' : '목표 설정하기'}
          </button>
        </div>

        {nutritionGoal ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-400">목표 칼로리</p>
                <p className="text-2xl font-bold">{nutritionGoal.targetCal.toFixed(0)} kcal</p>
                <p className="text-xs text-gray-500 mt-1">
                  마지막 업데이트: {new Date(nutritionGoal.lastUpdated).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-400">하루 권장량</p>
                <div className="space-y-1">
                  <p>단백질: {nutritionGoal.mealProtein * 3}g</p>
                  <p>탄수화물: {nutritionGoal.mealCarbs * 3}g</p>
                  <p>지방: {nutritionGoal.mealFats * 3}g</p>
                </div>
              </div>
            </div>

            {/* 추천 식단 섹션 */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">추천 식단</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                  <h4 className="font-medium mb-2">아침</h4>
                  <p className="text-sm">단백질: {nutritionGoal.mealProtein}g</p>
                  <p className="text-sm">탄수화물: {nutritionGoal.mealCarbs}g</p>
                  <p className="text-sm">지방: {nutritionGoal.mealFats}g</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                  <h4 className="font-medium mb-2">점심</h4>
                  <p className="text-sm">단백질: {nutritionGoal.mealProtein}g</p>
                  <p className="text-sm">탄수화물: {nutritionGoal.mealCarbs}g</p>
                  <p className="text-sm">지방: {nutritionGoal.mealFats}g</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                  <h4 className="font-medium mb-2">저녁</h4>
                  <p className="text-sm">단백질: {nutritionGoal.mealProtein}g</p>
                  <p className="text-sm">탄수화물: {nutritionGoal.mealCarbs}g</p>
                  <p className="text-sm">지방: {nutritionGoal.mealFats}g</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              목표 칼로리를 설정하고 맞춤형 식단 계획을 받아보세요
            </p>
            <button
              onClick={() => setShowCalculator(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
            >
              목표 설정하기
            </button>
          </div>
        )}
      </div>

      {/* 음식 기록 섹션 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">오늘의 식사 기록</h2>
        {/* 음식 기록 UI 구현 */}
      </div>

      {/* 목표 칼로리 계산기 모달 */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">목표 칼로리 계산</h2>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {userProfile && (
              <CalorieCalculator 
                userProfile={userProfile} 
                onComplete={handleCalculatorComplete} 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodLog;
