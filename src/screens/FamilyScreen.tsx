import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { T } from '../tokens';
import Icon from '../components/Icon';
import { useStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';
import type { FamilyMember } from '../types';

interface Props {
  onBack: () => void;
  onOpenMember: (id: string) => void;
  onInvite: () => void;
}

const chromeBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 20,
  background: 'rgba(255,255,255,0.85)', border: `1px solid ${T.lineSoft}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent' as any,
};

function MemberRow({ member, onOpen }: { member: FamilyMember; onOpen: () => void }) {
  const { light } = useHaptics();
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={() => { light(); onOpen(); }}
      style={{
        background: 'white', borderRadius: 20,
        border: `1px solid ${T.line}`,
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 16,
        cursor: 'pointer', width: '100%',
        boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
        WebkitTapHighlightColor: 'transparent' as any,
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 24,
        background: member.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: T.fontSerif, fontStyle: 'italic',
          fontSize: 20, color: '#fff', fontWeight: 400,
        }}>{member.initial}</span>
      </div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{
          fontSize: 15, fontWeight: 600, color: T.ink,
          letterSpacing: '-0.01em', marginBottom: 3,
        }}>{member.name}</div>
        <div style={{ fontSize: 12.5, color: T.inkMuted }}>
          {member.relation} · {member.joined}
        </div>
      </div>
      <Icon name="chevron" size={16} color={T.inkFaint} />
    </motion.button>
  );
}

export default function FamilyScreen({ onBack, onOpenMember, onInvite }: Props) {
  const { light, medium } = useHaptics();
  const members = useStore((s) => s.members);
  const [privacyMode, setPrivacyMode] = useState<'just' | 'shared'>('just');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'absolute', inset: 0, background: T.bg,
        fontFamily: T.fontSans, display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Decorative orbs */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 200, height: 200,
        borderRadius: '50%', background: 'rgba(196,181,232,0.18)', filter: 'blur(40px)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Header */}
      <div style={{ padding: `calc(${T.safeTop} + 12px) 24px 0`, flexShrink: 0, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { light(); onBack(); }} style={chromeBtn}>
            <Icon name="back" size={20} color={T.ink} />
          </motion.button>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 5,
            }}>Family · {members.length} {members.length === 1 ? 'person' : 'people'}</div>
            <div style={{
              fontSize: 28, fontWeight: 500, color: T.ink,
              letterSpacing: '-0.02em', lineHeight: 1.1,
            }}>
              The people{' '}
              <em style={{ fontFamily: T.fontSerif, fontStyle: 'italic' }}>who love her.</em>
            </div>
          </div>
        </div>

        {/* Privacy pill switcher */}
        <div style={{
          display: 'flex', background: T.lineSoft,
          borderRadius: 14, padding: 3,
          marginBottom: 24,
          width: 'fit-content',
        }}>
          {(['just', 'shared'] as const).map((mode) => (
            <motion.button
              key={mode}
              whileTap={{ scale: 0.95 }}
              onClick={() => { light(); setPrivacyMode(mode); }}
              style={{
                padding: '8px 18px', borderRadius: 11, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 500, fontFamily: T.fontSans,
                background: privacyMode === mode ? T.card : 'transparent',
                color: privacyMode === mode ? T.ink : T.inkMuted,
                boxShadow: privacyMode === mode ? '0 1px 3px rgba(58,50,69,0.08)' : 'none',
                transition: 'all 0.15s ease',
                WebkitTapHighlightColor: 'transparent' as any,
                whiteSpace: 'nowrap',
              }}
            >
              {mode === 'just' ? 'Just me' : 'Shared'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Scrollable list */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '0 20px 110px',
        scrollbarWidth: 'none', position: 'relative', zIndex: 1,
      } as any}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              onOpen={() => onOpenMember(member.id)}
            />
          ))}

          {/* Invite row */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { medium(); onInvite(); }}
            style={{
              background: 'transparent',
              border: `1.5px dashed ${T.line}`,
              borderRadius: 20, padding: '16px 18px',
              display: 'flex', alignItems: 'center', gap: 16,
              cursor: 'pointer', width: '100%',
              WebkitTapHighlightColor: 'transparent' as any,
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 24,
              background: T.lineSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon name="plus" size={20} color={T.inkFaint} strokeWidth={1.8} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: T.inkSoft }}>
                Invite someone
              </div>
              <div style={{ fontSize: 12.5, color: T.inkFaint, marginTop: 2 }}>
                Give someone close a quiet window in
              </div>
            </div>
            <Icon name="chevron" size={16} color={T.inkFaint} />
          </motion.button>
        </div>

        {/* Info note */}
        <div style={{
          marginTop: 24,
          background: T.bgCool,
          borderRadius: 16, padding: '14px 16px',
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <Icon name="shield" size={18} color={T.lavenderDeep} />
          <div style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.55 }}>
            People you invite can only see what you choose to share. You're always in control.
          </div>
        </div>
      </div>
    </motion.div>
  );
}
