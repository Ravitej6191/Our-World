import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../tokens';
import Icon from '../components/Icon';

interface Props { onDone: () => void; }

const pages = [
  {
    tone: 'lavender',
    eyebrow: 'Welcome',
    title: ['Preserve ', 'moments,', '\nnot just photos.'],
    titleItalic: 'moments,',
    body: "The small sounds, the first time they reached for you — the things you think you'll always remember.",
  },
  {
    tone: 'blush',
    eyebrow: 'Capture',
    title: ['A memory\nin ', 'two taps.'],
    titleItalic: 'two taps.',
    body: 'Photo, a little voice note, a line of feeling. Nothing to set up, nothing to sort. Just today, saved.',
  },
  {
    tone: 'dusk',
    eyebrow: 'Together',
    title: ['Only the people\nwho ', 'love them.'],
    titleItalic: 'love them.',
    body: 'Invite grandparents, a partner, a close friend. Everything stays private unless you choose to share.',
  },
];

function OnboardingIllo({ tone }: { tone: string }) {
  const bg = tone === 'lavender'
    ? 'linear-gradient(160deg, #e8e0f8, #d8ccf0)'
    : tone === 'blush'
    ? 'linear-gradient(160deg, #fae8e5, #f5d8d4)'
    : 'linear-gradient(160deg, #e0d5f5, #d8c8f0, #f5e0d8)';

  if (tone === 'lavender') {
    return (
      <div style={{ width: '100%', height: '100%', background: bg, position: 'relative', overflow: 'hidden' }}>
        <svg viewBox="0 0 300 420" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <circle cx="150" cy="200" r="88" fill="rgba(196,181,232,0.6)" />
          <circle cx="150" cy="200" r="88" fill="none" stroke="rgba(139,111,199,0.3)" strokeWidth="1" />
          <circle cx="150" cy="200" r="120" fill="none" stroke="rgba(139,111,199,0.2)" strokeWidth="1" strokeDasharray="2 6" />
          <circle cx="132" cy="185" r="4" fill="#3a3245" />
          <circle cx="168" cy="185" r="4" fill="#3a3245" />
          <path d="M130 215c6 9 14 12 20 12s14-3 20-12" stroke="#3a3245" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M240 90c-6-6-16-3-16 6 0 7 10 15 16 20 6-5 16-13 16-20 0-9-10-12-16-6z" fill="#f0a0a8" />
          <circle cx="60" cy="330" r="9" fill="#e8c870" />
          <circle cx="250" cy="340" r="6" fill="#93c5e8" />
        </svg>
      </div>
    );
  }
  if (tone === 'blush') {
    return (
      <div style={{ width: '100%', height: '100%', background: bg, position: 'relative', overflow: 'hidden' }}>
        <svg viewBox="0 0 300 420" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <g transform="translate(60 110) rotate(-8 90 110)">
            <rect x="0" y="0" width="180" height="220" rx="20" fill="#fae0d8" />
            <rect x="16" y="16" width="148" height="148" rx="12" fill="#f5c8b8" />
            <rect x="16" y="180" width="90" height="8" rx="4" fill="#e8a898" />
          </g>
          <g transform="translate(80 140) rotate(6 90 110)">
            <rect x="0" y="0" width="180" height="220" rx="20" fill="#fff" />
            <rect x="16" y="16" width="148" height="148" rx="12" fill="#fae8d8" />
            <rect x="16" y="180" width="110" height="8" rx="4" fill="#f0c8a8" />
          </g>
          <circle cx="220" cy="340" r="28" fill="none" stroke="#d4736a" strokeWidth="2" />
          <circle cx="220" cy="340" r="18" fill="#e8a098" />
          <path d="M213 340l5 5 10-10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    );
  }
  return (
    <div style={{ width: '100%', height: '100%', background: bg, position: 'relative', overflow: 'hidden' }}>
      <svg viewBox="0 0 300 420" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <circle cx="100" cy="200" r="58" fill="rgba(196,181,232,0.7)" />
        <circle cx="200" cy="180" r="48" fill="rgba(240,200,196,0.7)" />
        <circle cx="160" cy="270" r="42" fill="rgba(240,216,184,0.7)" />
        <path d="M135 215 Q160 180 190 185" stroke="rgba(139,111,199,0.45)" strokeWidth="1.4" fill="none" strokeDasharray="3 5" />
        <path d="M188 210 Q180 245 172 255" stroke="rgba(139,111,199,0.45)" strokeWidth="1.4" fill="none" strokeDasharray="3 5" />
        {([[100,200],[200,180],[160,270]] as [number,number][]).map(([x,y],i) => (
          <g key={i}>
            <circle cx={x-10} cy={y-5} r="2.5" fill="#3a3245" />
            <circle cx={x+10} cy={y-5} r="2.5" fill="#3a3245" />
            <path d={`M${x-8} ${y+8}q8 6 16 0`} stroke="#3a3245" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function OnboardingScreen({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const p = pages[step];
  const next = () => step < pages.length - 1 ? setStep(step + 1) : onDone();

  return (
    <div style={{
      height: '100%', background: T.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, margin: '60px 20px 0', borderRadius: 32, overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}
            style={{ position: 'absolute', inset: 0 }}>
            <OnboardingIllo tone={p.tone} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{ padding: '28px 32px 0' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 14 }}>
          {p.eyebrow}
        </div>
        <div style={{ fontSize: 30, lineHeight: 1.12, color: T.ink, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 14 }}>
          {p.title[0]}
          <em style={{ fontFamily: T.fontSerif, fontWeight: 400, fontStyle: 'italic' }}>{p.titleItalic}</em>
          {p.title[1] && !p.title[0].includes(p.titleItalic) ? p.title[1] : ''}
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.5, color: T.inkSoft, maxWidth: 300 }}>{p.body}</div>
      </div>

      <div style={{ padding: '28px 24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {pages.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 22 : 6, height: 6, borderRadius: 3,
              background: i === step ? T.lavenderDeep : T.line,
              transition: 'width 0.25s',
            }} />
          ))}
        </div>
        <button onClick={next} style={{
          height: 52, padding: '0 28px',
          background: T.ink, color: '#fff', border: 'none', borderRadius: 26,
          cursor: 'pointer', fontSize: 15, fontWeight: 500,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: T.fontSans, WebkitTapHighlightColor: 'transparent',
        }}>
          {step === pages.length - 1 ? 'Create profile' : 'Continue'}
          <Icon name="chevron" size={16} color="#fff" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
