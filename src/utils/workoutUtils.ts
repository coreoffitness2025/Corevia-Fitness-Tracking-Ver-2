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
export const getPartColor = (part: ExercisePart, isSuccess: boolean | null): string => {
  // 각 부위별 고정 배경색 (tailwind.config.js의 정의를 따름)
  const partBgColors: Record<ExercisePart, string> = {
    chest:    'bg-part-chest',
    back:     'bg-part-back',
    shoulder: 'bg-part-shoulder',
    leg:      'bg-part-leg',
    biceps:   'bg-part-biceps',
    triceps:  'bg-part-triceps',
    complex:  'bg-part-complex',
  };
  const currentBgClass = partBgColors[part] || 'bg-gray-100'; // 기본 배경: gray-100

  // 성공/실패에 따른 텍스트 색상
  let textColorClass = 'text-gray-700 dark:text-gray-300'; // 기본 텍스트: 어두운 회색 / 밝은 회색
  if (isSuccess === true) {
    textColorClass = 'text-success-600 dark:text-success-400'; // 성공 시: 초록색 계열
  } else if (isSuccess === false) {
    textColorClass = 'text-danger-600 dark:text-danger-400';   // 실패 시: 빨간색 계열
  }

  // 보더는 연한 회색으로 통일 (또는 제거)
  const borderColorClass = 'border border-gray-300 dark:border-gray-600'; 

  return `${currentBgClass} ${textColorClass} ${borderColorClass}`;
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