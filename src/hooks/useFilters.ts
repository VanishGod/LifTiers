import { useState, useCallback } from 'react';

// Definimos los tipos para mejor autocompletado
type FilterKeys = 'name' | 'category' | 'body_part' | 'equipment' | 'secondary_muscles';

interface Filters {
  name: string;
  category: string;
  body_part: string;
  equipment: string;
  secondary_muscles: string;
}

export const useFilters = () => {
  const [filters, setFilters] = useState<Filters>({
    name: '',
    category: '',
    body_part: '',
    equipment: '',
    secondary_muscles: ''
  });

  // Función genérica para actualizar cualquier filtro
  const setFilter = useCallback((filter: FilterKeys, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  }, []);

  // Funciones específicas para cada tipo de filtro
  const setNameFilter = useCallback((value: string) => {
    setFilter('name', value);
  }, [setFilter]);

  const setCategoryFilter = useCallback((value: string) => {
    setFilter('category', value);
  }, [setFilter]);

  const setBodyPartFilter = useCallback((value: string) => {
    setFilter('body_part', value);
  }, [setFilter]);

  const setEquipmentFilter = useCallback((value: string) => {
    setFilter('equipment', value);
  }, [setFilter]);

  const setSecondaryMusclesFilter = useCallback((value: string) => {
    setFilter('secondary_muscles', value);
  }, [setFilter]);

  // Resetear todos los filtros
  const resetFilters = useCallback(() => {
    setFilters({
      name: '',
      category: '',
      body_part: '',
      equipment: '',
      secondary_muscles: ''
    });
  }, []);

  // Resetear solo un filtro específico
  const resetSingleFilter = useCallback((filter: FilterKeys) => {
    setFilter(filter, '');
  }, [setFilter]);

  // Verificar si hay filtros activos
  const hasActiveFilters = useCallback(() => {
    return Object.values(filters).some(value => value !== '');
  }, [filters]);

  // Obtener el número de filtros activos
  const activeFiltersCount = useCallback(() => {
    return Object.values(filters).filter(value => value !== '').length;
  }, [filters]);

  // Limpiar todos los filtros excepto el nombre (útil para búsqueda)
  const clearFiltersExceptName = useCallback(() => {
    setFilters(prev => ({
      name: prev.name,
      category: '',
      body_part: '',
      equipment: '',
      secondary_muscles: ''
    }));
  }, []);

  return {
    // Estado
    filters,
    
    // Funciones genéricas
    setFilter,
    resetFilters,
    resetSingleFilter,
    
    // Funciones específicas para cada filtro
    setNameFilter,
    setCategoryFilter,
    setBodyPartFilter,
    setEquipmentFilter,
    setSecondaryMusclesFilter,
    
    // Utilidades
    hasActiveFilters,
    activeFiltersCount,
    clearFiltersExceptName
  };
};