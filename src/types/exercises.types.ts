// src/types/exercises.types.ts

// ============================================
// 1. TIPOS BASE
// ============================================

export type Unit = 'kg' | 'lbs';
export type Category = 'cardio' | 'strength' | 'flexibility' | 'balance' | 'plyometric';
export type BodyPart = 'chest' | 'back' | 'legs' | 'arms' | 'shoulders' | 'core' | 'full_body';
export type Equipment = 'dumbbell' | 'barbell' | 'machine' | 'bodyweight' | 'cable' | 'kettlebell' | 'resistance_band';
export type MuscleGroup = 'pectoralis' | 'latissimus' | 'quadriceps' | 'hamstrings' | 'biceps' | 'triceps' | 'deltoids' | 'abdominals' | 'glutes' | 'calves' | 'forearms' | 'traps';

// ============================================
// 2. EJERCICIO BASE (desde el JSON)
// ============================================

export interface Exercise {
  id: string;
  name: string;
  category: Category | string;
  body_part: BodyPart | string;
  equipment: Equipment | string;
  image: string;
  gif_url: string;
  muscle_group: MuscleGroup | string;
  secondary_muscles: string[];
  target: string;
  instruction_steps: {
    [key: string]: string[];
  };
  created_at: string;
  attribution: string;
}

// ============================================
// 3. TÉCNICAS AVANZADAS
// ============================================

export interface ExtraReps {
  type: 'rest-pause' | 'partials' | 'both';
  restPauseReps: number;    // Repeticiones post rest-pause
  partialReps: number;      // Repeticiones parciales
}

// ============================================
// 4. SERIES
// ============================================

export interface ExerciseSet {
  id: string;
  repsMin: number;          // Mínimo de repeticiones (ej: 8)
  repsMax: number;          // Máximo de repeticiones (ej: 12)
  weight: number;           // Peso
  rir: number;             // Reps in Reserve (0-5)
  extra?: ExtraReps;        // Técnicas avanzadas (opcional)
  // Campos para registro de entrenamiento
  completed?: boolean;
  actualReps?: number;
  actualWeight?: number;
  actualRir?: number;
}

// ============================================
// 5. EJERCICIO EN RUTINA
// ============================================

export interface ExerciseInRoutine {
  exerciseId: string;
  name: string;
  image: string;
  sets: ExerciseSet[];
  unit: Unit;
  notes?: string;
}

// ============================================
// 6. RUTINA
// ============================================

export interface Routine {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  exercises: ExerciseInRoutine[];
}

// ============================================
// 7. SET DE ENTRENAMIENTO (WORKOUT)
// ============================================

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseImage: string;
  setIndex: number;
  repsMin: number;
  repsMax: number;
  weight: number;
  rir: number;
  unit: Unit;
  extra?: ExtraReps;
  // Registro real
  actualReps: number;
  actualWeight: number;
  actualRir: number;
  completed: boolean;
  // Placeholders para PRs
  previousBestReps?: number | null;
  previousBestWeight?: number | null;
  lastReps?: number | null;
  lastWeight?: number | null;
}

// ============================================
// 8. ENTRENAMIENTO (WORKOUT)
// ============================================

export interface Workout {
  id: string;
  name: string;
  date: string;
  duration?: number;           // en minutos
  exercises: WorkoutSet[];
  notes?: string;
  // Relación con rutina (opcional)
  routineId?: string;
  routineName?: string;
}

// ============================================
// 9. RÉCORDS PERSONALES (PRs)
// ============================================

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  unit: Unit;
  date: string;
  estimated1RM: number;      // 1RM estimado con fórmula Epley
  volumeScore: number;       // Puntuación de volumen para comparación
}

// ============================================
// 10. INFORME DE ENTRENAMIENTO
// ============================================

export interface WorkoutReport {
  workoutId: string;
  workoutName: string;
  date: string;
  duration?: number;
  
  // Sección 1: Nuevos récords
  newRecords: {
    exerciseName: string;
    previousRecord: {
      weight: number;
      reps: number;
      unit: Unit;
    } | null;
    newRecord: {
      weight: number;
      reps: number;
      unit: Unit;
    };
    improvement: number;      // % de mejora
  }[];
  
  // Sección 2: PRs estimados (1RM)
  estimatedPRs: {
    exerciseName: string;
    weight: number;
    reps: number;
    unit: Unit;
    estimated1RM: number;
    date: string;
  }[];
  
