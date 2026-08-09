// components/routines/ExerciseSetCard.tsx
import { type ExerciseSet, type Unit } from '../../types/exercises.types';

interface ExerciseSetCardProps {
  set: ExerciseSet;
  setIndex: number;
  unit: Unit;
  onUpdate: (updates: Partial<ExerciseSet>) => void;
  onRemove: () => void;
  isLast: boolean;
}

export const ExerciseSetCard = ({
  set,
  setIndex,
  unit,
  onUpdate,
  onRemove,
  isLast,
}: ExerciseSetCardProps) => {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="flex items-center gap-3">
        {/* Número de serie */}
        <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded min-w-40px text-center">
          #{setIndex + 1}
        </span>

        {/* Reps Mínimo */}
        <div className="flex-1">
          <label className="text-xs text-gray-500 block">Reps min</label>
          <input
            type="number"
            value={set.repsMin}
            onChange={(e) => onUpdate({ repsMin: Number(e.target.value) })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>

        {/* Reps Máximo */}
        <div className="flex-1">
          <label className="text-xs text-gray-500 block">Reps max</label>
          <input
            type="number"
            value={set.repsMax}
            onChange={(e) => onUpdate({ repsMax: Number(e.target.value) })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>

        {/* Peso */}
        <div className="flex-1">
          <label className="text-xs text-gray-500 block">Peso ({unit})</label>
          <input
            type="number"
            value={set.weight}
            onChange={(e) => onUpdate({ weight: Number(e.target.value) })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.5"
          />
        </div>

        {/* RIR */}
        <div className="flex-1">
          <label className="text-xs text-gray-500 block">RIR</label>
          <select
            value={set.rir}
            onChange={(e) => onUpdate({ rir: Number(e.target.value) })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[0, 1, 2, 3, 4, 5].map((rir) => (
              <option key={rir} value={rir}>
                {rir === 0 ? '0 (Fallo)' : rir}
              </option>
            ))}
          </select>
        </div>

        {/* Botón eliminar (excepto si es la última) */}
        {!isLast && (
          <button
            onClick={onRemove}
            className="mt-5 text-gray-400 hover:text-red-500 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};