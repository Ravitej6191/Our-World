import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Memory, Child, FamilyMember, ToastState, Milestone } from '../types';
import { MILESTONES } from '../data';
import type { EmotionKind } from '../tokens';

export interface AppSettings {
  faceId: boolean;
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

  completeOnboarding: (c: Omit<Child, 'id'>) => void;
  addChildProfile: (c: Omit<Child, 'id'>) => void;
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

function seedMilestonesForChild(childId: string): Milestone[] {
  return MILESTONES.map((m) => ({ ...m, id: `${childId}:${m.id}`, childId }));
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      onboardingDone: false,
      child: { id: '', name: '', pronouns: 'she / her', colorIdx: 0 },
      children: [],
      activeChildIdx: 0,
      memories: [],
      members: [],
      milestones: MILESTONES,
      toast: null,
      settings: { faceId: false },
      searchHistory: [],
      isLoading: false,

      completeOnboarding: (c) =>
        set(() => {
          const child: Child = { ...c, id: `child-${Date.now()}` };
          return {
            onboardingDone: true,
            child,
            children: [child],
            activeChildIdx: 0,
          };
        }),

      addChildProfile: (c) =>
        set((s) => {
          const child: Child = { ...c, id: `child-${Date.now()}` };
          const children = [...s.children, child];
          return {
            children,
            child,
            activeChildIdx: children.length - 1,
            milestones: [...s.milestones, ...seedMilestonesForChild(child.id)],
          };
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
        return { memories: [{ ...m, childId: s.child.id }, ...s.memories] };
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
      version: 2,
      migrate: (persisted: unknown, version: number): unknown => {
        let state = persisted as {
          child?: Child;
          children?: Child[];
          milestones?: Milestone[];
          settings?: Record<string, unknown>;
        } & Record<string, unknown>;

        if (version < 1) {
          const milestones = (state.milestones ?? []).map((m) =>
            m.id in OLD_SEED && m.done && m.date === OLD_SEED[m.id]
              ? { ...m, done: false, date: '', tone: undefined, emotion: undefined }
              : m
          );
          state = { ...state, milestones };
        }

        if (version < 2) {
          // Give pre-multi-child profiles a stable id, and drop the retired
          // privateMode/autoSave settings (private mode and storage toggles
          // were removed from the app).
          const legacyId = state.child?.id || 'legacy-0';
          const child = state.child ? { ...state.child, id: state.child.id || legacyId } : state.child;
          const children = (state.children ?? []).map((c) => ({ ...c, id: c.id || legacyId }));
          const settingsRest = { ...(state.settings ?? {}) };
          delete settingsRest.privateMode;
          delete settingsRest.autoSave;
          state = { ...state, child, children, settings: { faceId: false, ...settingsRest } };
        }

        return state;
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
