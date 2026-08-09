// utils/workoutCalculations.ts
import { type PersonalRecord, type Unit, type Workout, type WorkoutReport } from '../types/exercises.types';

/**
 * Fórmula de Epley para estimar 1RM
 * 1RM = Peso * (1 + Reps / 30)
 */
export const calculate1RM = (weight: number, reps: number): number => {
  if (reps <= 0) return 0;
  return weight * (1 + reps / 30);
};

/**
 * Calcular puntuación de volumen ajustada
 * Combina 1RM (70%) y volumen total (30%) para una comparación justa
 */
export const calculateVolumeScore = (weight: number, reps: number): number => {
  const rm = calculate1RM(weight, reps);
  const volume = weight * reps;
  return (rm * 0.7) + (volume * 0.3);
};

/**
 * Comparar dos marcas y determinar cuál es mejor
 */
export const isBetterPR = (
  current: { weight: number; reps: number },
  previous: { weight: number; reps: number }
): boolean => {
  const currentScore = calculateVolumeScore(current.weight, current.reps);
  const previousScore = calculateVolumeScore(previous.weight, previous.reps);
  return currentScore > previousScore;
};

/**
 * Obtener el mejor PR de un array de registros
 */
export const getBestPR = (records: PersonalRecord[]): PersonalRecord | null => {
  if (records.length === 0) return null;
  return records.reduce((best, current) => {
    const currentScore = calculateVolumeScore(current.weight, current.reps);
    const bestScore = calculateVolumeScore(best.weight, best.reps);
    return currentScore > bestScore ? current : best;
  });
};

/**
 * Verificar si un set es un nuevo récord personal
 */
export const checkNewPR = (
  exerciseId: string,
  weight: number,
  reps: number,
  unit: Unit,
  existingRecords: PersonalRecord[]
): { isNewPR: boolean; previousPR: PersonalRecord | null; improvement: number | null } => {
  const exerciseRecords = existingRecords.filter((r) => r.exerciseId === exerciseId);
  
  if (exerciseRecords.length === 0) {
    return { isNewPR: true, previousPR: null, improvement: null };
  }
  
  const currentScore = calculateVolumeScore(weight, reps);
  const bestRecord = getBestPR(exerciseRecords);
  
  if (!bestRecord) {
    return { isNewPR: true, previousPR: null, improvement: null };
  }
  
  const bestScore = calculateVolumeScore(bestRecord.weight, bestRecord.reps);
  const isNew = currentScore > bestScore;
  
  let improvement = null;
  if (isNew) {
    improvement = ((currentScore - bestScore) / bestScore) * 100;
  }
  
  return { isNewPR: isNew, previousPR: bestRecord, improvement };
};

/**
 * Crear un nuevo registro de PR
 */
export const createPersonalRecord = (
  exerciseId: string,
  exerciseName: string,
  weight: number,
  reps: number,
  unit: Unit
): PersonalRecord => {
  const rm = calculate1RM(weight, reps);
  const score = calculateVolumeScore(weight, reps);
  
  return {
    exerciseId,
    exerciseName,
    weight,
    reps,
    unit,
    date: new Date().toISOString(),
    estimated1RM: rm,
    volumeScore: score,
  };
};

/**
 * Obtener el último registro de un ejercicio
 */
