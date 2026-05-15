import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithPopup } from 'firebase/auth';
import { db, auth, googleProvider } from '../firebase';
import { T } from '../tokens';
import Icon from '../components/Icon';
import { useHaptics } from '../hooks/useHaptics';

interface InviteData {
  token: string;
  ownerId: string;
  ownerChildName: string;
  roleName: string;
  permissions: { canView: boolean; canReact: boolean; canAdd: boolean; notifyNew: boolean };
  createdAt: number;
}

interface Props {
  token: string;
  isAuthed: boolean;
  onAccepted: () => void;
  onDecline: () => void;
}

export default function InviteAcceptScreen({ token, isAuthed, onAccepted, onDecline }: Props) {
  const { medium, success } = useHaptics();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'invites', token))
      .then((snap) => {
        if (snap.exists()) setInvite(snap.data() as InviteData);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      setSigningIn(false);
    }
  };

  const handleAccept = async () => {
    if (!invite || !auth.currentUser) return;
    medium();
    setAccepting(true);
    try {
      await setDoc(
        doc(db, 'invites', token, 'acceptances', auth.currentUser.uid),
        {
          userId: auth.currentUser.uid,
          displayName: auth.currentUser.displayName ?? '',
          email: auth.currentUser.email ?? '',
          acceptedAt: Date.now(),
        },
      );
      success();
      setAccepted(true);
      setTimeout(onAccepted, 1500);
    } catch {
      setAccepting(false);
    }
  };

  const container: React.CSSProperties = {
    position: 'absolute', inset: 0, background: T.bg,
    fontFamily: T.fontSans, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: '40px 28px',
  };

  if (loading) {
    return (
      <div style={container}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
          style={{
            width: 28, height: 28, borderRadius: 14,
            border: '2.5px solid rgba(139,111,199,0.2)',
            borderTopColor: T.lavenderDeep,
          }}
        />
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={container}>
        <div style={{
          width: 64, height: 64, borderRadius: 32, background: T.bgCool,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
        }}>
          <Icon name="info" size={28} color={T.inkMuted} />
        </div>
        <div style={{
          fontSize: 22, fontWeight: 500, color: T.ink, marginBottom: 10,
          letterSpacing: '-0.02em', textAlign: 'center',
        }}>Invite not found</div>
        <div style={{ fontSize: 14, color: T.inkMuted, textAlign: 'center', lineHeight: 1.55, marginBottom: 32 }}>
          This link may have expired or already been used.
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onDecline}
          style={{
            height: 50, padding: '0 32px', borderRadius: 16,
            background: T.ink, border: 'none', cursor: 'pointer',
            color: '#fff', fontSize: 14.5, fontWeight: 500, fontFamily: T.fontSans,
            WebkitTapHighlightColor: 'transparent' as any,
          }}
        >
          Back to app
        </motion.button>
      </div>
    );
  }

  if (accepted) {
    return (
      <div style={container}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 260 }}
          style={{
            width: 80, height: 80, borderRadius: 40,
            background: 'linear-gradient(135deg, #7de8b0, #4ab898)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 28px rgba(77,184,152,0.4)', marginBottom: 24,
          }}
        >
          <Icon name="check" size={36} color="#fff" strokeWidth={2.4} />
        </motion.div>
        <div style={{
          fontFamily: T.fontSerif, fontStyle: 'italic',
          fontSize: 28, color: T.ink, marginBottom: 8, letterSpacing: '-0.02em',
        }}>You're in!</div>
        <div style={{ fontSize: 14, color: T.inkMuted, textAlign: 'center', lineHeight: 1.55 }}>
          Welcome to {invite?.ownerChildName}'s world.
        </div>
      </div>
    );
  }

  const permList = [
    invite?.permissions.canView && 'View shared memories',
    invite?.permissions.canReact && 'React and comment',
    invite?.permissions.canAdd && 'Add memories',
  ].filter(Boolean) as string[];

  return (
    <div style={container}>
      {/* Soft orbs */}
      <div style={{
        position: 'absolute', top: 80, right: -40, width: 200, height: 200,
        borderRadius: '50%', background: 'rgba(196,181,232,0.3)', filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 100, left: -40, width: 180, height: 180,
        borderRadius: '50%', background: 'rgba(240,204,200,0.3)', filter: 'blur(36px)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 360, zIndex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}
      >
        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 36,
            background: 'linear-gradient(135deg, #e8e0f8, #d8cef0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(139,111,199,0.2)',
          }}>
            <Icon name="heart" size={32} color={T.lavenderDeep} strokeWidth={1.8} />
          </div>
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{
            fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: T.inkMuted, marginBottom: 12,
          }}>You've been invited</div>
          <div style={{
            fontFamily: T.fontSerif, fontStyle: 'italic',
            fontSize: 32, color: T.ink, lineHeight: 1.1, letterSpacing: '-0.02em',
          }}>
            Join {invite?.ownerChildName}'s<br />world
          </div>
        </div>

        {/* Role badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{
            background: T.bgCool, borderRadius: 999, padding: '5px 14px',
            fontSize: 13, color: T.lavenderDeep, fontWeight: 500,
          }}>
            as {invite?.roleName}
          </div>
        </div>

        {/* Permissions */}
        {permList.length > 0 && (
          <div style={{
            background: T.card, borderRadius: 18,
            boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
            padding: '16px 18px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {permList.map((p) => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="check" size={14} color={T.lavenderDeep} strokeWidth={2.4} />
                <span style={{ fontSize: 14, color: T.inkSoft }}>{p}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {!isAuthed ? (
          <>
            <div style={{ fontSize: 13, color: T.inkMuted, textAlign: 'center', marginBottom: 14, lineHeight: 1.5 }}>
              Sign in to accept this invitation
            </div>
            <motion.button
              whileTap={!signingIn ? { scale: 0.96 } : {}}
              onClick={handleSignIn}
              disabled={signingIn}
              style={{
                width: '100%', height: 54, borderRadius: 18,
                background: '#fff', border: `1.5px solid ${T.line}`,
                cursor: signingIn ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                boxShadow: '0 2px 16px rgba(58,50,69,0.08)',
                fontFamily: T.fontSans, fontSize: 15, fontWeight: 500, color: T.ink,
                WebkitTapHighlightColor: 'transparent' as any,
                marginBottom: 12,
              }}
            >
              {signingIn ? (
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
          </>
        ) : (
          <motion.button
            whileTap={!accepting ? { scale: 0.97 } : {}}
            onClick={handleAccept}
            disabled={accepting}
            style={{
              width: '100%', height: 54, borderRadius: 18,
              background: accepting ? T.lineSoft : 'linear-gradient(135deg, #8b6fc7, #d4736a)',
              border: 'none', cursor: accepting ? 'default' : 'pointer',
              color: accepting ? T.inkFaint : '#fff',
              fontSize: 15, fontWeight: 600, fontFamily: T.fontSans,
              boxShadow: accepting ? 'none' : '0 6px 20px rgba(139,111,199,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              WebkitTapHighlightColor: 'transparent' as any,
              marginBottom: 12,
            }}
          >
            {accepting ? 'Joining…' : 'Accept invitation'}
          </motion.button>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onDecline}
          style={{
            width: '100%', height: 44, borderRadius: 14,
            background: 'none', border: 'none', cursor: 'pointer',
            color: T.inkMuted, fontSize: 14, fontFamily: T.fontSans,
            WebkitTapHighlightColor: 'transparent' as any,
          }}
        >
          No thanks
        </motion.button>
      </motion.div>
    </div>
  );
}
