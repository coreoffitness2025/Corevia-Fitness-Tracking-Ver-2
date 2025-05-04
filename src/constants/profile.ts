import { UserProfile } from '../types';

export const DEFAULT_PROFILE: Omit<UserProfile, 'uid' | 'displayName' | 'email' | 'photoURL'> = {
  height: 170,
  weight: 70,
  age: 25,
  gender: 'male',
  activityLevel: 'moderate',
  fitnessGoal: 'maintain',
  experience: {
    years: 0,
    level: 'beginner',
    squat: {
      maxWeight: 0,
      maxReps: 0
    }
  }
}; 