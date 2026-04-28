import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T, EMOTIONS, type EmotionKind } from '../tokens';
import Icon from '../components/Icon';
import PhotoPlaceholder from '../components/PhotoPlaceholder';
import VoiceWaveform from '../components/VoiceWaveform';
import EmotionGlyph from '../components/EmotionGlyph';
import Toggle from '../components/Toggle';

interface Props {
  onClose: () => void;
  onSave: (m: { media: string; title: string; note: string; emotion: EmotionKind }) => void;
}

type MediaType = 'photo' | 'video' | 'voice' | 'text';
type Step = 'pick' | 'compose' | 'emotion' | 'saved';

const chromeBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 20,
  background: 'rgba(255,255,255,0.85)', border: `1px solid ${T.lineSoft}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent' as any,
};

const MEDIA_OPTIONS: {
  type: MediaType;
  icon: string;
  label: string;
  sub: string;
  color: string;
  bg: string;
}[] = [
  { type: 'photo',  icon: 'camera', label: 'Photo',  sub: 'From camera or library', color: T.lavenderDeep, bg: '#ede5f8' },
  { type: 'video',  icon: 'video',  label: 'Video',  sub: 'Capture a moving moment', color: T.blushDeep,   bg: '#fce8e6' },
  { type: 'voice',  icon: 'mic',    label: 'Voice',  sub: 'Speak your memory',       color: '#4ab8a0',      bg: '#d8f0e8' },
  { type: 'text',   icon: 'text',   label: 'Text',   sub: 'Write it down',           color: T.gold,         bg: '#faf0d0' },
];

const EMOTIONS_LIST = Object.entries(EMOTIONS) as [EmotionKind, typeof EMOTIONS[EmotionKind]][];

function VoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggle = () => {
    if (recording) {
      setRecording(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setRecording(true);
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

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
      <button
        onClick={toggle}
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
      </button>
      {recording && (
        <div style={{
          fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: T.blushDeep, fontWeight: 500,
        }}>Recording…</div>
      )}
    </div>
  );
}

export default function AddMemoryFlow({ onClose, onSave }: Props) {
  const [step, setStep] = useState<Step>('pick');
  const [media, setMedia] = useState<MediaType>('photo');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [isMilestone, setIsMilestone] = useState(false);
  const [emotion, setEmotion] = useState<EmotionKind | null>(null);

  useEffect(() => {
    if (step === 'saved') {
      const t = setTimeout(() => {
        onSave({ media, title, note, emotion: emotion ?? 'joy' });
      }, 1400);
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
        {step === 'pick' && (
          <motion.div
            key="pick"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.22 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '56px 24px 40px' }}
          >
            {/* Header */}
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
              <button onClick={onClose} style={chromeBtn}>
                <Icon name="close" size={18} color={T.inkSoft} />
              </button>
            </div>

            {/* 2x2 grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, flex: 1,
            }}>
              {MEDIA_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => { setMedia(opt.type); setStep('compose'); }}
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
                    <div style={{ fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 4 }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 12.5, color: T.inkMuted, lineHeight: 1.4 }}>
                      {opt.sub}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'compose' && (
          <motion.div
            key="compose"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.22 }}
            style={{
              flex: 1, overflowY: 'auto', scrollbarWidth: 'none',
              display: 'flex', flexDirection: 'column',
            } as any}
          >
            {/* Top chrome */}
            <div style={{
              padding: '56px 20px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              flexShrink: 0,
            }}>
              <button onClick={() => setStep('pick')} style={chromeBtn}>
                <Icon name="back" size={20} color={T.ink} />
              </button>
              <span style={{
                fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: T.inkMuted,
              }}>
                {MEDIA_OPTIONS.find((m) => m.type === media)?.label}
              </span>
            </div>

            <div style={{ padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Media area */}
              {media === 'photo' || media === 'video' ? (
                <div style={{ position: 'relative' }}>
                  <PhotoPlaceholder label={media === 'video' ? 'video · tap to capture' : 'tap to add photo'} tone="lavender" height={300} radius={20} />
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
                </div>
              ) : media === 'voice' ? (
                <VoiceRecorder />
              ) : null}

              {/* Title input */}
              <div style={{ borderBottom: `1.5px solid ${T.line}`, paddingBottom: 10 }}>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give this moment a title…"
                  style={{
                    width: '100%', border: 'none', outline: 'none',
                    background: 'transparent',
                    fontFamily: T.fontSerif, fontStyle: 'italic',
                    fontSize: 22, color: T.ink, lineHeight: 1.3,
                    letterSpacing: '-0.01em',
                    '::placeholder': { color: T.inkFaint },
                  } as any}
                />
              </div>

              {/* Note textarea */}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note… what do you want to remember about this?"
                rows={4}
                style={{
                  width: '100%', border: `1px solid ${T.line}`, outline: 'none',
                  background: T.card, borderRadius: 14,
                  padding: '14px 16px',
                  fontFamily: T.fontSans, fontSize: 15, color: T.ink,
                  lineHeight: 1.55, resize: 'none',
                  boxSizing: 'border-box',
                  '::placeholder': { color: T.inkFaint },
                } as any}
              />

              {/* Milestone toggle */}
              <div style={{
                background: T.card, border: `1px solid ${T.line}`,
                borderRadius: 14, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 14,
                boxShadow: '0 1px 3px rgba(58,50,69,0.04)',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 12,
                  background: '#faf0d0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name="star" size={16} color={T.gold} strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 500, color: T.ink }}>Mark as milestone</div>
                  <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 2 }}>A little first to remember</div>
                </div>
                <Toggle value={isMilestone} onChange={setIsMilestone} />
              </div>

              {/* CTA */}
              <button
                onClick={() => setStep('emotion')}
                style={{
                  width: '100%', height: 54, borderRadius: 18,
                  background: 'linear-gradient(135deg, #8b6fc7, #d4736a)',
                  border: 'none', cursor: 'pointer', color: '#fff',
                  fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em',
                  fontFamily: T.fontSans,
                  boxShadow: '0 6px 20px rgba(139,111,199,0.35)',
                  WebkitTapHighlightColor: 'transparent' as any,
                }}
              >
                Choose a feeling
              </button>
            </div>
          </motion.div>
        )}

        {step === 'emotion' && (
          <motion.div
            key="emotion"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.22 }}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              padding: '56px 24px 40px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <button onClick={() => setStep('compose')} style={chromeBtn}>
                <Icon name="back" size={20} color={T.ink} />
              </button>
              <div>
                <div style={{
                  fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: T.inkMuted, marginBottom: 3,
                }}>How did it feel?</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: T.ink, letterSpacing: '-0.02em' }}>
                  Choose a feeling
                </div>
              </div>
            </div>

            {/* 3x2 emotion grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, flex: 1,
            }}>
              {EMOTIONS_LIST.map(([kind, e]) => {
                const isActive = emotion === kind;
                return (
                  <button
                    key={kind}
                    onClick={() => setEmotion(kind)}
                    style={{
                      background: isActive ? e.ring : T.card,
                      border: isActive ? `2px solid ${e.color}` : `1.5px solid ${T.line}`,
                      borderRadius: 18,
                      padding: '18px 12px',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 10,
                      cursor: 'pointer',
                      boxShadow: isActive
                        ? `0 2px 12px ${e.color}40`
                        : '0 1px 3px rgba(58,50,69,0.04)',
                      transition: 'all 0.15s ease',
                      WebkitTapHighlightColor: 'transparent' as any,
                    }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: 26,
                      background: e.ring,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <EmotionGlyph kind={kind} size={28} />
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: 500, color: T.ink,
                      letterSpacing: '-0.01em',
                    }}>{e.label}</div>
                  </button>
                );
              })}
            </div>

            {/* CTA */}
            <button
              disabled={!emotion}
              onClick={() => emotion && setStep('saved')}
              style={{
                width: '100%', height: 54, borderRadius: 18,
                background: emotion
                  ? 'linear-gradient(135deg, #8b6fc7, #d4736a)'
                  : T.lineSoft,
                border: 'none', cursor: emotion ? 'pointer' : 'default',
                color: emotion ? '#fff' : T.inkFaint,
                fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em',
                fontFamily: T.fontSans,
                marginTop: 20,
                boxShadow: emotion ? '0 6px 20px rgba(139,111,199,0.35)' : 'none',
                transition: 'all 0.2s ease',
                WebkitTapHighlightColor: 'transparent' as any,
              }}
            >
              Save to her world
            </button>
          </motion.div>
        )}

        {step === 'saved' && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '40px 24px',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 18, stiffness: 260, delay: 0.1 }}
              style={{
                width: 88, height: 88, borderRadius: 44,
                background: 'linear-gradient(135deg, #8b6fc7, #d4736a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 12px 32px rgba(139,111,199,0.4)',
                marginBottom: 28,
              }}
            >
              <Icon name="check" size={36} color="#fff" strokeWidth={2.4} />
            </motion.div>
            <div style={{
              fontFamily: T.fontSerif, fontStyle: 'italic',
              fontSize: 38, color: T.ink, marginBottom: 12,
              letterSpacing: '-0.02em',
            }}>Kept.</div>
            <div style={{ fontSize: 15, color: T.inkMuted, textAlign: 'center', lineHeight: 1.5 }}>
              This moment is safe in her world.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
