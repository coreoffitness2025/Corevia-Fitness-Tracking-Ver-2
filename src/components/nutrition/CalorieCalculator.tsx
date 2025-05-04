import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface CalorieCalculatorProps {
  onComplete?: (result: any) => void;
}

const PROTEIN_SOURCES = [
  { name: "돼지 뒷다리살", protein: 21, carbs: 0, fat: 8 },
  { name: "돼지 안심", protein: 22, carbs: 0, fat: 5 },
  { name: "닭가슴살", protein: 23, carbs: 0, fat: 2 },
  { name: "닭안심", protein: 22, carbs: 0, fat: 2 },
  { name: "소고기 우둔살", protein: 21, carbs: 0, fat: 6 },
  { name: "연어", protein: 20, carbs: 0, fat: 13 },
  { name: "무지방 그릭요거트", protein: 10, carbs: 4, fat: 0 },
  { name: "계란", protein: 12, carbs: 1, fat: 10 }
];

const CARB_SOURCES = [
  { name: "현미밥", protein: 3, carbs: 35, fat: 1 },
  { name: "통밀 베이글", protein: 10, carbs: 45, fat: 1 },
  { name: "통밀 파스타", protein: 14, carbs: 70, fat: 2 },
  { name: "오트밀", protein: 13, carbs: 66, fat: 7 },
  { name: "고구마", protein: 1.5, carbs: 30, fat: 0.1 },
  { name: "감자", protein: 2, carbs: 20, fat: 0.1 }
];

const FAT_SOURCES = [
  { name: "땅콩버터", protein: 25, carbs: 20, fat: 50 },
  { name: "아몬드버터", protein: 20, carbs: 20, fat: 55 },
  { name: "견과류", protein: 15, carbs: 15, fat: 50 },
  { name: "아보카도", protein: 2, carbs: 8, fat: 15 }
];

const CalorieCalculator = ({ onComplete }: CalorieCalculatorProps) => {
  const { userProfile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    gender: 'male',
    age: '',
    height: '',
    weight: '',
    activity: '1.2',
    goal: 'loss'
  });

  const [result, setResult] = useState<{
    bmr: number;
    rawTdee: number;
    tdee: number;
    targetCal: number;
    mealProtein: number;
    mealCarbs: number;
    mealFats: number;
    exampleMeal: {
      protein: { name: string; amount: number };
      carb: { name: string; amount: number };
      fat: { name: string; amount: number };
    };
  } | null>(null);

  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        gender: userProfile.gender,
        age: userProfile.age.toString(),
        height: userProfile.height.toString(),
        weight: userProfile.weight.toString(),
        activity: userProfile.activityLevel === 'low' ? '1.2' : 
                 userProfile.activityLevel === 'moderate' ? '1.375' : '1.55',
        goal: userProfile.fitnessGoal
      }));
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const pickRandom = (arr: any[]) => {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  const calculate = async () => {
    const { gender, age, height, weight, activity, goal } = formData;
    
    if (!age || !height || !weight) {
      toast.error("나이, 키, 체중을 모두 입력해주세요.");
      return;
    }

    const ageNum = parseInt(age);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    const activityNum = parseFloat(activity);

    // 프로필 업데이트
    try {
      await updateProfile({
        gender,
        age: ageNum,
        height: heightNum,
        weight: weightNum,
        activityLevel: activityNum === 1.2 ? 'low' : 
                      activityNum === 1.375 ? 'moderate' : 'high',
        fitnessGoal: goal
      });
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
    }

    let bmr;
    if (gender === "male") {
      bmr = 66 + (13.7 * weightNum) + (5 * heightNum) - (6.8 * ageNum);
    } else {
      bmr = 655 + (9.6 * weightNum) + (1.8 * heightNum) - (4.7 * ageNum);
    }

    const rawTdee = bmr * activityNum;
    const tdee = rawTdee * 0.85;
    const targetCal = goal === "gain" ? tdee * 1.1 : tdee * 0.9;

    const proteinRatio = 0.3, carbRatio = 0.5, fatRatio = 0.2;
    let totalProtein = (targetCal * proteinRatio) / 4;
    let totalCarbs = (targetCal * carbRatio) / 4;
    let totalFats = (targetCal * fatRatio) / 9;

    totalProtein -= 30;
    if (totalProtein < 0) totalProtein = 0;

    const mealProtein = Number((totalProtein / 3).toFixed(1));
    const mealCarbs = Number((totalCarbs / 3).toFixed(1));
    const mealFats = Number((totalFats / 3).toFixed(1));

    const randProtein = pickRandom(PROTEIN_SOURCES);
    const randCarb = pickRandom(CARB_SOURCES);
    const randFat = pickRandom(FAT_SOURCES);

    const pAmt = (mealProtein / randProtein.protein) * 100;
    const cAmt = (mealCarbs / randCarb.carbs) * 100;
    const fAmt = (mealFats / randFat.fat) * 100;

    const result = {
      bmr,
      rawTdee,
      tdee,
      targetCal,
      mealProtein,
      mealCarbs,
      mealFats,
      exampleMeal: {
        protein: { name: randProtein.name, amount: pAmt },
        carb: { name: randCarb.name, amount: cAmt },
        fat: { name: randFat.name, amount: fAmt }
      }
    };

    setResult(result);
    if (onComplete) {
      onComplete(result);
    }
    toast.success('칼로리 계산이 완료되었습니다!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            성별
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            나이 (세)
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="예: 30"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            신장 (cm)
          </label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            placeholder="예: 170"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            체중 (kg)
          </label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="예: 65"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            활동지수
          </label>
          <select
            name="activity"
            value={formData.activity}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="1.2">거의 운동하지 않음</option>
            <option value="1.375">가벼운 운동 (주 1-3일)</option>
            <option value="1.55">보통 운동 (주 3-5일)</option>
            <option value="1.725">격렬한 운동 (주 6-7일)</option>
            <option value="1.9">매우 격렬한 운동 (하루 2회)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            목표
          </label>
          <select
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="loss">체중 감량</option>
            <option value="maintain">체중 유지</option>
            <option value="gain">체중 증가</option>
          </select>
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        계산하기
      </button>

      {result && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-medium mb-4">계산 결과</h3>
          <div className="space-y-2">
            <p>기초 대사량 (BMR): {Math.round(result.bmr)} kcal</p>
            <p>활동 대사량 (TDEE): {Math.round(result.tdee)} kcal</p>
            <p>목표 칼로리: {Math.round(result.targetCal)} kcal</p>
            <div className="mt-4">
              <h4 className="font-medium mb-2">권장 식사 구성 (1회)</h4>
              <p>단백질: {result.mealProtein}g</p>
              <p>탄수화물: {result.mealCarbs}g</p>
              <p>지방: {result.mealFats}g</p>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">예시 식사</h4>
              <p>단백질: {result.exampleMeal.protein.name} {Math.round(result.exampleMeal.protein.amount)}g</p>
              <p>탄수화물: {result.exampleMeal.carb.name} {Math.round(result.exampleMeal.carb.amount)}g</p>
              <p>지방: {result.exampleMeal.fat.name} {Math.round(result.exampleMeal.fat.amount)}g</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalorieCalculator; 