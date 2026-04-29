import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../tokens';
import Icon from '../components/Icon';
import Toggle from '../components/Toggle';
import { useHaptics } from '../hooks/useHaptics';
import type { FamilyMember } from '../types';

interface Props {
  member: FamilyMember | undefined;
  onBack: () => void;
  onRemove: (id: string) => void;
}

const chromeBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 20,
  background: 'rgba(255,255,255,0.85)', border: `1px solid ${T.lineSoft}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent' as any,
};

function Divider() {
  return <div style={{ height: 1, background: T.lineSoft, marginLeft: 20 }} />;
}

export default function MemberDetailScreen({ member, onBack, onRemove }: Props) {
  const { light, medium } = useHaptics();
  const [notifyNew, setNotifyNew] = useState(true);
  const [canAdd, setCanAdd] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  if (!member) {
    return (
      <div style={{
        position: 'absolute', inset: 0, background: T.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: T.fontSans, color: T.inkMuted,
      }}>
        Member not found
      </div>
    );
  }

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
      {/* Top chrome */}
      <div style={{
        position: 'absolute', top: `calc(${T.safeTop} + 2px)`, left: 0, right: 0,
        padding: '0 16px', display: 'flex', justifyContent: 'space-between',
        zIndex: 10,
      }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { light(); onBack(); }} style={chromeBtn}>
          <Icon name="back" size={20} color={T.ink} />
        </motion.button>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto',
        scrollbarWidth: 'none',
      } as any}>
        {/* Hero section */}
        <div style={{
          paddingTop: `calc(${T.safeTop} + 56px)` as any, paddingBottom: 28,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: `linear-gradient(180deg, ${T.bgCool} 0%, ${T.bg} 100%)`,
        }}>
          <div style={{
            width: 96, height: 96, borderRadius: 48,
            background: member.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(58,50,69,0.14)',
            marginBottom: 18,
          }}>
            <span style={{
              fontFamily: T.fontSerif, fontStyle: 'italic',
              fontSize: 40, color: '#fff', fontWeight: 400,
            }}>{member.initial}</span>
          </div>

          <div style={{
            fontFamily: T.fontSerif, fontStyle: 'italic',
            fontSize: 28, color: T.ink, letterSpacing: '-0.02em',
            marginBottom: 6,
          }}>{member.name}</div>

          <div style={{ fontSize: 14, color: T.inkMuted }}>
            {member.relation} · {member.joined}
          </div>
        </div>

        {/* Permissions section */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{
            fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: T.inkMuted, marginBottom: 12, fontWeight: 500,
          }}>Permissions</div>

          <div style={{
            background: T.card, borderRadius: 18, overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '15px 18px',
            }}>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 500, color: T.inkSoft }}>
                  Can view shared memories
                </div>
                <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 2 }}>
                  Always on
                </div>
              </div>
              <Toggle value={true} disabled={true} />
            </div>

            <Divider />

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '15px 18px',
            }}>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 500, color: T.ink }}>
                  Notify on new memories
                </div>
                <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 2 }}>
                  They'll get a gentle nudge
                </div>
              </div>
              <Toggle value={notifyNew} onChange={(v) => { light(); setNotifyNew(v); }} />
            </div>

            <Divider />

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '15px 18px',
            }}>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 500, color: T.ink }}>
                  Can add memories
                </div>
                <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 2 }}>
                  Contribute to the timeline
                </div>
              </div>
              <Toggle value={canAdd} onChange={(v) => { light(); setCanAdd(v); }} />
            </div>
          </div>
        </div>

        {/* Remove button */}
        <div style={{ padding: '0 20px 110px' }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { light(); setShowRemoveConfirm(true); }}
            style={{
              width: '100%', height: 50, borderRadius: 16,
              background: 'transparent',
              border: `1.5px solid #f5c0bc`,
              color: T.blushDeep,
              fontSize: 14.5, fontWeight: 600,
              fontFamily: T.fontSans, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              WebkitTapHighlightColor: 'transparent' as any,
            }}
          >
            <Icon name="trash" size={16} color={T.blushDeep} />
            Remove from family
          </motion.button>
        </div>
      </div>

      {/* Remove confirmation overlay */}
      <AnimatePresence>
        {showRemoveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 200,
              background: 'rgba(58,50,69,0.55)',
              display: 'flex', alignItems: 'flex-end',
            }}
            onClick={() => setShowRemoveConfirm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', background: T.card,
                borderRadius: '24px 24px 0 0',
                padding: '24px 24px 40px',
                fontFamily: T.fontSans,
              }}
            >
              <div style={{
                width: 40, height: 4, borderRadius: 2,
                background: T.lineSoft, margin: '0 auto 24px',
              }} />
              <div style={{ fontSize: 18, fontWeight: 600, color: T.ink, marginBottom: 8 }}>
                Remove {member.name}?
              </div>
              <div style={{ fontSize: 14, color: T.inkMuted, marginBottom: 28, lineHeight: 1.5 }}>
                {member.name} will lose access to the world. You can invite them again later.
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { medium(); setShowRemoveConfirm(false); onRemove(member.id); }}
                style={{
                  width: '100%', height: 52, borderRadius: 16,
                  background: '#d4736a', border: 'none', cursor: 'pointer',
                  color: '#fff', fontSize: 15, fontWeight: 600,
                  fontFamily: T.fontSans, marginBottom: 12,
                  WebkitTapHighlightColor: 'transparent' as any,
                }}
              >
                Yes, remove
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { light(); setShowRemoveConfirm(false); }}
                style={{
                  width: '100%', height: 52, borderRadius: 16,
                  background: 'transparent', border: `1.5px solid ${T.line}`,
                  cursor: 'pointer', color: T.ink, fontSize: 15,
                  fontWeight: 500, fontFamily: T.fontSans,
                  WebkitTapHighlightColor: 'transparent' as any,
                }}
              >
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
