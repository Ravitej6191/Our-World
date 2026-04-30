import React from 'react';
import { motion } from 'framer-motion';
import { T } from '../tokens';
import Icon from '../components/Icon';
import { useStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';
import { CHILD_PALETTES } from '../shared/constants';

interface Props {
  onBack: () => void;
  onSwitch: () => void;
  onAddChild: () => void;
}

export default function SwitchChildScreen({ onBack, onSwitch, onAddChild }: Props) {
  const { light, medium } = useHaptics();
  const { children, activeChildIdx, switchChildProfile } = useStore();

  const chromeBtn: React.CSSProperties = {
    width: 40, height: 40, borderRadius: 20,
    background: 'rgba(255,255,255,0.85)', border: `1px solid ${T.lineSoft}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent' as any,
  };

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
      {/* Orb */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 220, height: 220,
        borderRadius: '50%', background: 'rgba(196,181,232,0.18)', filter: 'blur(40px)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Header */}
      <div style={{
        padding: `calc(${T.safeTop} + 12px) 24px 0`,
        flexShrink: 0, position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { light(); onBack(); }} style={chromeBtn}>
            <Icon name="back" size={20} color={T.ink} />
          </motion.button>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: T.inkMuted, marginBottom: 5,
            }}>Profiles</div>
            <div style={{
              fontSize: 28, fontWeight: 500, color: T.ink,
              letterSpacing: '-0.02em', lineHeight: 1.1,
            }}>
              Switch{' '}
              <em style={{ fontFamily: T.fontSerif, fontStyle: 'italic' }}>child.</em>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '0 20px 110px',
        scrollbarWidth: 'none', position: 'relative', zIndex: 1,
      } as any}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {children.map((child, idx) => {
            const grad = CHILD_PALETTES[child.colorIdx % CHILD_PALETTES.length];
            const initial = (child.name || '?')[0].toUpperCase();
            const isActive = idx === activeChildIdx;

            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  light();
                  if (!isActive) {
                    switchChildProfile(idx);
                    onSwitch();
                  }
                }}
                style={{
                  background: isActive ? T.bgCool : 'white',
                  borderRadius: 20,
                  border: `1.5px solid ${isActive ? T.lavenderDeep : T.line}`,
                  padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 16,
                  cursor: isActive ? 'default' : 'pointer', width: '100%',
                  boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
                  WebkitTapHighlightColor: 'transparent' as any,
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 26,
                  background: grad,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: isActive ? '0 4px 14px rgba(139,111,199,0.25)' : 'none',
                }}>
                  <span style={{
                    fontFamily: T.fontSerif, fontStyle: 'italic',
                    fontSize: 22, color: '#fff', fontWeight: 400,
                  }}>{initial}</span>
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{
                    fontSize: 16, fontWeight: 600, color: T.ink,
                    letterSpacing: '-0.01em', marginBottom: 3,
                  }}>{child.name}</div>
                  {child.pronouns && (
                    <div style={{ fontSize: 12.5, color: T.inkMuted }}>{child.pronouns}</div>
                  )}
                </div>
                {isActive ? (
                  <div style={{
                    background: T.lavenderDeep, borderRadius: 999,
                    padding: '4px 10px', fontSize: 11, color: '#fff',
                    fontWeight: 600, letterSpacing: '0.04em',
                  }}>Active</div>
                ) : (
                  <Icon name="chevron" size={16} color={T.inkFaint} />
                )}
              </motion.button>
            );
          })}

          {/* Add new child row */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { medium(); onAddChild(); }}
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
              width: 52, height: 52, borderRadius: 26,
              background: T.lineSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon name="plus" size={22} color={T.inkFaint} strokeWidth={1.8} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.inkSoft }}>
                Add another child
              </div>
              <div style={{ fontSize: 12.5, color: T.inkFaint, marginTop: 2 }}>
                Create a new profile
              </div>
            </div>
            <Icon name="chevron" size={16} color={T.inkFaint} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
