import { useCallback } from 'react';

// Dynamic import so the web/browser dev build never fails
async function impact(style: 'Light' | 'Medium' | 'Heavy') {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle[style] });
  } catch { /* no-op on web */ }
}

async function notify(type: 'Success' | 'Warning' | 'Error') {
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType[type] });
  } catch { /* no-op on web */ }
}

export function useHaptics() {
  const light   = useCallback(() => impact('Light'),    []);
  const medium  = useCallback(() => impact('Medium'),   []);
  const success = useCallback(() => notify('Success'),  []);
  const warning = useCallback(() => notify('Warning'),  []);

  return { light, medium, success, warning };
}
