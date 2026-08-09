import { useState } from 'react';
import { type ExtraReps } from '../../types/exercises.types';

interface ExtraRepsCardProps {
  extra: ExtraReps;
  onUpdate: (updates: Partial<ExtraReps>) => void;
  onRemove: () => void;
}

export const ExtraRepsCard = ({
  extra,
  onUpdate,
  onRemove,
}: ExtraRepsCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // ✅ Función para validar números
  const handleNumberInput = (value: string, field: 'restPauseReps' | 'partialReps') => {
    const cleaned = value.replace(/[^0-9]/g, '');
    const numValue = cleaned === '' ? 0 : Number(cleaned);
    onUpdate({ [field]: numValue });
  };

  // Verificar si hay valores activos
  const hasValues = extra.restPauseReps > 0 || extra.partialReps > 0;

  return (
    <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg overflow-hidden">
      {/* Encabezado */}
      <div
        className="flex items-center justify-between p-2 cursor-pointer hover:bg-purple-100/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-purple-700">⚡ Técnicas avanzadas</span>
          {hasValues && (
            <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">
              {extra.restPauseReps > 0 && `${extra.restPauseReps} RP`}
              {extra.restPauseReps > 0 && extra.partialReps > 0 && ' • '}
              {extra.partialReps > 0 && `${extra.partialReps} PAR`}
            </span>
          )}
          {!hasValues && (
            <span className="text-xs text-gray-400">(sin técnicas activas)</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {hasValues && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-xs text-red-500 hover:text-red-700 transition-colors p-1"
            >
              Eliminar
            </button>
          )}
          <svg
            className={`w-4 h-4 text-purple-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Contenido expandido */}
      {isExpanded && (
        <div className="p-3 pt-0 border-t border-purple-100">
          <div className="grid grid-cols-2 gap-3 mt-3">
            {/* Rest-Pause */}
            <div>
              <label className="text-xs text-purple-700 font-medium block mb-1">
                Reps post rest-pause
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={extra.restPauseReps || ''}
                  onChange={(e) => handleNumberInput(e.target.value, 'restPauseReps')}
                  className="w-full px-2 py-1 text-sm border border-purple-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                  min="0"
                  placeholder="0"
                />
                <span className="text-xs text-purple-500">reps</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Repeticiones después de un breve descanso
              </p>
            </div>

            {/* Parciales */}
            <div>
              <label className="text-xs text-purple-700 font-medium block mb-1">
                Repeticiones parciales
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={extra.partialReps || ''}
                  onChange={(e) => handleNumberInput(e.target.value, 'partialReps')}
                  className="w-full px-2 py-1 text-sm border border-purple-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                  min="0"
                  placeholder="0"
                />
                <span className="text-xs text-purple-500">reps</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Repeticiones con rango de movimiento parcial
              </p>
            </div>
          </div>

          {/* Badges informativos */}
          {hasValues && (
            <div className="mt-3 flex flex-wrap gap-2">
              {extra.restPauseReps > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  🔄 Rest-pause: +{extra.restPauseReps} reps
                </span>
              )}
              {extra.partialReps > 0 && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                  📉 Parciales: +{extra.partialReps} reps
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExtraRepsCard;