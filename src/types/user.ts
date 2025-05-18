/**
 * 사용자 관련 타입 정의
 */
import { ActivityLevel, FitnessGoal } from './nutrition';
import { ChestMainExercise, BackMainExercise, ShoulderMainExercise, LegMainExercise, BicepsMainExercise, TricepsMainExercise, SetConfiguration } from './workout';

// 기본 사용자 정보
export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
}

// 사용자 설정
export interface UserSettings {
  darkMode: boolean;
  notifications: {
    workoutReminder: boolean;
    mealReminder: boolean;
    progressUpdate: boolean;
  };
  units: {
    weight: 'kg' | 'lbs';
    height: 'cm' | 'ft';
  };
  language: 'ko' | 'en';
}

// 운동 경험 정보
export interface ExperienceInfo {
  years: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  squat?: {
    maxWeight: number;
    maxReps: number;
  };
}

// 1RM 기록 정보
export interface OneRepMax {
  bench: number;
  squat: number;
  deadlift: number;
  overheadPress: number;
}

// 선호 운동 타입
export interface PreferredExercises {
  chest?: ChestMainExercise;
  back?: BackMainExercise;
  shoulder?: ShoulderMainExercise;
  leg?: LegMainExercise;
  biceps?: BicepsMainExercise;
  triceps?: TricepsMainExercise;
}

// 세트 구성 설정
export interface SetConfigurationSettings {
  preferredSetup: SetConfiguration;
  customSets?: number;
  customReps?: number;
}

// 사용자 프로필 (기본 사용자 정보 + 추가 정보)
export interface UserProfile extends User {
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
  targetCalories?: number;
  experience: ExperienceInfo;
  preferredExercises?: PreferredExercises;
  setConfiguration?: SetConfigurationSettings;
  oneRepMax?: OneRepMax;
  settings?: UserSettings;
  createdAt?: Date | string;
  lastLogin?: Date | string;
}

// 진행 측정 데이터
export interface Progress {
  id: string;
  userId: string;
  date: string;
  weight: number;
  bodyFat?: number;
  measurements?: {
    chest: number;
    waist: number;
    hips: number;
    arms: number;
    thighs: number;
  };
  photos?: string[];
  notes?: string;
} 