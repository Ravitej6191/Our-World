import { useEffect, useRef } from 'react';
import {
  doc, getDoc, setDoc, deleteDoc, collection, getDocs,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { useStore, type AppSettings } from '../store';
import type { Memory, Milestone, FamilyMember, Child } from '../types';

export function useFirestoreSync() {
  const memories = useStore((s) => s.memories);
  const milestones = useStore((s) => s.milestones);
  const members = useStore((s) => s.members);
  const child = useStore((s) => s.child);
  const settings = useStore((s) => s.settings);
  const initialLoadDone = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The uid whose users/{ownerId}/** tree this client reads/writes — normally
  // the signed-in user's own uid, but an accepted family member's app points
  // this at the family owner's uid instead (see InviteAcceptScreen).
  const ownerIdRef = useRef<string | null>(null);
  const isOwnerRef = useRef(true);
  // Ids known to exist in Firestore as of the last load/sync, so the debounced
  // write-back can tell "removed locally" apart from "never synced yet" and
  // issue deleteDoc for the former instead of leaving orphaned documents behind.
  const syncedMemoryIdsRef = useRef<Set<string>>(new Set());
  const syncedMemberIdsRef = useRef<Set<string>>(new Set());

  // Auth listener drives the initial load — ensures we don't race with Firebase
  // resolving its persisted auth state on first mount.
  useEffect(() => {
    let cancelled = false;

    async function loadFromFirestore(userId: string) {
      if (initialLoadDone.current) return;
      useStore.setState({ isLoading: true });
      try {
        let ownerId = userId;
        try {
          const rootSnap = await getDoc(doc(db, 'users', userId));
          const pointer = rootSnap.data()?.dataOwnerId as string | undefined;
          if (pointer) ownerId = pointer;
        } catch { /* no root pointer yet — sync own data */ }
        ownerIdRef.current = ownerId;
        isOwnerRef.current = ownerId === userId;

        const [memoriesSnap, milestonesSnap, membersSnap, childSnap, settingsSnap] =
          await Promise.all([
            getDocs(collection(db, 'users', ownerId, 'memories')),
            getDocs(collection(db, 'users', ownerId, 'milestones')),
            getDocs(collection(db, 'users', ownerId, 'members')),
            getDocs(collection(db, 'users', ownerId, 'child')),
            getDocs(collection(db, 'users', ownerId, 'settings')),
          ]);

        if (cancelled) return;

        const remoteMemories = memoriesSnap.docs.map((d) => d.data() as Memory & { _ts?: number });
        remoteMemories.sort((a, b) => (b._ts ?? 0) - (a._ts ?? 0));
        syncedMemoryIdsRef.current = new Set(remoteMemories.map((m) => m.id));
        if (!memoriesSnap.empty) {
          useStore.setState({ memories: remoteMemories });
        }

        if (!milestonesSnap.empty) {
          const milestones = milestonesSnap.docs.map((d) => d.data() as Milestone);
          useStore.setState({ milestones });
        }

        const remoteMembers = membersSnap.docs.map((d) => d.data() as FamilyMember);
        syncedMemberIdsRef.current = new Set(remoteMembers.map((m) => m.id));
        if (!membersSnap.empty) {
          useStore.setState({ members: remoteMembers });
        }

        if (!childSnap.empty) {
          const childData = childSnap.docs[0]?.data() as Child | undefined;
          // Backfill an id for profiles synced before multi-child support existed.
          if (childData) useStore.setState({ child: { ...childData, id: childData.id || 'legacy-0' } });
        }
        if (!settingsSnap.empty) {
          const settingsData = settingsSnap.docs[0]?.data() as AppSettings | undefined;
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
      if (user && !initialLoadDone.current) {
        loadFromFirestore(user.uid);
      } else if (!user) {
        // Signed out — reset so next sign-in reloads fresh Firestore data
        initialLoadDone.current = false;
        ownerIdRef.current = null;
        syncedMemoryIdsRef.current = new Set();
        syncedMemberIdsRef.current = new Set();
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
    const ownerId = ownerIdRef.current ?? auth.currentUser?.uid;
    if (!ownerId) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const currentMemoryIds = new Set(memories.map((m) => m.id));
      const currentMemberIds = new Set(members.map((m) => m.id));
      const removedMemoryIds = [...syncedMemoryIdsRef.current].filter((id) => !currentMemoryIds.has(id));
      const removedMemberIds = [...syncedMemberIdsRef.current].filter((id) => !currentMemberIds.has(id));

      syncToFirestore(
        { memories, milestones, members, child, settings },
        ownerId,
        isOwnerRef.current,
        removedMemoryIds,
        removedMemberIds,
      );

      syncedMemoryIdsRef.current = currentMemoryIds;
      syncedMemberIdsRef.current = currentMemberIds;
    }, 800);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [memories, milestones, members, child, settings]);

  return null;
}

type SyncStore = Pick<ReturnType<typeof useStore.getState>, 'memories' | 'milestones' | 'members' | 'child' | 'settings'>;

// Each group is written independently so a permission denial on one (e.g. a
// non-owner family member isn't allowed to edit the child profile) doesn't
// block the others (e.g. that same member adding a memory) from syncing.
async function syncToFirestore(
  store: SyncStore,
  ownerId: string,
  isOwner: boolean,
  removedMemoryIds: string[],
  removedMemberIds: string[],
) {
  if (isOwner) {
    setDoc(doc(db, 'users', ownerId, 'child', 'profile'), store.child).catch(() => {});
    setDoc(doc(db, 'users', ownerId, 'settings', 'main'), store.settings).catch(() => {});
  }

  // Milestones and memories may be written by any accepted family member
  // (e.g. adding a milestone-tagged memory marks that milestone done) —
  // security rules are the real gate on this, not the client.
  Promise.all(
    store.milestones.map((m) => setDoc(doc(db, 'users', ownerId, 'milestones', m.id), m)),
  ).catch(() => {});

  // Only sync memories without large binary payloads — blob: and data: URIs
  // (photos, videos, voice) exceed Firestore's 1MB document limit.
  Promise.all(
    store.memories
      .filter((m) => !m.mediaUri?.startsWith('blob:') && !m.mediaUri?.startsWith('data:'))
      .map((m) => setDoc(doc(db, 'users', ownerId, 'memories', m.id), { ...m, _ts: Date.now() })),
  ).catch(() => {});
  Promise.all(removedMemoryIds.map((id) => deleteDoc(doc(db, 'users', ownerId, 'memories', id)))).catch(() => {});

  if (isOwner) {
    Promise.all(
      store.members.map((m) => setDoc(doc(db, 'users', ownerId, 'members', m.id), m)),
    ).catch(() => {});
    Promise.all(removedMemberIds.map((id) => deleteDoc(doc(db, 'users', ownerId, 'members', id)))).catch(() => {});
  }
}
