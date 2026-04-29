import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { App as CapApp } from '@capacitor/app';
import { useStore } from './store';
import type { TabId } from './types';
import { useFirestoreSync } from './hooks/useFirestore';
import { EMOTION_TONE } from './shared/constants';

import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import AddChildFlow from './screens/AddChildFlow';
import TimelineScreen from './screens/TimelineScreen';
import MilestonesScreen from './screens/MilestonesScreen';
import MilestoneDetailScreen from './screens/MilestoneDetailScreen';
import SearchScreen from './screens/SearchScreen';
import AddMemoryFlow from './screens/AddMemoryFlow';
import MemoryDetailScreen from './screens/MemoryDetailScreen';
import FamilyScreen from './screens/FamilyScreen';
import MemberDetailScreen from './screens/MemberDetailScreen';
import InviteFlow from './screens/InviteFlow';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import TabBar from './components/TabBar';
import Toast from './components/Toast';

type Screen =
  | 'splash' | 'onboarding' | 'addChild'
  | 'home' | 'milestones' | 'milestoneDetail'
  | 'search' | 'addMemory' | 'memoryDetail'
  | 'family' | 'memberDetail' | 'invite'
  | 'profile' | 'settings';

const MAIN_TABS: Screen[] = ['home', 'milestones', 'family', 'profile'];

