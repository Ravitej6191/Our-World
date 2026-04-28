import React from 'react';
import { EMOTIONS, type EmotionKind } from '../tokens';

interface Props {
  kind: EmotionKind;
  size?: number;
  withRing?: boolean;
}

export default function EmotionGlyph({ kind, size = 20, withRing = false }: Props) {
  const e = EMOTIONS[kind] ?? EMOTIONS.joy;

  const glyph = () => {
    const s = size;
    const props = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', style: { display: 'block', flexShrink: 0 } };
    switch (kind) {
      case 'joy':
        return (
          <svg {...props}>
            <circle cx="8" cy="9" r="1.8" fill={e.color} />
            <circle cx="16" cy="9" r="1.8" fill={e.color} />
            <path d="M7 14c1.5 2.3 3 3 5 3s3.5-.7 5-3" stroke={e.color} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </svg>
        );
      case 'calm':
        return (
          <svg {...props}>
            <circle cx="12" cy="12" r="9" stroke={e.color} strokeWidth="1.6" opacity="0.5" />
            <circle cx="12" cy="12" r="5.5" stroke={e.color} strokeWidth="1.8" />
            <circle cx="12" cy="12" r="2.2" fill={e.color} />
          </svg>
        );
      case 'love':
        return (
          <svg {...props}>
            <ellipse cx="9" cy="11" rx="4.5" ry="6" fill={e.color} opacity="0.55" transform="rotate(-30 9 11)" />
            <ellipse cx="15" cy="11" rx="4.5" ry="6" fill={e.color} opacity="0.55" transform="rotate(30 15 11)" />
            <circle cx="12" cy="14" r="2" fill={e.color} />
          </svg>
        );
      case 'wonder':
        return (
          <svg {...props}>
            <circle cx="12" cy="12" r="3" fill={e.color} />
            {[0, 45, 90, 135].map((a) => (
              <rect key={a} x="11.2" y="2" width="1.6" height="5" rx="0.8" fill={e.color}
                transform={`rotate(${a} 12 12)`} opacity="0.75" />
            ))}
          </svg>
        );
      case 'sleepy':
        return (
          <svg {...props}>
            <path d="M16.5 14.5a7 7 0 0 1-8-9.2 7 7 0 1 0 8 9.2Z" fill={e.color} />
            <circle cx="16" cy="6" r="0.9" fill={e.color} opacity="0.6" />
            <circle cx="19" cy="9" r="0.7" fill={e.color} opacity="0.5" />
          </svg>
        );
      case 'playful':
        return (
          <svg {...props}>
            <circle cx="7" cy="13" r="2.4" fill={e.color} />
            <circle cx="12" cy="7.5" r="2.4" fill={e.color} opacity="0.85" />
            <circle cx="17" cy="13" r="2.4" fill={e.color} opacity="0.7" />
            <circle cx="12" cy="17" r="2.4" fill={e.color} opacity="0.55" />
          </svg>
        );
      default:
        return <svg {...props} />;
    }
  };

  if (withRing) {
    const ringSize = size + 14;
    return (
      <span style={{
        background: e.ring,
        width: ringSize,
        height: ringSize,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {glyph()}
      </span>
    );
  }
  return glyph();
}

interface ChipProps {
  kind: EmotionKind;
  size?: 'sm' | 'md';
}

export function EmotionChip({ kind, size = 'sm' }: ChipProps) {
  const e = EMOTIONS[kind] ?? EMOTIONS.joy;
  const h = size === 'sm' ? 26 : 32;
  const fs = size === 'sm' ? 11.5 : 13;
  const gs = size === 'sm' ? 16 : 18;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      height: h, padding: `0 ${size === 'sm' ? 10 : 14}px 0 ${size === 'sm' ? 7 : 9}px`,
      borderRadius: 999, background: e.ring,
      fontSize: fs, fontWeight: 500,
      color: '#3a3245', letterSpacing: '0.01em', lineHeight: 1,
      flexShrink: 0,
    }}>
      <EmotionGlyph kind={kind} size={gs} />
      {e.label}
    </span>
  );
}
