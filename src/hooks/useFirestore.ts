import { useEffect, useRef } from 'react';
import {
  doc, setDoc, collection, getDocs,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { useStore } from '../store';

export function useFirestoreSync() {
  const store = useStore();
  const initialLoadDone = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userIdRef = useRef<string | null>(null);

  // Auth listener drives the initial load — ensures we don't race with Firebase
  // resolving its persisted auth state on first mount.
  useEffect(() => {
    let cancelled = false;

    async function loadFromFirestore(userId: string) {
      if (initialLoadDone.current) return;
      useStore.setState({ isLoading: true });
      try {
        const [memoriesSnap, milestonesSnap, membersSnap, childSnap, settingsSnap] =
          await Promise.all([
            getDocs(collection(db, 'users', userId, 'memories')),
            getDocs(collection(db, 'users', userId, 'milestones')),
            getDocs(collection(db, 'users', userId, 'members')),
            getDocs(collection(db, 'users', userId, 'child')),
            getDocs(collection(db, 'users', userId, 'settings')),
          ]);

        if (cancelled) return;

        if (!memoriesSnap.empty) {
          const memories = memoriesSnap.docs.map((d) => d.data() as any);
          memories.sort((a: any, b: any) => (b._ts ?? 0) - (a._ts ?? 0));
          useStore.setState({ memories });
        }
        if (!milestonesSnap.empty) {
          const milestones = milestonesSnap.docs.map((d) => d.data() as any);
          useStore.setState({ milestones });
        }
        if (!membersSnap.empty) {
          const members = membersSnap.docs.map((d) => d.data() as any);
          useStore.setState({ members });
        }
        if (!childSnap.empty) {
          const childData = childSnap.docs[0]?.data() as any;
          if (childData) useStore.setState({ child: childData });
        }
        if (!settingsSnap.empty) {
          const settingsData = settingsSnap.docs[0]?.data() as any;
          if (settingsData) useStore.setState({ settings: settingsData });
        }
      } catch {
        // Firestore not configured yet — use local state
      } finally {
        if (!cancelled) {
          initialLoadDone.current = true;
          useStore.setState({ isLoading: false });
        }
      }
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      userIdRef.current = user?.uid ?? null;
      if (user && !initialLoadDone.current) {
        loadFromFirestore(user.uid);
      } else if (!user) {
        // Signed out — reset so next sign-in reloads fresh Firestore data
        initialLoadDone.current = false;
        useStore.setState({ isLoading: false });
      }
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  // Debounced write-back whenever store changes
  useEffect(() => {
    if (!initialLoadDone.current) return;
    const userId = userIdRef.current ?? auth.currentUser?.uid;
    if (!userId) return;
    if (!store.settings.autoSave) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      syncToFirestore(store, userId);
    }, 800);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [store.memories, store.milestones, store.members, store.child, store.settings]);

  return null;
}

async function syncToFirestore(store: ReturnType<typeof useStore.getState>, userId: string) {
  try {
    await setDoc(doc(db, 'users', userId, 'child', 'profile'), store.child);
    await setDoc(doc(db, 'users', userId, 'settings', 'main'), store.settings);
    // Only sync memories without large binary payloads — blob: and data: URIs
    // (photos, videos, voice) exceed Firestore's 1MB document limit.
    await Promise.all(
      store.memories
        .filter((m) => !m.mediaUri?.startsWith('blob:') && !m.mediaUri?.startsWith('data:'))
        .map((m) => setDoc(doc(db, 'users', userId, 'memories', m.id), { ...m, _ts: Date.now() })),
    );
    await Promise.all(
      store.milestones.map((m) =>
        setDoc(doc(db, 'users', userId, 'milestones', m.id), m),
      ),
    );
    await Promise.all(
      store.members.map((m) =>
        setDoc(doc(db, 'users', userId, 'members', m.id), m),
      ),
    );
  } catch {
    // Silent fail — local state still works
  }
}
