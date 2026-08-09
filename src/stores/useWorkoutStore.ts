// stores/useWorkoutStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  type Workout, 
  type WorkoutSet, 
  type ExerciseSet, 
  type Unit, 
  type ExtraReps,
  type PersonalRecord,
  type WorkoutReport,
} from '../types/exercises.types';
import { 
  createPersonalRecord, 
  checkNewPR, 
  getLastRecord,
  getBestRecordForExercise,
  generateWorkoutReport,
  getBestEstimatedPRs,
} from '../utils/workoutCalculations';

interface WorkoutState {
  // ============ ESTADO ============
  workouts: Workout[];
  currentWorkout: Workout | null;
  personalRecords: PersonalRecord[];
  
  // ============ ACCIONES DE ENTRENAMIENTO ============
  createWorkout: (name: string, routineId?: string, routineName?: string) => void;
  addExerciseToWorkout: (exerciseId: string, name: string, image: string, unit: Unit, sets: ExerciseSet[]) => void;
  updateWorkoutSet: (exerciseId: string, setIndex: number, updates: Partial<WorkoutSet>) => void;
  removeExerciseFromWorkout: (exerciseId: string) => void;
  completeWorkout: () => WorkoutReport | null;
  cancelWorkout: () => void;
  loadWorkout: (workoutId: string) => void;
  deleteWorkout: (workoutId: string) => void;
  clearHistory: () => void;
  
  // ============ FUNCIONES DE PRs ============
  getLastRecordForExercise: (exerciseId: string) => PersonalRecord | null;
  getBestRecordForExercise: (exerciseId: string) => PersonalRecord | null;
  checkIfNewPR: (exerciseId: string, weight: number, reps: number) => boolean;
  getPersonalRecords: () => PersonalRecord[];
  
  // ============ FUNCIONES DE REPORTES ============
  getWorkoutReport: (workoutId: string) => WorkoutReport | null;
  getLastWorkoutReport: () => WorkoutReport | null;
  getAllWorkoutReports: () => WorkoutReport[];
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      // ============ ESTADO INICIAL ============
      workouts: [],
      currentWorkout: null,
      personalRecords: [],

      // ============ CREAR ENTRENAMIENTO ============
      createWorkout: (name: string, routineId?: string, routineName?: string) => {
        const newWorkout: Workout = {
          id: `workout-${Date.now()}`,
          name,
          date: new Date().toISOString(),
          exercises: [],
          routineId,
          routineName,
        };
        set({ currentWorkout: newWorkout });
      },

      // ============ AGREGAR EJERCICIO ============
      addExerciseToWorkout: (exerciseId: string, name: string, image: string, unit: Unit, sets: ExerciseSet[]) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;

        // Verificar si el ejercicio ya existe
        const exists = currentWorkout.exercises.some((e) => e.exerciseId === exerciseId);
        if (exists) return;

        // Obtener el último registro para mostrar como placeholder
        const lastRecord = get().getLastRecordForExercise(exerciseId);
        const bestRecord = get().getBestRecordForExercise(exerciseId);

