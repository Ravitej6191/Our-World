import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { T } from '../tokens';
import Icon from '../components/Icon';
import Toggle from '../components/Toggle';
import type { FamilyMember } from '../types';

interface Props {
  member: FamilyMember | undefined;
  onBack: () => void;
  onRemove: () => void;
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
  const [notifyNew, setNotifyNew] = useState(true);
  const [canAdd, setCanAdd] = useState(false);

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
        <button onClick={onBack} style={chromeBtn}>
          <Icon name="back" size={20} color={T.ink} />
        </button>
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
          {/* Avatar */}
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

          {/* Name */}
          <div style={{
            fontFamily: T.fontSerif, fontStyle: 'italic',
            fontSize: 28, color: T.ink, letterSpacing: '-0.02em',
            marginBottom: 6,
          }}>{member.name}</div>

          {/* Relation + joined */}
          <div style={{ fontSize: 14, color: T.inkMuted }}>
            {member.relation} · {member.joined}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{
            background: T.card, borderRadius: 18,
            boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
            display: 'flex',
          }}>
            {[
              { label: 'Viewed', value: '128' },
              { label: 'Reactions', value: '24' },
              { label: 'Added', value: '3' },
            ].map((stat, i, arr) => (
              <div
                key={stat.label}
                style={{
                  flex: 1, textAlign: 'center',
                  padding: '16px 8px',
                  borderRight: i < arr.length - 1 ? `1px solid ${T.lineSoft}` : 'none',
                }}
              >
                <div style={{
                  fontSize: 22, fontWeight: 700, color: T.ink,
                  letterSpacing: '-0.02em', marginBottom: 3,
                }}>{stat.value}</div>
                <div style={{ fontSize: 11.5, color: T.inkMuted }}>{stat.label}</div>
              </div>
            ))}
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
            {/* Can view — always on, disabled */}
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

            {/* Notify on new */}
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
              <Toggle value={notifyNew} onChange={setNotifyNew} />
            </div>

            <Divider />

            {/* Can add */}
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
              <Toggle value={canAdd} onChange={setCanAdd} />
            </div>
          </div>
        </div>

        {/* Remove button */}
        <div style={{ padding: '0 20px 110px' }}>
          <button
            onClick={onRemove}
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
          </button>
        </div>
      </div>
    </motion.div>
  );
}
