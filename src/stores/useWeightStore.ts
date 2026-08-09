// stores/weightStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WeightStore {
  unit: 'kg' | 'lbs';
  toggleUnit: () => void;
  setUnit: (unit: 'kg' | 'lbs') => void;
}

export const useWeightStore = create<WeightStore>()(
  persist(
    (set) => ({
      unit: 'kg',
      
      toggleUnit: () => {
        set((state) => ({
          unit: state.unit === 'kg' ? 'lbs' : 'kg'
        }));
      },
      
      setUnit: (unit: 'kg' | 'lbs') => {
        set({ unit });
      }
    }),
    {
      name: 'weight-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);