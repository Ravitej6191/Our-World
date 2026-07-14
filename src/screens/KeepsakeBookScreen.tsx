import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { T, EMOTIONS } from '../tokens';
import type { EmotionKind } from '../tokens';
import Icon from '../components/Icon';
import { EmotionChip } from '../components/EmotionGlyph';
import PhotoPlaceholder from '../components/PhotoPlaceholder';
import { useHaptics } from '../hooks/useHaptics';
import { useStore } from '../store';
import type { Memory } from '../types';

interface Props {
  memories: Memory[];
  childName: string;
  onBack: () => void;
}

const chromeBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 20,
  background: 'rgba(255,255,255,0.85)', border: `1px solid ${T.lineSoft}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent',
};

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function groupByMonth(memories: Memory[], year: number): Map<string, Memory[]> {
  const map = new Map<string, Memory[]>();
  for (const m of memories) {
    if (!m.createdAt) continue;
    const d = new Date(m.createdAt);
    if (d.getFullYear() !== year) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  // Sort by month descending (newest first)
  return new Map([...map.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}

function monthLabel(key: string): string {
  const [, m] = key.split('-');
  return MONTH_NAMES[Number(m)] ?? '';
}

function MemoryCard({ memory }: { memory: Memory }) {
  return (
    <div style={{
      background: T.card, borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(58,50,69,0.04)',
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px',
    }}>
      <div style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
        {memory.mediaUri && memory.media !== 'voice' ? (
          <img
            src={memory.media === 'video' ? (memory.posterUri ?? memory.mediaUri) : memory.mediaUri}
            style={{ width: 52, height: 52, objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <PhotoPlaceholder label="" tone={memory.tone} height={52} radius={0} style={{ width: 52 }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600, color: T.ink,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginBottom: 4,
        }}>{memory.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <EmotionChip kind={memory.emotion} size="sm" />
          <span style={{ fontSize: 11, color: T.inkFaint }}>{memory.dateShort ?? memory.date}</span>
        </div>
      </div>
    </div>
  );
}

export default function KeepsakeBookScreen({ memories, childName, onBack }: Props) {
  const { light } = useHaptics();
  const showToast = useStore((s) => s.showToast);
  const year = new Date().getFullYear();

  const yearMemories = useMemo(
    () => memories.filter((m) => m.createdAt && new Date(m.createdAt).getFullYear() === year),
    [memories, year],
  );

  const monthGroups = useMemo(() => groupByMonth(memories, year), [memories, year]);

  const emotionCounts = useMemo(() => {
    const counts: Partial<Record<EmotionKind, number>> = {};
    for (const m of yearMemories) {
      counts[m.emotion] = (counts[m.emotion] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3) as [EmotionKind, number][];
  }, [yearMemories]);

  const milestoneCount = yearMemories.filter((m) => m.milestone).length;
  const topEmotion = emotionCounts[0]?.[0];

  const handleShare = async () => {
    light();
    const lines = [
      `${childName ? `${childName}'s` : 'Our'} ${year} Keepsake`,
      `${yearMemories.length} memories captured`,
      milestoneCount > 0 ? `${milestoneCount} milestones reached` : '',
      topEmotion ? `Most felt: ${EMOTIONS[topEmotion]?.label}` : '',
      '',
      'Captured with Our World',
    ].filter(Boolean).join('\n');

    if (navigator.share) {
      try { await navigator.share({ title: `${year} Keepsake Book`, text: lines }); } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard?.writeText(lines);
        showToast({ text: 'Copied to clipboard', variant: 'success' });
      } catch { /* clipboard unavailable */ }
    }
  };

  const handlePrint = () => {
    light();
    showToast({ text: 'Opening print view…', variant: 'success' });
    setTimeout(() => window.print(), 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'absolute', inset: 0, background: T.bg,
        fontFamily: T.fontSans, overflowY: 'auto', scrollbarWidth: 'none',
      }}
    >
      {/* Decorative orb */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 220, height: 220,
        borderRadius: '50%', background: 'rgba(212,168,71,0.15)', filter: 'blur(45px)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Header */}
      <div style={{
        padding: `calc(${T.safeTop} + 12px) 24px 0`,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { light(); onBack(); }} style={chromeBtn}>
            <Icon name="back" size={20} color={T.ink} />
          </motion.button>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 5,
            }}>{year}</div>
            <div style={{
              fontSize: 28, fontWeight: 500, color: T.ink,
              letterSpacing: '-0.02em', lineHeight: 1.1,
            }}>
              <em style={{ fontFamily: T.fontSerif, fontStyle: 'italic' }}>
                {childName ? `${childName}'s` : 'Our'} keepsake
              </em>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare} style={chromeBtn}>
            <Icon name="share" size={18} color={T.ink} />
          </motion.button>
        </div>
      </div>

      <div style={{ padding: '0 20px 110px', position: 'relative', zIndex: 1 }}>

        {/* Cover card */}
        <div style={{
          background: 'linear-gradient(135deg, #fdf5dc, #fae8b0)',
          borderRadius: 24, padding: '28px 24px', marginBottom: 24,
          boxShadow: '0 4px 20px rgba(212,168,71,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontFamily: T.fontSerif, fontStyle: 'italic',
                fontSize: 34, color: T.ink, lineHeight: 1.1, marginBottom: 8,
                letterSpacing: '-0.02em',
              }}>{year}</div>
              <div style={{ fontSize: 14, color: T.inkSoft, lineHeight: 1.5 }}>
                {childName ? `${childName}'s year in memories` : 'Your year in memories'}
              </div>
            </div>
            <div style={{
              width: 56, height: 56, borderRadius: 28,
              background: 'rgba(255,255,255,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="heart" size={24} color={T.gold} strokeWidth={1.8} />
            </div>
          </div>

          <div style={{
            marginTop: 24, display: 'flex', gap: 12,
          }}>
            {[
              { value: yearMemories.length, label: 'memories' },
              { value: milestoneCount, label: 'milestones' },
              { value: monthGroups.size, label: 'months' },
            ].map((s) => (
              <div key={s.label} style={{
                flex: 1, background: 'rgba(255,255,255,0.5)',
                borderRadius: 14, padding: '12px 8px', textAlign: 'center',
              }}>
                <div style={{
                  fontSize: 24, fontWeight: 700, color: T.ink,
                  letterSpacing: '-0.03em', marginBottom: 2,
                }}>{s.value}</div>
                <div style={{ fontSize: 11, color: T.inkSoft }}>{s.label}</div>
              </div>
            ))}
          </div>

          {topEmotion && (
            <div style={{
              marginTop: 16, background: 'rgba(255,255,255,0.5)',
              borderRadius: 14, padding: '12px 16px',
              fontSize: 13, color: T.inkSoft, lineHeight: 1.5,
            }}>
              Most captured feeling: <strong style={{ color: T.ink }}>{EMOTIONS[topEmotion]?.label}</strong>
            </div>
          )}
        </div>

        {/* Print button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handlePrint}
          style={{
            width: '100%', height: 50, borderRadius: 16,
            background: T.card, border: `1px solid ${T.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', marginBottom: 24,
            boxShadow: '0 1px 3px rgba(58,50,69,0.04)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Icon name="download" size={18} color={T.lavenderDeep} strokeWidth={2} />
          <span style={{ fontSize: 14.5, fontWeight: 500, color: T.ink, fontFamily: T.fontSans }}>
            Print / Save as PDF
          </span>
        </motion.button>

        {/* Memories by month */}
        {monthGroups.size === 0 ? (
          <div style={{
            paddingTop: 40, textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 36,
              background: 'linear-gradient(135deg, #fdf5dc, #fae8b0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="heart" size={28} color={T.gold} strokeWidth={1.8} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: T.fontSerif, fontStyle: 'italic',
                fontSize: 20, color: T.ink, marginBottom: 6,
              }}>Start capturing {year}</div>
              <div style={{ fontSize: 14, color: T.inkMuted, lineHeight: 1.6 }}>
                Your memories this year will appear here.
              </div>
            </div>
          </div>
        ) : (
          [...monthGroups.entries()].map(([key, mems]) => (
            <div key={key} style={{ marginBottom: 28 }}>
              <div style={{
                fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: T.inkMuted, marginBottom: 12, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span>{monthLabel(key)}</span>
                <div style={{ flex: 1, height: 1, background: T.lineSoft }} />
                <span>{mems.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {mems.map((m) => (
                  <MemoryCard key={m.id} memory={m} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
