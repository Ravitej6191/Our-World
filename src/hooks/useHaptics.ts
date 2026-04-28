import { useCallback } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

async function tryHaptics(fn: () => Promise<void>) {
  try { await fn(); } catch { /* no-op on web */ }
}

export function useHaptics() {
  const light = useCallback(
    () => tryHaptics(() => Haptics.impact({ style: ImpactStyle.Light })),
    [],
  );
  const medium = useCallback(
    () => tryHaptics(() => Haptics.impact({ style: ImpactStyle.Medium })),
    [],
  );
  const success = useCallback(
    () => tryHaptics(() => Haptics.notification({ type: NotificationType.Success })),
    [],
  );
  const warning = useCallback(
    () => tryHaptics(() => Haptics.notification({ type: NotificationType.Warning })),
    [],
  );

  return { light, medium, success, warning };
}
