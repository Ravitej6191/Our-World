export const T = {
  // Surfaces
  bg:           '#faf8f7',
  bgWarm:       '#f9f5f3',
  bgCool:       '#f6f4fb',
  card:         '#ffffff',
  line:         '#ebe8f0',
  lineSoft:     '#f0edf6',

  // Ink
  ink:          '#3a3245',
  inkSoft:      '#6b6180',
  inkMuted:     '#9b93ae',
  inkFaint:     '#c5bfd4',

  // Accents
  lavender:     '#c4b5e8',
  lavenderDeep: '#8b6fc7',
  blush:        '#f0ccc8',
  blushDeep:    '#d4736a',
  peach:        '#f5d5b8',
  mint:         '#b8e8d4',
  sky:          '#b8d8f0',
  gold:         '#d4a847',

  // Typography
  fontSans:  '"Figtree", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  fontSerif: '"Newsreader", "Iowan Old Style", Georgia, serif',
  fontMono:  '"IBM Plex Mono", "SFMono-Regular", monospace',

  // Radii
  rSm: 12,
  rMd: 18,
  rLg: 24,
  rXl: 32,
  rPill: 999,

  // Spacing
  pagePad: 24,
  safeTop: 'env(safe-area-inset-top, 44px)',
  safeBottom: 'env(safe-area-inset-bottom, 34px)',
} as const;

export const EMOTIONS = {
  joy:     { label: 'Joy',     color: '#f5a89a', ring: '#fde8e5' },
  calm:    { label: 'Calm',    color: '#93c5e8', ring: '#daeef8' },
  love:    { label: 'Love',    color: '#f0a0a8', ring: '#fde0e4' },
  wonder:  { label: 'Wonder',  color: '#b8a0e0', ring: '#ede5f8' },
  sleepy:  { label: 'Sleepy',  color: '#a0a8d8', ring: '#dde0f5' },
  playful: { label: 'Playful', color: '#e8c870', ring: '#faf0d0' },
} as const;

export type EmotionKind = keyof typeof EMOTIONS;

export const PHOTO_GRADS: Record<string, [string, string, string]> = {
  lavender: ['#e8e0f5', '#d8cef0', '#e0d8f5'],
  blush:    ['#f8e8e5', '#f5dcd8', '#f8e0dc'],
  mint:     ['#d8f0e8', '#cce8dc', '#d5eee5'],
  peach:    ['#fae8d5', '#f8dfc8', '#fae5d0'],
  sky:      ['#d8eaf8', '#cce0f5', '#d5e8f8'],
  dusk:     ['#e0d5f5', '#dac8f0', '#e5d5f8'],
  dawn:     ['#fae8d8', '#f8e0d0', '#f5ddc8'],
  sage:     ['#d8eee0', '#cce8d8', '#d5ece0'],
};
