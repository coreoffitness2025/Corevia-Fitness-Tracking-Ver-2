import { ExercisePart } from '../types';

/**
 * 운동 부위에 따른 레이블 반환
 */
export const getPartLabel = (part: ExercisePart | 'all'): string => {
  const labels: { [key in ExercisePart | 'all']?: string } = {
    chest: '가슴',
    back: '등',
    shoulder: '어깨',
    leg: '하체',
    biceps: '이두',
    triceps: '삼두',
    complex: '복합',
    all: '전체'
  };
  return labels[part] || part.toString();
};

/**
 * 운동 부위에 따른 색상 클래스 반환
 */
export const getPartColor = (part: ExercisePart, isSuccess: boolean = true): string => {
  const successColors: Record<ExercisePart, string> = {
    chest:    'bg-part-chest text-primary-700 dark:bg-part-chest dark:bg-opacity-70 dark:text-primary-100 border-primary-300',
    back:     'bg-part-back text-secondary-700 dark:bg-part-back dark:bg-opacity-70 dark:text-secondary-100 border-secondary-300',
    shoulder: 'bg-part-shoulder text-yellow-700 dark:bg-part-shoulder dark:bg-opacity-70 dark:text-yellow-100 border-yellow-300',
    leg:      'bg-part-leg text-success-700 dark:bg-part-leg dark:bg-opacity-70 dark:text-success-100 border-success-300',
    biceps:   'bg-part-biceps text-danger-700 dark:bg-part-biceps dark:bg-opacity-70 dark:text-danger-100 border-danger-300',
    triceps:  'bg-part-triceps text-indigo-700 dark:bg-part-triceps dark:bg-opacity-70 dark:text-indigo-100 border-indigo-300',
    complex:  'bg-part-complex text-gray-700 dark:bg-part-complex dark:bg-opacity-70 dark:text-gray-100 border-gray-300',
  };

  const failureColor = 'bg-danger-100 text-danger-700 dark:bg-danger-700/30 dark:text-danger-200 border-danger-300';

  if (isSuccess) {
    return successColors[part] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-300';
  }
  return failureColor;
};

/**
 * 세트 구성 설정에 따른 반복 횟수와 세트 수 반환
 */
export const getSetConfiguration = (configType: string, customSets: number = 5, customReps: number = 10) => {
  const configMap: Record<string, { setsCount: number, repsCount: number }> = {
    '5x5': { setsCount: 5, repsCount: 5 },     // 5회 5세트
    '10x5': { setsCount: 5, repsCount: 10 },   // 10회 5세트
    '15x5': { setsCount: 5, repsCount: 15 },   // 15회 5세트
    '6x3': { setsCount: 3, repsCount: 6 }      // 6회 3세트
  };
  
  // 요청된 설정이 없으면 기본값(10x5) 반환
  if (!configMap[configType]) {
    console.warn(`지원되지 않는 세트 설정: ${configType}, 기본값 10x5로 대체합니다.`);
    return configMap['10x5']; // 기본값으로 10x5 반환
  }
  
  return configMap[configType];
};

/**
 * 날짜 형식 변환 (차트 표시용)
 */
export const formatShortDate = (date: Date): string => {
  // YY/MM/DD 형식으로 변경
  const year = String(date.getFullYear()).slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
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