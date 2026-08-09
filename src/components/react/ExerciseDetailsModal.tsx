// components/ExerciseDetailsModal.tsx
import { useEffect, useRef, useState } from 'react';
import { type Exercise } from '../../types/exercises.types';

interface ExerciseDetailsModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExerciseDetailsModal = ({
  exercise,
  isOpen,
  onClose
}: ExerciseDetailsModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [showGif, setShowGif] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (exercise) {
      setShowGif(false);
      setImageError(false);
    }
  }, [exercise]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !exercise) return null;

  const getLanguage = () => {
    const lang = navigator.language.split('-')[0];
    const supported = ['es', 'en', 'it', 'tr', 'ru', 'zh', 'hi', 'pl', 'ko', 'fr'];
    return supported.includes(lang) ? lang : 'en';
  };

  const lang = getLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 truncate">
            {exercise.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-4">
          {/* Imagen */}
          <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
            {!imageError ? (
              showGif && exercise.gif_url ? (
                <img
                  src={exercise.gif_url}
                  alt={`${exercise.name} - GIF`}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <img
                  src={exercise.image}
                  alt={exercise.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200">
                <p className="text-sm">Imagen no disponible</p>
              </div>
            )}
            
            {/* Badge GIF/IMG */}
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button
                onClick={() => {
                  setShowGif(false);
                  setImageError(false);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  !showGif ? 'bg-blue-500 text-white shadow-md' : 'bg-white/90 text-gray-600'
                }`}
              >
                IMG
              </button>
              {exercise.gif_url && (
                <button
                  onClick={() => {
                    setShowGif(true);
                    setImageError(false);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    showGif ? 'bg-blue-500 text-white shadow-md' : 'bg-white/90 text-gray-600'
                  }`}
                >
                  GIF
                </button>
              )}
            </div>
          </div>

          {/* Información */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Categoría</p>
              <p className="font-medium text-sm capitalize">{exercise.category}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Parte del cuerpo</p>
              <p className="font-medium text-sm capitalize">{exercise.body_part}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Equipo</p>
              <p className="font-medium text-sm">{exercise.equipment}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Objetivo</p>
              <p className="font-medium text-sm capitalize">{exercise.target}</p>
            </div>
          </div>

          {/* Músculos */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h4 className="font-semibold text-sm text-blue-800 mb-2">🎯 Músculos trabajados</h4>
            <p className="text-sm">
              <span className="font-medium">Principal:</span>{' '}
              <span className="text-blue-700">{exercise.muscle_group}</span>
            </p>
            {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
              <p className="text-sm">
                <span className="font-medium">Secundarios:</span>{' '}
                {exercise.secondary_muscles
                  .filter(s => s !== exercise.muscle_group)
                  .join(', ')}
              </p>
            )}
          </div>

          {/* Instrucciones */}
          {exercise.instruction_steps && exercise.instruction_steps[lang] && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">📋 Instrucciones</h4>
              <ol className="space-y-2 text-sm text-gray-600">
                {exercise.instruction_steps.es.map((step: string, index: number) => (
                  <li key={index} className="flex gap-3">
                    <span className="font-bold text-blue-500 shrink-0 w-6 text-right">
                      {index + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-3 border-t border-gray-200 text-xs text-gray-400">
            <p>ID: {exercise.id}</p>
            <p>Creado: {new Date(exercise.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};