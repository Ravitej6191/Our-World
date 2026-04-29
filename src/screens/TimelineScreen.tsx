import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { T } from '../tokens';
import Icon from '../components/Icon';
import PhotoPlaceholder from '../components/PhotoPlaceholder';
import VoiceWaveform from '../components/VoiceWaveform';
import { EmotionChip } from '../components/EmotionGlyph';
import { useHaptics } from '../hooks/useHaptics';
import type { Memory, Child } from '../types';

const CHILD_PALETTES = [
  'linear-gradient(135deg, #f5c8c0, #e8a0d8)',
  'linear-gradient(135deg, #f8d8b0, #f0b890)',
  'linear-gradient(135deg, #b8e8d0, #90d8c0)',
  'linear-gradient(135deg, #c8b8e8, #a898d8)',
  'linear-gradient(135deg, #f5e0a0, #e8c870)',
  'linear-gradient(135deg, #c0d8c0, #98c8a0)',
];

interface Props {
  child: Child;
  memories: Memory[];
  onOpenMemory: (id: string) => void;
  onOpenSearch: () => void;
  onGoProfile: () => void;
}

const chromeBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 20,
  background: 'rgba(255,255,255,0.85)', border: `1px solid ${T.lineSoft}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent' as any,
};

function MemoryCard({ memory, onOpen }: { memory: Memory; onOpen: () => void }) {
  const { light } = useHaptics();
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => { light(); onOpen(); }}
      style={{
        width: '100%', textAlign: 'left', background: T.card, borderRadius: 20,
        border: 'none', padding: 0, cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 12px rgba(58,50,69,0.07)',
        overflow: 'hidden', display: 'block',
        WebkitTapHighlightColor: 'transparent' as any,
      }}
    >
      {memory.media === 'voice' ? (
        <div style={{
          height: 100, background: `linear-gradient(135deg, #e0d8f5, #d8cef0)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 24px', position: 'relative',
        }}>
          <VoiceWaveform height={52} color="rgba(139,111,199,0.6)" />
          {memory.duration && (
            <span style={{
              position: 'absolute', right: 12, bottom: 10,
              fontFamily: T.fontMono, fontSize: 10, letterSpacing: '0.08em',
              color: 'rgba(58,50,69,0.55)', background: 'rgba(255,255,255,0.7)',
              padding: '3px 7px', borderRadius: 6,
            }}>{memory.duration}</span>
          )}
        </div>
      ) : memory.media !== 'text' ? (
        <div style={{ position: 'relative' }}>
          <PhotoPlaceholder label={memory.label} tone={memory.tone} height={180} radius={0} />
          {memory.media === 'video' && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 44, height: 44, borderRadius: 22,
              background: 'rgba(255,255,255,0.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="play" size={18} color={T.ink} />
            </div>
          )}
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <EmotionChip kind={memory.emotion} size="sm" />
          </div>
          {memory.duration && (
            <span style={{
              position: 'absolute', right: 10, bottom: 10,
              fontFamily: T.fontMono, fontSize: 10, letterSpacing: '0.08em',
              color: 'rgba(58,50,69,0.7)', background: 'rgba(255,255,255,0.8)',
              padding: '3px 7px', borderRadius: 6,
            }}>{memory.duration}</span>
          )}
        </div>
      ) : null}

      <div style={{ padding: '12px 16px 16px' }}>
        {(memory.media === 'voice' || memory.media === 'text') && (
          <div style={{ marginBottom: 8 }}>
            <EmotionChip kind={memory.emotion} size="sm" />
          </div>
        )}
        <div style={{
          fontSize: 15, fontWeight: 600, color: T.ink,
          letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: memory.note ? 5 : 0,
        }}>{memory.title}</div>
        {memory.note ? (
          <div style={{
            fontSize: 13, color: T.inkSoft, lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          } as any}>{memory.note}</div>
        ) : null}
      </div>
    </motion.button>
  );
}

function MilestoneCard({ memory, onOpen }: { memory: Memory; onOpen: () => void }) {
  const { light } = useHaptics();
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => { light(); onOpen(); }}
      style={{
        width: '100%', textAlign: 'left',
        background: 'linear-gradient(135deg, #fdf5dc, #fae8b0)',
        borderRadius: 20, border: 'none', padding: '16px 18px 18px',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 12px rgba(58,50,69,0.07)',
        WebkitTapHighlightColor: 'transparent' as any,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <Icon name="star" size={14} color={T.gold} strokeWidth={2} />
        <span style={{
          fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: T.gold, fontWeight: 600,
        }}>Little first</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div style={{
            fontFamily: T.fontSerif, fontStyle: 'italic',
            fontSize: 20, color: T.ink, letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: 6,
          }}>{memory.milestoneLabel || memory.title}</div>
          {memory.note ? (
            <div style={{
              fontSize: 13, color: T.inkSoft, lineHeight: 1.5,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            } as any}>{memory.note}</div>
          ) : null}
        </div>
      </div>
    </motion.button>
  );
}

