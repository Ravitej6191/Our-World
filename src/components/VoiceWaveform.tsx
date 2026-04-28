import React from 'react';

interface Props {
  bars?: number;
  height?: number;
  color?: string;
}

export default function VoiceWaveform({ bars = 28, height = 60, color = 'rgba(139,111,199,0.6)' }: Props) {
  const heights = Array.from({ length: bars }, (_, i) => {
    const v = Math.sin(i * 1.7) * Math.cos(i * 0.9) * 0.5 + 0.5;
    return 0.25 + v * 0.75;
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2, background: color,
          height: `${h * 100}%`, opacity: 0.3 + h * 0.7,
        }} />
      ))}
    </div>
  );
}
