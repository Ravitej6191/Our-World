import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { T } from '../tokens';
import Icon from '../components/Icon';
import { useHaptics } from '../hooks/useHaptics';
import { GLASS_CHROME_BTN } from '../shared/constants';
import type { Child } from '../types';

export type ChildFlowMode = 'setup' | 'edit' | 'add';

interface Props {
  onDone: (child: Omit<Child, 'id'>) => void;
  onBack: () => void;
  mode?: ChildFlowMode;
  initialChild?: Child;
}

const PALETTES = [
  { key: 'blush',   label: 'Blush',  c1: '#f5c8c0', c2: '#e8a0d8' },
  { key: 'peach',   label: 'Peach',  c1: '#f8d8b0', c2: '#f0b890' },
  { key: 'mint',    label: 'Mint',   c1: '#b8e8d0', c2: '#90d8c0' },
  { key: 'dusk',    label: 'Dusk',   c1: '#c8b8e8', c2: '#a898d8' },
  { key: 'honey',   label: 'Honey',  c1: '#f5e0a0', c2: '#e8c870' },
  { key: 'sage',    label: 'Sage',   c1: '#c0d8c0', c2: '#98c8a0' },
];

// Only used for confirmation avatar display; user no longer picks shade manually

const PRONOUNS_OPTIONS = [
  { label: 'she / her',   value: 'she / her'   },
  { label: 'he / him',    value: 'he / him'    },
  { label: 'they / them', value: 'they / them' },
];

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function formatDobConfirm(dob: { d: string; m: string; y: string }): string {
  const mn = MONTH_NAMES[Number(dob.m) - 1] ?? '—';
  return `Born ${dob.d || '—'} ${mn} ${dob.y || '—'}`;
}

function validateDob(dob: { d: string; m: string; y: string }): string | null {
  const d = Number(dob.d);
  const m = Number(dob.m);
  const y = Number(dob.y);
  const now = new Date();
  if (!d || !m || !y) return null;
  if (m < 1 || m > 12) return 'Month must be between 1 and 12';
  if (d < 1 || d > 31) return 'Day must be between 1 and 31';
  if (y < 1900) return 'Year must be after 1900';
  const birth = new Date(y, m - 1, d);
  if (birth > now) return "Date of birth can't be in the future";
  const daysInMonth = new Date(y, m, 0).getDate();
  if (d > daysInMonth) return `${MONTH_NAMES[m - 1]} only has ${daysInMonth} days`;
  return null;
}

function DobField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <div style={{
        fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase',
        color: T.inkMuted, marginBottom: 6,
      }}>{label}</div>
      <input
        value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} inputMode="numeric"
        style={{
          width: '100%', height: 54, textAlign: 'center',
          border: `1px solid ${value ? T.lavenderDeep : T.lineSoft}`,
          background: T.card, borderRadius: 14,
          fontSize: 20, fontWeight: 500, color: T.ink,
          fontFamily: T.fontSans, outline: 'none',
        }}
      />
    </div>
  );
}

