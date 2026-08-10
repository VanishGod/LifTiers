// components/Workout.tsx
import { useState } from 'react';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { useRoutineStore } from '@/stores/useRoutineStore';
import { type Exercise, type ExerciseInRoutine, type WorkoutSet } from '../../types/exercises.types';
import exercises from '../../exercises.json';
import { WorkoutSelector } from './WorkoutSelector';
import { WorkoutInProgress } from './WorkoutInProgress';
import { WorkoutHistory } from './WorkoutHistory';
import { WorkoutReportModal } from './WorkoutReportModal';
import { type WorkoutReport } from '../../types/exercises.types';
import AlertsToast from './AlertsToast';

interface WorkoutProps {
  onNavigateToRoutines?: () => void; // ✅ Para volver a rutinas
}

export const Workout = ({ onNavigateToRoutines }: WorkoutProps) => {
  // ============ ESTADOS ============
  const [view, setView] = useState<'selector' | 'in-progress' | 'history'>('selector');
  const [showReport, setShowReport] = useState(false);
  const [currentReport, setCurrentReport] = useState<WorkoutReport | null>(null);
  
  // ✅ Toast unificado
  const [toast, setToast] = useState<{
    message: string;
    color: 'success' | 'error' | 'warning' | 'info' | 'default';
    duration?: number;
  } | null>(null);

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

  const handleStartFreeWorkout = (name: string) => {
    createWorkout(name);
    setView('in-progress');
  };

  const handleStartRoutineWorkout = (routineId: string) => {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;

    createWorkout(`Entrenamiento: ${routine.name}`, routineId, routine.name);

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

  const handleAddExercise = (exercise: Exercise) => {
    if (!currentWorkout) return;

    const exists = currentWorkout.exercises.some(
      (set) => set.exerciseId === exercise.id
    );
    if (exists) {
      setToast({
        message: 'Este ejercicio ya está en el entrenamiento',
        color: 'warning',
        duration: 3000,
      });
      return;
    }

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

    setToast({
      message: `"${exercise.name}" agregado al entrenamiento`,
      color: 'success',
      duration: 2500,
    });
  };

  const handleUpdateSet = (exerciseId: string, setIndex: number, updates: Partial<WorkoutSet>) => {
    updateWorkoutSet(exerciseId, setIndex, updates);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    removeExerciseFromWorkout(exerciseId);
    setToast({
      message: 'Ejercicio eliminado del entrenamiento',
      color: 'info',
      duration: 2000,
    });
  };

  const handleCompleteWorkout = () => {
    // ✅ Pasar toast al store para mostrar mensajes
    const report = completeWorkout((msg, color, duration) => {
      setToast({ message: msg, color: color || 'success', duration: duration || 3000 });
    });
    
    if (report) {
      setCurrentReport(report);
      setShowReport(true);
    }
    
    setView('selector');
  };

  const handleCancelWorkout = () => {
    cancelWorkout((msg, color, duration) => {
      setToast({ message: msg, color: color || 'info', duration: duration || 2500 });
    });
    setView('selector');
  };

  const handleViewHistory = () => {
    setView('history');
  };

  const handleLoadWorkout = (workoutId: string) => {
    loadWorkout(workoutId);
    setView('in-progress');
  };

  const handleDeleteWorkout = (workoutId: string) => {
    deleteWorkout(workoutId, (msg, color, duration) => {
      setToast({ message: msg, color: color || 'info', duration: duration || 3000 });
    });
  };

  const handleClearHistory = () => {
    clearHistory((msg, color, duration) => {
      setToast({ message: msg, color: color || 'info', duration: duration || 3000 });
    });
  };

  const handleViewReport = (workoutId: string) => {
    const report = getWorkoutReport(workoutId);
    if (report) {
      setCurrentReport(report);
      setShowReport(true);
    }
  };

  const handleCloseReport = () => {
    setShowReport(false);
    setCurrentReport(null);
  };

  // ============ RENDER ============

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-gray-50 min-h-screen rounded-xl p-4">
        
        {/* ✅ TOAST UNIFICADO */}
        {toast && (
          <AlertsToast
            message={toast.message}
            duration={toast.duration || 3000}
            color={toast.color}
            onClose={() => setToast(null)}
          />
        )}

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