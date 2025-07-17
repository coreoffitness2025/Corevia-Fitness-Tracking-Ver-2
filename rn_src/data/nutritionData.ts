export interface FoodSource {
    name: string;
    protein: number;
    carbs: number;
    fat: number;
}

// 단백질 급원 푸드 리스트
export const proteinSources: FoodSource[] = [
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
export const carbSources: FoodSource[] = [
  { name: '현미밥', protein: 3, carbs: 35, fat: 1 },
  { name: '통밀 베이글', protein: 10, carbs: 45, fat: 1 },
  { name: '통밀 파스타', protein: 14, carbs: 70, fat: 2 },
  { name: '오트밀', protein: 13, carbs: 66, fat: 7 },
  { name: '고구마', protein: 1.5, carbs: 30, fat: 0.1 },
  { name: '감자', protein: 2, carbs: 20, fat: 0.1 }
];

// 지방 급원 푸드 리스트
export const fatSources: FoodSource[] = [
  { name: '땅콩버터', protein: 25, carbs: 20, fat: 50 },
  { name: '아몬드버터', protein: 20, carbs: 20, fat: 55 },
  { name: '견과류', protein: 15, carbs: 15, fat: 50 },
  { name: '아보카도', protein: 2, carbs: 8, fat: 15 }
]; 