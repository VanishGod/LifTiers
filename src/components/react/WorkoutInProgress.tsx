// components/workout/WorkoutInProgress.tsx
import { useState } from 'react';
import { type Workout, type WorkoutSet, type Exercise } from '../../types/exercises.types';
import { WorkoutSetCard } from './WorkoutSetCard';
import { AllExercises } from '../../components/react/AllExercises';
import { useWorkoutStore } from '@/stores/useWorkoutStore';

interface WorkoutInProgressProps {
  workout: Workout;
  onUpdateSet: (exerciseId: string, setIndex: number, updates: Partial<WorkoutSet>) => void;
  onAddExercise: (exercise: Exercise) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onComplete: () => void;
  onCancel: () => void;
  exercises: Exercise[];
}

export const WorkoutInProgress = ({
  workout,
  onUpdateSet,
  onAddExercise,
  onRemoveExercise,
  onComplete,
  onCancel,
  exercises,
}: WorkoutInProgressProps) => {
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const { personalRecords } = useWorkoutStore();

  const groupedExercises = workout.exercises.reduce((acc, set) => {
    if (!acc[set.exerciseId]) {
      acc[set.exerciseId] = {
        exerciseId: set.exerciseId,
        name: set.exerciseName,
        image: set.exerciseImage,
        sets: [],
      };
    }
    acc[set.exerciseId].sets.push(set);
    return acc;
  }, {} as Record<string, { exerciseId: string; name: string; image: string; sets: WorkoutSet[] }>);

  const exerciseGroups = Object.values(groupedExercises);

  const totalSets = workout.exercises.length;
  const completedSets = workout.exercises.filter((set) => set.completed).length;
  const progress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  const estimatedDuration = workout.exercises.length * 3;
  const hasNewPRs = workout.exercises.some(
    (set) => set.completed && set.actualReps > 0 && set.actualWeight > 0
  );

  return (
    <div className="space-y-3 md:space-y-4">
      {/* ===== HEADER ===== */}
      <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="w-full sm:w-auto">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-blue-500">🏋️</span>
              <span className="truncate">{workout.name}</span>
            </h2>
            {workout.routineName && (
              <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                <span className="text-gray-400">📋</span>
                Basado en: {workout.routineName}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1 hidden sm:block">
              💡 Los placeholders muestran tu última marca. ¡Superarla es un nuevo récord!
            </p>
          </div>
          <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
            <div className="text-center flex-1 sm:flex-none">
              <span className="text-xs text-gray-500">Progreso</span>
              <p className="text-base md:text-lg font-bold text-blue-600">{progress}%</p>
            </div>
            <div className="text-center flex-1 sm:flex-none">
              <span className="text-xs text-gray-500">Sets</span>
              <p className="text-base md:text-lg font-bold text-gray-700">
                {completedSets}/{totalSets}
              </p>
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-3 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-blue-400 to-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Estadísticas rápidas */}
        {totalSets > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-1 md:gap-2 text-xs text-gray-500">
            <div className="bg-gray-50 rounded-lg p-1.5 md:p-2 text-center">
              <span className="block font-medium text-gray-700 text-sm md:text-base">{exerciseGroups.length}</span>
              <span className="text-[10px] md:text-xs">Ejercicios</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-1.5 md:p-2 text-center">
              <span className="block font-medium text-gray-700 text-sm md:text-base">{totalSets}</span>
              <span className="text-[10px] md:text-xs">Series</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-1.5 md:p-2 text-center">
              <span className="block font-medium text-gray-700 text-sm md:text-base">~{estimatedDuration}min</span>
              <span className="text-[10px] md:text-xs">Tiempo</span>
            </div>
          </div>
        )}
      </div>

      {/* ===== BOTÓN AGREGAR EJERCICIO ===== */}
      <button
        onClick={() => setIsAddingExercise(!isAddingExercise)}
        className="w-full py-2.5 md:py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-xs md:text-sm font-medium flex items-center justify-center gap-2"
      >
        {isAddingExercise ? (
          <>
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cerrar búsqueda
          </>
        ) : (
          <>
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar ejercicio
          </>
        )}
      </button>

      {/* ===== BÚSQUEDA ===== */}
      {isAddingExercise && (
        <div className="bg-gray-50 rounded-lg p-3 md:p-4 max-h-300px md:max-h-400px overflow-y-auto border border-gray-200">
          <AllExercises
            exercises={exercises}
            onSelectExercise={(exercise) => {
              onAddExercise(exercise);
              setIsAddingExercise(false);
            }}
            isInRoutine={true}
          />
        </div>
      )}

      {/* ===== LISTA DE EJERCICIOS ===== */}
      <div className="space-y-3 md:space-y-4 max-h-400px md:max-h-500px overflow-y-auto pr-1">
        {exerciseGroups.map((group) => (
          <div key={group.exerciseId} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Encabezado */}
            <div className="p-2.5 md:p-3 bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center gap-2 md:gap-3">
              <img
                src={group.image || '/default-exercise.png'}
                alt={group.name}
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover bg-white border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-exercise.png';
                }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-800 text-sm md:text-base truncate">
                  {group.name}
                </h4>
                <p className="text-[10px] md:text-xs text-gray-500">
                  {group.sets.filter((s) => s.completed).length}/{group.sets.length} sets completados
                  {group.sets.some(s => s.extra && (s.extra.restPauseReps > 0 || s.extra.partialReps > 0)) && (
                    <span className="ml-2 text-purple-600">⚡ Extra</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm(`¿Eliminar "${group.name}" del entrenamiento?`)) {
                    onRemoveExercise(group.exerciseId);
                  }
                }}
                className="p-1 md:p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Sets */}
            <div className="p-2 md:p-3 space-y-2">
              {group.sets.map((set, index) => (
                <WorkoutSetCard
                  key={set.id}
                  set={set}
                  setIndex={index}
                  unit={set.unit}
                  onUpdate={(updates) => onUpdateSet(group.exerciseId, index, updates)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Estado vacío */}
        {exerciseGroups.length === 0 && (
          <div className="text-center py-8 md:py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
            <div className="text-4xl md:text-6xl mb-3 md:mb-4">👋</div>
            <p className="text-gray-500 font-medium text-base md:text-lg">No hay ejercicios</p>
            <p className="text-xs md:text-sm text-gray-400 mt-1">
              Haz clic en <span className="font-medium text-blue-500">"Agregar ejercicio"</span>
            </p>
          </div>
        )}
      </div>

      {/* ===== ACCIONES ===== */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-3 md:pt-4 border-t border-gray-200">
        <button
          onClick={onComplete}
          disabled={totalSets === 0}
          className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <span>🎯</span>
          Finalizar
          {totalSets > 0 && (
            <span className="text-[10px] md:text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {completedSets}/{totalSets}
            </span>
          )}
        </button>
        <button
          onClick={onCancel}
          className="px-4 md:px-6 py-2.5 md:py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancelar
        </button>
      </div>

      {/* Mensajes informativos */}
      {totalSets > 0 && completedSets < totalSets && (
        <div className="text-center text-[10px] md:text-sm text-yellow-600 bg-yellow-50 rounded-lg p-1.5 md:p-2 border border-yellow-200">
          ⚠️ {totalSets - completedSets} sets sin completar
        </div>
      )}

      {hasNewPRs && (
        <div className="text-center text-[10px] md:text-sm text-purple-600 bg-purple-50 rounded-lg p-1.5 md:p-2 border border-purple-200">
          🏆 ¡Récords personales pendientes de verificar!
        </div>
      )}
    </div>
  );
};

export default WorkoutInProgress;