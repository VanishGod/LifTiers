// src/types/dashboard.types.ts

export interface WorkoutSet {
  exerciseName?: string;
  actualReps?: number;
  [key: string]: unknown;
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  exercises?: WorkoutSet[];
  [key: string]: unknown;
}

export interface FavoriteItem {
  name: string;
  count: number;
}

export interface WorkoutStorage {
  state?: {
    workouts?: Workout[];
    personalRecords?: unknown[];
  };
}