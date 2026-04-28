import { create } from 'zustand';
import type { Memory, Child, FamilyMember, ToastState } from '../types';
import { SAMPLE_MEMORIES, SAMPLE_MEMBERS } from '../data';

interface AppState {
  child: Child;
  memories: Memory[];
  members: FamilyMember[];
  toast: ToastState | null;

  setChild: (c: Partial<Child>) => void;
  addMemory: (m: Memory) => void;
  updateMemory: (m: Memory) => void;
  deleteMemory: (id: string) => void;
  showToast: (t: ToastState) => void;
  clearToast: () => void;
}

export const useStore = create<AppState>((set) => ({
  child: { name: 'Mira', pronouns: 'she / her', colorIdx: 0 },
  memories: SAMPLE_MEMORIES,
  members: SAMPLE_MEMBERS,
  toast: null,

  setChild: (c) => set((s) => ({ child: { ...s.child, ...c } })),
  addMemory: (m) => set((s) => ({ memories: [m, ...s.memories] })),
  updateMemory: (m) => set((s) => ({ memories: s.memories.map((x) => (x.id === m.id ? m : x)) })),
  deleteMemory: (id) => set((s) => ({ memories: s.memories.filter((x) => x.id !== id) })),
  showToast: (t) => set({ toast: t }),
  clearToast: () => set({ toast: null }),
}));
