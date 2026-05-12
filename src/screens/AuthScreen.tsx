import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { T } from '../tokens';
import Icon from '../components/Icon';

interface Props {
  onAuth: () => void;
}

type Mode = 'signin' | 'signup';

export default function AuthScreen({ onAuth }: Props) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      onAuth();
    } catch (e: any) {
      const code = e?.code ?? '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Incorrect email or password.');
      } else if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code.includes('network') || code.includes('unavailable')) {
        setError('No connection. Check your internet and try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onAuth();
    } catch (e: any) {
      if (e?.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = email.trim().length > 0 && password.length >= 6 && !loading;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(160deg, #f0ebf8 0%, #faf5f0 50%, #f0f5fb 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', fontFamily: T.fontSans,
      padding: `calc(${T.safeTop} + 20px) 28px calc(${T.safeBottom} + 20px)`,
    }}>
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 40, textAlign: 'center' }}
      >
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: 'linear-gradient(135deg, #8b6fc7, #d4736a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(139,111,199,0.35)',
        }}>
          <Icon name="heart" size={28} color="#fff" strokeWidth={1.8} />
        </div>
        <div style={{
          fontFamily: T.fontSerif, fontStyle: 'italic',
          fontSize: 28, color: T.ink, letterSpacing: '-0.02em',
        }}>Our World</div>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          width: '100%', maxWidth: 380,
          background: 'rgba(255,255,255,0.9)',
          borderRadius: 24, padding: '28px 24px',
          boxShadow: '0 8px 32px rgba(58,50,69,0.1)',
          border: `1px solid ${T.lineSoft}`,
        }}
      >
        {/* Mode toggle */}
        <div style={{
          display: 'flex', background: T.lineSoft,
          borderRadius: 14, padding: 3, marginBottom: 24,
        }}>
          {(['signin', 'signup'] as Mode[]).map((m) => (
            <motion.button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              whileTap={{ scale: 0.97 }}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 11, border: 'none',
                cursor: 'pointer', fontSize: 14, fontWeight: 500,
                fontFamily: T.fontSans,
                background: mode === m ? '#fff' : 'transparent',
                color: mode === m ? T.ink : T.inkMuted,
                boxShadow: mode === m ? '0 1px 3px rgba(58,50,69,0.08)' : 'none',
                transition: 'all 0.15s ease',
                WebkitTapHighlightColor: 'transparent' as any,
              }}
            >
              {m === 'signin' ? 'Sign in' : 'Create account'}
            </motion.button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Email */}
          <div style={{
            background: T.bg, border: `1px solid ${T.line}`,
            borderRadius: 14, padding: '13px 16px',
          }}>
            <div style={{
              fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 6,
            }}>Email</div>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              placeholder="you@example.com"
              autoComplete="email"
              style={{
                width: '100%', border: 'none', outline: 'none',
                background: 'transparent', fontSize: 16, color: T.ink,
                fontFamily: T.fontSans,
              } as any}
            />
          </div>

          {/* Password */}
          <div style={{
            background: T.bg, border: `1px solid ${T.line}`,
            borderRadius: 14, padding: '13px 16px',
          }}>
            <div style={{
              fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 6,
            }}>Password</div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              style={{
                width: '100%', border: 'none', outline: 'none',
                background: 'transparent', fontSize: 16, color: T.ink,
                fontFamily: T.fontSans,
              } as any}
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  fontSize: 13, color: T.blushDeep,
                  background: '#fce8e6', borderRadius: 10,
                  padding: '10px 14px', lineHeight: 1.4,
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            whileTap={canSubmit ? { scale: 0.97 } : {}}
            disabled={!canSubmit}
            onClick={handleSubmit}
            style={{
              width: '100%', height: 52, borderRadius: 16,
              background: canSubmit
                ? 'linear-gradient(135deg, #8b6fc7, #d4736a)'
                : T.lineSoft,
              border: 'none', cursor: canSubmit ? 'pointer' : 'default',
              color: canSubmit ? '#fff' : T.inkFaint,
              fontSize: 15, fontWeight: 600, fontFamily: T.fontSans,
              boxShadow: canSubmit ? '0 6px 20px rgba(139,111,199,0.35)' : 'none',
              transition: 'all 0.2s ease',
              WebkitTapHighlightColor: 'transparent' as any,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                style={{
                  width: 18, height: 18, borderRadius: 9,
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#fff',
                }}
              />
            ) : (mode === 'signin' ? 'Sign in' : 'Create account')}
          </motion.button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: T.lineSoft }} />
            <span style={{ fontSize: 12, color: T.inkFaint }}>or</span>
            <div style={{ flex: 1, height: 1, background: T.lineSoft }} />
          </div>

          {/* Google */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: '100%', height: 52, borderRadius: 16,
              background: '#fff', border: `1.5px solid ${T.line}`,
              cursor: 'pointer', color: T.ink,
              fontSize: 15, fontWeight: 500, fontFamily: T.fontSans,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              WebkitTapHighlightColor: 'transparent' as any,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
