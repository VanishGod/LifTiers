// components/workout/WorkoutSelector.tsx
import { useState } from 'react';
import { type Routine } from '../../types/exercises.types';
import AlertsToast from './AlertsToast';

interface WorkoutSelectorProps {
  routines: Routine[];
  onStartFreeWorkout: (name: string) => void;
  onStartRoutineWorkout: (routineId: string) => void;
  onViewHistory: () => void;
}

export const WorkoutSelector = ({
  routines,
  onStartFreeWorkout,
  onStartRoutineWorkout,
  onViewHistory,
}: WorkoutSelectorProps) => {
  const [workoutName, setWorkoutName] = useState('');
  const [selectedRoutineId, setSelectedRoutineId] = useState('');

  const routinesWithExercises = routines.filter(r => r.exercises.length > 0);
  const hasRoutines = routinesWithExercises.length > 0;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Título */}
      <div className="text-center">
        <h2 className="text-xl md:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <span className="text-blue-500">🏋️</span>
          ¿Qué quieres hacer hoy?
        </h2>
        <p className="text-xs md:text-sm text-gray-500 mt-1">
          Elige una opción para comenzar tu entrenamiento
        </p>
      </div>

      {/* Opción 1: Entrenamiento libre */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200 hover:border-blue-300 transition-colors">
        <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-xl md:text-2xl">🔥</span>
          </div>
          <div className="flex-1 w-full">
            <h3 className="text-base md:text-lg font-semibold text-gray-800">
              Entrenamiento libre
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
              Crea un entrenamiento desde cero agregando los ejercicios que quieras.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="Ej: Entrenamiento de pecho..."
                className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && workoutName.trim()) {
                    onStartFreeWorkout(workoutName.trim());
                  }
                }}
              />
              <button
                onClick={() => {
                  if (workoutName.trim()) {
                    onStartFreeWorkout(workoutName.trim());
                  } else {
                    <AlertsToast
                    message='Por favor ingresa un nombre para el entrenamiento'
                    duration={3000}
                    color='warning'/>
                  }
                }}
                disabled={!workoutName.trim()}
                className="px-4 md:px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors whitespace-nowrap text-sm md:text-base"
              >
                Comenzar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Opción 2: Usar rutina */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200 hover:border-green-300 transition-colors">
        <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-xl md:text-2xl">📋</span>
          </div>
          <div className="flex-1 w-full">
            <h3 className="text-base md:text-lg font-semibold text-gray-800">
              Entrenar con rutina
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
              Selecciona una de tus rutinas y registra tus marcas.
            </p>
            
            {hasRoutines ? (
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <select
                  value={selectedRoutineId}
                  onChange={(e) => setSelectedRoutineId(e.target.value)}
                  className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
                >
                  <option value="">Selecciona una rutina...</option>
                  {routinesWithExercises.map((routine) => (
                    <option key={routine.id} value={routine.id}>
                      {routine.name} ({routine.exercises.length} ejercicios)
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (selectedRoutineId) {
                      onStartRoutineWorkout(selectedRoutineId);
                    } else {
                      <AlertsToast
                      message='Por favor selecciona una rutina'
                      duration={3000}
                      color='warning'/>
                    }
                  }}
                  disabled={!selectedRoutineId}
                  className="px-4 md:px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors whitespace-nowrap text-sm md:text-base"
                >
                  Comenzar
                </button>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 md:p-3 text-xs md:text-sm text-yellow-700">
                <p className="flex items-center gap-2">
                  <span>⚠️</span>
                  No tienes rutinas con ejercicios.
                  <a href="/routines" className="text-blue-600 hover:text-blue-800 font-medium underline">
                    Crear una rutina
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historial */}
      <button
        onClick={onViewHistory}
        className="w-full py-3 md:py-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Ver historial de entrenamientos
      </button>
    </div>
  );
};

export default WorkoutSelector;