interface MemoryGroup { key: string; label: string; items: Memory[] }

function groupMemoriesByMonth(memories: Memory[]): MemoryGroup[] {
  const groups: MemoryGroup[] = [];
  const seen = new Map<string, MemoryGroup>();
  for (const m of memories) {
    const key = m.group ?? 'Recent';
    if (!seen.has(key)) {
      const g: MemoryGroup = { key, label: key, items: [m] };
      groups.push(g);
      seen.set(key, g);
    } else {
      seen.get(key)!.items.push(m);
    }
  }
  return groups;
}

export default function TimelineScreen({ child, memories, onOpenMemory, onOpenSearch, onGoProfile }: Props) {
  const { light } = useHaptics();
  const avatarGrad = CHILD_PALETTES[child.colorIdx % CHILD_PALETTES.length];
  const initial = (child.name || 'M')[0].toUpperCase();
  const groups = useMemo(() => groupMemoriesByMonth(memories), [memories]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'absolute', inset: 0, background: T.bg,
        fontFamily: T.fontSans, display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background orbs */}
      <div style={{
        position: 'absolute', top: -60, left: -60, width: 260, height: 260,
        borderRadius: '50%', background: 'rgba(196,181,232,0.22)', filter: 'blur(50px)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', top: 120, right: -80, width: 200, height: 200,
        borderRadius: '50%', background: 'rgba(240,204,200,0.2)', filter: 'blur(40px)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Header */}
      <div style={{
        padding: `calc(${T.safeTop} + 12px) 24px 16px`, flexShrink: 0,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 5,
            }}>
              {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
            </div>
            <div style={{
              fontSize: 30, fontWeight: 500, color: T.ink,
              letterSpacing: '-0.02em', lineHeight: 1.1,
              display: 'flex', alignItems: 'baseline', gap: 7,
            }}>
              <span>{child.name || 'Mira'}'s</span>
              <em style={{ fontFamily: T.fontSerif, fontStyle: 'italic' }}>world</em>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => { light(); onOpenSearch(); }} style={chromeBtn}>
              <Icon name="search" size={18} color={T.inkSoft} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { light(); onGoProfile(); }}
              style={{ ...chromeBtn, background: avatarGrad, border: 'none' }}
            >
              <span style={{
                fontFamily: T.fontSerif, fontStyle: 'italic',
                fontSize: 16, color: '#fff', fontWeight: 400,
              }}>{initial}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '0 20px 110px',
        scrollbarWidth: 'none', position: 'relative', zIndex: 1,
      } as any}>
        {groups.length === 0 ? (
          <div style={{
            paddingTop: 80, textAlign: 'center',
            fontSize: 15, color: T.inkFaint, lineHeight: 1.6,
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
            No memories yet.<br />Tap + to capture the first one.
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.key} style={{ marginBottom: 8 }}>
              {/* Month header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                paddingTop: 20, paddingBottom: 14,
              }}>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: T.ink,
                  letterSpacing: '-0.01em',
                }}>{group.label}</div>
                <div style={{ flex: 1, height: 1, background: T.lineSoft }} />
                <div style={{ fontSize: 12, color: T.inkMuted }}>
                  {group.items.length}
                </div>
              </div>

              {/* Memories in this month */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {group.items.map((memory, idx) => (
                  <div key={memory.id} style={{ display: 'flex', gap: 0, marginBottom: 20 }}>
                    {/* Timeline rail */}
                    <div style={{
                      width: 44, flexShrink: 0, display: 'flex',
                      flexDirection: 'column', alignItems: 'center',
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: 4, marginTop: 14,
                        background: memory.milestone ? T.gold : T.lavenderDeep,
                        flexShrink: 0,
                        boxShadow: memory.milestone
                          ? `0 0 0 3px rgba(212,168,71,0.2)`
                          : `0 0 0 3px rgba(139,111,199,0.15)`,
                      }} />
                      {idx < group.items.length - 1 && (
                        <div style={{
                          width: 1, flex: 1, minHeight: 24, marginTop: 6,
                          background: `linear-gradient(${T.lineSoft}, transparent)`,
                        }} />
                      )}
                    </div>

                    {/* Card + meta */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Date + time */}
                      <div style={{
                        fontSize: 11, letterSpacing: '0.08em',
                        color: T.inkMuted, marginBottom: 8, marginTop: 10,
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <span>{memory.dateShort ?? memory.date}</span>
                        {memory.time && (
                          <>
                            <span style={{ color: T.lineSoft }}>·</span>
                            <span>{memory.time}</span>
                          </>
                        )}
                      </div>
                      {memory.milestone ? (
                        <MilestoneCard memory={memory} onOpen={() => onOpenMemory(memory.id)} />
                      ) : (
                        <MemoryCard memory={memory} onOpen={() => onOpenMemory(memory.id)} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
