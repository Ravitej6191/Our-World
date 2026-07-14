import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { T, EMOTIONS } from '../tokens';
import type { EmotionKind } from '../tokens';
import Icon from '../components/Icon';
import { EmotionChip } from '../components/EmotionGlyph';
import PhotoPlaceholder from '../components/PhotoPlaceholder';
import { useHaptics } from '../hooks/useHaptics';
import { useStore } from '../store';
import { GLASS_HEADER, GLASS_CHROME_BTN } from '../shared/constants';
import { generateYearbookPdf } from '../lib/yearbookPdf';
import type { Memory } from '../types';

interface Props {
  memories: Memory[];
  childName: string;
  onBack: () => void;
}

const chromeBtn = GLASS_CHROME_BTN;

function groupByYear(memories: Memory[]): Map<number, Memory[]> {
  const map = new Map<number, Memory[]>();
  for (const m of memories) {
    if (!m.createdAt) continue;
    const year = new Date(m.createdAt).getFullYear();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(m);
  }
  for (const list of map.values()) list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  return new Map([...map.entries()].sort((a, b) => b[0] - a[0]));
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
        }}>{memory.milestoneLabel || memory.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <EmotionChip kind={memory.emotion} size="sm" />
          <span style={{ fontSize: 11, color: T.inkFaint }}>{memory.dateShort ?? memory.date}</span>
        </div>
      </div>
    </div>
  );
}

function YearCard({ year, memories, childName }: { year: number; memories: Memory[]; childName: string }) {
  const { light } = useHaptics();
  const showToast = useStore((s) => s.showToast);
  const [exporting, setExporting] = useState(false);

  const milestoneCount = memories.filter((m) => m.milestone).length;
  const emotionCounts = useMemo(() => {
    const counts: Partial<Record<EmotionKind, number>> = {};
    for (const m of memories) counts[m.emotion] = (counts[m.emotion] ?? 0) + 1;
    return Object.entries(counts).sort(([, a], [, b]) => b - a) as [EmotionKind, number][];
  }, [memories]);
  const topEmotion = emotionCounts[0]?.[0];

  const handleExport = async () => {
    light();
    setExporting(true);
    try {
      await generateYearbookPdf(memories, year, childName);
    } catch {
      showToast({ text: "Couldn't export the PDF. Try again.", variant: 'error' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        background: 'linear-gradient(135deg, #fdf5dc, #fae8b0)',
        borderRadius: 24, padding: '26px 22px', marginBottom: 16,
        boxShadow: '0 4px 20px rgba(212,168,71,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{
              fontFamily: T.fontSerif, fontStyle: 'italic',
              fontSize: 32, color: T.ink, lineHeight: 1.1, marginBottom: 6,
              letterSpacing: '-0.02em',
            }}>{year}</div>
            <div style={{ fontSize: 13.5, color: T.inkSoft }}>
              {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
              {milestoneCount > 0 ? ` · ${milestoneCount} ${milestoneCount === 1 ? 'milestone' : 'milestones'}` : ''}
            </div>
            {topEmotion && (
              <div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 4 }}>
                Most felt: <strong style={{ color: T.ink }}>{EMOTIONS[topEmotion]?.label}</strong>
              </div>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleExport}
            disabled={exporting}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 999,
              padding: '8px 14px', cursor: exporting ? 'default' : 'pointer',
              fontSize: 12.5, fontWeight: 600, color: T.ink, fontFamily: T.fontSans,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {exporting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                style={{ width: 13, height: 13, borderRadius: 7, border: '2px solid rgba(58,50,69,0.2)', borderTopColor: T.ink }}
              />
            ) : (
              <Icon name="share" size={14} color={T.ink} />
            )}
            {exporting ? 'Exporting…' : 'Share PDF'}
          </motion.button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {memories.map((m) => (
          <MemoryCard key={m.id} memory={m} />
        ))}
      </div>
    </div>
  );
}

export default function KeepsakeBookScreen({ memories, childName, onBack }: Props) {
  const { light } = useHaptics();
  const yearGroups = useMemo(() => groupByYear(memories), [memories]);

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
      <div style={{ ...GLASS_HEADER, padding: `calc(${T.safeTop} + 12px) 24px 16px` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { light(); onBack(); }} style={chromeBtn}>
            <Icon name="back" size={20} color={T.ink} />
          </motion.button>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 5,
            }}>Keepsake</div>
            <div style={{
              fontSize: 26, fontWeight: 500, color: T.ink,
              letterSpacing: '-0.02em', lineHeight: 1.1,
            }}>
              <em style={{ fontFamily: T.fontSerif, fontStyle: 'italic' }}>
                {childName ? `${childName}'s` : 'Our'} keepsake book
              </em>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 20px 110px', position: 'relative', zIndex: 1 }}>
        {yearGroups.size === 0 ? (
          <div style={{
            paddingTop: 60, textAlign: 'center',
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
              }}>Nothing here yet</div>
              <div style={{ fontSize: 14, color: T.inkMuted, lineHeight: 1.6 }}>
                Every year you capture will show up here.
              </div>
            </div>
          </div>
        ) : (
          [...yearGroups.entries()].map(([year, mems]) => (
            <YearCard key={year} year={year} memories={mems} childName={childName} />
          ))
        )}
      </div>
    </motion.div>
  );
}
