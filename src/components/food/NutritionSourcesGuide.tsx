import React, { useState } from 'react';

// 단백질 급원 푸드 리스트
const proteinSources = [
  { name: '돼지 뒷다리살', protein: 21, carbs: 0, fat: 8 },
  { name: '돼지 안심', protein: 22, carbs: 0, fat: 5 },
  { name: '닭가슴살', protein: 23, carbs: 0, fat: 2 },
  { name: '닭안심', protein: 22, carbs: 0, fat: 2 },
  { name: '소고기 우둔살', protein: 21, carbs: 0, fat: 6 },
  { name: '연어', protein: 20, carbs: 0, fat: 13 },
  { name: '무지방 그릭요거트', protein: 10, carbs: 4, fat: 0 },
  { name: '계란', protein: 12, carbs: 1, fat: 10 }
];

// 탄수화물 급원 푸드 리스트
const carbSources = [
  { name: '현미밥', protein: 3, carbs: 35, fat: 1 },
  { name: '통밀 베이글', protein: 10, carbs: 45, fat: 1 },
  { name: '통밀 파스타', protein: 14, carbs: 70, fat: 2 },
  { name: '오트밀', protein: 13, carbs: 66, fat: 7 },
  { name: '고구마', protein: 1.5, carbs: 30, fat: 0.1 },
  { name: '감자', protein: 2, carbs: 20, fat: 0.1 }
];

// 지방 급원 푸드 리스트
const fatSources = [
  { name: '땅콩버터', protein: 25, carbs: 20, fat: 50 },
  { name: '아몬드버터', protein: 20, carbs: 20, fat: 55 },
  { name: '견과류', protein: 15, carbs: 15, fat: 50 },
  { name: '아보카도', protein: 2, carbs: 8, fat: 15 }
];

const NutritionSourcesGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'protein' | 'carbs' | 'fats'>('protein');
  
  return (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">주요 영양소 급원 (100g 기준)</h3>
      
      {/* 탭 컨테이너 */}
      <div className="flex flex-wrap mb-4 border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab('protein')}
          className={`py-2 px-4 font-medium text-sm cursor-pointer ${
            activeTab === 'protein' 
              ? 'text-green-600 border-b-2 border-green-600' 
              : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
          }`}
        >
          단백질 급원
        </button>
        
        <button
          onClick={() => setActiveTab('carbs')}
          className={`py-2 px-4 font-medium text-sm cursor-pointer ${
            activeTab === 'carbs' 
              ? 'text-yellow-600 border-b-2 border-yellow-600' 
              : 'text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400'
          }`}
        >
          탄수화물 급원
        </button>
        
        <button
          onClick={() => setActiveTab('fats')}
          className={`py-2 px-4 font-medium text-sm cursor-pointer ${
            activeTab === 'fats' 
              ? 'text-red-600 border-b-2 border-red-600' 
              : 'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
          }`}
        >
          지방 급원
        </button>
      </div>
      
      {/* 탭 내용 */}
      <div className="tab-content">
        {/* 단백질 급원 탭 */}
        <div className={activeTab === 'protein' ? 'block' : 'hidden'}>
          <h4 className="text-md font-medium mb-2 text-green-700 dark:text-green-400">🥩 단백질 급원</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">식품</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">단백질(g)</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">탄수화물(g)</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">지방(g)</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                {proteinSources.map((food, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">{food.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-bold text-green-600">{food.protein}g</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-300">{food.carbs}g</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-300">{food.fat}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* 탄수화물 급원 탭 */}
        <div className={activeTab === 'carbs' ? 'block' : 'hidden'}>
          <h4 className="text-md font-medium mb-2 text-yellow-700 dark:text-yellow-400">🍚 탄수화물 급원</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">식품</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">단백질(g)</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">탄수화물(g)</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">지방(g)</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                {carbSources.map((food, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">{food.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-300">{food.protein}g</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-bold text-yellow-600">{food.carbs}g</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-300">{food.fat}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* 지방 급원 탭 */}
        <div className={activeTab === 'fats' ? 'block' : 'hidden'}>
          <h4 className="text-md font-medium mb-2 text-red-700 dark:text-red-400">🥑 지방 급원</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">식품</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">단백질(g)</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">탄수화물(g)</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">지방(g)</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                {fatSources.map((food, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">{food.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-300">{food.protein}g</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-300">{food.carbs}g</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-bold text-red-600">{food.fat}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>💡 <strong>참고:</strong> 모든 수치는 100g 기준이며, 실제 식품에 따라 차이가 있을 수 있습니다.</p>
      </div>
    </div>
  );
};

export default NutritionSourcesGuide; 