// components/routines/RoutineView.tsx
import { type Routine, type ExerciseInRoutine } from '../../types/exercises.types';
import { RoutineExerciseCard } from './RoutineExerciseCard';

interface RoutineViewProps {
  routine: Routine;
  weightUnit: 'kg' | 'lbs';
  onUpdateExercise: (exerciseId: string, updates: Partial<ExerciseInRoutine>) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onViewDetails: (exerciseId: string) => void;
}

export const RoutineView = ({
  routine,
  weightUnit,
  onUpdateExercise,
  onRemoveExercise,
  onViewDetails
}: RoutineViewProps) => {
  if (!routine) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-gray-500">No hay rutina seleccionada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ✅ SOLO UN map - No hay duplicación aquí */}
      <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto pr-1 custom-scrollbar">
        {routine.exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
            <svg className="w-16 h-16 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 font-medium">No hay ejercicios en esta rutina</p>
            <p className="text-sm text-gray-400 mt-1">Busca ejercicios en el panel izquierdo y agrégalos</p>
          </div>
        ) : (
          // ✅ SOLO UN map
          routine.exercises.map((exercise) => (
            <RoutineExerciseCard
              key={exercise.exerciseId}
              exercise={exercise}
              weightUnit={weightUnit}
              onUpdate={(updates) => onUpdateExercise(exercise.exerciseId, updates)}
              onRemove={() => onRemoveExercise(exercise.exerciseId)}
              onViewDetails={() => onViewDetails(exercise.exerciseId)}
            />
          ))
        )}
      </div>

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

export default RoutineView;