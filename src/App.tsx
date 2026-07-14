import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { App as CapApp } from '@capacitor/app';
import { SplashScreen as CapSplash } from '@capacitor/splash-screen';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { useStore } from './store';
import type { TabId } from './types';
import type { EmotionKind } from './tokens';
import { useFirestoreSync } from './hooks/useFirestore';
import { useMediaBackupRetry } from './hooks/useMediaBackupRetry';
import { useBiometricLock } from './hooks/useBiometricLock';
import { EMOTION_TONE, filterByActiveChild } from './shared/constants';
import { T } from './tokens';
import Icon from './components/Icon';

import SplashScreen from './screens/SplashScreen';
import InviteAcceptScreen from './screens/InviteAcceptScreen';
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
import KeepsakeBookScreen from './screens/KeepsakeBookScreen';
import TabBar from './components/TabBar';
import Toast from './components/Toast';
import type { ChildFlowMode } from './screens/AddChildFlow';

type Screen =
  | 'splash' | 'onboarding' | 'addChild'
  | 'home' | 'milestones' | 'milestoneDetail'
  | 'search' | 'addMemory' | 'memoryDetail'
  | 'family' | 'memberDetail' | 'invite'
  | 'profile' | 'keepsake'
  | 'inviteAccept';

const MAIN_TABS: Screen[] = ['home', 'milestones', 'family', 'profile'];

