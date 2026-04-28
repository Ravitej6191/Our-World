import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { T, EMOTIONS, type EmotionKind } from '../tokens';
import Icon from '../components/Icon';
import PhotoPlaceholder from '../components/PhotoPlaceholder';
import VoiceWaveform from '../components/VoiceWaveform';
import { EmotionChip } from '../components/EmotionGlyph';
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

const FILTERS = ['This week', 'Last week', 'April', 'March', 'All'];

function MilestoneIllustration() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <circle cx="36" cy="36" r="28" fill="rgba(212,168,71,0.18)" />
      <circle cx="36" cy="36" r="18" fill="rgba(212,168,71,0.28)" />
      <circle cx="36" cy="36" r="10" fill="rgba(212,168,71,0.5)" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line
          key={a}
          x1={36 + Math.cos((a * Math.PI) / 180) * 22}
          y1={36 + Math.sin((a * Math.PI) / 180) * 22}
          x2={36 + Math.cos((a * Math.PI) / 180) * 30}
          y2={36 + Math.sin((a * Math.PI) / 180) * 30}
          stroke="rgba(212,168,71,0.6)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
      <path
        d="M29 38c1.8 2.5 4 3.5 7 3.5s5.2-1 7-3.5"
        stroke="#d4a847"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="30" cy="32" r="2.5" fill="#d4a847" opacity="0.8" />
      <circle cx="42" cy="32" r="2.5" fill="#d4a847" opacity="0.8" />
    </svg>
  );
}

