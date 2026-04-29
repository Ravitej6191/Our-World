import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { T } from '../tokens';
import Icon from '../components/Icon';
import { useHaptics } from '../hooks/useHaptics';
import type { Child } from '../types';

interface Props {
  onDone: (child: Child) => void;
  onBack: () => void;
}

const PALETTES = [
  { key: 'blush',   label: 'Blush',  c1: '#f5c8c0', c2: '#e8a0d8' },
  { key: 'peach',   label: 'Peach',  c1: '#f8d8b0', c2: '#f0b890' },
  { key: 'mint',    label: 'Mint',   c1: '#b8e8d0', c2: '#90d8c0' },
  { key: 'dusk',    label: 'Dusk',   c1: '#c8b8e8', c2: '#a898d8' },
  { key: 'honey',   label: 'Honey',  c1: '#f5e0a0', c2: '#e8c870' },
  { key: 'sage',    label: 'Sage',   c1: '#c0d8c0', c2: '#98c8a0' },
];

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function formatDobConfirm(dob: { d: string; m: string; y: string }): string {
  const mn = MONTH_NAMES[Number(dob.m) - 1] ?? '—';
  return `Born ${dob.d || '—'} ${mn} ${dob.y || '—'}`;
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

export default function AddChildFlow({ onDone, onBack }: Props) {
  const { light, medium } = useHaptics();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [dob, setDob] = useState({ d: '', m: '', y: '' });
  const [colorIdx, setColorIdx] = useState(0);
  const total = 4;

  const canProceed =
    (step === 0 && name.trim().length > 0) ||
    (step === 1 && dob.d && dob.m && dob.y) ||
    step === 2 || step === 3;

  const next = () => {
    medium();
    if (step < total - 1) setStep(step + 1);
    else onDone({ name: name || 'Mira', pronouns: 'she / her', colorIdx, dob });
  };
  const prev = () => { light(); step > 0 ? setStep(step - 1) : onBack(); };

  const pal = PALETTES[colorIdx];

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
          Step {step + 1} of {total}
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* Progress bar — only filled + current steps show colour, future are faint tracks */}
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
            {/* Day / Month / Year order */}
            <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: 10 }}>
              <DobField label="Day"   value={dob.d} onChange={(v) => setDob({ ...dob, d: v.replace(/\D/g, '').slice(0, 2) })} placeholder="DD" />
              <DobField label="Month" value={dob.m} onChange={(v) => setDob({ ...dob, m: v.replace(/\D/g, '').slice(0, 2) })} placeholder="MM" />
              <DobField label="Year"  value={dob.y} onChange={(v) => setDob({ ...dob, y: v.replace(/\D/g, '').slice(0, 4) })} placeholder="YYYY" />
            </div>
            <div style={{ fontSize: 13, color: T.inkMuted, marginTop: 20, lineHeight: 1.5 }}>
              We use this to mark weeks, months and milestones on their timeline.
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{
              fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 14,
            }}>Their colour</div>
            <div style={{
              fontSize: 28, lineHeight: 1.15, letterSpacing: '-0.02em', fontWeight: 500,
              display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap',
            }}>
              <span>Pick a shade</span>
              <em style={{ fontFamily: T.fontSerif, fontStyle: 'italic' }}>for {name || 'them'}.</em>
            </div>
            <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              {PALETTES.map((p, i) => (
                <motion.button
                  key={p.key}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => { light(); setColorIdx(i); }}
                  style={{
                    border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  }}
                >
                  <div style={{
                    width: 72, height: 72, borderRadius: 36,
                    background: `linear-gradient(135deg, ${p.c1}, ${p.c2})`,
                    boxShadow: colorIdx === i
                      ? `0 0 0 3px ${T.bg}, 0 0 0 5px ${T.lavenderDeep}`
                      : '0 4px 12px rgba(139,111,199,0.15)',
                    transition: 'box-shadow 0.15s',
                  }} />
                  <div style={{
                    fontSize: 11.5,
                    fontWeight: colorIdx === i ? 600 : 500,
                    color: colorIdx === i ? T.ink : T.inkSoft,
                  }}>
                    {p.label}
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginTop: -40,
          }}>
            <div style={{
              width: 128, height: 128, borderRadius: 64, marginBottom: 28,
              background: `linear-gradient(135deg, ${pal.c1}, ${pal.c2})`,
              border: `4px solid ${T.bg}`,
              boxShadow: '0 12px 32px rgba(139,111,199,0.24)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: T.fontSerif, fontStyle: 'italic', fontSize: 56, color: '#fff' }}>
                {(name || 'M')[0].toUpperCase()}
              </span>
            </div>
            <div style={{
              fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 10,
            }}>
              Everything ready
            </div>
            <div style={{ fontSize: 30, lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 500 }}>
              <em style={{ fontFamily: T.fontSerif, fontStyle: 'italic' }}>{name || 'Mira'}'s</em> world
            </div>
            <div style={{
              fontSize: 14.5, color: T.inkSoft, marginTop: 12,
              maxWidth: 280, lineHeight: 1.55,
            }}>
              {formatDobConfirm(dob)}. Let's begin with today.
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
            WebkitTapHighlightColor: 'transparent' as any,
          }}
        >
          {step === 3 ? 'Open their world' : 'Continue'}
          {step < 3 && <Icon name="chevron" size={16} color={canProceed ? '#fff' : T.inkMuted} strokeWidth={2.2} />}
        </motion.button>
      </div>
    </div>
  );
}

const chromeBtnStyle: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 20,
  background: T.card, border: `1px solid ${T.lineSoft}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', padding: 0,
};
