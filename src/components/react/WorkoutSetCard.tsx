// components/workout/WorkoutSetCard.tsx
import { useState, useEffect } from 'react';
import { type WorkoutSet, type Unit } from '../../types/exercises.types';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { checkNewPR } from '../../utils/workoutCalculations';

interface WorkoutSetCardProps {
  set: WorkoutSet;
  setIndex: number;
  unit: Unit;
  onUpdate: (updates: Partial<WorkoutSet>) => void;
}

export const WorkoutSetCard = ({
  set,
  setIndex,
  unit,
  onUpdate,
}: WorkoutSetCardProps) => {
  const [isNewPR, setIsNewPR] = useState(false);
  const [showPRBanner, setShowPRBanner] = useState(false);
  const { personalRecords } = useWorkoutStore();

  useEffect(() => {
    if (set.completed && set.actualReps > 0 && set.actualWeight > 0) {
      const result = checkNewPR(
        set.exerciseId,
        set.actualWeight,
        set.actualReps,
        set.unit,
        personalRecords
      );
      
      setIsNewPR(result.isNewPR);
      if (result.isNewPR) {
        setShowPRBanner(true);
        setTimeout(() => setShowPRBanner(false), 5000);
      }
    }
  }, [set.actualWeight, set.actualReps, set.completed]);

  const lastWeightPlaceholder = set.lastWeight ? `Último: ${set.lastWeight}` : 'Peso';
  const lastRepsPlaceholder = set.lastReps ? `Último: ${set.lastReps}` : 'Reps';
  const bestWeightPlaceholder = set.previousBestWeight ? `Mejor: ${set.previousBestWeight}` : null;
  const bestRepsPlaceholder = set.previousBestReps ? `Mejor: ${set.previousBestReps}` : null;

  const handleNumberInput = (value: string, field: 'actualReps' | 'actualWeight') => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const finalValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
    const numValue = finalValue === '' ? 0 : Number(finalValue);
    onUpdate({ [field]: numValue });
  };

  return (
    <div className={`p-2 md:p-3 rounded-lg border transition-all ${
      set.completed 
        ? 'bg-green-50 border-green-300' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      {/* Banner PR */}
      {showPRBanner && isNewPR && (
        <div className="mb-2 p-1.5 md:p-2 bg-linear-to-r from-yellow-400 to-yellow-500 rounded-lg text-center animate-pulse">
          <span className="text-[10px] md:text-sm font-bold text-white">
            🏆 ¡NUEVO RÉCORD PERSONAL!
          </span>
        </div>
      )}

      {/* Contenido principal - Responsive con grid */}
      <div className="grid grid-cols-12 gap-1 md:gap-2 items-center">
        {/* Checkbox */}
        <div className="col-span-1">
          <button
            onClick={() => onUpdate({ completed: !set.completed })}
            className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              set.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            {set.completed && (
              <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>

        {/* Número de serie */}
        <div className="col-span-1">
          <span className="text-[10px] md:text-xs font-medium text-gray-500 bg-gray-200 px-1.5 md:px-2 py-0.5 rounded min-w-30px md:min-w-40px text-center block">
            #{setIndex + 1}
          </span>
        </div>

        {/* Plan (oculto en móvil muy pequeño) */}
        <div className="hidden xs:block col-span-3">
          <div className="flex items-center gap-1 text-[10px] md:text-sm">
            <span className="text-gray-500 hidden sm:inline">Plan:</span>
            <span className="font-medium">{set.repsMin}-{set.repsMax} reps</span>
            <span className="text-gray-400 hidden md:inline">•</span>
            <span className="font-medium hidden md:inline">{set.weight} {unit}</span>
            <span className="text-gray-400 hidden lg:inline">•</span>
            <span className={`px-1 py-0.5 rounded text-[8px] md:text-xs hidden lg:inline ${
              set.rir <= 1 ? 'bg-red-100 text-red-700' :
              set.rir <= 3 ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              RIR: {set.rir}
            </span>
          </div>
        </div>

        {/* Reps */}
        <div className="col-span-3 md:col-span-2">
          <div className="flex flex-col">
            <input
              type="text"
              inputMode="numeric"
              value={set.actualReps || ''}
              onChange={(e) => handleNumberInput(e.target.value, 'actualReps')}
              placeholder={lastRepsPlaceholder}
              className={`w-full px-1 md:px-1.5 py-1 text-[10px] md:text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${
                set.completed ? 'border-green-400 bg-green-50' : 'border-gray-300'
              }`}
            />
            {bestRepsPlaceholder && (
              <span className="text-[8px] text-gray-400 truncate hidden md:block">
                {bestRepsPlaceholder}
              </span>
            )}
          </div>
        </div>

        {/* Peso */}
        <div className="col-span-3 md:col-span-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-0.5 md:gap-1">
              <input
                type="text"
                inputMode="decimal"
                value={set.actualWeight || ''}
                onChange={(e) => handleNumberInput(e.target.value, 'actualWeight')}
                placeholder={lastWeightPlaceholder}
                className={`w-full px-1 md:px-1.5 py-1 text-[10px] md:text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${
                  set.completed ? 'border-green-400 bg-green-50' : 'border-gray-300'
                }`}
              />
              <span className="text-[8px] md:text-xs text-gray-400">{unit}</span>
            </div>
            {bestWeightPlaceholder && (
              <span className="text-[8px] text-gray-400 truncate hidden md:block">
                {bestWeightPlaceholder}
              </span>
            )}
          </div>
        </div>

        {/* RIR */}
        <div className="col-span-2">
          <select
            value={set.actualRir}
            onChange={(e) => onUpdate({ actualRir: Number(e.target.value) })}
            className="w-full px-1 md:px-1.5 py-1 text-[10px] md:text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value={0}>RIR 0</option>
            {[1, 2, 3, 4, 5].map((rir) => (
              <option key={rir} value={rir}>
                RIR {rir}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Extras y comparativa */}
      {set.extra && (set.extra.restPauseReps > 0 || set.extra.partialReps > 0) && (
        <div className="mt-1.5 md:mt-2 ml-12 md:ml-14 flex flex-wrap gap-1 md:gap-2 text-[8px] md:text-xs">
          {set.extra.restPauseReps > 0 && (
            <span className="text-purple-600">⚡ Rest-pause: +{set.extra.restPauseReps}</span>
          )}
          {set.extra.partialReps > 0 && (
            <span className="text-orange-600">📉 Parciales: +{set.extra.partialReps}</span>
          )}
        </div>
      )}

      {set.completed && set.actualReps > 0 && set.actualWeight > 0 && !isNewPR && set.previousBestWeight && (
        <div className="mt-1 ml-12 md:ml-14 text-[8px] md:text-xs text-gray-400">
          {set.actualWeight === set.previousBestWeight && set.actualReps === set.previousBestReps ? (
            <span>⚪ Igualaste tu mejor marca</span>
          ) : (
            <span>📊 Mejor: {set.previousBestWeight}{unit} x {set.previousBestReps}</span>
          )}
        </div>
      )}
    </div>
  );
};