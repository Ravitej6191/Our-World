import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T, EMOTIONS, type EmotionKind } from '../tokens';
import Icon from '../components/Icon';
import PhotoPlaceholder from '../components/PhotoPlaceholder';
import VoiceWaveform from '../components/VoiceWaveform';
import EmotionGlyph from '../components/EmotionGlyph';
import Toggle from '../components/Toggle';
import { MILESTONES } from '../data';
import { useHaptics } from '../hooks/useHaptics';

interface Props {
  defaultMilestoneId?: string | null;
  onClose: () => void;
  onSave: (m: {
    media: string;
    title: string;
    note: string;
    emotion: EmotionKind;
    milestoneId?: string;
    isMilestone: boolean;
  }) => void;
}

type MediaType = 'photo' | 'video' | 'voice' | 'text';
type Step = 'pick' | 'compose' | 'saving';

const chromeBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 20,
  background: 'rgba(255,255,255,0.85)', border: `1px solid ${T.lineSoft}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent' as any,
};

const MEDIA_OPTIONS: { type: MediaType; icon: string; label: string; sub: string; color: string; bg: string }[] = [
  { type: 'photo',  icon: 'camera', label: 'Photo',  sub: 'Camera or library',    color: T.lavenderDeep, bg: '#ede5f8' },
  { type: 'video',  icon: 'video',  label: 'Video',  sub: 'Capture a moment',     color: T.blushDeep,    bg: '#fce8e6' },
  { type: 'voice',  icon: 'mic',    label: 'Voice',  sub: 'Speak your memory',    color: '#4ab8a0',      bg: '#d8f0e8' },
  { type: 'text',   icon: 'text',   label: 'Text',   sub: 'Write it down',        color: T.gold,         bg: '#faf0d0' },
];

const EMOTIONS_LIST = Object.entries(EMOTIONS) as [EmotionKind, typeof EMOTIONS[EmotionKind]][];

function VoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { light } = useHaptics();

  const toggle = () => {
    light();
    if (recording) {
      setRecording(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setRecording(true);
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div style={{
      background: '#ede5f8', borderRadius: 20,
      padding: '28px 24px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 20,
    }}>
      <VoiceWaveform bars={32} height={56} color={recording ? T.lavenderDeep : 'rgba(139,111,199,0.35)'} />
      <div style={{
        fontFamily: T.fontMono, fontSize: 28, color: T.ink,
        letterSpacing: '0.05em', fontWeight: 400,
      }}>{mm}:{ss}</div>
      <motion.button
        onClick={toggle}
        whileTap={{ scale: 0.92 }}
        style={{
          width: 64, height: 64, borderRadius: 32,
          background: recording
            ? 'linear-gradient(135deg, #d4736a, #c05a52)'
            : 'linear-gradient(135deg, #8b6fc7, #7a5db8)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: recording
            ? '0 6px 20px rgba(212,115,106,0.4)'
            : '0 6px 20px rgba(139,111,199,0.4)',
          WebkitTapHighlightColor: 'transparent' as any,
        }}
      >
        <Icon name={recording ? 'pause' : 'mic'} size={26} color="#fff" strokeWidth={2} />
      </motion.button>
      {recording && (
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          style={{
            fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: T.blushDeep, fontWeight: 500,
          }}
        >Recording…</motion.div>
      )}
    </div>
  );
}

export default function AddMemoryFlow({ defaultMilestoneId, onClose, onSave }: Props) {
  const [step, setStep] = useState<Step>('pick');
  const [media, setMedia] = useState<MediaType>('photo');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [isMilestone, setIsMilestone] = useState(!!defaultMilestoneId);
  const [milestoneId, setMilestoneId] = useState<string | null>(defaultMilestoneId ?? null);
  const [emotion, setEmotion] = useState<EmotionKind | null>(null);
  const { light, medium, success } = useHaptics();

  const canSave = title.trim().length > 0 && emotion !== null;

  useEffect(() => {
    if (step === 'saving') {
      success();
      const t = setTimeout(() => {
        onSave({
          media, title, note,
          emotion: emotion ?? 'joy',
          isMilestone,
          milestoneId: isMilestone && milestoneId ? milestoneId : undefined,
        });
      }, 900);
      return () => clearTimeout(t);
    }
  }, [step]);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: T.bg, fontFamily: T.fontSans,
      display: 'flex', flexDirection: 'column',
    }}>
      <AnimatePresence mode="wait">

        {/* ── Step 1: Pick media type ── */}
        {step === 'pick' && (
          <motion.div
            key="pick"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: `calc(${T.safeTop} + 12px) 24px 40px` }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
              <div>
                <div style={{
                  fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: T.inkMuted, marginBottom: 6,
                }}>New memory</div>
                <div style={{ fontSize: 26, fontWeight: 600, color: T.ink, letterSpacing: '-0.02em' }}>
                  What happened?
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => { light(); onClose(); }} style={chromeBtn}>
                <Icon name="close" size={18} color={T.inkSoft} />
              </motion.button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, flex: 1 }}>
              {MEDIA_OPTIONS.map((opt) => (
                <motion.button
                  key={opt.type}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { medium(); setMedia(opt.type); setStep('compose'); }}
                  style={{
                    background: T.card, border: `1px solid ${T.line}`,
                    borderRadius: 22, padding: '24px 20px',
                    display: 'flex', flexDirection: 'column', gap: 14,
                    cursor: 'pointer', textAlign: 'left',
                    boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
                    WebkitTapHighlightColor: 'transparent' as any,
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 16,
                    background: opt.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name={opt.icon} size={22} color={opt.color} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 4 }}>{opt.label}</div>
                    <div style={{ fontSize: 12.5, color: T.inkMuted, lineHeight: 1.4 }}>{opt.sub}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Compose (all-in-one) ── */}
        {step === 'compose' && (
          <motion.div
            key="compose"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22 }}
            style={{
              flex: 1, overflowY: 'auto', scrollbarWidth: 'none',
              display: 'flex', flexDirection: 'column',
            } as any}
          >
            {/* Chrome */}
            <div style={{
              padding: `calc(${T.safeTop} + 12px) 20px 16px`,
              display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
            }}>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => { light(); setStep('pick'); }} style={chromeBtn}>
                <Icon name="back" size={20} color={T.ink} />
              </motion.button>
              <span style={{
                fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.inkMuted,
              }}>
                {MEDIA_OPTIONS.find((m) => m.type === media)?.label}
              </span>
              <div style={{ flex: 1 }} />
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => { light(); onClose(); }} style={chromeBtn}>
                <Icon name="close" size={18} color={T.inkSoft} />
              </motion.button>
            </div>

            <div style={{ padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Media area */}
              {(media === 'photo' || media === 'video') && (
                <motion.div whileTap={{ scale: 0.99 }} style={{ position: 'relative', cursor: 'pointer' }}>
                  <PhotoPlaceholder
                    label={media === 'video' ? 'tap to record video' : 'tap to add photo'}
                    tone="lavender" height={240} radius={20}
                  />
                  {media === 'video' && (
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%,-50%)',
                      width: 52, height: 52, borderRadius: 26,
                      background: 'rgba(255,255,255,0.85)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name="play" size={22} color={T.ink} />
                    </div>
                  )}
                </motion.div>
              )}
              {media === 'voice' && <VoiceRecorder />}

              {/* Title */}
              <div style={{ borderBottom: `1.5px solid ${T.line}`, paddingBottom: 10 }}>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give this moment a title…"
                  autoFocus
                  style={{
                    width: '100%', border: 'none', outline: 'none',
                    background: 'transparent',
                    fontFamily: T.fontSerif, fontStyle: 'italic',
                    fontSize: 22, color: T.ink, lineHeight: 1.3,
                    letterSpacing: '-0.01em',
                  } as any}
                />
              </div>

              {/* Note */}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note… what do you want to remember?"
                rows={3}
                style={{
                  width: '100%', border: `1px solid ${T.line}`, outline: 'none',
                  background: T.card, borderRadius: 14, padding: '14px 16px',
                  fontFamily: T.fontSans, fontSize: 15, color: T.ink,
                  lineHeight: 1.55, resize: 'none', boxSizing: 'border-box',
                } as any}
              />

              {/* Feeling picker (inline) */}
              <div>
                <div style={{
                  fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: T.inkMuted, fontWeight: 500, marginBottom: 10,
                }}>How does it feel?</div>
                <div style={{
                  display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4,
                  scrollbarWidth: 'none',
                } as any}>
                  {EMOTIONS_LIST.map(([kind, e]) => {
                    const active = emotion === kind;
                    return (
                      <motion.button
                        key={kind}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => { light(); setEmotion(kind); }}
                        style={{
                          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7,
                          padding: '8px 14px', borderRadius: 999,
                          background: active ? e.ring : T.card,
                          border: active ? `1.5px solid ${e.color}` : `1px solid ${T.line}`,
                          cursor: 'pointer', transition: 'all 0.15s',
                          boxShadow: active ? `0 2px 10px ${e.color}50` : 'none',
                          WebkitTapHighlightColor: 'transparent' as any,
                        }}
                      >
                        <EmotionGlyph kind={kind} size={18} />
                        <span style={{
                          fontSize: 13, fontWeight: active ? 600 : 400,
                          color: active ? T.ink : T.inkSoft,
                        }}>{e.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Milestone toggle */}
              <div style={{
                background: T.card, border: `1px solid ${T.line}`,
                borderRadius: 14, overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(58,50,69,0.04)',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 12, background: '#faf0d0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name="star" size={16} color={T.gold} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 500, color: T.ink }}>Mark as milestone</div>
                    <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 2 }}>A little first to remember</div>
                  </div>
                  <Toggle
                    value={isMilestone}
                    onChange={(v) => { light(); setIsMilestone(v); if (!v) setMilestoneId(null); }}
                  />
                </div>

                {/* Milestone picker */}
                <AnimatePresence>
                  {isMilestone && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ borderTop: `1px solid ${T.lineSoft}`, padding: '12px 16px 16px' }}>
                        <div style={{
                          fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
                          color: T.inkMuted, marginBottom: 10,
                        }}>Which first?</div>
                        <div style={{
                          display: 'flex', flexWrap: 'wrap', gap: 8,
                        }}>
                          {MILESTONES.map((m) => {
                            const active = milestoneId === m.id;
                            return (
                              <motion.button
                                key={m.id}
                                whileTap={{ scale: 0.94 }}
                                onClick={() => { light(); setMilestoneId(active ? null : m.id); }}
                                style={{
                                  padding: '6px 14px', borderRadius: 999,
                                  background: active ? T.lavenderDeep : (m.done ? '#faf0d0' : T.bgCool),
                                  color: active ? '#fff' : (m.done ? T.gold : T.inkSoft),
                                  border: `1px solid ${active ? T.lavenderDeep : T.line}`,
                                  fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', gap: 5,
                                  WebkitTapHighlightColor: 'transparent' as any,
                                }}
                              >
                                {m.done && <Icon name="check" size={11} color={active ? '#fff' : T.gold} strokeWidth={2.4} />}
                                {m.label}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Save CTA */}
              <motion.button
                whileTap={canSave ? { scale: 0.97 } : {}}
                disabled={!canSave}
                onClick={() => { if (canSave) { medium(); setStep('saving'); } }}
                style={{
                  width: '100%', height: 54, borderRadius: 18,
                  background: canSave
                    ? 'linear-gradient(135deg, #8b6fc7, #d4736a)'
                    : T.lineSoft,
                  border: 'none',
                  cursor: canSave ? 'pointer' : 'default',
                  color: canSave ? '#fff' : T.inkFaint,
                  fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em',
                  fontFamily: T.fontSans,
                  boxShadow: canSave ? '0 6px 20px rgba(139,111,199,0.35)' : 'none',
                  transition: 'all 0.2s ease',
                  WebkitTapHighlightColor: 'transparent' as any,
                }}
              >
                {!title.trim()
                  ? 'Add a title to save'
                  : !emotion
                  ? 'Choose a feeling to save'
                  : 'Save to her world'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Saving animation ── */}
        {step === 'saving' && (
          <motion.div
            key="saving"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', padding: '40px 24px',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 16, stiffness: 280, delay: 0.08 }}
              style={{
                width: 88, height: 88, borderRadius: 44,
                background: 'linear-gradient(135deg, #8b6fc7, #d4736a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 12px 32px rgba(139,111,199,0.4)', marginBottom: 28,
              }}
            >
              <Icon name="check" size={36} color="#fff" strokeWidth={2.4} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontFamily: T.fontSerif, fontStyle: 'italic',
                fontSize: 38, color: T.ink, marginBottom: 12, letterSpacing: '-0.02em',
              }}
            >Kept.</motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              style={{ fontSize: 15, color: T.inkMuted, textAlign: 'center', lineHeight: 1.5 }}
            >
              This moment is safe in her world.
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
