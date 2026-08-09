// components/routines/RoutineExerciseCard.tsx
import { useState } from 'react';
import { type ExerciseInRoutine, type ExerciseSet, type Unit } from '../../types/exercises.types';
import { ExerciseSetCard } from './ExerciseSetCard';

interface RoutineExerciseCardProps {
  exercise: ExerciseInRoutine;
  weightUnit: Unit;
  onUpdate: (updates: Partial<ExerciseInRoutine>) => void;
  onRemove: () => void;
  onViewDetails: () => void;
}

// Función de conversión de peso
const convertWeight = (value: number, from: Unit, to: Unit): number => {
  if (from === to) return value;
  if (from === 'kg' && to === 'lbs') return Math.round((value * 2.20462) * 10) / 10;
  if (from === 'lbs' && to === 'kg') return Math.round((value / 2.20462) * 10) / 10;
  return value;
};

export const RoutineExerciseCard = ({
  exercise,
  weightUnit,
  onUpdate,
  onRemove,
  onViewDetails,
}: RoutineExerciseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localUnit, setLocalUnit] = useState<Unit>(exercise.unit || 'kg');

  // Crear una nueva serie
  const addSet = () => {
    const newSet: ExerciseSet = {
      id: `set-${Date.now()}`,
      repsMin: 8,
      repsMax: 12,
      weight: 0,
      rir: 2,
    };
    onUpdate({ sets: [...exercise.sets, newSet] });
  };

  // Eliminar una serie
  const removeSet = (setIndex: number) => {
    if (exercise.sets.length <= 1) {
      alert('Debe haber al menos una serie');
      return;
    }
    const newSets = exercise.sets.filter((_, index) => index !== setIndex);
    onUpdate({ sets: newSets });
  };

  // Actualizar una serie
  const updateSet = (setIndex: number, updates: Partial<ExerciseSet>) => {
    const newSets = exercise.sets.map((set, index) =>
      index === setIndex ? { ...set, ...updates } : set
    );
    onUpdate({ sets: newSets });
  };

  // Cambiar unidad y convertir pesos
  const handleUnitChange = (newUnit: Unit) => {
    if (newUnit === localUnit) return;
    
    const convertedSets = exercise.sets.map((set) => ({
      ...set,
      weight: convertWeight(set.weight, localUnit, newUnit),
    }));
    
    setLocalUnit(newUnit);
    onUpdate({ 
      unit: newUnit,
      sets: convertedSets 
    });
  };

  // Calcular totales
  const totalRepsMin = exercise.sets.reduce((sum, s) => sum + s.repsMin, 0);
  const totalRepsMax = exercise.sets.reduce((sum, s) => sum + s.repsMax, 0);
  const totalWeight = exercise.sets.reduce((sum, s) => sum + s.weight, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Encabezado del ejercicio */}
      <div
        className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {/* Imagen */}
          <img
            src={exercise.image || '/default-exercise.png'}
            alt={exercise.name}
            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-exercise.png';
            }}
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-800 truncate">
                {exercise.name}
              </h4>
              <span className="text-xs text-gray-400 shrink-0 bg-gray-100 px-2 py-0.5 rounded">
                {exercise.sets.length} series
              </span>
              {exercise.sets.some(s => s.extra && (s.extra.restPauseReps > 0 || s.extra.partialReps > 0)) && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full shrink-0">
                  ⚡ Extra
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>
                {totalRepsMin}-{totalRepsMax} reps
              </span>
              <span>•</span>
              <span>
                {totalWeight} {localUnit}
              </span>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Ver detalles"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`¿Eliminar "${exercise.name}" de la rutina?`)) {
                  onRemove();
                }
              }}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Eliminar ejercicio"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="p-3 pt-0 border-t border-gray-100">
          {/* Selector de unidad y botón agregar serie */}
          <div className="flex justify-between items-center mb-3 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Unidad:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleUnitChange('kg')}
                  className={`px-2 py-0.5 text-xs rounded transition-colors ${
                    localUnit === 'kg'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  KG
                </button>
                <button
                  onClick={() => handleUnitChange('lbs')}
                  className={`px-2 py-0.5 text-xs rounded transition-colors ${
                    localUnit === 'lbs'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  LBS
                </button>
              </div>
            </div>
            <button
              onClick={addSet}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <span className="text-lg leading-none">+</span>
              Agregar serie
            </button>
          </div>

          {/* Lista de series */}
          <div className="space-y-2">
            {exercise.sets.map((set, index) => (
              <ExerciseSetCard
                key={set.id}
                set={set}
                setIndex={index}
                unit={localUnit}
                onUpdate={(updates) => updateSet(index, updates)}
                onRemove={() => removeSet(index)}
                isLast={index === exercise.sets.length - 1}
              />
            ))}

            {/* Notas */}
            <div className="mt-2">
              <textarea
                placeholder="Notas adicionales (ej: técnica, descanso, etc.)"
                value={exercise.notes || ''}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={1}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineExerciseCard;