import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CurrentParentState {
  parentId: string | null;
  displayName: string | null;
  setParent: (id: string, name: string) => void;
  clear: () => void;
}

export const useCurrentParentStore = create<CurrentParentState>()(
  persist(
    (set) => ({
      parentId: null,
      displayName: null,
      setParent: (parentId, displayName) => set({ parentId, displayName }),
      clear: () => set({ parentId: null, displayName: null }),
    }),
    {
      name: 'current-parent',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
