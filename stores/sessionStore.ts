import { create } from 'zustand';

interface SessionState {
  isDemoMode: boolean;
  demoUserId: string;
  setDemoMode: (v: boolean) => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  isDemoMode: process.env.EXPO_PUBLIC_DEMO_MODE === 'true',
  demoUserId: 'demo-caregiver-001',
  setDemoMode: (isDemoMode) => set({ isDemoMode }),
}));
