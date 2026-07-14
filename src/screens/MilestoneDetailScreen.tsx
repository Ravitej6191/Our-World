import React from 'react';
import { motion } from 'framer-motion';
import { T } from '../tokens';
import Icon from '../components/Icon';
import EmotionGlyph from '../components/EmotionGlyph';
import { useHaptics } from '../hooks/useHaptics';
import { getMilestoneCopy, GLASS_CHROME_BTN } from '../shared/constants';
import type { Milestone, Memory } from '../types';

interface Props {
  milestone: Milestone | undefined;
  memories: Memory[];
  onBack: () => void;
  onAddMemory: () => void;
  onOpenMemory?: (id: string) => void;
}

const chromeBtn = GLASS_CHROME_BTN;

export default function MilestoneDetailScreen({ milestone, memories, onBack, onAddMemory, onOpenMemory }: Props) {
  const { light, medium } = useHaptics();
  if (!milestone) {
    return (
      <div style={{
        position: 'absolute', inset: 0, background: T.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: T.fontSans, color: T.inkMuted,
      }}>
        Milestone not found
      </div>
    );
  }

  const linkedMemories = memories.filter((m) => m.milestoneId === milestone.id);
  const heroGrad = milestone.done
    ? 'linear-gradient(135deg, #fdf5dc, #fae8b0, #f8e090)'
    : 'linear-gradient(135deg, #e8e0f5, #d8cef0, #e0d8f5)';
  const heroColor = milestone.done ? T.gold : T.lavenderDeep;
  const contextCopy = getMilestoneCopy(milestone.id, milestone.label, milestone.done);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'absolute', inset: 0, background: T.bg,
        fontFamily: T.fontSans, overflowY: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      {/* Top chrome */}
      <div style={{
        position: 'absolute', top: `calc(${T.safeTop} + 2px)`, left: 0, right: 0,
        padding: '0 16px', display: 'flex', justifyContent: 'space-between',
        zIndex: 10,
      }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { light(); onBack(); }} style={chromeBtn}>
          <Icon name="back" size={20} color={T.ink} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          style={chromeBtn}
          onClick={async () => {
            light();
            try {
              if (navigator.share) {
                await navigator.share({
                  title: milestone.label,
                  text: `${milestone.label} — captured in Our World`,
                });
              }
            } catch { /* cancelled */ }
          }}
        >
          <Icon name="share" size={18} color={T.ink} />
        </motion.button>
      </div>

      {/* Hero card */}
      <div style={{ padding: `calc(${T.safeTop} + 56px) 20px 0` }}>
        <div style={{
          background: heroGrad,
          borderRadius: 28, padding: '36px 28px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 20, textAlign: 'center',
          boxShadow: '0 2px 16px rgba(58,50,69,0.08)',
        }}>
          {milestone.done ? (
            <div style={{
              width: 72, height: 72, borderRadius: 36,
              background: 'rgba(255,255,255,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {milestone.emotion ? (
                <EmotionGlyph kind={milestone.emotion} size={36} />
              ) : (
                <Icon name="star" size={32} color={T.gold} strokeWidth={1.8} />
              )}
            </div>
          ) : (
            <div style={{
              width: 72, height: 72, borderRadius: 36,
              background: 'rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="star" size={32} color={T.lavenderDeep} strokeWidth={1.8} />
            </div>
          )}

          {milestone.done && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.55)',
              borderRadius: 999, padding: '4px 12px',
            }}>
              <Icon name="check" size={12} color={heroColor} strokeWidth={2.4} />
              <span style={{
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: heroColor, fontWeight: 600,
              }}>Reached {milestone.date}</span>
            </div>
          )}

          <div style={{
            fontFamily: T.fontSerif, fontStyle: 'italic',
            fontSize: 34, color: T.ink, lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}>{milestone.label}</div>

          {!milestone.done && (
            <div style={{ fontSize: 13, color: T.inkMuted, lineHeight: 1.5 }}>
              This milestone hasn't happened yet. When it does, capture it.
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 20px 110px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Context paragraph */}
        <div style={{
          fontSize: 15.5, color: T.inkSoft, lineHeight: 1.65,
          letterSpacing: '0.005em',
        }}>
          {contextCopy}
        </div>

        {/* Memories linked to this milestone */}
        {milestone.done && (
          <div style={{
            background: T.card, borderRadius: 18,
            boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 18px',
              borderBottom: linkedMemories.length > 0 ? `1px solid ${T.lineSoft}` : 'none',
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 14,
                background: '#fde0e4',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon name="heart" size={20} color={T.blushDeep} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.ink, marginBottom: 2 }}>
                  {linkedMemories.length === 0
                    ? 'No memories linked yet'
                    : `${linkedMemories.length} ${linkedMemories.length === 1 ? 'memory' : 'memories'} linked`
                  }
                </div>
                <div style={{ fontSize: 13, color: T.inkMuted }}>
                  {linkedMemories.length === 0 ? 'Capture this moment below' : 'Tap to open'}
                </div>
              </div>
            </div>

            {linkedMemories.map((mem, i) => (
              <motion.button
                key={mem.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => { light(); onOpenMemory?.(mem.id); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 18px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderTop: i > 0 ? `1px solid ${T.lineSoft}` : 'none',
                  textAlign: 'left',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `linear-gradient(135deg, var(--tone-a, #ede5f8), var(--tone-b, #d8cef0))`,
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 500, color: T.ink,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{mem.title}</div>
                  <div style={{ fontSize: 12, color: T.inkMuted }}>{mem.dateShort ?? mem.date}</div>
                </div>
                <Icon name="chevron" size={14} color={T.inkFaint} />
              </motion.button>
            ))}
          </div>
        )}

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { medium(); onAddMemory(); }}
          style={{
            width: '100%', height: 54, borderRadius: 18,
            background: milestone.done ? 'transparent' : 'linear-gradient(135deg, #8b6fc7, #d4736a)',
            border: milestone.done ? `1.5px solid ${T.line}` : 'none',
            cursor: 'pointer',
            color: milestone.done ? T.ink : '#fff',
            fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em',
            fontFamily: T.fontSans,
            boxShadow: milestone.done ? 'none' : '0 6px 20px rgba(139,111,199,0.35)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {milestone.done ? 'Add another memory' : 'Capture this moment'}
        </motion.button>
      </div>
    </motion.div>
  );
}
