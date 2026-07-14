import { useCallback, useEffect, useRef, useState } from 'react';

// Dynamic import so the web/browser dev build never fails — matches useHaptics' pattern.
async function loadPlugin() {
  try {
    return await import('@aparajita/capacitor-biometric-auth');
  } catch {
    return null;
  }
}

// Gates the app behind Face ID / Touch ID (or device passcode as a fallback)
// on cold start and whenever it returns from the background, but only when
// the "Face ID / Touch ID" setting is on and the platform actually supports it.
export function useBiometricLock(enabled: boolean, appHidden: boolean) {
  const [locked, setLocked] = useState(false);
  const wasHiddenRef = useRef(false);
  const availableRef = useRef(false);

  const checkAvailable = useCallback(async () => {
    const mod = await loadPlugin();
    if (!mod) { availableRef.current = false; return false; }
    try {
      const result = await mod.BiometricAuth.checkBiometry();
      availableRef.current = result.isAvailable;
      return result.isAvailable;
    } catch {
      availableRef.current = false;
      return false;
    }
  }, []);

  // Lock on cold start whenever the setting is (or becomes) enabled.
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    checkAvailable().then((available) => {
      if (!cancelled && available) setLocked(true);
    });
    return () => { cancelled = true; };
  }, [enabled, checkAvailable]);

  // Re-lock whenever the app comes back from the background.
  useEffect(() => {
    if (!enabled) return;
    if (appHidden) { wasHiddenRef.current = true; return; }
    if (wasHiddenRef.current) {
      wasHiddenRef.current = false;
      if (availableRef.current) setLocked(true);
    }
  }, [enabled, appHidden]);

  const unlock = useCallback(async () => {
    const mod = await loadPlugin();
    if (!mod) { setLocked(false); return true; }
    try {
      await mod.BiometricAuth.authenticate({
        reason: 'Unlock Our World',
        cancelTitle: 'Cancel',
        allowDeviceCredential: true,
        androidTitle: 'Unlock Our World',
        androidSubtitle: 'Use your fingerprint or face to continue',
      });
      setLocked(false);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { locked: locked && enabled, unlock };
}
