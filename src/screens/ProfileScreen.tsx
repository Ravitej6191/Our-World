import React from 'react';
import { motion } from 'framer-motion';
import { T } from '../tokens';
import Icon from '../components/Icon';
import { useStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';
import type { Child } from '../types';

interface Props {
  child: Child;
  onBack: () => void;
  onEdit: () => void;
  onOpenSettings: () => void;
  onOpenMilestones: () => void;
  onOpenFamily: () => void;
  onAddChild: () => void;
  memoriesCount: number;
}

const CHILD_PALETTES = [
  'linear-gradient(135deg, #f5c8c0, #e8a0d8)',
  'linear-gradient(135deg, #f8d8b0, #f0b890)',
  'linear-gradient(135deg, #b8e8d0, #90d8c0)',
  'linear-gradient(135deg, #c8b8e8, #a898d8)',
  'linear-gradient(135deg, #f5e0a0, #e8c870)',
  'linear-gradient(135deg, #c0d8c0, #98c8a0)',
];

function computeAge(dob?: { m: string; d: string; y: string }): string {
  if (!dob || !dob.y || !dob.m || !dob.d) return '';
  const birth = new Date(Number(dob.y), Number(dob.m) - 1, Number(dob.d));
  const now = new Date();
  const totalMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (totalMonths < 1) {
    const days = Math.floor((now.getTime() - birth.getTime()) / 86400000);
    return `${days} day${days !== 1 ? 's' : ''} old`;
  }
  if (totalMonths < 24) return `${totalMonths} month${totalMonths !== 1 ? 's' : ''} old`;
  const years = Math.floor(totalMonths / 12);
  const rem = totalMonths % 12;
  return rem > 0 ? `${years} yr ${rem} mo old` : `${years} year${years !== 1 ? 's' : ''} old`;
}

function formatDob(dob?: { m: string; d: string; y: string }): string {
  if (!dob || !dob.y || !dob.m || !dob.d) return '';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const m = months[Number(dob.m) - 1] ?? '';
  return `born ${dob.d} ${m} ${dob.y}`;
}

const chromeBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 20,
  background: 'rgba(255,255,255,0.85)', border: `1px solid ${T.lineSoft}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent' as any,
};

export default function ProfileScreen({
  child, onBack, onEdit, onOpenSettings, onOpenMilestones, onOpenFamily, onAddChild, memoriesCount,
}: Props) {
  const { light } = useHaptics();
  const milestones = useStore((s) => s.milestones);
  const doneMilestones = milestones.filter((m) => m.done);
  const avatarGrad = CHILD_PALETTES[child.colorIdx % CHILD_PALETTES.length];
  const initial = (child.name || 'M')[0].toUpperCase();
  const ageText = computeAge(child.dob);
  const dobText = formatDob(child.dob);

  const PROFILE_ROWS = [
    { icon: 'users',  label: 'Family & sharing',     sub: '3 people',                          action: onOpenFamily },
    { icon: 'star',   label: 'Little firsts',         sub: `${doneMilestones.length} reached`,  action: onOpenMilestones },
    { icon: 'heart',  label: 'Yearly keepsake book',  sub: 'Create your 2025 book',             action: () => {} },
    { icon: 'sun',    label: 'Settings',              sub: 'Privacy, backup, account',          action: onOpenSettings },
    { icon: 'plus',   label: 'Add or switch child',   sub: 'Set up another profile',            action: onAddChild },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'absolute', inset: 0, background: T.bg,
        fontFamily: T.fontSans, overflowY: 'auto',
        scrollbarWidth: 'none',
      } as any}
    >
      {/* Decorative background orbs */}
      <div style={{
        position: 'absolute', top: -30, right: -50, width: 240, height: 240,
        borderRadius: '50%', background: 'rgba(196,181,232,0.22)', filter: 'blur(50px)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', top: 200, left: -60, width: 180, height: 180,
        borderRadius: '50%', background: 'rgba(240,204,200,0.18)', filter: 'blur(40px)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Top chrome */}
      <div style={{
        padding: `calc(${T.safeTop} + 12px) 20px 0`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'relative', zIndex: 1,
      }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { light(); onBack(); }} style={chromeBtn}>
          <Icon name="back" size={20} color={T.ink} />
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { light(); onEdit(); }} style={chromeBtn}>
          <Icon name="edit" size={18} color={T.ink} />
        </motion.button>
      </div>

      {/* Avatar + name */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '28px 24px 0', position: 'relative', zIndex: 1,
      }}>
        <motion.div
          whileTap={{ scale: 0.96 }}
          onClick={() => { light(); onEdit(); }}
          style={{
            width: 110, height: 110, borderRadius: 55,
            background: avatarGrad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 28px rgba(139,111,199,0.22)',
            marginBottom: 16, cursor: 'pointer',
          }}
        >
          <span style={{
            fontFamily: T.fontSerif, fontStyle: 'italic',
            fontSize: 48, color: '#fff', fontWeight: 400,
          }}>{initial}</span>
        </motion.div>

        <div style={{
          fontFamily: T.fontSerif, fontStyle: 'italic',
          fontSize: 30, color: T.ink, marginBottom: 5, letterSpacing: '-0.02em',
        }}>{child.name || 'Mira'}</div>

        <div style={{ fontSize: 13.5, color: T.inkMuted }}>
          {[ageText, dobText].filter(Boolean).join(' · ')}
        </div>
      </div>

      {/* Stats card */}
      <div style={{ padding: '24px 20px 0', position: 'relative', zIndex: 1 }}>
        <div style={{
          background: T.card, borderRadius: 20,
          boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
          display: 'flex',
        }}>
          {[
            { value: String(memoriesCount), label: 'memories' },
            { value: String(doneMilestones.length), label: 'firsts' },
          ].map((stat, i, arr) => (
            <div key={stat.label} style={{
              flex: 1, textAlign: 'center', padding: '20px 8px',
              borderRight: i < arr.length - 1 ? `1px solid ${T.lineSoft}` : 'none',
            }}>
              <div style={{
                fontSize: 28, fontWeight: 700, color: T.ink,
                letterSpacing: '-0.03em', marginBottom: 4,
              }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: T.inkMuted }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ padding: '24px 20px 0', position: 'relative', zIndex: 1 }}>
        <div style={{
          background: T.card, borderRadius: 18, overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
        }}>
          {PROFILE_ROWS.map((row, i, arr) => (
            <React.Fragment key={row.label}>
              <motion.button
                whileTap={{ scale: 0.99, backgroundColor: T.bgCool }}
                onClick={() => { light(); row.action(); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  padding: '15px 16px', background: 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                  WebkitTapHighlightColor: 'transparent' as any,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 12, background: T.bgCool,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon name={row.icon} size={16} color={T.lavenderDeep} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 500, color: T.ink }}>{row.label}</div>
                  <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 1 }}>{row.sub}</div>
                </div>
                <Icon name="chevron" size={14} color={T.inkFaint} />
              </motion.button>
              {i < arr.length - 1 && (
                <div style={{ height: 1, background: T.lineSoft, marginLeft: 66 }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Quote */}
      <div style={{ padding: '20px 20px 110px', position: 'relative', zIndex: 1 }}>
        <div style={{
          background: T.bgCool, borderRadius: 18,
          padding: '20px 22px', textAlign: 'center',
        }}>
          <div style={{
            fontFamily: T.fontSerif, fontStyle: 'italic',
            fontSize: 15.5, color: T.inkSoft, lineHeight: 1.7,
          }}>
            "The days are long, but the years are short."
          </div>
          <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 8 }}>Gretchen Rubin</div>
        </div>
      </div>
    </motion.div>
  );
}
