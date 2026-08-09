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

    // Formatear para mostrar en tabla
    const formatWeightForDisplay = useCallback((kgValue: number, showUnit: boolean = true): string => {
        const converted = convertFromBase(kgValue);
        return showUnit ? `${converted} ${unit}` : `${converted}`;
    }, [convertFromBase, unit]);

    // Comparar valores en kg
    const compareWeights = useCallback((kg1: number, kg2: number): number => {
        return kg1 - kg2;
    }, []);

    // Verificar si el valor es válido
    const isValidWeight = useCallback((value: number): boolean => {
        return !isNaN(value) && value >= 0 && isFinite(value);
    }, []);

    // Limitar valor a un rango
    const clampWeight = useCallback((value: number, min: number = 0, max: number = 999): number => {
        return Math.max(min, Math.min(max, value));
    }, []);

    return {
        // Estado
        unit,
        
        // Acciones
        toggleUnit,
        setUnit,
        
        // Conversiones
        convertFromBase,
        convertToBase,
        
        // Formateo
        formatWeight,
        formatWeightForDisplay,
        
        // Utilidades
        compareWeights,
        isValidWeight,
        clampWeight,
        
        // Constantes
        KG_TO_LBS,
        LBS_TO_KG
    };
};