export default function AddChildFlow({ onDone, onBack, mode = 'setup', initialChild }: Props) {
  const { light, medium } = useHaptics();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initialChild?.name ?? '');
  const [dob, setDob] = useState(initialChild?.dob ?? { d: '', m: '', y: '' });
  const [dobError, setDobError] = useState<string | null>(null);
  const [pronouns, setPronouns] = useState(initialChild?.pronouns ?? 'she / her');
  const [colorIdx] = useState(initialChild?.colorIdx ?? 0);
  const [photoUri, setPhotoUri] = useState(initialChild?.photoUri);
  const total = 3;

  const pickPhoto = async () => {
    light();
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        quality: 85,
      });
      if (photo.dataUrl) setPhotoUri(photo.dataUrl);
    } catch { /* cancelled or permission denied */ }
  };

  const dobFilled = dob.d && dob.m && dob.y;
  const canProceed =
    (step === 0 && name.trim().length > 0) ||
    (step === 1 && !!dobFilled && !dobError) ||
    step === 2;

  const next = () => {
    if (step === 1) {
      const err = validateDob(dob);
      if (err) { setDobError(err); return; }
      setDobError(null);
    }
    medium();
    if (step < total - 1) setStep(step + 1);
    else onDone({ name: name.trim(), pronouns, colorIdx, dob, photoUri });
  };

  // colorIdx is kept in state so existing profiles preserve their color on edit
  const prev = () => {
    light();
    if (step > 0) setStep(step - 1);
    else onBack();
  };

  const pal = PALETTES[colorIdx];

  const ctaLabel = () => {
    if (step < total - 1) return 'Continue';
    if (mode === 'edit') return 'Save changes';
    if (mode === 'add') return 'Add to world';
    return 'Open their world';
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, background: T.bg,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Chrome */}
      <div style={{
        padding: `calc(${T.safeTop} + 12px) 16px 8px`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={prev} style={chromeBtnStyle}>
          <Icon name="back" size={20} color={T.ink} />
        </motion.button>
        <div style={{
          fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.inkMuted,
        }}>
          {mode === 'edit' ? 'Edit profile' : mode === 'add' ? 'New child' : `Step ${step + 1} of ${total}`}
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* Progress bar */}
      <div style={{ padding: '6px 24px 4px', display: 'flex', gap: 6 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= step ? T.lavenderDeep : 'rgba(139,111,199,0.12)',
            transition: 'background 0.25s',
          }} />
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '32px 28px 0', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {step === 0 && (
          <>
            <div style={{
              fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 14,
            }}>Their name</div>
            <div style={{
              fontSize: 28, lineHeight: 1.15, letterSpacing: '-0.02em', fontWeight: 500,
              display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap',
            }}>
              <span>What do we</span>
              <em style={{ fontFamily: T.fontSerif, fontStyle: 'italic' }}>call them?</em>
            </div>
            <div style={{ marginTop: 36 }}>
              <input
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Mira" autoFocus
                style={{
                  width: '100%', border: 'none', outline: 'none', background: 'transparent',
                  fontFamily: T.fontSerif, fontStyle: 'italic', fontSize: 38, color: T.ink,
                  padding: '0 0 14px',
                  borderBottom: `2px solid ${name.trim() ? T.lavenderDeep : T.lineSoft}`,
                  letterSpacing: '-0.02em',
                }}
              />
              <div style={{ fontSize: 13, color: T.inkMuted, marginTop: 14, lineHeight: 1.5 }}>
                The name you use for them. You can change this any time.
              </div>
            </div>

            {/* Pronouns picker */}
            <div style={{ marginTop: 32 }}>
              <div style={{
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: T.inkMuted, marginBottom: 12,
              }}>Pronouns</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {PRONOUNS_OPTIONS.map((p) => (
                  <motion.button
                    key={p.value}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => { light(); setPronouns(p.value); }}
                    style={{
                      padding: '8px 18px', borderRadius: 999,
                      background: pronouns === p.value ? T.lavenderDeep : T.card,
                      border: `1.5px solid ${pronouns === p.value ? T.lavenderDeep : T.line}`,
                      color: pronouns === p.value ? '#fff' : T.inkSoft,
                      fontSize: 14, fontWeight: pronouns === p.value ? 600 : 400,
                      cursor: 'pointer', fontFamily: T.fontSans,
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    {p.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div style={{
              fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 14,
            }}>The day they arrived</div>
            <div style={{
              fontSize: 28, lineHeight: 1.15, letterSpacing: '-0.02em', fontWeight: 500,
              display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap',
            }}>
              <span>When was</span>
              <em style={{ fontFamily: T.fontSerif, fontStyle: 'italic' }}>{name || 'they'} born?</em>
            </div>
            <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: 10 }}>
              <DobField label="Day"   value={dob.d} onChange={(v) => { setDob({ ...dob, d: v.replace(/\D/g, '').slice(0, 2) }); setDobError(null); }} placeholder="DD" />
              <DobField label="Month" value={dob.m} onChange={(v) => { setDob({ ...dob, m: v.replace(/\D/g, '').slice(0, 2) }); setDobError(null); }} placeholder="MM" />
              <DobField label="Year"  value={dob.y} onChange={(v) => { setDob({ ...dob, y: v.replace(/\D/g, '').slice(0, 4) }); setDobError(null); }} placeholder="YYYY" />
            </div>
            <AnimatePresence>
              {dobError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  style={{
                    marginTop: 12, padding: '10px 14px', borderRadius: 10,
                    background: '#fce8e6', border: `1px solid #f5c0bc`,
                    fontSize: 13, color: T.blushDeep, lineHeight: 1.4,
                  }}
                >
                  {dobError}
                </motion.div>
              )}
            </AnimatePresence>
            <div style={{ fontSize: 13, color: T.inkMuted, marginTop: 16, lineHeight: 1.5 }}>
              We use this to mark weeks, months and milestones on their timeline.
            </div>
          </>
        )}

        {step === 2 && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginTop: -40,
          }}>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={pickPhoto}
              style={{
                position: 'relative', width: 128, height: 128, borderRadius: 64, marginBottom: 28,
                background: photoUri ? 'transparent' : `linear-gradient(135deg, ${pal.c1}, ${pal.c2})`,
                border: `4px solid ${T.bg}`, padding: 0, cursor: 'pointer',
                boxShadow: '0 12px 32px rgba(139,111,199,0.24)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {photoUri ? (
                <img src={photoUri} style={{ width: '100%', height: '100%', borderRadius: 60, objectFit: 'cover' }} />
              ) : (
                <span style={{ fontFamily: T.fontSerif, fontStyle: 'italic', fontSize: 56, color: '#fff' }}>
                  {(name || 'M')[0].toUpperCase()}
                </span>
              )}
              <div style={{
                position: 'absolute', right: -2, bottom: -2, width: 38, height: 38, borderRadius: 19,
                background: T.ink, border: `3px solid ${T.bg}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="camera" size={16} color="#fff" strokeWidth={2} />
              </div>
            </motion.button>
            <div style={{ fontSize: 12.5, color: T.inkMuted, marginBottom: 18, marginTop: -18 }}>
              {photoUri ? 'Tap to change photo' : 'Tap to add a photo'}
            </div>
            <div style={{
              fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 10,
            }}>
              {mode === 'edit' ? 'Changes ready' : 'Everything ready'}
            </div>
            <div style={{ fontSize: 30, lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 500 }}>
              <em style={{ fontFamily: T.fontSerif, fontStyle: 'italic' }}>{name}'s</em> world
            </div>
            <div style={{
              fontSize: 14.5, color: T.inkSoft, marginTop: 12,
              maxWidth: 280, lineHeight: 1.55,
            }}>
              {dob.d && dob.m && dob.y
                ? formatDobConfirm(dob) + '. ' + (mode === 'edit' ? "Profile updated." : "Let's begin with today.")
                : mode === 'edit' ? 'Your changes are ready to save.' : "Let's begin."}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '24px 24px 40px' }}>
        <motion.button
          whileTap={canProceed ? { scale: 0.97 } : {}}
          onClick={next}
          disabled={!canProceed}
          style={{
            width: '100%', height: 54,
            background: canProceed ? T.ink : T.line,
            color: canProceed ? '#fff' : T.inkMuted,
            border: 'none', borderRadius: 27, cursor: canProceed ? 'pointer' : 'not-allowed',
            fontSize: 15.5, fontWeight: 500, fontFamily: T.fontSans,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.15s',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {ctaLabel()}
          {step < 2 && <Icon name="chevron" size={16} color={canProceed ? '#fff' : T.inkMuted} strokeWidth={2.2} />}
        </motion.button>
      </div>
    </div>
  );
}

const chromeBtnStyle = GLASS_CHROME_BTN;
