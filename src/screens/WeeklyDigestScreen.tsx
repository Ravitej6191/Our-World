import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { T, EMOTIONS } from '../tokens';
import type { EmotionKind } from '../tokens';
import Icon from '../components/Icon';
import { EmotionChip } from '../components/EmotionGlyph';
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
  cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent' as any,
};

function StatPill({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <div style={{
      flex: 1, background: T.card, borderRadius: 18,
      padding: '18px 12px', textAlign: 'center',
      boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
    }}>
      <div style={{
        fontSize: 30, fontWeight: 700, color: color ?? T.ink,
        letterSpacing: '-0.03em', marginBottom: 4,
      }}>{value}</div>
      <div style={{ fontSize: 12, color: T.inkMuted }}>{label}</div>
    </div>
  );
}

export default function WeeklyDigestScreen({ memories, childName, onBack }: Props) {
  const { light } = useHaptics();
  const showToast = useStore((s) => s.showToast);

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  const thisWeek = useMemo(
    () => memories.filter((m) => (m.createdAt ?? 0) >= sevenDaysAgo),
    [memories, sevenDaysAgo],
  );
  const thisMonth = useMemo(
    () => memories.filter((m) => (m.createdAt ?? 0) >= thirtyDaysAgo),
    [memories, thirtyDaysAgo],
  );

  const emotionCounts = useMemo(() => {
    const counts: Partial<Record<EmotionKind, number>> = {};
    for (const m of thisMonth) {
      counts[m.emotion] = (counts[m.emotion] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6) as [EmotionKind, number][];
  }, [thisMonth]);

  const mediaBreakdown = useMemo(() => {
    const counts = { photo: 0, video: 0, voice: 0, text: 0 };
    for (const m of thisMonth) counts[m.media] = (counts[m.media] ?? 0) + 1;
    return counts;
  }, [thisMonth]);

  const milestoneCount = thisMonth.filter((m) => m.milestone).length;
  const topEmotion = emotionCounts[0]?.[0];

  const handleShare = async () => {
    light();
    const text = `${childName ? `${childName}'s week` : 'This week'}: ${thisWeek.length} memories captured. ${milestoneCount > 0 ? `${milestoneCount} milestone${milestoneCount !== 1 ? 's' : ''} reached!` : ''}`;
    if (navigator.share) {
      try { await navigator.share({ title: "This week in Our World", text }); } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard?.writeText(text);
        showToast({ text: 'Copied to clipboard', variant: 'success' });
      } catch { /* clipboard unavailable */ }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'absolute', inset: 0, background: T.bg,
        fontFamily: T.fontSans, overflowY: 'auto', scrollbarWidth: 'none',
      } as any}
    >
      {/* Decorative orb */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 220, height: 220,
        borderRadius: '50%', background: 'rgba(196,181,232,0.18)', filter: 'blur(40px)',
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
            }}>Last 7 days</div>
            <div style={{
              fontSize: 28, fontWeight: 500, color: T.ink,
              letterSpacing: '-0.02em', lineHeight: 1.1,
            }}>
              <em style={{ fontFamily: T.fontSerif, fontStyle: 'italic' }}>This week's</em> story
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare} style={chromeBtn}>
            <Icon name="share" size={18} color={T.ink} />
          </motion.button>
        </div>
      </div>

      <div style={{ padding: '0 20px 110px', position: 'relative', zIndex: 1 }}>

        {/* Weekly stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <StatPill value={thisWeek.length} label="this week" color={T.lavenderDeep} />
          <StatPill value={thisMonth.length} label="this month" />
          {milestoneCount > 0 && <StatPill value={milestoneCount} label="milestones" color={T.gold} />}
        </div>

        {/* Emotion breakdown */}
        {emotionCounts.length > 0 && (
          <div style={{
            background: T.card, borderRadius: 20,
            padding: '18px 18px 20px',
            boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
            marginBottom: 20,
          }}>
            <div style={{
              fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 14, fontWeight: 500,
            }}>Feelings this month</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {emotionCounts.map(([kind, count]) => (
                <div key={kind} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <EmotionChip kind={kind} size="sm" />
                  <span style={{ fontSize: 12, color: T.inkMuted, fontWeight: 500 }}>×{count}</span>
                </div>
              ))}
            </div>
            {topEmotion && (
              <div style={{
                background: T.bgCool, borderRadius: 12, padding: '10px 14px',
                fontSize: 13, color: T.inkSoft, lineHeight: 1.5,
              }}>
                The most captured feeling this month is{' '}
                <strong style={{ color: T.ink }}>{EMOTIONS[topEmotion]?.label}</strong>.
              </div>
            )}
          </div>
        )}

        {/* Media breakdown */}
        {thisMonth.length > 0 && (
          <div style={{
            background: T.card, borderRadius: 20,
            padding: '18px 18px 20px',
            boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
            marginBottom: 20,
          }}>
            <div style={{
              fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 14, fontWeight: 500,
            }}>Memory types this month</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {([
                { key: 'photo', icon: 'camera', label: 'Photos' },
                { key: 'video', icon: 'video', label: 'Videos' },
                { key: 'voice', icon: 'mic', label: 'Voice' },
                { key: 'text', icon: 'text', label: 'Text' },
              ] as const).filter(({ key }) => mediaBreakdown[key] > 0).map(({ key, icon, label }) => (
                <div key={key} style={{
                  flex: 1, background: T.bgCool, borderRadius: 14,
                  padding: '12px 8px', textAlign: 'center',
                }}>
                  <Icon name={icon} size={20} color={T.lavenderDeep} strokeWidth={1.8} />
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, marginTop: 6 }}>
                    {mediaBreakdown[key]}
                  </div>
                  <div style={{ fontSize: 11, color: T.inkMuted }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent memories this week */}
        {thisWeek.length > 0 && (
          <div>
            <div style={{
              fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 12, fontWeight: 500,
            }}>From this week</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {thisWeek.map((m) => (
                <div key={m.id} style={{
                  background: T.card, borderRadius: 16,
                  padding: '12px 16px',
                  boxShadow: '0 1px 3px rgba(58,50,69,0.04)',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  {m.mediaUri && m.media !== 'voice' ? (
                    <img
                      src={m.media === 'video' ? (m.posterUri ?? m.mediaUri) : m.mediaUri}
                      style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                      background: T.bgCool,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name={m.media === 'voice' ? 'mic' : 'text'} size={18} color={T.inkFaint} strokeWidth={1.8} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 600, color: T.ink,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{m.title}</div>
                    <div style={{ fontSize: 11.5, color: T.inkMuted, marginTop: 2 }}>{m.dateShort}</div>
                  </div>
                  <EmotionChip kind={m.emotion} size="sm" />
                </div>
              ))}
            </div>
          </div>
        )}

        {thisWeek.length === 0 && thisMonth.length === 0 && (
          <div style={{
            paddingTop: 60, textAlign: 'center',
            fontSize: 15, color: T.inkFaint, lineHeight: 1.6,
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
            No memories captured yet.<br />Start adding moments to see your story here.
          </div>
        )}

        {thisWeek.length === 0 && thisMonth.length > 0 && (
          <div style={{
            background: T.bgCool, borderRadius: 16, padding: '14px 16px',
            display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 4,
          }}>
            <Icon name="sparkle" size={18} color={T.lavenderDeep} />
            <div style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.55 }}>
              No new memories this week — but {thisMonth.length} captured this month. Keep going!
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
