import React from 'react';
import { motion } from 'framer-motion';
import { T } from '../tokens';
import Icon from '../components/Icon';
import PhotoPlaceholder from '../components/PhotoPlaceholder';
import { EmotionChip } from '../components/EmotionGlyph';
import type { Memory } from '../types';

interface Props {
  memory: Memory | undefined;
  onBack: () => void;
  onOpenActions: () => void;
}

const chromeBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 20,
  background: 'rgba(255,255,255,0.85)', border: `1px solid ${T.lineSoft}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent' as any,
};

export default function MemoryDetailScreen({ memory, onBack, onOpenActions }: Props) {
  if (!memory) {
    return (
      <div style={{
        position: 'absolute', inset: 0, background: T.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: T.fontSans, color: T.inkMuted,
      }}>
        Memory not found
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'absolute', inset: 0, background: T.bg,
        fontFamily: T.fontSans, overflowY: 'auto',
        scrollbarWidth: 'none',
      } as any}
    >
      {/* Hero photo */}
      <div style={{ position: 'relative', paddingTop: 100 }}>
        <PhotoPlaceholder
          label={memory.label}
          tone={memory.tone}
          height={440}
          radius={28}
          style={{ margin: '0 16px' }}
        />
        {/* Absolute chrome */}
        <div style={{
          position: 'absolute', top: 46, left: 0, right: 0,
          padding: '0 16px', display: 'flex', justifyContent: 'space-between',
        }}>
          <button onClick={onBack} style={chromeBtn}>
            <Icon name="back" size={20} color={T.ink} />
          </button>
          <button onClick={onOpenActions} style={chromeBtn}>
            <Icon name="more" size={18} color={T.ink} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '28px 24px 110px' }}>
        {/* Date */}
        <div style={{
          fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: T.inkMuted, marginBottom: 12,
        }}>{memory.date}</div>

        {/* Title */}
        <div style={{
          fontFamily: T.fontSerif, fontStyle: 'italic',
          fontSize: 30, color: T.ink, lineHeight: 1.15,
          letterSpacing: '-0.02em', marginBottom: 16,
        }}>{memory.title}</div>

        {/* Emotion chip */}
        <div style={{ marginBottom: 20 }}>
          <EmotionChip kind={memory.emotion} size="md" />
        </div>

        {/* Note */}
        {memory.note ? (
          <div style={{
            fontSize: 16.5, color: T.inkSoft, lineHeight: 1.65,
            letterSpacing: '0.01em', marginBottom: 28,
          }}>{memory.note}</div>
        ) : null}

        {/* Also on this day card */}
        <div style={{
          background: T.card, borderRadius: 18,
          padding: '16px 18px',
          boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: T.bgCool,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon name="calendar" size={18} color={T.lavenderDeep} />
          </div>
          <div>
            <div style={{
              fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 3,
            }}>Also on this day</div>
            <div style={{ fontSize: 14, color: T.ink, fontWeight: 500 }}>
              See what else happened on {memory.dateShort ?? memory.date.split('·')[0].trim()}
            </div>
          </div>
          <Icon name="chevron" size={16} color={T.inkFaint} />
        </div>

        {/* Milestone badge */}
        {memory.milestone && memory.milestoneLabel && (
          <div style={{
            marginTop: 16,
            background: 'linear-gradient(135deg, #fdf5dc, #fae8b0)',
            borderRadius: 18, padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <Icon name="star" size={18} color={T.gold} strokeWidth={2} />
            <div>
              <div style={{
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: T.gold, marginBottom: 2,
              }}>Milestone</div>
              <div style={{
                fontSize: 15, fontWeight: 500, color: T.ink,
              }}>{memory.milestoneLabel}</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
