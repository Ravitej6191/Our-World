import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../tokens';
import Icon from '../components/Icon';
import PhotoPlaceholder from '../components/PhotoPlaceholder';
import VoiceWaveform from '../components/VoiceWaveform';
import { EmotionChip } from '../components/EmotionGlyph';
import { useHaptics } from '../hooks/useHaptics';
import { CHILD_PALETTES, GLASS_HEADER, GLASS_CHROME_BTN } from '../shared/constants';
import type { Memory, Child } from '../types';

interface Props {
  child: Child;
  memories: Memory[];
  isLoading?: boolean;
  onOpenMemory: (id: string) => void;
  onOpenSearch: () => void;
  onGoProfile: () => void;
}

const chromeBtn = GLASS_CHROME_BTN;

const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];

function getAgeLabel(dob: Child['dob'], groupLabel: string): string | null {
  if (!dob?.y || !dob?.m || !dob?.d) return null;
  const parts = groupLabel.split(' ');
  if (parts.length < 2) return null;
  const monthIdx = MONTH_NAMES.indexOf(parts[0]);
  if (monthIdx === -1) return null;
  const groupYear = Number(parts[1]);
  if (!groupYear) return null;
  const birth = new Date(Number(dob.y), Number(dob.m) - 1, Number(dob.d));
  const groupEnd = new Date(groupYear, monthIdx + 1, 0);
  const totalMonths = (groupEnd.getFullYear() - birth.getFullYear()) * 12 + (groupEnd.getMonth() - birth.getMonth());
  if (totalMonths < 0 || totalMonths > 240) return null;
  if (totalMonths === 0) return 'newborn';
  if (totalMonths < 24) return `${totalMonths} month${totalMonths !== 1 ? 's' : ''} old`;
  const years = Math.floor(totalMonths / 12);
  const rem = totalMonths % 12;
  return rem > 0 ? `${years} yr ${rem} mo old` : `${years} year${years !== 1 ? 's' : ''} old`;
}

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
        WebkitTapHighlightColor: 'transparent',
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
          {memory.media === 'video' ? (
            memory.posterUri ? (
              <img src={memory.posterUri} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
            ) : (
              <PhotoPlaceholder label={memory.label} tone={memory.tone} height={180} radius={0} />
            )
          ) : memory.mediaUri ? (
            <img src={memory.mediaUri} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
          ) : (
            <PhotoPlaceholder label={memory.label} tone={memory.tone} height={180} radius={0} />
          )}
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
          }}>{memory.note}</div>
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
        WebkitTapHighlightColor: 'transparent',
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
            }}>{memory.note}</div>
          ) : null}
        </div>
      </div>
    </motion.button>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: T.card, borderRadius: 20, overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(58,50,69,0.04)',
    }}>
      <div style={{
        height: 160, background: 'linear-gradient(90deg, #f0ecf8 25%, #e8e0f5 50%, #f0ecf8 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
      }} />
      <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 14, borderRadius: 7, background: '#ede8f5', width: '65%' }} />
        <div style={{ height: 11, borderRadius: 6, background: '#f0ecf8', width: '80%' }} />
        <div style={{ height: 11, borderRadius: 6, background: '#f0ecf8', width: '50%' }} />
      </div>
    </div>
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