const slide = {
  enter: (d: number) => ({ x: d >= 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d: number) => ({ x: d >= 0 ? '-100%' : '100%', opacity: 0 }),
};
const fade = {
  enter:  { opacity: 0, y: 16 },
  center: { opacity: 1, y: 0 },
  exit:   { opacity: 0, y: -8 },
};

function useNav(initial: Screen) {
  const [stack, setStack] = useState<Screen[]>([initial]);
  const [dir, setDir] = useState(1);

  const push = useCallback((s: Screen) => {
    setDir(1);
    setStack(prev => [...prev, s]);
  }, []);

  const pop = useCallback(() => {
    setDir(-1);
    setStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  }, []);

  const replace = useCallback((s: Screen) => {
    setDir(1);
    setStack([s]);
  }, []);

  const jumpTab = useCallback((s: Screen) => {
    const idx = MAIN_TABS.indexOf(s);
    const curIdx = MAIN_TABS.indexOf(stack[stack.length - 1]);
    setDir(idx >= curIdx ? 1 : -1);
    setStack([s]);
  }, [stack]);

  return { screen: stack[stack.length - 1], stack, dir, push, pop, replace, jumpTab };
}

function nowGroup() {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
function nowDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
function todayShort() {
  return new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function App() {
  const {
    child, memories, milestones, toast,
    setChild, addMemory, updateMemory, deleteMemory, markMilestoneDone,
    removeMember, showToast, clearToast,
  } = useStore();
  const { screen, stack, dir, push, pop, replace, jumpTab } = useNav('splash');

  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [openMemoryId, setOpenMemoryId] = useState<string | null>(null);
  const [openMilestoneId, setOpenMilestoneId] = useState<string | null>(null);
  const [openMemberId, setOpenMemberId] = useState<string | null>(null);
  const [pendingMilestoneId, setPendingMilestoneId] = useState<string | null>(null);

  useFirestoreSync();

  useEffect(() => {
    let handle: { remove: () => void } | undefined;
    CapApp.addListener('backButton', () => {
      if (stack.length > 1) pop();
    }).then(h => { handle = h; });
    return () => { handle?.remove(); };
  }, [stack, pop]);

  const showMain = MAIN_TABS.includes(screen as any);

  const handleTab = (tab: TabId) => {
    if (tab === 'add') { push('addMemory'); return; }
    setActiveTab(tab);
    jumpTab(tab as Screen);
  };

  const handleOpenMemory = (id: string) => {
    setOpenMemoryId(id);
    push('memoryDetail');
  };

  const handleOpenMilestone = (id: string) => {
    setOpenMilestoneId(id);
    push('milestoneDetail');
  };

  const handleOpenMember = (id: string) => {
    setOpenMemberId(id);
    push('memberDetail');
  };

  const handleOpenAddMemory = (milestoneId?: string) => {
    setPendingMilestoneId(milestoneId ?? null);
    push('addMemory');
  };

  const handleSaveMemory = (m: {
    media: string; title: string; note: string;
    emotion: any; isMilestone: boolean; milestoneId?: string;
  }) => {
    const id = `m${Date.now()}`;
    const milestone = milestones.find(ml => ml.id === m.milestoneId);
    const tone = EMOTION_TONE[m.emotion as keyof typeof EMOTION_TONE] ?? 'lavender';
    addMemory({
      id,
      date: nowDate(),
      dateShort: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: nowTime(),
      group: nowGroup(),
      title: m.title || 'A memory',
      note: m.note,
      media: m.media as any,
      tone,
      label: m.title,
      emotion: m.emotion,
      milestone: m.isMilestone && !!m.milestoneId,
      milestoneLabel: milestone?.label,
      milestoneId: m.milestoneId,
    });

    if (m.isMilestone && m.milestoneId) {
      markMilestoneDone(m.milestoneId, todayShort(), tone, m.emotion);
    }

    setPendingMilestoneId(null);
    pop();
    showToast({ text: 'Memory saved', variant: 'success' });
  };

  const handleDeleteMemory = (id: string) => {
    deleteMemory(id);
    pop();
    showToast({ text: 'Memory deleted', variant: 'success' });
  };

  const handleRemoveMember = (id: string) => {
    removeMember(id);
    pop();
    showToast({ text: 'Member removed', variant: 'success' });
  };

  const selectedMemory = memories.find(m => m.id === openMemoryId);
  const selectedMilestone = milestones.find(m => m.id === openMilestoneId);
  const members = useStore((s) => s.members);
  const selectedMember = members.find(m => m.id === openMemberId);

  const isModal = screen === 'addMemory' || screen === 'addChild' || screen === 'invite';
  const transition = { type: 'tween', ease: [0.32, 0, 0.16, 1], duration: 0.32 } as const;

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#faf8f7' }}>
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={screen}
          custom={dir}
          variants={isModal ? fade : slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          style={{ position: 'absolute', inset: 0 }}
        >
          {screen === 'splash' && (
            <SplashScreen onContinue={() => replace('onboarding')} />
          )}

          {screen === 'onboarding' && (
            <OnboardingScreen onDone={() => replace('addChild')} />
          )}

          {screen === 'addChild' && (
            <AddChildFlow
              onDone={(c) => { setChild(c); replace('home'); }}
              onBack={() => replace('onboarding')}
            />
          )}

          {screen === 'home' && (
            <TimelineScreen
              child={child}
              memories={memories}
              onOpenMemory={handleOpenMemory}
              onOpenSearch={() => push('search')}
              onGoProfile={() => { setActiveTab('profile'); jumpTab('profile'); }}
            />
          )}

          {screen === 'milestones' && (
            <MilestonesScreen
              onBack={() => { setActiveTab('home'); jumpTab('home'); }}
              onOpenMilestone={handleOpenMilestone}
              onAddMemoryForMilestone={(id) => handleOpenAddMemory(id)}
            />
          )}

          {screen === 'milestoneDetail' && (
            <MilestoneDetailScreen
              milestone={selectedMilestone}
              memories={memories}
              onBack={pop}
              onAddMemory={() => handleOpenAddMemory(openMilestoneId ?? undefined)}
            />
          )}

          {screen === 'search' && (
            <SearchScreen
              memories={memories}
              onBack={pop}
              onOpenMemory={handleOpenMemory}
            />
          )}

          {screen === 'addMemory' && (
            <AddMemoryFlow
              defaultMilestoneId={pendingMilestoneId}
              onClose={() => { setPendingMilestoneId(null); pop(); }}
              onSave={handleSaveMemory}
            />
          )}

          {screen === 'memoryDetail' && (
            <MemoryDetailScreen
              memory={selectedMemory}
              onBack={pop}
              onDelete={handleDeleteMemory}
              onSave={(updated) => {
                updateMemory(updated);
                showToast({ text: 'Memory updated', variant: 'success' });
              }}
            />
          )}

          {screen === 'family' && (
            <FamilyScreen
              onBack={() => { setActiveTab('home'); jumpTab('home'); }}
              onOpenMember={handleOpenMember}
              onInvite={() => push('invite')}
            />
          )}

          {screen === 'memberDetail' && (
            <MemberDetailScreen
              member={selectedMember}
              onBack={pop}
              onRemove={handleRemoveMember}
            />
          )}

          {screen === 'invite' && (
            <InviteFlow
              onClose={pop}
              onInvited={() => { pop(); showToast({ text: 'Invite sent!', variant: 'success' }); }}
            />
          )}

          {screen === 'profile' && (
            <ProfileScreen
              child={child}
              memoriesCount={memories.length}
              onBack={() => { setActiveTab('home'); jumpTab('home'); }}
              onEdit={() => push('addChild')}
              onOpenSettings={() => push('settings')}
              onOpenMilestones={() => { setActiveTab('milestones'); jumpTab('milestones'); }}
              onOpenFamily={() => { setActiveTab('family'); jumpTab('family'); }}
              onAddChild={() => push('addChild')}
            />
          )}

          {screen === 'settings' && (
            <SettingsScreen onBack={pop} />
          )}
        </motion.div>
      </AnimatePresence>

      {showMain && (
        <TabBar active={activeTab} onNav={handleTab} />
      )}

      {toast && <Toast toast={toast} onDone={clearToast} />}
    </div>
  );
}
