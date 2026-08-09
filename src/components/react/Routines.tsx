// components/Routines.tsx
import { useState } from 'react';
import { useRoutineStore } from '@/stores/useRoutineStore';
import { useWeightStore } from '@/stores/useWeightStore';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { AllExercises } from './AllExercises';
import { RoutineView } from './RoutineView';
import { RoutinesList } from './RoutinesList';
import { ExerciseDetailsModal } from './ExerciseDetailsModal';
import  AlertsToast  from './AlertsToast';
import { type Exercise, type ExerciseInRoutine, type Unit } from '../../types/exercises.types';
import exercises from '../../exercises.json';

interface RoutinesProps {
  onNavigateToWorkout?: () => void;
}

export const Routines = ({ onNavigateToWorkout }: RoutinesProps) => {
  // Estados locales
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');

  // ✅ Estado para el Toast
  const [toast, setToast] = useState<{
    message: string;
    color: 'success' | 'error' | 'warning' | 'info' | 'default';
    duration?: number;
  } | null>(null);

  // Stores
  const {
    routines,
    activeRoutine,
    activeRoutineId,
    addRoutine,
    deleteRoutine,
    setActiveRoutineId,
    addExerciseToRoutine,
    removeExerciseFromRoutine,
    updateExerciseInRoutine,
    updateRoutine,
  } = useRoutineStore();

  const { unit: weightUnit, toggleUnit } = useWeightStore();

  const { createWorkout, addExerciseToWorkout } = useWorkoutStore();

  // ============ MANEJADORES ============
  
  const handleAddExercise = (exercise: Exercise) => {
    if (!activeRoutine) {
      setToast({
        message: 'Primero selecciona o crea una rutina',
        color: 'warning',
        duration: 3500,
      });
      return;
    }

    const exists = activeRoutine.exercises.some(
      (e: ExerciseInRoutine) => e.exerciseId === exercise.id
    );

    if (exists) {
      setToast({
        message: 'Este ejercicio ya está en la rutina',
        color: 'error',
        duration: 3000,
      });
      return;
    }

    addExerciseToRoutine(activeRoutine.id, {
      exerciseId: exercise.id,
      name: exercise.name,
      image: exercise.image,
      unit: 'kg' as Unit,
      sets: [{
        id: `set-${Date.now()}`,
        repsMin: 8,
        repsMax: 12,
        weight: 0,
        rir: 2,
      }],
      notes: '',
    });

    setToast({
      message: `"${exercise.name}" agregado a la rutina`,
      color: 'success',
      duration: 2500,
    });
  };

  const handleViewDetails = (exerciseId: string) => {
    const exercise = (exercises as Exercise[]).find((e: Exercise) => e.id === exerciseId);
    if (exercise) {
      setSelectedExercise(exercise);
      setIsModalOpen(true);
    }
  };

  const handleCreateRoutine = () => {
    if (newRoutineName.trim()) {
      addRoutine(newRoutineName.trim());
      setNewRoutineName('');
      setIsCreatingRoutine(false);
      setToast({
        message: `Rutina "${newRoutineName.trim()}" creada exitosamente`,
        color: 'success',
        duration: 3000,
      });
    }
  };

  const handleDeleteRoutine = (id: string) => {
    const routine = routines.find((r) => r.id === id);
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${routine?.name}"?`)) {
      deleteRoutine(id);
      setToast({
        message: `Rutina "${routine?.name}" eliminada`,
        color: 'info',
        duration: 3000,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateRoutine();
    }
    if (e.key === 'Escape') {
      setIsCreatingRoutine(false);
      setNewRoutineName('');
    }
  };

  const handleStartWorkout = (routineId: string) => {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) {
      setToast({
        message: 'No se encontró la rutina',
        color: 'error',
        duration: 3000,
      });
      return;
    }

    if (routine.exercises.length === 0) {
      setToast({
        message: 'Esta rutina no tiene ejercicios. Agrega algunos primero.',
        color: 'warning',
        duration: 3500,
      });
      return;
    }

    // Crear el entrenamiento
    createWorkout(
      `Entrenamiento: ${routine.name}`,
      routine.id,
      routine.name
    );

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

    // ✅ Navegar a la sección de entrenamiento
    if (onNavigateToWorkout) {
      onNavigateToWorkout();
    } else {
      // Fallback: mostrar toast si no hay navegación
      setToast({
        message: `¡Entrenamiento "${routine.name}" iniciado! 🏋️`,
        color: 'success',
        duration: 4000,
      });
    }
  };

  // ============ ESTADÍSTICAS ============
  const getRoutineStats = () => {
    if (!activeRoutine) return null;
    
    const totalExercises = activeRoutine.exercises.length;
    const totalSets = activeRoutine.exercises.reduce(
      (sum, ex) => sum + ex.sets.length, 0
    );
    const totalReps = activeRoutine.exercises.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.repsMin, 0), 0
    );
    const totalWeight = activeRoutine.exercises.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.weight * set.repsMin), 0), 0
    );

    const exercisesWithExtras = activeRoutine.exercises.filter(ex =>
      ex.sets.some(set => set.extra && (set.extra.restPauseReps > 0 || set.extra.partialReps > 0))
    );

    return {
      totalExercises,
      totalSets,
      totalReps,
      totalWeight: Math.round(totalWeight * 10) / 10,
      exercisesWithExtras: exercisesWithExtras.length,
    };
  };

  const stats = getRoutineStats();

  // ============ RENDER ============
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                💪 Mis Rutinas
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {routines.length} rutinas creadas • {routines.reduce((sum, r) => sum + r.exercises.length, 0)} ejercicios en total
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleUnit}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                Unidad: {weightUnit.toUpperCase()}
              </button>
              <button
                onClick={() => setIsCreatingRoutine(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                Nueva Rutina
              </button>
            </div>
          </div>

          {isCreatingRoutine && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nombre de la nueva rutina..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateRoutine}
                    disabled={!newRoutineName.trim()}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    Crear
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingRoutine(false);
                      setNewRoutineName('');
                    }}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Columna 1: Lista de rutinas */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-4">
              <RoutinesList
                routines={routines}
                activeId={activeRoutineId}
                onSelect={setActiveRoutineId}
                onDelete={handleDeleteRoutine}
                onAdd={addRoutine}
                onStartWorkout={handleStartWorkout}
              />
            </div>
          </div>

          {/* Columna 2: All Exercises */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl shadow-sm p-4 max-h-800px overflow-y-auto">
              <AllExercises
                exercises={exercises as Exercise[]}
                onSelectExercise={handleAddExercise}
                isInRoutine={true}
              />
            </div>
          </div>

          {/* Columna 3: Rutina Activa */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-4">
              {activeRoutine ? (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                          {activeRoutine.name}
                          {stats?.exercisesWithExtras && stats.exercisesWithExtras > 0 && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                              ⚡ Extra
                            </span>
                          )}
                        </h2>
                        {activeRoutine.description && (
                          <p className="text-sm text-gray-500 mt-1">{activeRoutine.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {activeRoutine.exercises.length > 0 && (
                          <button
                            onClick={() => handleStartWorkout(activeRoutine.id)}
                            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Entrenar
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const newName = prompt('Nuevo nombre para la rutina:', activeRoutine.name);
                            if (newName && newName.trim()) {
                              updateRoutine(activeRoutine.id, { name: newName.trim() });
                            }
                          }}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Editar nombre"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {stats && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500">Ejercicios</p>
                          <p className="font-semibold text-lg">{stats.totalExercises}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500">Series</p>
                          <p className="font-semibold text-lg">{stats.totalSets}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500">Repeticiones</p>
                          <p className="font-semibold text-lg">{stats.totalReps}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500">Peso total</p>
                          <p className="font-semibold text-lg">{stats.totalWeight}{weightUnit}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <RoutineView
                    routine={activeRoutine}
                    weightUnit={weightUnit}
                    onUpdateExercise={(exerciseId, updates) =>
                      updateExerciseInRoutine(activeRoutine.id, exerciseId, updates)
                    }
                    onRemoveExercise={(exerciseId) =>
                      removeExerciseFromRoutine(activeRoutine.id, exerciseId)
                    }
                    onViewDetails={handleViewDetails}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    No hay rutina seleccionada
                  </h3>
                  <p className="text-gray-500 text-sm mt-2 max-w-xs">
                    Selecciona una rutina de la lista o crea una nueva para comenzar a agregar ejercicios
                  </p>
                  <button
                    onClick={() => setIsCreatingRoutine(true)}
                    className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Crear nueva rutina
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <ExerciseDetailsModal
          exercise={selectedExercise}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedExercise(null);
          }}
        />
        
        {toast && (
          <AlertsToast
            message={toast.message}
            duration={toast.duration || 3000}
            color={toast.color}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Routines;