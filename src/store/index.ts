import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Memory, Child, FamilyMember, ToastState, Milestone } from '../types';
import { MILESTONES } from '../data';
import type { EmotionKind } from '../tokens';

export interface AppSettings {
  faceId: boolean;
  privateMode: boolean;
  autoSave: boolean;
}

interface AppState {
  onboardingDone: boolean;
  child: Child;
  children: Child[];
  activeChildIdx: number;
  memories: Memory[];
  members: FamilyMember[];
  milestones: Milestone[];
  toast: ToastState | null;
  settings: AppSettings;
  searchHistory: string[];
  isLoading: boolean;

  completeOnboarding: (c: Child) => void;
  addChildProfile: (c: Child) => void;
  switchChildProfile: (idx: number) => void;
  setChild: (c: Partial<Child>) => void;
  addMemory: (m: Memory) => void;
  updateMemory: (m: Memory) => void;
  deleteMemory: (id: string) => void;
  markMilestoneDone: (id: string, date: string, tone?: string, emotion?: EmotionKind) => void;
  addMember: (m: FamilyMember) => void;
  updateMember: (id: string, updates: Partial<FamilyMember>) => void;
  removeMember: (id: string) => void;
  showToast: (t: ToastState) => void;
  clearToast: () => void;
  updateSettings: (s: Partial<AppSettings>) => void;
  addSearchQuery: (q: string) => void;
  clearSearchHistory: () => void;
}

// IDs and dates of old pre-seeded demo milestones to migrate away
const OLD_SEED: Record<string, string> = {
  smile: 'Apr 21, 2025',
  laugh: 'Apr 22, 2025',
  roll:  'Mar 30, 2025',
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      onboardingDone: false,
      child: { name: '', pronouns: 'she / her', colorIdx: 0 },
      children: [],
      activeChildIdx: 0,
      memories: [],
      members: [],
      milestones: MILESTONES,
      toast: null,
      settings: { faceId: false, privateMode: false, autoSave: true },
      searchHistory: [],
      isLoading: false,

      completeOnboarding: (c) =>
        set(() => ({
          onboardingDone: true,
          child: c,
          children: [c],
          activeChildIdx: 0,
        })),

      addChildProfile: (c) =>
        set((s) => {
          const children = [...s.children, c];
          return { children, child: c, activeChildIdx: children.length - 1 };
        }),

      switchChildProfile: (idx) =>
        set((s) => ({
          activeChildIdx: idx,
          child: s.children[idx] ?? s.child,
        })),

      setChild: (c) =>
        set((s) => {
          const updated = { ...s.child, ...c };
          const children =
            s.children.length > 0
              ? s.children.map((ch, i) => (i === s.activeChildIdx ? updated : ch))
              : s.children;
          return { child: updated, children };
        }),

      addMemory: (m) => set((s) => {
        if (s.memories.some((x) => x.id === m.id)) return s;
        return { memories: [m, ...s.memories] };
      }),
      updateMemory: (m) => set((s) => ({ memories: s.memories.map((x) => (x.id === m.id ? m : x)) })),
      deleteMemory: (id) => set((s) => ({ memories: s.memories.filter((x) => x.id !== id) })),
      markMilestoneDone: (id, date, tone, emotion) =>
        set((s) => ({
          milestones: s.milestones.map((m) =>
            m.id === id
              ? { ...m, done: true, date, ...(tone && { tone }), ...(emotion && { emotion }) }
              : m,
          ),
        })),
      addMember: (m) => set((s) => ({ members: [...s.members, m] })),
      updateMember: (id, updates) =>
        set((s) => ({ members: s.members.map((m) => m.id === id ? { ...m, ...updates } : m) })),
      removeMember: (id) => set((s) => ({ members: s.members.filter((m) => m.id !== id) })),
      showToast: (t) => set({ toast: t }),
      clearToast: () => set({ toast: null }),
      updateSettings: (s) => set((prev) => ({ settings: { ...prev.settings, ...s } })),
      addSearchQuery: (q) =>
        set((s) => ({
          searchHistory: [q, ...s.searchHistory.filter((h) => h !== q)].slice(0, 5),
        })),
      clearSearchHistory: () => set({ searchHistory: [] }),
    }),
    {
      name: 'ourworld-store',
      version: 1,
      migrate: (persisted: any, version: number) => {
        if (version < 1) {
          const milestones = (persisted.milestones ?? []).map((m: any) =>
            m.id in OLD_SEED && m.done && m.date === OLD_SEED[m.id]
              ? { ...m, done: false, date: '', tone: undefined, emotion: undefined }
              : m
          );
          return { ...persisted, milestones };
        }
        return persisted;
      },
      partialize: (state) => ({
        onboardingDone: state.onboardingDone,
        child: state.child,
        children: state.children,
        activeChildIdx: state.activeChildIdx,
        memories: state.memories,
        milestones: state.milestones,
        members: state.members,
        settings: state.settings,
        searchHistory: state.searchHistory,
      }),
    },
  ),
);
