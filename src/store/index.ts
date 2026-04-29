import { create } from 'zustand';
import type { Memory, Child, FamilyMember, ToastState, Milestone } from '../types';
import { SAMPLE_MEMORIES, SAMPLE_MEMBERS, MILESTONES } from '../data';
import type { EmotionKind } from '../tokens';

export interface AppSettings {
  faceId: boolean;
  privateMode: boolean;
  autoSave: boolean;
}

interface AppState {
  child: Child;
  memories: Memory[];
  members: FamilyMember[];
  milestones: Milestone[];
  toast: ToastState | null;
  settings: AppSettings;
  searchHistory: string[];

  setChild: (c: Partial<Child>) => void;
  addMemory: (m: Memory) => void;
  updateMemory: (m: Memory) => void;
  deleteMemory: (id: string) => void;
  markMilestoneDone: (id: string, date: string, tone?: string, emotion?: EmotionKind) => void;
  removeMember: (id: string) => void;
  showToast: (t: ToastState) => void;
  clearToast: () => void;
  updateSettings: (s: Partial<AppSettings>) => void;
  addSearchQuery: (q: string) => void;
  clearSearchHistory: () => void;
}

export const useStore = create<AppState>((set) => ({
  child: { name: 'Mira', pronouns: 'she / her', colorIdx: 0 },
  memories: SAMPLE_MEMORIES,
  members: SAMPLE_MEMBERS,
  milestones: MILESTONES,
  toast: null,
  settings: { faceId: false, privateMode: false, autoSave: true },
  searchHistory: [],

  setChild: (c) => set((s) => ({ child: { ...s.child, ...c } })),
  addMemory: (m) => set((s) => ({ memories: [m, ...s.memories] })),
  updateMemory: (m) => set((s) => ({ memories: s.memories.map((x) => (x.id === m.id ? m : x)) })),
  deleteMemory: (id) => set((s) => ({ memories: s.memories.filter((x) => x.id !== id) })),
  markMilestoneDone: (id, date, tone, emotion) =>
    set((s) => ({
      milestones: s.milestones.map((m) =>
        m.id === id ? { ...m, done: true, date, ...(tone && { tone }), ...(emotion && { emotion }) } : m,
      ),
    })),
  removeMember: (id) => set((s) => ({ members: s.members.filter((m) => m.id !== id) })),
  showToast: (t) => set({ toast: t }),
  clearToast: () => set({ toast: null }),
  updateSettings: (s) => set((prev) => ({ settings: { ...prev.settings, ...s } })),
  addSearchQuery: (q) =>
    set((s) => ({
      searchHistory: [q, ...s.searchHistory.filter((h) => h !== q)].slice(0, 5),
    })),
  clearSearchHistory: () => set({ searchHistory: [] }),
}));
