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

  // Track auth state so syncs use the right user ID
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      userIdRef.current = user?.uid ?? null;
    });
    return unsub;
  }, []);

  // Load all data from Firestore once on mount
  useEffect(() => {
    let cancelled = false;

    async function loadFromFirestore() {
      const userId = userIdRef.current ?? auth.currentUser?.uid;
      if (!userId) return;
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
        initialLoadDone.current = true;
      }
    }

    loadFromFirestore();
    return () => { cancelled = true; };
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
    await Promise.all(
      store.memories
        .filter((m) => !m.mediaUri?.startsWith('blob:'))
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