const slide = {
  enter: (d: number) => ({ x: d >= 0 ? '100%' : '-100%' }),
  center: { x: 0 },
  exit:  (d: number) => ({ x: d >= 0 ? '-100%' : '100%' }),
};
const fade = {
  enter:  { opacity: 0 },
  center: { opacity: 1 },
  exit:   { opacity: 0 },
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
    child, children, memories, milestones, toast, onboardingDone, settings, isLoading,
    setChild, addMemory, updateMemory, deleteMemory, markMilestoneDone,
    removeMember, showToast, clearToast, completeOnboarding, addChildProfile,
  } = useStore();

  const firstChildId = children[0]?.id ?? child.id;
  const childMemories = useMemo(
    () => filterByActiveChild(memories, child.id, firstChildId),
    [memories, child.id, firstChildId],
  );
  const childMilestones = useMemo(
    () => filterByActiveChild(milestones, child.id, firstChildId),
    [milestones, child.id, firstChildId],
  );

  const [authReady, setAuthReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [appHidden, setAppHidden] = useState(false);
  const [pendingInviteToken, setPendingInviteToken] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('invite');
  });

  const { screen, stack, dir, push, pop, replace, jumpTab } = useNav('splash');

  // Firebase auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAuthed(!!user);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  // Fade out native splash and navigate once auth state is determined
  useEffect(() => {
    if (!authReady) return;
    CapSplash.hide({ fadeOutDuration: 300 }).catch(() => {});

    if (pendingInviteToken) {
      // Clear the token from URL so refresh/share doesn't re-trigger
      window.history.replaceState({}, '', window.location.pathname);
      replace('inviteAccept');
      return;
    }

    // Skip splash screen — go directly to the right destination
    if (isAuthed) {
      replace(onboardingDone ? 'home' : 'onboarding');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady]);

  // Tracks whether the app is backgrounded — used by the biometric lock's
  // "re-lock on resume" behavior.
  // Uses both visibilitychange (web) and Capacitor appStateChange (native/PWA)
  useEffect(() => {
    if (!settings.faceId) return;
    const handleVisibility = () => setAppHidden(document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    let capHandle: { remove: () => void } | undefined;
    CapApp.addListener('appStateChange', ({ isActive }) => {
      setAppHidden(!isActive);
    }).then((h) => { capHandle = h; });
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      capHandle?.remove();
      setAppHidden(false);
    };
  }, [settings.faceId]);

  // Navigate to splash whenever the user signs out
  useEffect(() => {
    if (authReady && !isAuthed && screen !== 'splash') {
      replace('splash');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, authReady]);

  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [openMemoryId, setOpenMemoryId] = useState<string | null>(null);
  const [openMilestoneId, setOpenMilestoneId] = useState<string | null>(null);
  const [openMemberId, setOpenMemberId] = useState<string | null>(null);
  const [pendingMilestoneId, setPendingMilestoneId] = useState<string | null>(null);
  const [childFlowMode, setChildFlowMode] = useState<ChildFlowMode>('setup');

  useFirestoreSync();
  useMediaBackupRetry();
  const { locked, unlock } = useBiometricLock(settings.faceId, appHidden);

  // Prompt automatically as soon as the lock screen appears; the on-screen
  // "Unlock" button remains as a manual retry if the prompt is dismissed.
  useEffect(() => {
    if (locked) unlock();
  }, [locked, unlock]);

  useEffect(() => {
    let handle: { remove: () => void } | undefined;
    CapApp.addListener('backButton', () => {
      if (stack.length > 1) pop();
    }).then(h => { handle = h; });
    return () => { handle?.remove(); };
  }, [stack, pop]);

  const showMain = MAIN_TABS.includes(screen);

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
    media: 'photo' | 'video' | 'voice' | 'text'; title: string; note: string;
    emotion: EmotionKind; isMilestone: boolean; milestoneId?: string;
    mediaUri?: string; posterUri?: string; duration?: string;
  }) => {
    const id = `m${Date.now()}`;
    const milestone = childMilestones.find(ml => ml.id === m.milestoneId);
    const tone = EMOTION_TONE[m.emotion as keyof typeof EMOTION_TONE] ?? 'lavender';
    addMemory({
      id,
      date: nowDate(),
      dateShort: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: nowTime(),
      group: nowGroup(),
      title: m.title || 'A memory',
      note: m.note,
      media: m.media,
      tone,
      label: m.title,
      emotion: m.emotion,
      milestone: m.isMilestone && !!m.milestoneId,
      milestoneLabel: milestone?.label,
      milestoneId: m.milestoneId,
      mediaUri: m.mediaUri,
      posterUri: m.posterUri,
      duration: m.duration,
      createdAt: Date.now(),
    });

    if (m.isMilestone && m.milestoneId) {
      markMilestoneDone(m.milestoneId, todayShort(), tone, m.emotion);
    }

    setPendingMilestoneId(null);
    pop();
    const backupPending = m.mediaUri?.startsWith('data:');
    showToast({
      text: backupPending ? 'Memory saved — will back up when online' : 'Memory saved',
      variant: 'success',
    });
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

  const handleChildFlowDone = (c: Omit<import('./types').Child, 'id'>) => {
    if (childFlowMode === 'setup') {
      completeOnboarding(c);
      replace('home');
    } else if (childFlowMode === 'edit') {
      setChild(c);
      pop();
      showToast({ text: 'Profile updated', variant: 'success' });
    } else {
      addChildProfile(c);
      replace('home');
      showToast({ text: 'New profile added', variant: 'success' });
    }
  };

  const handleSplashContinue = () => {
    replace(onboardingDone ? 'home' : 'onboarding');
  };

  const selectedMemory = childMemories.find(m => m.id === openMemoryId);
  const selectedMilestone = childMilestones.find(m => m.id === openMilestoneId);
  const members = useStore((s) => s.members);
  const selectedMember = members.find(m => m.id === openMemberId);

  const isModal = screen === 'addMemory' || screen === 'invite';
  const isMainTab = MAIN_TABS.includes(screen);
  const usesFade = screen === 'splash' || screen === 'onboarding' || screen === 'addChild' || screen === 'inviteAccept' || isModal || isMainTab;
  const transition = { type: 'tween', ease: [0.25, 0.1, 0.25, 1], duration: 0.26 } as const;

  if (!authReady) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#faf8f7',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }} />
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#faf8f7' }}>
      <AnimatePresence mode="sync" custom={dir} initial={false}>
        <motion.div
          key={screen}
          custom={dir}
          variants={usesFade ? fade : slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          style={{ position: 'absolute', inset: 0 }}
        >
          {screen === 'splash' && (
            <SplashScreen isAuthed={isAuthed} onContinue={handleSplashContinue} />
          )}

          {screen === 'inviteAccept' && pendingInviteToken && (
            <InviteAcceptScreen
              token={pendingInviteToken}
              isAuthed={isAuthed}
              onAccepted={() => {
                setPendingInviteToken(null);
                replace(onboardingDone ? 'home' : 'onboarding');
              }}
              onDecline={() => {
                setPendingInviteToken(null);
                replace('splash');
              }}
            />
          )}

          {screen === 'onboarding' && (
            <OnboardingScreen onDone={() => replace('addChild')} />
          )}

          {screen === 'addChild' && (
            <AddChildFlow
              mode={childFlowMode}
              initialChild={childFlowMode === 'edit' ? child : undefined}
              onDone={handleChildFlowDone}
              onBack={() => {
                if (childFlowMode === 'setup') replace('onboarding');
                else pop();
              }}
            />
          )}

          {screen === 'home' && (
            <TimelineScreen
              child={child}
              memories={childMemories}
              isLoading={isLoading}
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
              memories={childMemories}
              onBack={pop}
              onAddMemory={() => handleOpenAddMemory(openMilestoneId ?? undefined)}
              onOpenMemory={handleOpenMemory}
            />
          )}

          {screen === 'search' && (
            <SearchScreen
              memories={childMemories}
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
              onInvited={({ name }) => {
                // No optimistic local member here — they only appear in the
                // Family list once they actually accept (see InviteAcceptScreen),
                // at which point the real membership syncs down from Firestore.
                pop();
                showToast({ text: `${name || 'Invite'} sent!`, variant: 'success' });
              }}
            />
          )}

          {screen === 'profile' && (
            <ProfileScreen
              child={child}
              children={children}
              memoriesCount={childMemories.length}
              onBack={() => { setActiveTab('home'); jumpTab('home'); }}
              onEdit={() => { setChildFlowMode('edit'); push('addChild'); }}
              onOpenKeepsake={() => push('keepsake')}
              onAddChild={() => { setChildFlowMode('add'); push('addChild'); }}
            />
          )}

          {screen === 'keepsake' && (
            <KeepsakeBookScreen
              memories={childMemories}
              childName={child.name}
              onBack={pop}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {showMain && (
        <TabBar active={activeTab} onNav={handleTab} />
      )}

      {toast && <Toast toast={toast} onDone={clearToast} />}

      {/* Biometric lock screen */}
      <AnimatePresence>
        {locked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 1000,
              background: T.bg, fontFamily: T.fontSans,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 20, padding: 24,
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: 32, background: T.bgCool,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="lock" size={26} color={T.lavenderDeep} />
            </div>
            <div style={{ fontSize: 15, color: T.inkMuted, textAlign: 'center' }}>
              Unlock to open Our World
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={unlock}
              style={{
                height: 50, padding: '0 28px', borderRadius: 16,
                background: T.ink, border: 'none', cursor: 'pointer',
                color: '#fff', fontSize: 14.5, fontWeight: 500, fontFamily: T.fontSans,
              }}
            >
              Unlock
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
