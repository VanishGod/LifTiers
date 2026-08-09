// components/react/AllExercises.tsx
import { useState, useMemo } from 'react';
import { type Exercise } from '../../types/exercises.types';

interface AllExercisesProps {
  exercises: Exercise[];
  onSelectExercise?: (exercise: Exercise) => void;
  isInRoutine?: boolean;
}

export const AllExercises = ({
  exercises,
  onSelectExercise,
  isInRoutine = false,
}: AllExercisesProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');

  // Obtener opciones únicas para filtros
  const uniqueCategories = useMemo(() => {
    const categories = new Set(exercises.map(ex => ex.category).filter(Boolean));
    return Array.from(categories).sort();
  }, [exercises]);

  const uniqueBodyParts = useMemo(() => {
    const parts = new Set(exercises.map(ex => ex.body_part).filter(Boolean));
    return Array.from(parts).sort();
  }, [exercises]);

  const uniqueEquipment = useMemo(() => {
    const equipment = new Set(exercises.map(ex => ex.equipment).filter(Boolean));
    return Array.from(equipment).sort();
  }, [exercises]);

  const uniqueMuscleGroups = useMemo(() => {
    const groups = new Set(exercises.map(ex => ex.muscle_group).filter(Boolean));
    return Array.from(groups).sort();
  }, [exercises]);

  // Filtrar ejercicios
  const filteredExercises = useMemo(() => {
    let result = exercises;

    if (searchQuery) {
      result = result.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      result = result.filter(ex => ex.category === selectedCategory);
    }

    if (selectedBodyPart) {
      result = result.filter(ex => ex.body_part === selectedBodyPart);
    }

    if (selectedEquipment) {
      result = result.filter(ex => ex.equipment === selectedEquipment);
    }

    if (selectedMuscleGroup) {
      result = result.filter(ex => ex.muscle_group === selectedMuscleGroup);
    }

    return result;
  }, [exercises, searchQuery, selectedCategory, selectedBodyPart, selectedEquipment, selectedMuscleGroup]);

  // Verificar filtros activos
  const hasActiveFilters = useMemo(() => {
    return !!(
      searchQuery ||
      selectedCategory ||
      selectedBodyPart ||
      selectedEquipment ||
      selectedMuscleGroup
    );
  }, [searchQuery, selectedCategory, selectedBodyPart, selectedEquipment, selectedMuscleGroup]);

  // Aplicar límite de 20 solo en rutinas y sin filtros
  const maxItems = isInRoutine && !hasActiveFilters ? 20 : Infinity;

  const displayedExercises = useMemo(() => {
    return filteredExercises.slice(0, maxItems);
  }, [filteredExercises, maxItems]);

  // Limpiar filtros
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBodyPart('');
    setSelectedEquipment('');
    setSelectedMuscleGroup('');
  };

  const activeFilterCount = [
    searchQuery,
    selectedCategory,
    selectedBodyPart,
    selectedEquipment,
    selectedMuscleGroup
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {isInRoutine ? 'Agregar Ejercicios' : 'Todos los Ejercicios'}
          </h3>
          <p className="text-sm text-gray-500">
            Mostrando {displayedExercises.length} de {filteredExercises.length} ejercicios
            {isInRoutine && !hasActiveFilters && filteredExercises.length > 20 && (
              <span className="text-blue-600"> (máximo 20)</span>
            )}
          </p>
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Limpiar filtros ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-150px">
          <input
            type="text"
            placeholder="🔍 Buscar ejercicio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          {uniqueCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={selectedBodyPart}
          onChange={(e) => setSelectedBodyPart(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Parte del cuerpo</option>
          {uniqueBodyParts.map(part => (
            <option key={part} value={part}>{part}</option>
          ))}
        </select>

        <select
          value={selectedEquipment}
          onChange={(e) => setSelectedEquipment(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Equipamiento</option>
          {uniqueEquipment.map(equip => (
            <option key={equip} value={equip}>{equip}</option>
          ))}
        </select>

        <select
          value={selectedMuscleGroup}
          onChange={(e) => setSelectedMuscleGroup(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Grupo muscular</option>
          {uniqueMuscleGroups.map(group => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
      </div>

      {/* Indicador de límite */}
      {isInRoutine && !hasActiveFilters && filteredExercises.length > 20 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
          <span className="font-medium">💡 Sugerencia:</span> Usa los filtros para encontrar ejercicios específicos.
          Mostrando los primeros 20 de {filteredExercises.length} ejercicios.
        </div>
      )}

      {/* ✅ GRID DE EJERCICIOS - 2 columnas en móvil */}
      {displayedExercises.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🏋️</div>
          <p className="text-gray-500 font-medium">No se encontraron ejercicios</p>
          <p className="text-sm text-gray-400 mt-1">
            {hasActiveFilters ? 'Prueba con otros filtros' : 'No hay ejercicios disponibles'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {displayedExercises.map((exercise) => (
            <div
              key={exercise.id}
              onClick={() => onSelectExercise?.(exercise)}
              className={`
                group relative
                bg-white rounded-lg border border-gray-200
                overflow-hidden
                transition-all duration-200
                ${onSelectExercise ? 'cursor-pointer hover:shadow-lg hover:border-blue-400 hover:-translate-y-0.5' : ''}
              `}
            >
              {/* Imagen */}
              <div className="aspect-video bg-gray-100 relative">
                {exercise.image ? (
                  <img
                    src={exercise.image}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Badge de selección */}
                {onSelectExercise && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      Seleccionar
                    </span>
                  </div>
                )}
              </div>

              {/* Información */}
              <div className="p-2 sm:p-3">
                <h4 className="font-medium text-gray-800 text-xs sm:text-sm truncate">
                  {exercise.name}
                </h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {exercise.body_part}
                  </span>
                  <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {exercise.muscle_group}
                  </span>
                </div>
                <div className="mt-1 sm:mt-2 flex justify-between text-[10px] sm:text-xs text-gray-400">
                  <span>{exercise.category}</span>
                  <span>{exercise.equipment}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pie de página */}
      {displayedExercises.length > 0 && (
        <div className="pt-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
          <span>
            Mostrando {displayedExercises.length} de {filteredExercises.length} ejercicios
          </span>
          {isInRoutine && !hasActiveFilters && filteredExercises.length > 20 && (
            <span className="text-blue-600">
              {filteredExercises.length - 20} ejercicios no mostrados
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AllExercises;