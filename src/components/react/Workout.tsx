// components/Workout.tsx
import { useState } from 'react';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { useRoutineStore } from '@/stores/useRoutineStore';
import { type Exercise, type ExerciseInRoutine, type WorkoutSet } from '../../types/exercises.types';
import exercises from '../../exercises.json';
import { WorkoutSelector } from './WorkoutSelector';
import { WorkoutInProgress } from './WorkoutInProgress';
import { WorkoutHistory } from './WorkoutHistory';
import { WorkoutReportModal } from './WorkoutReportModal'
import { type WorkoutReport } from '../../types/exercises.types';
import AlertsToast from './AlertsToast';

export const Workout = () => {
  // ============ ESTADOS ============
  const [view, setView] = useState<'selector' | 'in-progress' | 'history'>('selector');
  const [showReport, setShowReport] = useState(false);
  const [currentReport, setCurrentReport] = useState<WorkoutReport | null>(null);
  
  // ============ STORES ============
  const {
    workouts,
    currentWorkout,
    createWorkout,
    addExerciseToWorkout,
    updateWorkoutSet,
    removeExerciseFromWorkout,
    completeWorkout,
    cancelWorkout,
    loadWorkout,
    deleteWorkout,
    clearHistory,
    getWorkoutReport,
    getLastWorkoutReport,
  } = useWorkoutStore();

  const { routines } = useRoutineStore();

  // ============ MANEJADORES ============

  /**
   * Iniciar entrenamiento libre
   */
  const handleStartFreeWorkout = (name: string) => {
    createWorkout(name);
    setView('in-progress');
  };

  /**
   * Iniciar entrenamiento basado en rutina
   */
  const handleStartRoutineWorkout = (routineId: string) => {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;

    // Crear el entrenamiento con el nombre de la rutina
    createWorkout(`Entrenamiento: ${routine.name}`, routineId, routine.name);

    // Agregar todos los ejercicios de la rutina
    routine.exercises.forEach((exercise: ExerciseInRoutine) => {
      addExerciseToWorkout(
        exercise.exerciseId,
        exercise.name,
        exercise.image,
        exercise.unit,
        exercise.sets
      );
    });

    setView('in-progress');
  };

  /**
   * Agregar ejercicio al entrenamiento actual
   */
  const handleAddExercise = (exercise: Exercise) => {
    if (!currentWorkout) return;

    // Verificar si ya existe
    const exists = currentWorkout.exercises.some(
      (set) => set.exerciseId === exercise.id
    );
    if (exists) {
     <AlertsToast
     message='Este ejercicio ya está en el entrenamiento'
     duration={3000}
     color='warning'
     />
      return;
    }

    // Crear un set por defecto
    const defaultSets = [{
      id: `set-${Date.now()}`,
      repsMin: 8,
      repsMax: 12,
      weight: 0,
      rir: 2,
    }];

    addExerciseToWorkout(
      exercise.id,
      exercise.name,
      exercise.image,
      'kg',
      defaultSets
    );
  };

  /**
   * Actualizar un set del entrenamiento
   */
  const handleUpdateSet = (exerciseId: string, setIndex: number, updates: Partial<WorkoutSet>) => {
    updateWorkoutSet(exerciseId, setIndex, updates);
  };

  /**
   * Eliminar ejercicio del entrenamiento
   */
  const handleRemoveExercise = (exerciseId: string) => {
    removeExerciseFromWorkout(exerciseId);
  };

  /**
   * Completar entrenamiento y mostrar reporte
   */
  const handleCompleteWorkout = () => {
    const report = completeWorkout();
    
    if (report) {
      setCurrentReport(report);
      setShowReport(true);
    }
    
    setView('selector');
  };

  /**
   * Cancelar entrenamiento
   */
  const handleCancelWorkout = () => {
    cancelWorkout();
    setView('selector');
  };

  /**
   * Ver historial de entrenamientos
   */
  const handleViewHistory = () => {
    setView('history');
  };

  /**
   * Cargar un entrenamiento del historial
   */
  const handleLoadWorkout = (workoutId: string) => {
    loadWorkout(workoutId);
    setView('in-progress');
  };

  /**
   * Eliminar entrenamiento del historial
   */
  const handleDeleteWorkout = (workoutId: string) => {
    deleteWorkout(workoutId);
  };

  /**
   * Limpiar todo el historial
   */
  const handleClearHistory = () => {
    clearHistory();
  };

  /**
   * Ver informe de un entrenamiento del historial
   */
  const handleViewReport = (workoutId: string) => {
    const report = getWorkoutReport(workoutId);
    if (report) {
      setCurrentReport(report);
      setShowReport(true);
    }
  };

  /**
   * Cerrar el modal de informe
   */
  const handleCloseReport = () => {
    setShowReport(false);
    setCurrentReport(null);
  };

  // ============ RENDER ============

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-gray-50 min-h-screen rounded-xl p-4">
        
        {/* ===== SELECTOR ===== */}
        {view === 'selector' && (
          <WorkoutSelector
            routines={routines}
            onStartFreeWorkout={handleStartFreeWorkout}
            onStartRoutineWorkout={handleStartRoutineWorkout}
            onViewHistory={handleViewHistory}
          />
        )}

        {/* ===== ENTRENAMIENTO EN PROGRESO ===== */}
        {view === 'in-progress' && currentWorkout && (
          <WorkoutInProgress
            workout={currentWorkout}
            onUpdateSet={handleUpdateSet}
            onAddExercise={handleAddExercise}
            onRemoveExercise={handleRemoveExercise}
            onComplete={handleCompleteWorkout}
            onCancel={handleCancelWorkout}
            exercises={exercises as Exercise[]}
          />
        )}

        {/* ===== HISTORIAL ===== */}
        {view === 'history' && (
          <WorkoutHistory
            workouts={workouts}
            onLoadWorkout={handleLoadWorkout}
            onDeleteWorkout={handleDeleteWorkout}
            onClearHistory={handleClearHistory}
            onBack={() => setView('selector')}
            onViewReport={handleViewReport}
          />
        )}

        {/* ===== MODAL DE INFORME ===== */}
        {showReport && currentReport && (
          <WorkoutReportModal
            report={currentReport}
            onClose={handleCloseReport}
            onViewHistory={() => {
              handleCloseReport();
              setView('history');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Workout;