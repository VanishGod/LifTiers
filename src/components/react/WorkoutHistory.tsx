// components/workout/WorkoutHistory.tsx
import { useState } from 'react';
import { type Workout } from '../../types/exercises.types';

interface WorkoutHistoryProps {
  workouts: Workout[];
  onLoadWorkout: (workoutId: string) => void;
  onDeleteWorkout: (workoutId: string) => void;
  onClearHistory: () => void;
  onBack: () => void;
  onViewReport: (workoutId: string) => void;
}

export const WorkoutHistory = ({
  workouts,
  onLoadWorkout,
  onDeleteWorkout,
  onClearHistory,
  onBack,
  onViewReport,
}: WorkoutHistoryProps) => {
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

  // Ordenar por fecha (más reciente primero)
  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calcular estadísticas de un entrenamiento
  const getWorkoutStats = (workout: Workout) => {
    const totalSets = workout.exercises.filter(s => s.completed).length;
    const totalVolume = workout.exercises
      .filter(s => s.completed)
      .reduce((sum, set) => sum + ((set.actualWeight || 0) * (set.actualReps || 0)), 0);
    
    return { totalSets, totalVolume };
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-blue-500">📊</span>
          Historial de entrenamientos
          <span className="text-sm font-normal text-gray-400 ml-2">
            ({workouts.length})
          </span>
        </h2>
        <button
          onClick={onBack}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>
      </div>

      {/* ===== CONTENIDO ===== */}
      {workouts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 text-lg">No hay entrenamientos registrados</p>
          <p className="text-sm text-gray-400 mt-1">Comienza tu primer entrenamiento hoy!</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Ir a entrenar
          </button>
        </div>
      ) : (
        <>
          {/* ===== LISTA DE ENTRENAMIENTOS ===== */}
          <div className="space-y-3 max-h-600px overflow-y-auto pr-1 custom-scrollbar">
            {sortedWorkouts.map((workout) => {
              const stats = getWorkoutStats(workout);
              const isExpanded = expandedWorkout === workout.id;
              
              return (
                <div
                  key={workout.id}
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Encabezado del entrenamiento */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedWorkout(isExpanded ? null : workout.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-800">{workout.name}</h4>
                          {workout.routineName && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              📋 {workout.routineName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <span>{formatDate(workout.date)}</span>
                          <span>•</span>
                          <span>{workout.exercises.length} ejercicios</span>
                          <span>•</span>
                          <span>{stats.totalSets} series</span>
                          <span>•</span>
                          <span className="font-medium text-gray-700">
                            {Math.round(stats.totalVolume)} kg
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewReport(workout.id);
                          }}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Ver informe"
                        >
                          📊 Informe
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onLoadWorkout(workout.id);
                          }}
                          className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Cargar entrenamiento"
                        >
                          🔄 Cargar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteWorkout(workout.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Detalles expandidos */}
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Volumen total</p>
                          <p className="text-lg font-bold text-gray-800">
                            {Math.round(stats.totalVolume)} kg
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Series completadas</p>
                          <p className="text-lg font-bold text-gray-800">
                            {stats.totalSets}
                          </p>
                        </div>
                      </div>

                      {/* Lista de ejercicios del entrenamiento */}
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ejercicios realizados
                        </p>
                        {workout.exercises
                          .filter(s => s.completed)
                          .reduce((acc, set) => {
                            if (!acc.find(s => s.exerciseId === set.exerciseId)) {
                              acc.push(set);
                            }
                            return acc;
                          }, [] as typeof workout.exercises)
                          .map((set) => (
                            <div key={set.id} className="flex items-center justify-between text-sm py-1">
                              <span className="text-gray-700">{set.exerciseName}</span>
                              <span className="text-gray-500">
                                {set.actualWeight}{set.unit} x {set.actualReps} reps
                                {set.extra && (set.extra.restPauseReps > 0 || set.extra.partialReps > 0) && (
                                  <span className="ml-1 text-purple-500 text-xs">⚡</span>
                                )}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ===== ACCIONES ===== */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <button
              onClick={onClearHistory}
              className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
            >
              🗑️ Eliminar todo el historial
            </button>
            <span className="text-xs text-gray-400">
              {workouts.length} entrenamientos guardados
            </span>
          </div>
        </>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default WorkoutHistory;