        const newSets: WorkoutSet[] = sets.map((set, index) => ({
          id: `wset-${Date.now()}-${index}`,
          exerciseId,
          exerciseName: name,
          exerciseImage: image,
          setIndex: index,
          repsMin: set.repsMin,
          repsMax: set.repsMax,
          weight: set.weight,
          rir: set.rir,
          unit: unit,
          extra: set.extra,
          actualReps: 0,
          actualWeight: 0,
          actualRir: 0,
          completed: false,
          // ✅ Placeholders para PRs
          previousBestReps: bestRecord?.reps || null,
          previousBestWeight: bestRecord?.weight || null,
          lastReps: lastRecord?.reps || null,
          lastWeight: lastRecord?.weight || null,
        }));

        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: [...currentWorkout.exercises, ...newSets],
          },
        });
      },

      // ============ ACTUALIZAR SET ============
      updateWorkoutSet: (exerciseId: string, setIndex: number, updates: Partial<WorkoutSet>) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;

        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: currentWorkout.exercises.map((set) =>
              set.exerciseId === exerciseId && set.setIndex === setIndex
                ? { ...set, ...updates }
                : set
            ),
          },
        });
      },

      // ============ ELIMINAR EJERCICIO ============
      removeExerciseFromWorkout: (exerciseId: string) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;

        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: currentWorkout.exercises.filter((e) => e.exerciseId !== exerciseId),
          },
        });
      },

      // ============ COMPLETAR ENTRENAMIENTO ============
      completeWorkout: () => {
        const { currentWorkout, workouts, personalRecords } = get();
        if (!currentWorkout) return null;

        // Verificar que todos los sets estén completados
        const allCompleted = currentWorkout.exercises.every((set) => set.completed);
        if (!allCompleted) {
          alert('Hay ejercicios sin completar. ¿Seguro que quieres finalizar?');
          return null;
        }

        // ✅ Procesar nuevos PRs
        const newPRs: PersonalRecord[] = [];
        const exerciseMap = new Map();

        currentWorkout.exercises.forEach((set) => {
          if (set.completed && set.actualReps > 0 && set.actualWeight > 0) {
            // Verificar si es un nuevo PR
            const { isNewPR, previousPR, improvement } = checkNewPR(
              set.exerciseId,
              set.actualWeight,
              set.actualReps,
              set.unit,
              personalRecords
            );

            if (isNewPR) {
              const newPR = createPersonalRecord(
                set.exerciseId,
                set.exerciseName,
                set.actualWeight,
                set.actualReps,
                set.unit
              );
              newPRs.push(newPR);
            }

            // Guardar el mejor registro para este ejercicio
            const best = getBestRecordForExercise(set.exerciseId, personalRecords);
            if (best) {
              exerciseMap.set(set.exerciseId, best);
            }
          }
        });

        const completedWorkout = {
          ...currentWorkout,
          duration: 0,
        };

        // ✅ Actualizar estado
        set({
          workouts: [...workouts, completedWorkout],
          currentWorkout: null,
          personalRecords: [...personalRecords, ...newPRs],
        });

        // ✅ Generar reporte
        const report = get().getWorkoutReport(completedWorkout.id);
        
        // Mostrar mensaje de nuevos PRs
        if (newPRs.length > 0) {
          const prMessages = newPRs.map(
            (pr) => `🏆 ${pr.exerciseName}: ${pr.weight}${pr.unit} x ${pr.reps} reps`
          );
          setTimeout(() => {
            alert(`¡Nuevos Récords Personales! 🎉\n\n${prMessages.join('\n')}`);
          }, 100);
        } else {
          setTimeout(() => {
            alert('¡Entrenamiento completado con éxito! 💪');
          }, 100);
        }

        return report;
      },

      // ============ CANCELAR ENTRENAMIENTO ============
      cancelWorkout: () => {
        if (window.confirm('¿Cancelar entrenamiento? Se perderá todo el progreso.')) {
          set({ currentWorkout: null });
        }
      },

      // ============ CARGAR ENTRENAMIENTO ============
      loadWorkout: (workoutId: string) => {
        const { workouts } = get();
        const workout = workouts.find((w) => w.id === workoutId);
        if (workout) {
          set({ currentWorkout: workout });
        }
      },

      // ============ ELIMINAR ENTRENAMIENTO ============
      deleteWorkout: (workoutId: string) => {
        if (window.confirm('¿Eliminar este entrenamiento del historial?')) {
          set({
            workouts: get().workouts.filter((w) => w.id !== workoutId),
          });
        }
      },

      // ============ LIMPIAR HISTORIAL ============
      clearHistory: () => {
        if (window.confirm('¿Eliminar todo el historial de entrenamientos?')) {
          set({ workouts: [], personalRecords: [] });
        }
      },

      // ============ FUNCIONES DE PRs ============
      getLastRecordForExercise: (exerciseId: string) => {
        const { personalRecords } = get();
        const records = personalRecords
          .filter((r) => r.exerciseId === exerciseId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return records.length > 0 ? records[0] : null;
      },

      getBestRecordForExercise: (exerciseId: string) => {
        const { personalRecords } = get();
        const records = personalRecords.filter((r) => r.exerciseId === exerciseId);
        if (records.length === 0) return null;
        
        return records.reduce((best, current) => {
          const currentScore = current.weight * (1 + current.reps / 30);
          const bestScore = best.weight * (1 + best.reps / 30);
          return currentScore > bestScore ? current : best;
        });
      },

      checkIfNewPR: (exerciseId: string, weight: number, reps: number) => {
        const { personalRecords } = get();
        const result = checkNewPR(exerciseId, weight, reps, 'kg', personalRecords);
        return result.isNewPR;
      },

      getPersonalRecords: () => {
        return get().personalRecords;
      },

      // ============ FUNCIONES DE REPORTES ============
      getWorkoutReport: (workoutId: string) => {
        const { workouts, personalRecords } = get();
        const workout = workouts.find(w => w.id === workoutId);
        if (!workout) return null;
        
        // Obtener entrenamientos anteriores para comparar
        const previousWorkouts = workouts.filter(w => w.id !== workoutId);
        
        return generateWorkoutReport(workout, personalRecords, previousWorkouts);
      },

      getLastWorkoutReport: () => {
        const { workouts, personalRecords } = get();
        const lastWorkout = workouts
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        
        if (!lastWorkout) return null;
        
        const previousWorkouts = workouts.filter(w => w.id !== lastWorkout.id);
        return generateWorkoutReport(lastWorkout, personalRecords, previousWorkouts);
      },

      getAllWorkoutReports: () => {
        const { workouts, personalRecords } = get();
        return workouts.map(workout => {
          const previousWorkouts = workouts.filter(w => w.id !== workout.id);
          return generateWorkoutReport(workout, personalRecords, previousWorkouts);
        });
      },
    }),
    {
      name: 'workout-storage',
      // ✅ Solo persistir workouts y personalRecords (no currentWorkout)
      partialize: (state) => ({
        workouts: state.workouts,
        personalRecords: state.personalRecords,
      }),
    }
  )
);