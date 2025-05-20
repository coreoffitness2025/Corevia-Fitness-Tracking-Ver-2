import { Exercise, ExercisePart } from '../types';
import { exercises as allExercises } from './exerciseData'; // 기존 운동 데이터 가져오기

export const accessoryExercisePartOptions: Array<{ value: ExercisePart; label: string; icon: string }> = [
  { value: 'chest',    label: '가슴',   icon: '💪' },
  { value: 'back',     label: '등',     icon: '🔙' },
  { value: 'shoulder', label: '어깨',   icon: '🏋️' },
  { value: 'leg',      label: '하체',   icon: '🦵' },
  { value: 'biceps',   label: '이두',   icon: '💪' },
  { value: 'triceps',  label: '삼두',   icon: '💪' },
  { value: 'abs',      label: '복근',   icon: '🧘' }, // 복근 추가
  { value: 'cardio',   label: '유산소', icon: '🏃' }, // 유산소 추가
];

// 기존 exerciseData.ts의 Exercise 타입을 그대로 사용하거나, 필요시 보조 운동에 특화된 타입 정의 가능
// 여기서는 기존 Exercise 타입을 사용한다고 가정

export const accessoryExercisesByPart: Record<string, Exercise[]> = 
  accessoryExercisePartOptions.reduce((acc, partOption) => {
    acc[partOption.value] = allExercises.filter(ex => ex.part === partOption.value);
    return acc;
  }, {} as Record<string, Exercise[]>);

// 만약 특정 보조 운동만 선별하고 싶다면 아래와 같이 직접 정의할 수도 있습니다.
/*
export const sampleAccessoryExercises: Record<ExercisePart, Exercise[]> = {
  chest: [
    allExercises.find(ex => ex.id === 'dumbbellFly'),
    allExercises.find(ex => ex.id === 'cableFly'),
    allExercises.find(ex => ex.id === 'pushUp'),
  ].filter(Boolean) as Exercise[], // null/undefined 제거 및 타입 단언
  back: [
    allExercises.find(ex => ex.id === 'seatedRow'),
    allExercises.find(ex => ex.id === 'latPulldown'),
    allExercises.find(ex => ex.id === 'oneDumbbellRow'),
  ].filter(Boolean) as Exercise[],
  // ... 다른 부위들도 유사하게 정의
  shoulder: [],
  leg: [],
  biceps: [],
  triceps: [],
  complex: [], // complex는 메인 운동에서만 사용되므로 빈 배열 또는 제외
};
*/ 