// components/routines/RoutinesList.tsx
import { useState } from 'react';
import { type Routine } from '../../types/exercises.types';

interface RoutinesListProps {
  routines: Routine[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (name: string) => void;
  onUpdate?: (id: string, name: string) => void;
  onStartWorkout?: (routineId: string) => void;
}

export const RoutinesList = ({
  routines,
  activeId,
  onSelect,
  onDelete,
  onAdd,
  onUpdate,
  onStartWorkout,
}: RoutinesListProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoutines = routines.filter(routine =>
    routine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    if (newRoutineName.trim()) {
      onAdd(newRoutineName.trim());
      setNewRoutineName('');
      setIsCreating(false);
    }
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim() && onUpdate) {
      onUpdate(id, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleCreate();
    if (e.key === 'Escape') {
      setIsCreating(false);
      setNewRoutineName('');
    }
  };

  // ============ ESTADÍSTICAS ============
  const getRoutineStats = (routine: Routine) => {
    const totalSets = routine.exercises.reduce(
      (sum, ex) => sum + ex.sets.length, 0
    );
    
    const totalReps = routine.exercises.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.repsMin, 0), 0
    );
    
    const totalWeight = routine.exercises.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.weight * set.repsMin), 0), 0
    );

    const exercisesWithExtras = routine.exercises.filter(ex =>
      ex.sets.some(set => set.extra && (set.extra.restPauseReps > 0 || set.extra.partialReps > 0))
    );

    return { 
      totalSets, 
      totalReps, 
      totalWeight: Math.round(totalWeight * 10) / 10,
      exercisesWithExtras: exercisesWithExtras.length,
    };
  };

  const getRoutineStatus = (routine: Routine) => {
    if (routine.exercises.length === 0) {
      return { 
        label: 'Vacía', 
        color: 'bg-gray-200 text-gray-600',
        borderColor: 'border-gray-300'
      };
    }
    if (routine.exercises.length < 3) {
      return { 
        label: 'En progreso', 
        color: 'bg-black text-white',
        borderColor: 'border-black'
      };
    }
    return { 
      label: 'Completa', 
      color: 'bg-green-100 text-green-700',
      borderColor: 'border-green-300'
    };
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Mis Rutinas
          <span className="text-xs font-normal text-gray-500">
            ({routines.length})
          </span>
        </h2>
        <button
          onClick={() => setIsCreating(true)}
          className="
            bg-blue-500 hover:bg-blue-600 
            text-white text-sm font-medium 
            px-3 py-1.5 rounded-lg 
            transition-all duration-200
            flex items-center gap-1
            hover:shadow-md
            active:scale-95
          "
        >
          <span className="text-lg leading-none">+</span>
          Nueva
        </button>
      </div>

      {/* Barra de búsqueda */}
      {routines.length > 0 && (
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar rutina..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full
              border border-gray-300 rounded-lg 
              pl-9 pr-3 py-1.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition-shadow
            "
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Formulario de creación */}
      {isCreating && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 space-y-2">
          <input
            type="text"
            value={newRoutineName}
            onChange={(e) => setNewRoutineName(e.target.value)}
            placeholder="Nombre de la rutina..."
            className="
              w-full
              border border-gray-300 rounded-lg 
              px-3 py-1.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition-shadow
            "
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCreate}
              disabled={!newRoutineName.trim()}
              className="
                bg-green-500 hover:bg-green-600
                disabled:bg-gray-300 disabled:cursor-not-allowed
                text-white text-sm font-medium 
                px-3 py-1 rounded-lg 
                transition-colors duration-200
              "
            >
              Crear
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewRoutineName('');
              }}
              className="
                bg-gray-200 hover:bg-gray-300 
                text-gray-700 text-sm font-medium 
                px-3 py-1 rounded-lg 
                transition-colors duration-200
              "
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de rutinas */}
      <div className="space-y-2 max-h-500px overflow-y-auto pr-1 custom-scrollbar">
        {filteredRoutines.length === 0 ? (
          <div className="text-center py-8">
            {searchQuery ? (
              <>
                <p className="text-sm text-gray-500">No se encontraron rutinas</p>
                <p className="text-xs text-gray-400 mt-1">Prueba con otra búsqueda</p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500">No tienes rutinas creadas</p>
                <p className="text-xs text-gray-400 mt-1">Haz clic en "Nueva" para comenzar</p>
              </>
            )}
          </div>
        ) : (
          filteredRoutines.map((routine) => {
            const status = getRoutineStatus(routine);
            const stats = getRoutineStats(routine);
            const isActive = routine.id === activeId;
            const hasExercises = routine.exercises.length > 0;
            
            return (
              <div
                key={routine.id}
                className={`
                  group relative
                  flex items-center gap-3
                  p-3 rounded-lg 
                  cursor-pointer
                  transition-all duration-200
                  border-2
                  ${isActive
                    ? 'bg-blue-50 border-blue-500 shadow-sm'
                    : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                  }
                `}
                onClick={() => onSelect(routine.id)}
              >
                {/* Indicador visual de selección */}
                {isActive && (
                  <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                )}

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  {editingId === routine.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="
                        w-full 
                        border border-gray-300 rounded 
                        px-2 py-0.5 text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                      "
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(routine.id);
                        if (e.key === 'Escape') {
                          setEditingId(null);
                          setEditName('');
                        }
                      }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800 truncate">
                          {routine.name}
                        </p>
                        <span className={`
                          text-xs px-2 py-0.5 rounded-md shrink-0
                          ${status.color}
                          ${status.label === 'En progreso' ? 'border border-black' : ''}
                        `}>
                          {status.label}
                        </span>
                        {stats.exercisesWithExtras > 0 && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full shrink-0">
                            ⚡ Extra
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{routine.exercises.length} ejercicios</span>
                        {routine.exercises.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{stats.totalSets} series</span>
                            <span>•</span>
                            <span>{stats.totalReps} reps</span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* ===== ACCIONES (hover) ===== */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {/* ✅ Botón Entrenar - Minimalista */}
                  {hasExercises && onStartWorkout && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartWorkout(routine.id);
                      }}
                      className="
                        p-1.5 rounded
                        text-gray-400 hover:text-green-600
                        hover:bg-green-50
                        transition-colors
                      "
                      title="Comenzar entrenamiento"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Botón Editar */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onUpdate) {
                        setEditingId(routine.id);
                        setEditName(routine.name);
                      }
                    }}
                    className="
                      p-1.5 rounded
                      text-gray-400 hover:text-blue-600
                      hover:bg-blue-50
                      transition-colors
                    "
                    title="Editar nombre"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  {/* Botón Eliminar */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(routine.id);
                    }}
                    className="
                      p-1.5 rounded
                      text-gray-400 hover:text-red-600
                      hover:bg-red-50
                      transition-colors
                    "
                    title="Eliminar rutina"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Acciones en modo edición */}
                {editingId === routine.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveEdit(routine.id);
                      }}
                      className="
                        p-1.5 rounded
                        text-green-600 hover:text-green-700
                        hover:bg-green-50
                        transition-colors
                      "
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(null);
                        setEditName('');
                      }}
                      className="
                        p-1.5 rounded
                        text-gray-400 hover:text-gray-600
                        hover:bg-gray-100
                        transition-colors
                      "
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pie de página */}
      {routines.length > 0 && (
        <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex justify-between items-center">
            <span>
              {filteredRoutines.length} de {routines.length} rutina{routines.length > 1 ? 's' : ''}
            </span>
            <span>
              {routines.reduce((sum, r) => sum + r.exercises.length, 0)} ejercicios
            </span>
          </div>
        </div>
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