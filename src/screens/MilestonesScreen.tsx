import React from 'react';
import { motion } from 'framer-motion';
import { T } from '../tokens';
import Icon from '../components/Icon';
import EmotionGlyph from '../components/EmotionGlyph';
import { MILESTONES } from '../data';
import { useHaptics } from '../hooks/useHaptics';
import type { Milestone } from '../types';

interface Props {
  onBack: () => void;
  onOpenMilestone: (id: string) => void;
  onAddMemoryForMilestone: (id: string) => void;
}

const chromeBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 20,
  background: 'rgba(255,255,255,0.85)', border: `1px solid ${T.lineSoft}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent' as any,
};

const DONE_GRADIENTS: Record<string, string> = {
  peach:    'linear-gradient(135deg, #fae8d5, #f8d8b8)',
  blush:    'linear-gradient(135deg, #f8e8e5, #f5d0c8)',
  mint:     'linear-gradient(135deg, #d8f0e8, #c0e8d4)',
  lavender: 'linear-gradient(135deg, #e8e0f5, #d8cef0)',
  sky:      'linear-gradient(135deg, #d8eaf8, #c0d8f0)',
  dusk:     'linear-gradient(135deg, #e0d5f5, #d5c5f0)',
  gold:     'linear-gradient(135deg, #fdf5dc, #fae8b0)',
  dawn:     'linear-gradient(135deg, #fae8d8, #f8dfc8)',
};

const DONE_ICON_BG: Record<string, string> = {
  peach: '#f5c88a', blush: '#f0b8b0', mint: '#88d8b8',
  lavender: '#c4b5e8', sky: '#88c8e8', dusk: '#b8a8e0',
  gold: '#d4a847', dawn: '#e8a878',
};

function ProgressRing({ done, total }: { done: number; total: number }) {
  const r = 17;
  const circ = 2 * Math.PI * r;
  const fill = (done / total) * circ;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} fill="none" stroke={T.lineSoft} strokeWidth="3.5" />
      <circle
        cx="24" cy="24" r={r} fill="none"
        stroke={T.lavenderDeep} strokeWidth="3.5"
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
      />
      <text x="24" y="24" textAnchor="middle" dominantBaseline="central"
        fontSize="11" fontWeight="600" fill={T.ink} fontFamily="Figtree, sans-serif">
        {done}
      </text>
    </svg>
  );
}

function MilestoneTile({ milestone, onOpen, onCapture }: {
  milestone: Milestone;
  onOpen: () => void;
  onCapture: () => void;
}) {
  const { light, medium } = useHaptics();
  const tone = milestone.tone ?? 'lavender';

  if (milestone.done) {
    return (
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => { light(); onOpen(); }}
        style={{
          background: DONE_GRADIENTS[tone] ?? DONE_GRADIENTS.lavender,
          borderRadius: 20, border: 'none', padding: '16px 14px 18px',
          cursor: 'pointer', textAlign: 'left', position: 'relative',
          boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
          WebkitTapHighlightColor: 'transparent' as any,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 22, height: 22, borderRadius: 11, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(58,50,69,0.12)',
        }}>
          <Icon name="check" size={12} color={T.lavenderDeep} strokeWidth={2.4} />
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 22,
          background: DONE_ICON_BG[tone] ?? '#c4b5e8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {milestone.emotion ? (
            <EmotionGlyph kind={milestone.emotion} size={22} />
          ) : (
            <Icon name="star" size={18} color="#fff" strokeWidth={2} />
          )}
        </div>
        <div>
          <div style={{
            fontSize: 13.5, fontWeight: 600, color: T.ink,
            letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 4,
          }}>{milestone.label}</div>
          <div style={{ fontSize: 11.5, color: T.inkSoft }}>{milestone.date}</div>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => { medium(); onCapture(); }}
      style={{
        background: 'transparent',
        border: `1.5px dashed ${T.line}`,
        borderRadius: 20, padding: '16px 14px 18px',
        cursor: 'pointer', textAlign: 'left',
        WebkitTapHighlightColor: 'transparent' as any,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 22, background: T.lineSoft,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="plus" size={18} color={T.inkFaint} strokeWidth={1.8} />
      </div>
      <div>
        <div style={{
          fontSize: 13.5, fontWeight: 600, color: T.inkSoft,
          letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 4,
        }}>{milestone.label}</div>
        <div style={{ fontSize: 11.5, color: T.inkFaint }}>Tap to capture</div>
      </div>
    </motion.button>
  );
}

export default function MilestonesScreen({ onBack, onOpenMilestone, onAddMemoryForMilestone }: Props) {
  const { light } = useHaptics();
  const done = MILESTONES.filter((m) => m.done).length;
  const total = MILESTONES.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'absolute', inset: 0, background: T.bg,
        fontFamily: T.fontSans, display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ padding: `calc(${T.safeTop} + 12px) 24px 20px`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { light(); onBack(); }} style={chromeBtn}>
            <Icon name="back" size={20} color={T.ink} />
          </motion.button>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 5,
            }}>{done} of {total} reached</div>
            <div style={{
              fontSize: 28, fontWeight: 500, color: T.ink,
              letterSpacing: '-0.02em', lineHeight: 1.1,
              display: 'flex', alignItems: 'baseline', gap: 7,
            }}>
              <span>Little</span>
              <em style={{ fontFamily: T.fontSerif, fontStyle: 'italic' }}>firsts</em>
            </div>
          </div>
          <ProgressRing done={done} total={total} />
        </div>
      </div>

      {/* Grid */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '0 20px 110px',
        scrollbarWidth: 'none',
      } as any}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {MILESTONES.map((m) => (
            <MilestoneTile
              key={m.id}
              milestone={m}
              onOpen={() => onOpenMilestone(m.id)}
              onCapture={() => onAddMemoryForMilestone(m.id)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