export default function TimelineScreen({ child, memories, isLoading, onOpenMemory, onOpenSearch, onGoProfile }: Props) {
  const { light } = useHaptics();
  const avatarGrad = CHILD_PALETTES[child.colorIdx % CHILD_PALETTES.length];
  const initial = (child.name || 'M')[0].toUpperCase();
  const groups = useMemo(() => groupMemoriesByMonth(memories), [memories]);

  const todayShort = useMemo(() =>
    new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), []);
  const thisYear = String(new Date().getFullYear());

  const onThisDayMemories = useMemo(() =>
    memories.filter((m) =>
      m.dateShort === todayShort && !(m.group ?? '').includes(thisYear)
    ), [memories, todayShort, thisYear]);

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
      {/* Shimmer keyframe */}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

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
        ...GLASS_HEADER,
        padding: `calc(${T.safeTop} + 12px) 24px 16px`, flexShrink: 0,
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
              <span>{child.name || 'your child'}'s</span>
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
              style={{ ...chromeBtn, background: child.photoUri ? 'transparent' : avatarGrad, border: 'none', overflow: 'hidden' }}
            >
              {child.photoUri ? (
                <img src={child.photoUri} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{
                  fontFamily: T.fontSerif, fontStyle: 'italic',
                  fontSize: 16, color: '#fff', fontWeight: 400,
                }}>{initial}</span>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '0 20px 110px',
        scrollbarWidth: 'none', position: 'relative', zIndex: 1,
      }}>

        {/* On this day */}
        <AnimatePresence>
          {onThisDayMemories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ marginBottom: 20 }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #fdf5dc, #fae8b0)',
                borderRadius: 18, padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Icon name="star" size={14} color={T.gold} strokeWidth={2} />
                  <span style={{
                    fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase',
                    color: T.gold, fontWeight: 600,
                  }}>On this day</span>
                </div>
                {onThisDayMemories.map((m) => (
                  <motion.button
                    key={m.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { light(); onOpenMemory(m.id); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      background: 'rgba(255,255,255,0.7)', borderRadius: 12,
                      border: 'none', padding: '10px 12px', cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <div style={{ fontSize: 12, color: T.gold, minWidth: 52 }}>{m.group?.split(' ')[1] ?? ''}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, flex: 1, textAlign: 'left' }}>{m.title}</div>
                    <Icon name="chevron" size={14} color={T.gold} />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeleton */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : groups.length === 0 ? (
          <div style={{
            paddingTop: 60, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 20,
          }}>
            <svg width="140" height="120" viewBox="0 0 140 120" fill="none">
              <circle cx="54" cy="60" r="36" fill="url(#tl_lav)" opacity="0.6" />
              <circle cx="86" cy="60" r="36" fill="url(#tl_blush)" opacity="0.6" />
              <circle cx="70" cy="60" r="14" fill="#3a3245" opacity="0.18" />
              <circle cx="70" cy="60" r="7" fill="#3a3245" opacity="0.28" />
              <circle cx="38" cy="32" r="4" fill={T.lavenderDeep} opacity="0.5" />
              <circle cx="102" cy="88" r="3" fill={T.blushDeep} opacity="0.45" />
              <path d="M108 28 L111 22 L114 28 L120 31 L114 34 L111 40 L108 34 L102 31 Z"
                fill={T.gold} opacity="0.55" />
              <defs>
                <radialGradient id="tl_lav" cx="35%" cy="35%">
                  <stop offset="0%" stopColor="#e0d5f5" />
                  <stop offset="100%" stopColor="#b8a0e0" />
                </radialGradient>
                <radialGradient id="tl_blush" cx="35%" cy="35%">
                  <stop offset="0%" stopColor="#fae0dc" />
                  <stop offset="100%" stopColor="#e8a8a0" />
                </radialGradient>
              </defs>
            </svg>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: T.fontSerif, fontStyle: 'italic',
                fontSize: 22, color: T.ink, marginBottom: 8, letterSpacing: '-0.01em',
              }}>Your story starts here</div>
              <div style={{ fontSize: 14, color: T.inkMuted, lineHeight: 1.6 }}>
                Tap + to capture your first memory.
              </div>
            </div>
          </div>
        ) : (
          groups.map((group) => {
            const ageLabel = getAgeLabel(child.dob, group.label);
            return (
              <div key={group.key} style={{ marginBottom: 8 }}>
                {/* Month header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  paddingTop: 20, paddingBottom: 14,
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: T.ink,
                      letterSpacing: '-0.01em',
                    }}>{group.label}</div>
                    {ageLabel && (
                      <div style={{
                        fontSize: 10.5, color: T.lavenderDeep,
                        letterSpacing: '0.06em', fontWeight: 500,
                      }}>{ageLabel}</div>
                    )}
                  </div>
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
            );
          })
        )}
      </div>
    </motion.div>
  );
}