function MemoryCard({ memory, onOpen }: { memory: Memory; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      style={{
        width: '100%', textAlign: 'left', background: T.card, borderRadius: 22,
        border: 'none', padding: 0, cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
        overflow: 'hidden', display: 'block',
        WebkitTapHighlightColor: 'transparent' as any,
      }}
    >
      {memory.media === 'voice' ? (
        <div style={{
          height: 120, background: `linear-gradient(135deg, #e0d8f5, #d8cef0)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 24px', position: 'relative',
        }}>
          <VoiceWaveform height={60} color="rgba(139,111,199,0.6)" />
          {memory.duration && (
            <span style={{
              position: 'absolute', right: 12, bottom: 10,
              fontFamily: T.fontMono, fontSize: 10, letterSpacing: '0.08em',
              color: 'rgba(58,50,69,0.55)', background: 'rgba(255,255,255,0.6)',
              padding: '3px 7px', borderRadius: 6,
            }}>{memory.duration}</span>
          )}
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <PhotoPlaceholder
            label={memory.label}
            tone={memory.tone}
            height={210}
            radius={0}
          />
          {memory.media === 'video' && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 48, height: 48, borderRadius: 24,
              background: 'rgba(255,255,255,0.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="play" size={20} color={T.ink} />
            </div>
          )}
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <EmotionChip kind={memory.emotion} size="sm" />
          </div>
        </div>
      )}
      <div style={{ padding: '14px 18px 18px' }}>
        {memory.media === 'voice' && (
          <div style={{ marginBottom: 8 }}>
            <EmotionChip kind={memory.emotion} size="sm" />
          </div>
        )}
        <div style={{
          fontSize: 16, fontWeight: 600, color: T.ink,
          letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 6,
          fontFamily: T.fontSans,
        }}>{memory.title}</div>
        {memory.note ? (
          <div style={{
            fontSize: 13.5, color: T.inkSoft, lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          } as any}>{memory.note}</div>
        ) : null}
      </div>
    </button>
  );
}

function MilestoneCard({ memory, onOpen }: { memory: Memory; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      style={{
        width: '100%', textAlign: 'left',
        background: 'linear-gradient(135deg, #fdf5dc, #fae8b0, #f8e090)',
        borderRadius: 22, border: 'none', padding: '18px 20px 20px',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
        WebkitTapHighlightColor: 'transparent' as any,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Icon name="star" size={16} color={T.gold} strokeWidth={2} />
        <span style={{
          fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: T.gold, fontWeight: 600,
        }}>Milestone</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
        <MilestoneIllustration />
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 10 }}>
            <EmotionChip kind={memory.emotion} size="sm" />
          </div>
          <div style={{
            fontFamily: T.fontSerif, fontStyle: 'italic',
            fontSize: 22, color: T.ink, letterSpacing: '-0.01em', lineHeight: 1.2,
          }}>{memory.milestoneLabel || memory.title}</div>
        </div>
      </div>
      {memory.note ? (
        <div style={{
          fontSize: 13, color: T.inkSoft, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        } as any}>{memory.note}</div>
      ) : null}
    </button>
  );
}

function filterMemories(memories: Memory[], filterLabel: string): Memory[] {
  switch (filterLabel) {
    case 'This week':
      return memories.filter(m => /today|yesterday/i.test(m.date));
    case 'Last week':
      return memories.filter(m => /\b(mon|tue|wed|thu|fri|sat|sun)\b/i.test(m.date) && !/today|yesterday/i.test(m.date));
    case 'April':
      return memories.filter(m => /apr/i.test(m.date));
    case 'March':
      return memories.filter(m => /mar/i.test(m.date));
    default:
      return memories;
  }
}

export default function TimelineScreen({ child, memories, onOpenMemory, onOpenSearch, onGoProfile }: Props) {
  const [activeFilter, setActiveFilter] = useState(FILTERS.length - 1); // default "All"

  const avatarGrad = CHILD_PALETTES[child.colorIdx % CHILD_PALETTES.length];
  const initial = (child.name || 'M')[0].toUpperCase();

  const filtered = useMemo(
    () => filterMemories(memories, FILTERS[activeFilter]),
    [memories, activeFilter],
  );

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
      <div style={{ padding: `calc(${T.safeTop} + 12px) 24px 0` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 6,
            }}>April · Week 16</div>
            <div style={{
              fontSize: 30, fontWeight: 500, color: T.ink,
              letterSpacing: '-0.02em', lineHeight: 1.1,
              display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap',
            }}>
              <span>{child.name || 'Mira'}'s</span>
              <em style={{ fontFamily: T.fontSerif, fontStyle: 'italic' }}>world</em>
            </div>
            <div style={{ fontSize: 13.5, color: T.inkMuted, marginTop: 5 }}>
              {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button onClick={onOpenSearch} style={chromeBtn}>
              <Icon name="search" size={18} color={T.inkSoft} />
            </button>
            <button onClick={onGoProfile} style={{
              ...chromeBtn, background: avatarGrad, border: 'none',
            }}>
              <span style={{
                fontFamily: T.fontSerif, fontStyle: 'italic',
                fontSize: 16, color: '#fff', fontWeight: 400,
              }}>{initial}</span>
            </button>
          </div>
        </div>

        {/* Filter pills */}
        <div style={{
          display: 'flex', gap: 8, marginTop: 20,
          overflowX: 'auto', paddingBottom: 2,
          scrollbarWidth: 'none',
        } as any}>
          {FILTERS.map((f, i) => (
            <button
              key={f}
              onClick={() => setActiveFilter(i)}
              style={{
                flexShrink: 0,
                height: 34, padding: '0 16px',
                borderRadius: 999,
                background: i === activeFilter ? T.ink : T.card,
                color: i === activeFilter ? '#fff' : T.inkSoft,
                border: i === activeFilter ? 'none' : `1px solid ${T.line}`,
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                fontFamily: T.fontSans, whiteSpace: 'nowrap',
                WebkitTapHighlightColor: 'transparent' as any,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable memory list */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px 24px 110px',
        scrollbarWidth: 'none',
      } as any}>
        {filtered.length === 0 ? (
          <div style={{
            paddingTop: 60, textAlign: 'center',
            fontSize: 15, color: T.inkFaint,
          }}>No memories here yet</div>
        ) : (
          filtered.map((memory) => (
            <div key={memory.id} style={{ display: 'flex', gap: 0, marginBottom: 24 }}>
              {/* Date rail */}
              <div style={{
                width: 52, flexShrink: 0, display: 'flex',
                flexDirection: 'column', alignItems: 'center', paddingTop: 4,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: 4,
                  background: memory.milestone ? T.gold : T.lavenderDeep,
                  flexShrink: 0,
                }} />
                <div style={{
                  width: 1, flex: 1, minHeight: 40,
                  background: `linear-gradient(${T.lineSoft}, transparent)`,
                  marginTop: 4,
                }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: T.inkMuted, marginBottom: 10, fontWeight: 500,
                }}>{memory.date}</div>
                {memory.milestone ? (
                  <MilestoneCard memory={memory} onOpen={() => onOpenMemory(memory.id)} />
                ) : (
                  <MemoryCard memory={memory} onOpen={() => onOpenMemory(memory.id)} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
