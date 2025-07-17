export interface Meal {
  name: string;
  items: string[];
  imageUrl?: string;
}

export interface MealPlan {
  id: string;
  category: 'diet' | 'bulk' | 'quickmeal' | 'highprotein' | 'balanced';
  title: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: Meal[];
}

export const MEAL_PLAN_DATA: MealPlan[] = [
  {
    id: 'diet-1',
    category: 'diet',
    title: '저탄수화물 다이어트 식단',
    description: '체중 감량을 위한 저탄수화물 고단백 식단입니다. 하루 1500kcal로 구성되어 있습니다.',
    calories: 1500, protein: 120, carbs: 75, fat: 65,
    meals: [
      { name: '아침', items: ['달걀 흰자 100g', '아보카도 70g', '시금치 100g'] },
      { name: '점심', items: ['구운 닭가슴살 150g', '브로콜리 100g', '견과류 30g'] },
      { name: '저녁', items: ['구운 연어 150g', '아스파라거스 100g', '양상추 100g'] },
    ]
  },
  {
    id: 'bulk-1',
    category: 'bulk',
    title: '벌크업 고칼로리 식단',
    description: '근육 증가를 위한 고칼로리 고단백 식단입니다. 하루 3000kcal로 구성되어 있습니다.',
    calories: 3000, protein: 180, carbs: 350, fat: 80,
    meals: [
      { name: '아침', items: ['오트밀 100g', '바나나 1개', '단백질 쉐이크 30g', '계란 3개'] },
      { name: '점심', items: ['현미밥 150g', '닭가슴살 200g', '고구마 150g'] },
      { name: '저녁', items: ['소고기 스테이크 200g', '구운 채소 150g', '아보카도 반 개'] },
    ]
  },
  // ... 원본 데이터를 모두 여기에 추가 ...
  {
    id: 'balanced-1',
    category: 'balanced',
    title: '영양 균형 식단',
    description: '탄수화물, 단백질, 지방의 균형이 잡힌 전반적으로 건강한 식단입니다.',
    calories: 2200, protein: 120, carbs: 230, fat: 70,
    meals: [
      { name: '아침', items: ['오트밀 60g', '그릭 요거트 150g', '블루베리 1/2컵'] },
      { name: '점심', items: ['구운 닭가슴살 120g', '현미밥 3/4공기', '찐 브로콜리 1컵'] },
      { name: '저녁', items: ['연어 120g', '고구마 1/2개', '아스파라거스 1컵'] },
    ]
  }
]; 