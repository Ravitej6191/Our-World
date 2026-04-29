import { useEffect, useRef } from 'react';
import {
  doc, setDoc, collection, getDocs, onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useStore } from '../store';

const USER_ID = 'default'; // single-user app; extend with auth later

export function useFirestoreSync() {
  const store = useStore();
  const initialLoadDone = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load all data from Firestore once on mount
  useEffect(() => {
    let cancelled = false;

    async function loadFromFirestore() {
      try {
        const [memoriesSnap, milestonesSnap, membersSnap, childSnap, settingsSnap] =
          await Promise.all([
            getDocs(collection(db, 'users', USER_ID, 'memories')),
            getDocs(collection(db, 'users', USER_ID, 'milestones')),
            getDocs(collection(db, 'users', USER_ID, 'members')),
            getDocs(collection(db, 'users', USER_ID, 'child')),
            getDocs(collection(db, 'users', USER_ID, 'settings')),
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

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      syncToFirestore(store);
    }, 800);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [store.memories, store.milestones, store.members, store.child, store.settings]);

  return null;
}

async function syncToFirestore(store: ReturnType<typeof useStore.getState>) {
  try {
    // Write child profile
    await setDoc(doc(db, 'users', USER_ID, 'child', 'profile'), store.child);

    // Write settings
    await setDoc(doc(db, 'users', USER_ID, 'settings', 'main'), store.settings);

    // Write memories (upsert each by id)
    await Promise.all(
      store.memories.map((m) =>
        setDoc(doc(db, 'users', USER_ID, 'memories', m.id), { ...m, _ts: Date.now() }),
      ),
    );

    // Write milestones
    await Promise.all(
      store.milestones.map((m) =>
        setDoc(doc(db, 'users', USER_ID, 'milestones', m.id), m),
      ),
    );

    // Write members
    await Promise.all(
      store.members.map((m) =>
        setDoc(doc(db, 'users', USER_ID, 'members', m.id), m),
      ),
    );
  } catch {
    // Silent fail — local state still works
  }
}
