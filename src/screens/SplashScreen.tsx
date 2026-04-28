import React from 'react';
import { motion } from 'framer-motion';
import { T } from '../tokens';

interface Props { onContinue: () => void; }

export default function SplashScreen({ onContinue }: Props) {
  return (
    <div style={{
      height: '100%', position: 'relative', overflow: 'hidden',
      background: `radial-gradient(ellipse at 30% 25%, #ece8f8, ${T.bg} 55%),
                   radial-gradient(ellipse at 70% 80%, #f8ece8, transparent 55%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Soft orbs */}
      <div style={{
        position: 'absolute', top: 120, left: -60, width: 220, height: 220,
        borderRadius: '50%', background: 'rgba(196,181,232,0.4)', filter: 'blur(30px)',
      }} />
      <div style={{
        position: 'absolute', bottom: 160, right: -40, width: 180, height: 180,
        borderRadius: '50%', background: 'rgba(240,204,200,0.4)', filter: 'blur(28px)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 40px', marginTop: -40 }}
      >
        {/* Logo mark */}
        <div style={{ display: 'inline-flex', marginBottom: 28 }}>
          <svg width="96" height="96" viewBox="0 0 96 96">
            <defs>
              <radialGradient id="lav" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#e0d5f5" />
                <stop offset="100%" stopColor="#b8a0e0" />
              </radialGradient>
              <radialGradient id="bls" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#fae0dc" />
                <stop offset="100%" stopColor="#e8a8a0" />
              </radialGradient>
            </defs>
            <circle cx="34" cy="48" r="26" fill="url(#lav)" opacity="0.9" />
            <circle cx="62" cy="48" r="26" fill="url(#bls)" opacity="0.9" />
            <circle cx="48" cy="48" r="10" fill="#3a3245" opacity="0.92" />
          </svg>
        </div>

        <div style={{
          fontFamily: T.fontSerif, fontStyle: 'italic',
          fontSize: 44, lineHeight: 1.02, color: T.ink,
          fontWeight: 400, letterSpacing: '-0.02em',
        }}>
          Our&nbsp;World
        </div>

        <div style={{
          marginTop: 14, fontSize: 15, color: T.inkSoft,
          letterSpacing: '0.01em', lineHeight: 1.6,
        }}>
          A quiet place for the moments<br />that become your child's story.
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        style={{ position: 'absolute', bottom: 64, left: 0, right: 0, textAlign: 'center' }}
      >
        <button onClick={onContinue} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, color: T.inkMuted, letterSpacing: '0.18em',
          textTransform: 'uppercase', fontFamily: T.fontSans,
          WebkitTapHighlightColor: 'transparent',
        }}>
          Begin
        </button>
      </motion.div>
    </div>
  );
}
