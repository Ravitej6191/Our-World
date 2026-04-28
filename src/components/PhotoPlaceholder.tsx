import React from 'react';
import { PHOTO_GRADS } from '../tokens';

interface Props {
  label?: string;
  tone?: string;
  height?: number;
  radius?: number;
  style?: React.CSSProperties;
}

export default function PhotoPlaceholder({ label = 'photo', tone = 'lavender', height = 200, radius = 20, style = {} }: Props) {
  const [c1, c2, c3] = PHOTO_GRADS[tone] ?? PHOTO_GRADS.lavender;
  return (
    <div style={{
      position: 'relative', height, borderRadius: radius,
      background: `linear-gradient(135deg, ${c1}, ${c2}, ${c3})`,
      overflow: 'hidden', flexShrink: 0, ...style,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(45deg, transparent 0 9px, rgba(255,255,255,0.07) 9px 10px)',
      }} />
      {label && (
        <span style={{
          position: 'absolute', left: 12, bottom: 10,
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'rgba(58,50,69,0.55)',
          background: 'rgba(255,255,255,0.55)',
          padding: '3px 7px', borderRadius: 6,
          backdropFilter: 'blur(6px)',
        }}>{label}</span>
      )}
    </div>
  );
}
