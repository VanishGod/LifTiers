// components/routines/ExerciseSetCard.tsx
import { useState } from 'react';
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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="flex items-center justify-between gap-2">
        {/* Número de serie */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
            #{setIndex + 1}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 transition-transform"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Resumen compacto */}
        <div className="flex-1 flex items-center gap-3 text-sm">
          <span className="font-medium">{set.repsMin}-{set.repsMax} reps</span>
          <span className="text-gray-400">•</span>
          <span>{set.weight} {unit}</span>
          <span className="text-gray-400">•</span>
          <span className={`px-1.5 py-0.5 rounded text-xs ${
            set.rir <= 1 ? 'bg-red-100 text-red-700' :
            set.rir <= 3 ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            RIR: {set.rir}
          </span>
        </div>

        {/* Botón eliminar */}
        {!isLast && (
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Detalles expandidos */}
      {isExpanded && (
        <div className="mt-3 grid grid-cols-4 gap-2 pt-3 border-t border-gray-200">
          {/* Reps Mínimo */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Reps min</label>
            <input
              type="number"
              value={set.repsMin}
              onChange={(e) => onUpdate({ repsMin: Number(e.target.value) })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          {/* Reps Máximo */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Reps max</label>
            <input
              type="number"
              value={set.repsMax}
              onChange={(e) => onUpdate({ repsMax: Number(e.target.value) })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          {/* Peso */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Peso ({unit})</label>
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
          <div>
            <label className="text-xs text-gray-500 block mb-1">RIR</label>
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
        </div>
      )}
    </div>
  );
};