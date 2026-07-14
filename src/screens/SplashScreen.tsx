import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  signInWithPopup, signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { T } from '../tokens';
import { useHaptics } from '../hooks/useHaptics';

interface Props {
  isAuthed: boolean;
  onContinue: () => void;
}

export default function SplashScreen({ isAuthed, onContinue }: Props) {
  const { medium } = useHaptics();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Auto-advance for already-authenticated users
  useEffect(() => {
    if (!isAuthed) return;
    const t = setTimeout(onContinue, 500);
    return () => clearTimeout(t);
  }, [isAuthed, onContinue]);

  // On mobile, signInWithRedirect navigates away and back.
  // When we return, pick up the result here and show a spinner while it resolves.
  // Do NOT show a spinner on cold opens — only when a redirect result is actually present.
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) setLoading(true); // auth state change is about to fire → show spinner
      })
      .catch(() => {
        setError(true);
      });
  }, []);

  const handleGoogle = async () => {
    medium();
    setLoading(true);
    setError(false);

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      // On mobile, popup opens a Chrome Custom Tab with no window.opener,
      // so Firebase can't postMessage the result back. Use redirect instead.
      try {
        await signInWithRedirect(auth, googleProvider);
        // Page navigates away; getRedirectResult picks it up on return
      } catch {
        setError(true);
        setLoading(false);
      }
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      const code = (e as { code?: string } | undefined)?.code;
      const needsRedirect =
        code === 'auth/popup-blocked' ||
        code === 'auth/operation-not-supported-in-this-environment' ||
        code === 'auth/cancelled-popup-request';
      if (needsRedirect) {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch {
          setError(true);
          setLoading(false);
        }
      } else if (code === 'auth/popup-closed-by-user') {
        setLoading(false);
      } else {
        setError(true);
        setLoading(false);
      }
    }
  };

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

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative', zIndex: 2,
          textAlign: 'center', padding: '0 40px',
          marginTop: isAuthed ? -60 : -100,
          transition: 'margin-top 0.6s ease',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7, ease: 'easeOut' }}
          style={{ display: 'inline-flex', marginBottom: 28 }}
        >
          <svg width="96" height="96" viewBox="0 0 96 96">
            <defs>
              <radialGradient id="sp_lav" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#e0d5f5" />
                <stop offset="100%" stopColor="#b8a0e0" />
              </radialGradient>
              <radialGradient id="sp_bls" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#fae0dc" />
                <stop offset="100%" stopColor="#e8a8a0" />
              </radialGradient>
            </defs>
            <circle cx="34" cy="48" r="26" fill="url(#sp_lav)" opacity="0.9" />
            <circle cx="62" cy="48" r="26" fill="url(#sp_bls)" opacity="0.9" />
            <circle cx="48" cy="48" r="10" fill="#3a3245" opacity="0.92" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7, ease: 'easeOut' }}
          style={{
            fontFamily: T.fontSerif, fontStyle: 'italic',
            fontSize: 44, lineHeight: 1.02, color: T.ink,
            fontWeight: 400, letterSpacing: '-0.02em',
          }}
        >
          Our&nbsp;World
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
          style={{
            marginTop: 14, fontSize: 15, color: T.inkSoft,
            letterSpacing: '0.01em', lineHeight: 1.6,
          }}
        >
          A quiet place for the moments<br />that become your child's story.
        </motion.div>
      </motion.div>

      {/* Sign-in button — hidden once authed */}
      <AnimatePresence>
        {!isAuthed && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ delay: 0.75, duration: 0.5, ease: 'easeOut' }}
            style={{
              position: 'absolute', bottom: 60, left: 24, right: 24,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
              zIndex: 2,
            }}
          >
            <motion.button
              whileTap={!loading ? { scale: 0.96 } : {}}
              onClick={handleGoogle}
              disabled={loading}
              style={{
                width: '100%', maxWidth: 340, height: 54, borderRadius: 18,
                background: '#fff',
                border: `1.5px solid ${T.line}`,
                cursor: loading ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                boxShadow: '0 2px 16px rgba(58,50,69,0.08)',
                fontFamily: T.fontSans, fontSize: 15, fontWeight: 500, color: T.ink,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.85, ease: 'linear' }}
                  style={{
                    width: 20, height: 20, borderRadius: 10,
                    border: '2px solid rgba(58,50,69,0.15)',
                    borderTopColor: T.lavenderDeep,
                  }}
                />
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </motion.button>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ fontSize: 13, color: T.blushDeep, textAlign: 'center' }}
                >
                  Sign-in failed. Please try again.
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
