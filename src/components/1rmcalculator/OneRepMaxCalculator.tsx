import { useState } from 'react';

const OneRepMaxCalculator = () => {
  const [weight, setWeight] = useState<number>(0);
  const [reps, setReps] = useState<number>(0);
  const [oneRepMax, setOneRepMax] = useState<number>(0);

  const calculateOneRepMax = () => {
    // Brzycki 공식 사용
    const max = weight * (36 / (37 - reps));
    setOneRepMax(Math.round(max));
  };

  const getTrainingIntensity = (oneRM: number) => {
    return {
      strength: {
        min: oneRM * 0.85,
        max: oneRM * 0.95
      },
      hypertrophy: {
        min: oneRM * 0.7,
        max: oneRM * 0.8
      },
      endurance: {
        min: oneRM * 0.6,
        max: oneRM * 0.7
      }
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">1RM 계산기</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            들어올린 중량 (kg)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
            min="0"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            최대 반복횟수
          </label>
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
            min="1"
          />
        </div>

        <button
          onClick={calculateOneRepMax}
          className="w-full bg-[#4285F4] text-white py-2 px-4 rounded-md hover:bg-[#3b78db] focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:ring-offset-2"
        >
          계산하기
        </button>

        {oneRepMax > 0 && (
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">예상 1RM</p>
              <p className="text-2xl font-bold">{oneRepMax.toFixed(1)}kg</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">훈련 강도표</h3>
              <div className="grid grid-cols-1 gap-2">
                <div className="bg-[#E8F0FE] dark:bg-blue-900 p-3 rounded">
                  <p className="font-medium">근력 증가</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {getTrainingIntensity(oneRepMax).strength.min.toFixed(1)}kg - {getTrainingIntensity(oneRepMax).strength.max.toFixed(1)}kg
                  </p>
                </div>
                <div className="bg-[#E8F0FE] dark:bg-green-900 p-3 rounded">
                  <p className="font-medium">근비대</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {getTrainingIntensity(oneRepMax).hypertrophy.min.toFixed(1)}kg - {getTrainingIntensity(oneRepMax).hypertrophy.max.toFixed(1)}kg
                  </p>
                </div>
                <div className="bg-[#E8F0FE] dark:bg-yellow-900 p-3 rounded">
                  <p className="font-medium">근지구력</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {getTrainingIntensity(oneRepMax).endurance.min.toFixed(1)}kg - {getTrainingIntensity(oneRepMax).endurance.max.toFixed(1)}kg
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <p>⚠️ 추정값으로 실제 1RM과 다를 수 있습니다.</p>
              <p>⚠️ 10회 이하의 데이터 사용을 권장합니다.</p>
              <p>⚠️ 전문가 지도 하에 실제 1RM 테스트를 권장합니다.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OneRepMaxCalculator; 