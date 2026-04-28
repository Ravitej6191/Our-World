import React from 'react';
import { motion } from 'framer-motion';
import { T } from '../tokens';
import Icon from '../components/Icon';
import EmotionGlyph from '../components/EmotionGlyph';
import type { Milestone } from '../types';

interface Props {
  milestone: Milestone | undefined;
  onBack: () => void;
  onAddMemory: () => void;
}

const chromeBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 20,
  background: 'rgba(255,255,255,0.85)', border: `1px solid ${T.lineSoft}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent' as any,
};

export default function MilestoneDetailScreen({ milestone, onBack, onAddMemory }: Props) {
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

  const heroGrad = milestone.done
    ? 'linear-gradient(135deg, #fdf5dc, #fae8b0, #f8e090)'
    : 'linear-gradient(135deg, #e8e0f5, #d8cef0, #e0d8f5)';

  const heroColor = milestone.done ? T.gold : T.lavenderDeep;

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
      {/* Top chrome */}
      <div style={{
        position: 'absolute', top: `calc(${T.safeTop} + 2px)`, left: 0, right: 0,
        padding: '0 16px', display: 'flex', justifyContent: 'space-between',
        zIndex: 10,
      }}>
        <button onClick={onBack} style={chromeBtn}>
          <Icon name="back" size={20} color={T.ink} />
        </button>
        <button style={chromeBtn}>
          <Icon name="share" size={18} color={T.ink} />
        </button>
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
            <div style={{
              fontSize: 13, color: T.inkMuted, lineHeight: 1.5,
            }}>This milestone hasn't happened yet. When it does, capture it.</div>
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
          {milestone.done
            ? `A moment that changes everything. ${milestone.label} is one of those firsts you'll always want to remember — the look on her face, the sounds she made, and how time seemed to pause for a second.`
            : `${milestone.label} is a milestone worth waiting for. When it happens, come back here and capture every detail. These are the moments that become the whole story.`
          }
        </div>

        {/* Memories linked card */}
        {milestone.done && (
          <div style={{
            background: T.card, borderRadius: 18,
            padding: '16px 18px',
            boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
            display: 'flex', alignItems: 'center', gap: 14,
            cursor: 'pointer',
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
                3 memories linked
              </div>
              <div style={{ fontSize: 13, color: T.inkMuted }}>
                See everything from this day
              </div>
            </div>
            <Icon name="chevron" size={16} color={T.inkFaint} />
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onAddMemory}
          style={{
            width: '100%', height: 54, borderRadius: 18,
            background: milestone.done ? 'transparent' : 'linear-gradient(135deg, #8b6fc7, #d4736a)',
            border: milestone.done ? `1.5px solid ${T.line}` : 'none',
            cursor: 'pointer',
            color: milestone.done ? T.ink : '#fff',
            fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em',
            fontFamily: T.fontSans,
            boxShadow: milestone.done ? 'none' : '0 6px 20px rgba(139,111,199,0.35)',
            WebkitTapHighlightColor: 'transparent' as any,
          }}
        >
          {milestone.done ? 'Add another memory' : 'Capture this moment'}
        </button>
      </div>
    </motion.div>
  );
}
