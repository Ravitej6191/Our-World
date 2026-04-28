import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { T, EMOTIONS, type EmotionKind } from '../tokens';
import Icon from '../components/Icon';
import { EmotionChip } from '../components/EmotionGlyph';
import PhotoPlaceholder from '../components/PhotoPlaceholder';
import type { Memory } from '../types';

interface Props {
  memories: Memory[];
  onBack: () => void;
  onOpenMemory: (id: string) => void;
}

const chromeBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 20,
  background: 'rgba(255,255,255,0.85)', border: `1px solid ${T.lineSoft}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent' as any,
};

const RECENT = ['First laugh', 'Grandma', 'Bath time'];

type FilterId = 'all' | 'milestones' | EmotionKind;

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'joy', label: 'Joy' },
  { id: 'love', label: 'Love' },
  { id: 'wonder', label: 'Wonder' },
  { id: 'calm', label: 'Calm' },
  { id: 'playful', label: 'Playful' },
  { id: 'sleepy', label: 'Sleepy' },
];

export default function SearchScreen({ memories, onBack, onOpenMemory }: Props) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');

  const results = useMemo(() => {
    let list = memories;
    if (activeFilter === 'milestones') {
      list = list.filter((m) => m.milestone);
    } else if (activeFilter !== 'all') {
      list = list.filter((m) => m.emotion === activeFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.note.toLowerCase().includes(q) ||
          m.label.toLowerCase().includes(q),
      );
    }
    return list;
  }, [memories, query, activeFilter]);

  const isEmpty = query.trim() === '' && activeFilter === 'all';
  const hasResults = results.length > 0;

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
      {/* Top bar */}
      <div style={{ padding: `calc(${T.safeTop} + 12px) 20px 0`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={onBack} style={chromeBtn}>
            <Icon name="back" size={20} color={T.ink} />
          </button>
          <span style={{
            fontSize: 16, fontWeight: 600, color: T.ink, letterSpacing: '-0.01em',
          }}>Search memories</span>
        </div>

        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: T.card, border: `1px solid ${T.line}`,
          borderRadius: 16, padding: '0 14px', height: 48,
          boxShadow: '0 1px 3px rgba(58,50,69,0.04)',
        }}>
          <Icon name="search" size={18} color={T.inkMuted} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, note, or feeling…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 15, color: T.ink, fontFamily: T.fontSans,
              '::placeholder': { color: T.inkFaint },
            } as any}
          />
          {query.length > 0 && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: T.lineSoft, border: 'none', borderRadius: 10,
                width: 22, height: 22, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent' as any,
                padding: 0, flexShrink: 0,
              }}
            >
              <Icon name="close" size={12} color={T.inkMuted} strokeWidth={2.2} />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div style={{
          display: 'flex', gap: 8, marginTop: 12,
          overflowX: 'auto', paddingBottom: 2,
          scrollbarWidth: 'none',
        } as any}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              style={{
                flexShrink: 0, height: 32, padding: '0 14px',
                borderRadius: 999,
                background: activeFilter === f.id ? T.lavenderDeep : T.card,
                color: activeFilter === f.id ? '#fff' : T.inkSoft,
                border: activeFilter === f.id ? 'none' : `1px solid ${T.line}`,
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                fontFamily: T.fontSans, whiteSpace: 'nowrap',
                WebkitTapHighlightColor: 'transparent' as any,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px 20px 110px',
        scrollbarWidth: 'none',
      } as any}>
        {isEmpty ? (
          /* Recent searches */
          <div>
            <div style={{
              fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 14, fontWeight: 500,
            }}>Recent searches</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {RECENT.map((r) => (
                <button
                  key={r}
                  onClick={() => setQuery(r)}
                  style={{
                    background: T.card, border: `1px solid ${T.line}`,
                    borderRadius: 999, padding: '8px 16px',
                    fontSize: 14, color: T.inkSoft, cursor: 'pointer',
                    fontFamily: T.fontSans,
                    WebkitTapHighlightColor: 'transparent' as any,
                    boxShadow: '0 1px 3px rgba(58,50,69,0.04)',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        ) : !hasResults ? (
          /* Empty state */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', paddingTop: 80, gap: 14,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 32,
              background: T.bgCool,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="search" size={28} color={T.inkFaint} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: T.ink, textAlign: 'center' }}>
              Nothing matched
            </div>
            <div style={{
              fontSize: 14, color: T.inkMuted, textAlign: 'center', lineHeight: 1.5,
              maxWidth: 240,
            }}>
              Try a different word or clear the filter to see all memories.
            </div>
          </div>
        ) : (
          /* Results list */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 4, fontWeight: 500,
            }}>{results.length} result{results.length !== 1 ? 's' : ''}</div>
            {results.map((memory) => (
              <button
                key={memory.id}
                onClick={() => onOpenMemory(memory.id)}
                style={{
                  width: '100%', textAlign: 'left', background: T.card,
                  borderRadius: 18, border: 'none', padding: '12px 14px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
                  display: 'flex', alignItems: 'center', gap: 14,
                  WebkitTapHighlightColor: 'transparent' as any,
                }}
              >
                {/* Thumbnail */}
                <div style={{ width: 56, height: 56, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
                  <PhotoPlaceholder
                    label=""
                    tone={memory.tone}
                    height={56}
                    radius={0}
                    style={{ width: 56 }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: T.inkMuted, marginBottom: 3,
                  }}>{memory.date}</div>
                  <div style={{
                    fontSize: 14.5, fontWeight: 600, color: T.ink,
                    letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 6,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{memory.title}</div>
                  <EmotionChip kind={memory.emotion} size="sm" />
                </div>
                <Icon name="chevron" size={16} color={T.inkFaint} />
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