export const getLastRecord = (
  exerciseId: string,
  records: PersonalRecord[]
): PersonalRecord | null => {
  const exerciseRecords = records
    .filter((r) => r.exerciseId === exerciseId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return exerciseRecords.length > 0 ? exerciseRecords[0] : null;
};

/**
 * Obtener el mejor PR de un ejercicio específico
 */
export const getBestRecordForExercise = (
  exerciseId: string,
  records: PersonalRecord[]
): PersonalRecord | null => {
  const exerciseRecords = records.filter((r) => r.exerciseId === exerciseId);
  return getBestPR(exerciseRecords);
};

/**
 * Obtener los mejores PRs estimados (1RM) para cada ejercicio
 */
export const getBestEstimatedPRs = (records: PersonalRecord[]): PersonalRecord[] => {
  const map = new Map<string, PersonalRecord>();
  
  records.forEach((record) => {
    const existing = map.get(record.exerciseId);
    if (!existing || record.estimated1RM > existing.estimated1RM) {
      map.set(record.exerciseId, record);
    }
  });
  
  return Array.from(map.values());
};

/**
 * Generar informe completo del entrenamiento
 */
export const generateWorkoutReport = (
  workout: Workout,
  personalRecords: PersonalRecord[],
  previousWorkouts: Workout[]
): WorkoutReport => {
  // ============================================
  // SECCIÓN 1: Nuevos récords
  // ============================================
  const newRecords: WorkoutReport['newRecords'] = [];
  
  // Agrupar sets por ejercicio y tomar el mejor set completado
  const completedSetsByExercise = workout.exercises.filter(s => s.completed);
  const exerciseMap = new Map<string, typeof completedSetsByExercise[0]>();
  
  completedSetsByExercise.forEach(set => {
    const existing = exerciseMap.get(set.exerciseId);
    if (!existing || (set.actualWeight || 0) > (existing.actualWeight || 0)) {
      exerciseMap.set(set.exerciseId, set);
    }
  });
  
  exerciseMap.forEach((set) => {
    const result = checkNewPR(
      set.exerciseId,
      set.actualWeight || 0,
      set.actualReps || 0,
      set.unit,
      personalRecords
    );
    
    if (result.isNewPR) {
      newRecords.push({
        exerciseName: set.exerciseName,
        previousRecord: result.previousPR ? {
          weight: result.previousPR.weight,
          reps: result.previousPR.reps,
          unit: result.previousPR.unit,
        } : null,
        newRecord: {
          weight: set.actualWeight || 0,
          reps: set.actualReps || 0,
          unit: set.unit,
        },
        improvement: result.improvement || 0,
      });
    }
  });
  
  // ============================================
  // SECCIÓN 2: PRs estimados (1RM)
  // ============================================
  const estimatedPRs = getBestEstimatedPRs(personalRecords).map(record => ({
    exerciseName: record.exerciseName,
    weight: record.weight,
    reps: record.reps,
    unit: record.unit,
    estimated1RM: record.estimated1RM,
    date: record.date,
  }));
  
  // ============================================
  // SECCIÓN 3: Resumen del entrenamiento
  // ============================================
  const totalSets = workout.exercises.filter(s => s.completed).length;
  const totalVolume = workout.exercises
    .filter(s => s.completed)
    .reduce((sum, set) => sum + ((set.actualWeight || 0) * (set.actualReps || 0)), 0);
  
  // Agrupar por ejercicio para el resumen
  const exerciseSummary: WorkoutReport['summary']['exercises'] = [];
  const exerciseVolumeMap = new Map<string, { name: string; sets: number; volume: number }>();
  
  workout.exercises.filter(s => s.completed).forEach(set => {
    const existing = exerciseVolumeMap.get(set.exerciseId);
    const volume = (set.actualWeight || 0) * (set.actualReps || 0);
    
    if (existing) {
      existing.sets += 1;
      existing.volume += volume;
    } else {
      exerciseVolumeMap.set(set.exerciseId, {
        name: set.exerciseName,
        sets: 1,
        volume: volume,
      });
    }
  });
  
  exerciseVolumeMap.forEach(value => {
    exerciseSummary.push(value);
  });
  
  // Comparación con objetos del mundo real
  const volumeComparison = getVolumeComparison(totalVolume);
  
  // ============================================
  // SECCIÓN 4: Comparativa con entrenamientos anteriores
  // ============================================
  const previousWorkout = previousWorkouts
    .filter(w => w.id !== workout.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null;
  
  // ✅ CORREGIDO: Usar undefined en lugar de null
  let comparison: WorkoutReport['comparison'] = undefined;
  
  if (previousWorkout) {
    const prevVolume = previousWorkout.exercises
      .filter(s => s.completed)
      .reduce((sum, set) => sum + ((set.actualWeight || 0) * (set.actualReps || 0)), 0);
    
    const difference = totalVolume - prevVolume;
    const trend = difference > 0 ? 'up' : difference < 0 ? 'down' : 'same';
    
    comparison = {
      previousWorkout: {
        date: previousWorkout.date,
        volume: prevVolume,
      },
      difference,
      trend,
    };
  }
  
  // ============================================
  // RETORNAR INFORME COMPLETO
  // ============================================
  return {
    workoutId: workout.id,
    workoutName: workout.name,
    date: workout.date,
    duration: workout.duration || 0,
    newRecords,
    estimatedPRs,
    summary: {
      totalExercises: exerciseSummary.length,
      totalSets,
      totalVolume,
      unit: 'kg',
      volumeComparison,
      exercises: exerciseSummary,
    },
    comparison,
  };
};

/**
 * Comparar volumen con objetos del mundo real (forma divertida)
 */
const getVolumeComparison = (volume: number): { object: string; weight: number; unit: string } => {
  const comparisons = [
    { threshold: 0, object: 'un vaso de agua', weight: 0.5, unit: 'kg' },
    { threshold: 50, object: 'un niño pequeño', weight: 20, unit: 'kg' },
    { threshold: 100, object: 'una persona adulta', weight: 70, unit: 'kg' },
    { threshold: 500, object: 'un oso panda', weight: 100, unit: 'kg' },
    { threshold: 1000, object: 'un caballo', weight: 500, unit: 'kg' },
    { threshold: 2000, object: 'un automóvil pequeño', weight: 1000, unit: 'kg' },
    { threshold: 5000, object: 'un elefante africano', weight: 6000, unit: 'kg' },
    { threshold: 10000, object: 'un camión de bomberos', weight: 12000, unit: 'kg' },
    { threshold: 20000, object: 'un autobús', weight: 15000, unit: 'kg' },
    { threshold: 50000, object: 'un avión pequeño', weight: 50000, unit: 'kg' },
    { threshold: 100000, object: 'una ballena azul (bebé)', weight: 2700, unit: 'kg' },
    { threshold: 150000, object: 'la Estatua de la Libertad', weight: 225000, unit: 'kg' },
  ];
  
  let selected = comparisons[0];
  for (const comp of comparisons) {
    if (volume >= comp.threshold) {
      selected = comp;
    }
  }
  
  // Ajustar el texto para hacerlo más interactivo
  const times = Math.floor(volume / selected.weight);
  let object = '';
  
  if (times > 1) {
    // Manejar plurales especiales
    const pluralMap: Record<string, string> = {
      'un elefante africano': `${times} elefantes africanos`,
      'un automóvil pequeño': `${times} automóviles pequeños`,
      'un avión pequeño': `${times} aviones pequeños`,
      'un camión de bomberos': `${times} camiones de bomberos`,
      'un autobús': `${times} autobuses`,
      'un oso panda': `${times} osos panda`,
      'un caballo': `${times} caballos`,
      'un niño pequeño': `${times} niños pequeños`,
      'un vaso de agua': `${times} vasos de agua`,
      'una persona adulta': `${times} personas adultas`,
      'una ballena azul (bebé)': `${times} ballenas azules (bebés)`,
      'la Estatua de la Libertad': `${times} Estatuas de la Libertad`,
    };
    
    object = pluralMap[selected.object] || `${times} ${selected.object}s`;
  } else if (times === 1) {
    object = `1 ${selected.object}`;
  } else {
    object = selected.object;
  }
  
  return {
    object,
    weight: selected.weight,
    unit: selected.unit,
  };
};

/**
 * Obtener estadísticas de un entrenamiento
 */
export const getWorkoutStats = (workout: Workout) => {
  const completedSets = workout.exercises.filter(s => s.completed);
  const totalSets = completedSets.length;
  const totalVolume = completedSets.reduce(
    (sum, set) => sum + ((set.actualWeight || 0) * (set.actualReps || 0)), 
    0
  );
  const totalWeight = completedSets.reduce(
    (sum, set) => sum + (set.actualWeight || 0), 
    0
  );
  const totalReps = completedSets.reduce(
    (sum, set) => sum + (set.actualReps || 0), 
    0
  );
  
  // Agrupar por ejercicio
  const exercises = new Map<string, { name: string; sets: number; reps: number; weight: number; volume: number }>();
  
  completedSets.forEach(set => {
    const existing = exercises.get(set.exerciseId);
    const volume = (set.actualWeight || 0) * (set.actualReps || 0);
    
    if (existing) {
      existing.sets += 1;
      existing.reps += set.actualReps || 0;
      existing.weight += set.actualWeight || 0;
      existing.volume += volume;
    } else {
      exercises.set(set.exerciseId, {
        name: set.exerciseName,
        sets: 1,
        reps: set.actualReps || 0,
        weight: set.actualWeight || 0,
        volume: volume,
      });
    }
  });
  
  return {
    totalSets,
    totalVolume,
    totalWeight,
    totalReps,
    exercises: Array.from(exercises.values()),
  };
};

/**
 * Calcular progreso entre dos entrenamientos
 */
export const calculateProgress = (
  currentWorkout: Workout,
  previousWorkout: Workout
): {
  volumeChange: number;
  volumeChangePercentage: number;
  exerciseProgress: { name: string; oldVolume: number; newVolume: number; change: number }[];
} => {
  const currentStats = getWorkoutStats(currentWorkout);
  const previousStats = getWorkoutStats(previousWorkout);
  
  const volumeChange = currentStats.totalVolume - previousStats.totalVolume;
  const volumeChangePercentage = previousStats.totalVolume > 0 
    ? (volumeChange / previousStats.totalVolume) * 100 
    : 0;
  
  // Progreso por ejercicio
  const exerciseProgress: { name: string; oldVolume: number; newVolume: number; change: number }[] = [];
  
  currentStats.exercises.forEach((current) => {
    const previous = previousStats.exercises.find(e => e.name === current.name);
    if (previous) {
      const change = current.volume - previous.volume;
      exerciseProgress.push({
        name: current.name,
        oldVolume: previous.volume,
        newVolume: current.volume,
        change,
      });
    } else {
      exerciseProgress.push({
        name: current.name,
        oldVolume: 0,
        newVolume: current.volume,
        change: current.volume,
      });
    }
  });
  
  return {
    volumeChange,
    volumeChangePercentage,
    exerciseProgress,
  };
};