import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { T, type EmotionKind } from '../tokens';
import Icon from '../components/Icon';
import { EmotionChip } from '../components/EmotionGlyph';
import PhotoPlaceholder from '../components/PhotoPlaceholder';
import { useHaptics } from '../hooks/useHaptics';
import { useStore } from '../store';
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
  const { light } = useHaptics();
  const { searchHistory, addSearchQuery, clearSearchHistory } = useStore();
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

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.trim()) addSearchQuery(q.trim());
  };

  const handleOpenMemory = (id: string) => {
    if (query.trim()) addSearchQuery(query.trim());
    onOpenMemory(id);
  };

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
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { light(); onBack(); }} style={chromeBtn}>
            <Icon name="back" size={20} color={T.ink} />
          </motion.button>
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
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by title, note, or feeling…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 15, color: T.ink, fontFamily: T.fontSans,
            } as any}
          />
          {query.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => { light(); setQuery(''); }}
              style={{
                background: T.lineSoft, border: 'none', borderRadius: 10,
                width: 22, height: 22, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent' as any,
                padding: 0, flexShrink: 0,
              }}
            >
              <Icon name="close" size={12} color={T.inkMuted} strokeWidth={2.2} />
            </motion.button>
          )}
        </div>

        {/* Filter chips */}
        <div style={{
          display: 'flex', gap: 8, marginTop: 12,
          overflowX: 'auto', paddingBottom: 2,
          scrollbarWidth: 'none',
        } as any}>
          {FILTERS.map((f) => (
            <motion.button
              key={f.id}
              whileTap={{ scale: 0.93 }}
              onClick={() => { light(); setActiveFilter(f.id); }}
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
            </motion.button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px 20px 110px',
        scrollbarWidth: 'none',
      } as any}>
        {isEmpty ? (
          <div>
            {searchHistory.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{
                    fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
                    color: T.inkMuted, fontWeight: 500,
                  }}>Recent searches</div>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => { light(); clearSearchHistory(); }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 12, color: T.inkMuted, padding: '4px 8px',
                      WebkitTapHighlightColor: 'transparent' as any,
                    }}
                  >
                    Clear
                  </motion.button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                  {searchHistory.map((r) => (
                    <motion.button
                      key={r}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => { light(); setQuery(r); }}
                      style={{
                        background: T.card, border: `1px solid ${T.line}`,
                        borderRadius: 999, padding: '8px 16px',
                        fontSize: 14, color: T.inkSoft, cursor: 'pointer',
                        fontFamily: T.fontSans,
                        WebkitTapHighlightColor: 'transparent' as any,
                        boxShadow: '0 1px 3px rgba(58,50,69,0.04)',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}
                    >
                      <Icon name="search" size={13} color={T.inkFaint} />
                      {r}
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            {/* Suggestion to start searching */}
            {searchHistory.length === 0 && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                paddingTop: 60, gap: 14,
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 32,
                  background: T.bgCool,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name="search" size={28} color={T.inkFaint} />
                </div>
                <div style={{ fontSize: 15, color: T.inkMuted, textAlign: 'center', lineHeight: 1.5 }}>
                  Search across all your memories by title, note, or feeling.
                </div>
              </div>
            )}
          </div>
        ) : !hasResults ? (
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 4, fontWeight: 500,
            }}>{results.length} result{results.length !== 1 ? 's' : ''}</div>
            {results.map((memory) => (
              <motion.button
                key={memory.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => { light(); handleOpenMemory(memory.id); }}
                style={{
                  width: '100%', textAlign: 'left', background: T.card,
                  borderRadius: 18, border: 'none', padding: '12px 14px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
                  display: 'flex', alignItems: 'center', gap: 14,
                  WebkitTapHighlightColor: 'transparent' as any,
                }}
              >
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
                  }}>{memory.dateShort ?? memory.date}</div>
                  <div style={{
                    fontSize: 14.5, fontWeight: 600, color: T.ink,
                    letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 6,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{memory.title}</div>
                  <EmotionChip kind={memory.emotion} size="sm" />
                </div>
                <Icon name="chevron" size={16} color={T.inkFaint} />
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
