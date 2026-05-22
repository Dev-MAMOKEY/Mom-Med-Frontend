import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Role = 'parent' | 'caregiver' | null;

interface RoleState {
  role: Role;
  setRole: (r: Role) => void;
  clear: () => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: null,
      setRole: (role) => set({ role }),
      clear: () => set({ role: null }),
    }),
    {
      name: 'role-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