  // Sección 3: Resumen del entrenamiento
  summary: {
    totalExercises: number;
    totalSets: number;
    totalVolume: number;      // peso * reps
    unit: Unit;
    volumeComparison: {
      object: string;          // Ej: "un elefante africano"
      weight: number;
      unit: string;
    };
    exercises: {
      name: string;
      sets: number;
      volume: number;
    }[];
  };
  
  // Sección 4: Comparativa con entrenamientos anteriores
  comparison?: {
    previousWorkout: {
      date: string;
      volume: number;
    } | null;
    difference: number | null;
    trend: 'up' | 'down' | 'same' | null;
  };
}

// ============================================
// 11. HISTORIAL DE ENTRENAMIENTOS
// ============================================

export interface WorkoutHistory {
  workouts: Workout[];
  personalRecords: PersonalRecord[];
}

// ============================================
// 12. TIPOS UTILITARIOS (para formularios, etc.)
// ============================================

// Para crear/editar ejercicios en rutina
export type CreateExerciseInRoutine = Omit<ExerciseInRoutine, 'sets'> & {
  sets?: ExerciseSet[];
};

// Para crear/editar rutinas
export type CreateRoutine = Omit<Routine, 'id' | 'createdAt' | 'updatedAt' | 'exercises'> & {
  exercises?: ExerciseInRoutine[];
};

// Para crear/editar entrenamientos
export type CreateWorkout = Omit<Workout, 'id' | 'date' | 'exercises'> & {
  exercises?: WorkoutSet[];
};

// Para crear/editar sets
export type CreateExerciseSet = Omit<ExerciseSet, 'id'>;

// Para crear/editar PRs
export type CreatePersonalRecord = Omit<PersonalRecord, 'date'>;

// ============================================
// 13. TIPOS PARA PROPS DE COMPONENTES
// ============================================

// Props para componentes de rutina
export interface RoutineViewProps {
  routine: Routine;
  weightUnit: Unit;
  onUpdateExercise: (exerciseId: string, updates: Partial<ExerciseInRoutine>) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onViewDetails: (exerciseId: string) => void;
}

// Props para componentes de entrenamiento
export interface WorkoutInProgressProps {
  workout: Workout;
  onUpdateSet: (exerciseId: string, setIndex: number, updates: Partial<WorkoutSet>) => void;
  onAddExercise: (exercise: Exercise) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onComplete: () => void;
  onCancel: () => void;
  exercises: Exercise[];
}

// Props para el informe
export interface WorkoutReportModalProps {
  report: WorkoutReport;
  onClose: () => void;
  onViewHistory: () => void;
}

// ============================================
// 14. FILTROS Y ORDENAMIENTO
// ============================================

export interface ExerciseFilters {
  searchQuery?: string;
  category?: string;
  bodyPart?: string;
  equipment?: string;
  muscleGroup?: string;
}

export interface SortOptions {
  field: 'name' | 'category' | 'body_part' | 'muscle_group';
  direction: 'asc' | 'desc';
}

// ============================================
// 15. ESTADÍSTICAS DE RUTINA
// ============================================

export interface RoutineStats {
  totalExercises: number;
  totalSets: number;
  totalReps: number;
  totalWeight: number;
  unit: Unit;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight: number;
  }[];
}

// ============================================
// 16. ESTADÍSTICAS DE ENTRENAMIENTO
// ============================================

export interface WorkoutStats {
  totalWorkouts: number;
  totalExercises: number;
  totalSets: number;
  totalVolume: number;
  unit: Unit;
  averageDuration: number;
  mostFrequentExercises: {
    name: string;
    count: number;
  }[];
  // Mejoras
  improvements: {
    exerciseName: string;
    oldWeight: number;
    newWeight: number;
    oldReps: number;
    newReps: number;
    improvementPercentage: number;
  }[];
}

// ============================================
// 17. RESPUESTAS DE API (si usas API)
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// 18. CONFIGURACIÓN DE USUARIO
// ============================================

export interface UserSettings {
  defaultUnit: Unit;
  defaultRepsRange: {
    min: number;
    max: number;
  };
  defaultWeight: number;
  defaultRIR: number;
  showExtraReps: boolean;
  autoSaveWorkout: boolean;
}
