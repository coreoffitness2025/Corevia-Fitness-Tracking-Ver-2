import { UserProfile } from '../types';

export const DEFAULT_PROFILE: UserProfile['profile'] = {
  height: 170,
  weight: 70,
  age: 25,
  gender: 'male',
  experience: {
    years: 0,
    level: 'beginner',
    squat: {
      maxWeight: 0,
      maxReps: 0
    }
  }
}; 