export interface ProgramDay {
  day: number;
  name: string;
  focus: string;
  exercises: {
    name: string;
    sets: string; // e.g., '3x10', '5x5'
  }[];
}

export interface Program {
  id: string;
  name: string;
  description: string;
  duration: string; // e.g., '8 Weeks'
  daysPerWeek: number;
  routine: ProgramDay[];
}

export const PROGRAM_DATA: Program[] = [
  {
    id: 'prog1',
    name: '3-Day Full Body Split',
    description: 'A classic program for beginners focusing on hitting all major muscle groups three times a week.',
    duration: 'Ongoing',
    daysPerWeek: 3,
    routine: [
      {
        day: 1,
        name: 'Workout A',
        focus: 'Full Body',
        exercises: [
          { name: 'Squat', sets: '3x5' },
          { name: 'Bench Press', sets: '3x5' },
          { name: 'Barbell Row', sets: '3x5' },
          { name: 'Overhead Press', sets: '3x8' },
        ],
      },
      {
        day: 2,
        name: 'Workout B',
        focus: 'Full Body',
        exercises: [
            { name: 'Deadlift', sets: '1x5' },
            { name: 'Pull-ups', sets: '3xAMRAP' }, // As Many Reps As Possible
            { name: 'Dips', sets: '3x10' },
            { name: 'Leg Press', sets: '3x12' },
        ],
      },
      {
        day: 3,
        name: 'Workout C',
        focus: 'Full Body',
        exercises: [
            { name: 'Squat', sets: '3x5' },
            { name: 'Incline Bench Press', sets: '3x8' },
            { name: 'Dumbbell Row', sets: '3x10' },
            { name: 'Bicep Curls', sets: '3x12' },
        ],
      },
    ],
  },
  // Add more programs here
]; 