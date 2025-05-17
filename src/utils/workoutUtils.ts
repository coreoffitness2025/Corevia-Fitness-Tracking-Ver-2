import { ExercisePart } from '../types';

/**
 * 운동 부위에 따른 레이블 반환
 */
export const getPartLabel = (part: ExercisePart): string => {
  const labels: { [key in ExercisePart]: string } = {
    chest: '가슴',
    back: '등',
    shoulder: '어깨',
    leg: '하체',
    biceps: '이두',
    triceps: '삼두'
  };
  return labels[part];
};

/**
 * 운동 부위에 따른 색상 클래스 반환
 */
export const getPartColor = (part: ExercisePart, isSuccess: boolean = true): string => {
  const baseColors = {
    chest: isSuccess ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-400',
    back: isSuccess ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-400',
    leg: isSuccess ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-orange-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-400',
    shoulder: isSuccess ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-purple-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-400',
    biceps: isSuccess ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-pink-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-400',
    triceps: isSuccess ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-400'
  };
  return baseColors[part] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

/**
 * 세트 구성 설정에 따른 반복 횟수와 세트 수 반환
 */
export const getSetConfiguration = (configType: string, customSets: number = 5, customReps: number = 10) => {
  const configMap: Record<string, { setsCount: number, repsCount: number }> = {
    '5x5': { setsCount: 5, repsCount: 5 },     // 5회 5세트 추가
    '10x5': { setsCount: 5, repsCount: 10 },
    '15x5': { setsCount: 5, repsCount: 15 },
    '6x3': { setsCount: 3, repsCount: 6 },
    '6x5': { setsCount: 5, repsCount: 6 },     // 6회 5세트 추가
    '3x10': { setsCount: 10, repsCount: 3 },   // 3회 10세트 추가
    'custom': { setsCount: customSets, repsCount: customReps }
  };
  
  // 요청된 설정이 없으면 기본값(10x5) 반환 전에 로그로 경고
  if (!configMap[configType]) {
    console.warn(`지원되지 않는 세트 설정: ${configType}, 기본값 10x5로 대체합니다.`);
  }
  
  return configMap[configType] || configMap['10x5']; // 기본값으로 10x5 반환
};

/**
 * 날짜 형식 변환 (차트 표시용)
 */
export const formatShortDate = (date: Date) => {
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

/**
 * Firestore 날짜 문자열을 Date 객체로 변환
 */
export const parseFirestoreDate = (timestamp: any): Date => {
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

/**
 * 현재 달의 날짜 배열 생성 (달력 표시용)
 */
export const generateCalendarDays = (year: number, month: number) => {
  // 선택된 달의 첫째 날
  const firstDay = new Date(year, month, 1);
  // 선택된 달의 마지막 날
  const lastDay = new Date(year, month + 1, 0);
  
  // 달력 시작일 (이전 달의 일부 포함)
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());
  
  // 달력 종료일 (다음 달의 일부 포함)
  const endDate = new Date(lastDay);
  const daysToAdd = 6 - lastDay.getDay();
  endDate.setDate(lastDay.getDate() + daysToAdd);
  
  const days: Date[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
}; 