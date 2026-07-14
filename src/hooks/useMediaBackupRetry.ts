import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { uploadToCloudinary, cloudinaryConfigured } from '../lib/cloudinary';

// Memories whose media upload failed at save time are kept with a local
// data: URI (see AddMemoryFlow's uploadMedia) so nothing is lost, but they
// never back up to the cloud on their own. Retry them opportunistically
// whenever the app gains connectivity.
export function useMediaBackupRetry() {
  const retryingRef = useRef(false);

  useEffect(() => {
    if (!cloudinaryConfigured) return;

    async function retryPending() {
      if (retryingRef.current) return;
      retryingRef.current = true;
      try {
        const { memories, updateMemory } = useStore.getState();
        const pending = memories.filter((m) => m.mediaUri?.startsWith('data:'));
        for (const m of pending) {
          try {
            const url = await uploadToCloudinary(m.mediaUri as string);
            updateMemory({ ...m, mediaUri: url });
          } catch {
            // still offline or upload failing — leave as local, try again next trigger
          }
        }
      } finally {
        retryingRef.current = false;
      }
    }

    retryPending();
    window.addEventListener('online', retryPending);
    return () => window.removeEventListener('online', retryPending);
  }, []);
}
