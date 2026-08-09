// stores/useRoutineStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  type Routine, 
  type ExerciseInRoutine, 
  type ExerciseSet,
  type Unit 
} from '../types/exercises.types';

// ✅ Tipo para agregar ejercicio (sin sets obligatorios)
type AddExerciseToRoutineInput = Omit<ExerciseInRoutine, 'sets'> & {
  sets?: ExerciseSet[];
};

interface RoutineState {
  routines: Routine[];
  activeRoutineId: string | null;
  activeRoutine: Routine | null;
  
  // Acciones
  addRoutine: (name: string) => void;
  deleteRoutine: (id: string) => void;
  setActiveRoutineId: (id: string) => void;
  updateRoutine: (id: string, updates: Partial<Omit<Routine, 'id' | 'createdAt'>>) => void;
  
  addExerciseToRoutine: (routineId: string, exercise: AddExerciseToRoutineInput) => void;
  removeExerciseFromRoutine: (routineId: string, exerciseId: string) => void;
  updateExerciseInRoutine: (routineId: string, exerciseId: string, updates: Partial<Omit<ExerciseInRoutine, 'exerciseId'>>) => void;
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      routines: [],
      activeRoutineId: null,
      activeRoutine: null,

      addRoutine: (name: string) => {
        const newRoutine: Routine = {
          id: `routine-${Date.now()}`,
          name,
          description: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          exercises: [],
        };
        
        set((state) => ({
          routines: [...state.routines, newRoutine],
          activeRoutineId: newRoutine.id,
          activeRoutine: newRoutine,
        }));
      },

      deleteRoutine: (id: string) => {
        set((state) => ({
          routines: state.routines.filter((r) => r.id !== id),
          activeRoutineId: state.activeRoutineId === id ? null : state.activeRoutineId,
          activeRoutine: state.activeRoutine?.id === id ? null : state.activeRoutine,
        }));
      },

      setActiveRoutineId: (id: string) => {
        const routine = get().routines.find((r) => r.id === id) || null;
        set({
          activeRoutineId: id,
          activeRoutine: routine,
        });
      },

      updateRoutine: (id: string, updates: Partial<Omit<Routine, 'id' | 'createdAt'>>) => {
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === id
              ? { ...r, ...updates, updatedAt: new Date().toISOString() }
              : r
          ),
          activeRoutine: state.activeRoutine?.id === id
            ? { ...state.activeRoutine, ...updates, updatedAt: new Date().toISOString() }
            : state.activeRoutine,
        }));
      },

      // ✅ CORREGIDO: addExerciseToRoutine con tipo correcto
      addExerciseToRoutine: (routineId: string, exercise: AddExerciseToRoutineInput) => {
        const { routines, activeRoutine } = get();
        
        // Buscar la rutina
        const routine = routines.find((r) => r.id === routineId);
        if (!routine) return;

        // Verificar si el ejercicio ya existe
        const exists = routine.exercises.some(
          (e: ExerciseInRoutine) => e.exerciseId === exercise.exerciseId
        );
        if (exists) return;

        // ✅ Crear el ejercicio con la estructura correcta
        const newExercise: ExerciseInRoutine = {
          exerciseId: exercise.exerciseId,
          name: exercise.name,
          image: exercise.image || '',
          unit: exercise.unit || 'kg',
          sets: exercise.sets || [{
            id: `set-${Date.now()}`,
            repsMin: 8,
            repsMax: 12,
            weight: 0,
            rir: 2,
          }],
          notes: exercise.notes || '',
        };

        // Actualizar rutinas
        const updatedRoutines = routines.map((r) =>
          r.id === routineId
            ? {
                ...r,
                exercises: [...r.exercises, newExercise],
                updatedAt: new Date().toISOString(),
              }
            : r
        );

        // Actualizar activeRoutine si es la misma
        const updatedActiveRoutine = activeRoutine?.id === routineId
          ? {
              ...activeRoutine,
              exercises: [...activeRoutine.exercises, newExercise],
              updatedAt: new Date().toISOString(),
            }
          : activeRoutine;

        set({
          routines: updatedRoutines,
          activeRoutine: updatedActiveRoutine,
        });
      },

      removeExerciseFromRoutine: (routineId: string, exerciseId: string) => {
        const { routines, activeRoutine } = get();

        const updatedRoutines = routines.map((r) =>
          r.id === routineId
            ? {
                ...r,
                exercises: r.exercises.filter((e: ExerciseInRoutine) => e.exerciseId !== exerciseId),
                updatedAt: new Date().toISOString(),
              }
            : r
        );

        const updatedActiveRoutine = activeRoutine?.id === routineId
          ? {
              ...activeRoutine,
              exercises: activeRoutine.exercises.filter(
                (e: ExerciseInRoutine) => e.exerciseId !== exerciseId
              ),
              updatedAt: new Date().toISOString(),
            }
          : activeRoutine;

        set({
          routines: updatedRoutines,
          activeRoutine: updatedActiveRoutine,
        });
      },

      updateExerciseInRoutine: (
        routineId: string,
        exerciseId: string,
        updates: Partial<Omit<ExerciseInRoutine, 'exerciseId'>>
      ) => {
        const { routines, activeRoutine } = get();

        const updatedRoutines = routines.map((r) =>
          r.id === routineId
            ? {
                ...r,
                exercises: r.exercises.map((e: ExerciseInRoutine) =>
                  e.exerciseId === exerciseId
                    ? { ...e, ...updates }
                    : e
                ),
                updatedAt: new Date().toISOString(),
              }
            : r
        );

        const updatedActiveRoutine = activeRoutine?.id === routineId
          ? {
              ...activeRoutine,
              exercises: activeRoutine.exercises.map((e: ExerciseInRoutine) =>
                e.exerciseId === exerciseId
                  ? { ...e, ...updates }
                  : e
              ),
              updatedAt: new Date().toISOString(),
            }
          : activeRoutine;

        set({
          routines: updatedRoutines,
          activeRoutine: updatedActiveRoutine,
        });
      },
    }),
    {
      name: 'routine-storage',
    }
  )
);