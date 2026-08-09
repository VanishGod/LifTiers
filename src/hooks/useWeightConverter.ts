// hooks/useWeightConverter.ts
import { useWeightStore } from '../stores/useWeightStore';
import { useCallback } from 'react';

export const useWeightConverter = () => {
  const unit = useWeightStore((state) => state.unit);
  const toggleUnit = useWeightStore((state) => state.toggleUnit);
  const setUnit = useWeightStore((state) => state.setUnit);

  // Constantes de conversión
  const KG_TO_LBS = 2.20462;
  const LBS_TO_KG = 0.453592;

  // Convertir de kg a la unidad actual
  const convertFromBase = useCallback((kgValue: number): number => {
    if (unit === 'lbs') {
      return Math.round(kgValue * KG_TO_LBS * 10) / 10;
    }
    return Math.round(kgValue * 10) / 10;
  }, [unit]);

  // Convertir de la unidad actual a kg
  const convertToBase = useCallback((displayValue: number): number => {
    if (unit === 'lbs') {
      return Math.round(displayValue * LBS_TO_KG * 10) / 10;
    }
    return Math.round(displayValue * 10) / 10;
  }, [unit]);

  // Formatear valor con unidad
  const formatWeight = useCallback((kgValue: number): string => {
    const converted = convertFromBase(kgValue);
    return `${converted} ${unit}`;
  }, [convertFromBase, unit]);

  // Comparar valores en kg
  const compareWeights = useCallback((kg1: number, kg2: number): number => {
    return kg1 - kg2;
  }, []);

  return {
    unit,
    toggleUnit,
    setUnit,
    convertFromBase,
    convertToBase,
    formatWeight,
    compareWeights,
    // Constantes
    KG_TO_LBS,
    LBS_TO_KG
  };
};