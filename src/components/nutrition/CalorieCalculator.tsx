import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface CalorieCalculatorProps {
  onComplete?: (result: any) => void;
}

interface UserProfile {
  gender: string;
  age: number;
  height: number;
  weight: number;
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
  const { currentUser } = useAuth();
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
    const fetchUserProfile = async () => {
      if (!currentUser) return;

      try {
        const userDoc = doc(db, 'users', currentUser.uid);
        const userData = await getDoc(userDoc);
        
        if (userData.exists()) {
          const profile = userData.data().profile as UserProfile;
          if (profile) {
            setFormData(prev => ({
              ...prev,
              gender: profile.gender || 'male',
              age: profile.age?.toString() || '',
              height: profile.height?.toString() || '',
              weight: profile.weight?.toString() || ''
            }));
          }
        }
      } catch (error) {
        console.error('사용자 프로필 로딩 실패:', error);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const pickRandom = (arr: any[]) => {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  const calculate = () => {
    const { gender, age, height, weight, activity, goal } = formData;
    
    if (!age || !height || !weight) {
      alert("나이, 키, 체중을 모두 입력해주세요.");
      return;
    }

    const ageNum = parseInt(age);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    const activityNum = parseFloat(activity);

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
            <option value="1.2">운동을 하지 않는다 (거의 좌식, 운동X)</option>
            <option value="1.3">보통이다 (주3회 운동)</option>
            <option value="1.5">많다 (주5회 이상 운동)</option>
            <option value="1.7">아주 많다 (주7회 이상 운동)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            목적
          </label>
          <select
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="gain">증량</option>
            <option value="loss">감량</option>
          </select>
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
      >
        계산하기
      </button>

      {result && (
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">📊 결과 요약</h3>
            <div className="space-y-2">
              <p><b>하루 기초 소비 칼로리:</b> {result.bmr.toFixed(0)} kcal</p>
              <p><b>유지 칼로리:</b> 약 {result.rawTdee.toFixed(0)} kcal</p>
              <p><b>한국인 기준(15%↓):</b> 약 {result.tdee.toFixed(0)} kcal</p>
              <p><b>목표 섭취 칼로리 ({formData.goal === "gain" ? "증량" : "감량"}):</b> {result.targetCal.toFixed(0)} kcal</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">🍽 1끼당 권장 섭취량(하루 3끼 식사 기준)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              간식으로 단백질 보충제(1스쿱 - 단백질 30g) 섭취 가정
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="font-semibold">단백질</p>
                <p className="text-2xl">{result.mealProtein}g</p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="font-semibold">탄수화물</p>
                <p className="text-2xl">{result.mealCarbs}g</p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="font-semibold">지방</p>
                <p className="text-2xl">{result.mealFats}g</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">🍽 1끼 예시 식단 조합</h3>
            <div className="space-y-4">
              <div>
                <p className="font-semibold">단백질 식품:</p>
                <p>{result.exampleMeal.protein.name} 약 {result.exampleMeal.protein.amount.toFixed(0)}g</p>
              </div>
              <div>
                <p className="font-semibold">탄수화물 식품:</p>
                <p>{result.exampleMeal.carb.name} 약 {result.exampleMeal.carb.amount.toFixed(0)}g</p>
              </div>
              <div>
                <p className="font-semibold">지방 식품:</p>
                <p>{result.exampleMeal.fat.name} 약 {result.exampleMeal.fat.amount.toFixed(0)}g</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">🥩 영양소 급원</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">단백질 급원</h4>
                <ul className="space-y-1">
                  {PROTEIN_SOURCES.map((item, index) => (
                    <li key={index} className="text-sm">
                      {item.name} - 100g 기준: 단백질 {item.protein}g / 탄수화물 {item.carbs}g / 지방 {item.fat}g
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">탄수화물 급원</h4>
                <ul className="space-y-1">
                  {CARB_SOURCES.map((item, index) => (
                    <li key={index} className="text-sm">
                      {item.name} - 100g 기준: 단백질 {item.protein}g / 탄수화물 {item.carbs}g / 지방 {item.fat}g
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">지방 급원</h4>
                <ul className="space-y-1">
                  {FAT_SOURCES.map((item, index) => (
                    <li key={index} className="text-sm">
                      {item.name} - 100g 기준: 단백질 {item.protein}g / 탄수화물 {item.carbs}g / 지방 {item.fat}g
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>※ 본 계산기는 예시용입니다. 개인별 건강 상태나 목표에 따라 실제 섭취 계획은 달라집니다.</p>
            <p>※ 본 계산기는 Harris-Benedict 공식으로 산출된 칼로리를 기준으로, 한국인에 맞춰 조정하여 15% 낮추어 칼로리를 계산하였습니다.</p>
            <p>※ 실제 식단을 유지해보며 2~4주간 체중 변화 추세를 확인 후, 조금씩 보정하여 본인의 유지 칼로리를 찾을 수 있도록 해야 합니다.</p>
            <p>※ 단백질 보충제(1스쿱=30g 단백질)를 하루에 한번 간식으로 섭취했다고 가정하고, 나머지 식단 구성량을 계산합니다.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalorieCalculator; 