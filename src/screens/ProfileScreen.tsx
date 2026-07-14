import React, { useMemo } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { T } from '../tokens';
import Icon from '../components/Icon';
import Toggle from '../components/Toggle';
import { useStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';
import { CHILD_PALETTES, GLASS_HEADER, GLASS_CHROME_BTN, filterByActiveChild } from '../shared/constants';
import type { Child } from '../types';

interface Props {
  child: Child;
  children: Child[];
  onBack: () => void;
  onEdit: () => void;
  onOpenKeepsake: () => void;
  onAddChild: () => void;
  memoriesCount: number;
}

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

const ITEM_W = 96;

export default function ProfileScreen({
  child, children, onBack, onEdit, onOpenKeepsake, onAddChild, memoriesCount,
}: Props) {
  const { light, medium } = useHaptics();
  const allMilestones = useStore((s) => s.milestones);
  const firstChildId = useStore((s) => s.children[0]?.id ?? s.child.id);
  const milestones = useMemo(
    () => filterByActiveChild(allMilestones, child.id, firstChildId),
    [allMilestones, child.id, firstChildId],
  );
  const showToast = useStore((s) => s.showToast);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const switchChildProfile = useStore((s) => s.switchChildProfile);
  const activeChildIdx = useStore((s) => s.activeChildIdx);
  const doneMilestones = milestones.filter((m) => m.done);
  const ageText = computeAge(child.dob);
  const dobText = formatDob(child.dob);
  const currentYear = new Date().getFullYear();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch {
      showToast({ text: 'Could not sign out. Try again.', variant: 'error' });
    }
  };

  const handleDragEnd = (_e: unknown, info: PanInfo) => {
    if ((info.offset.x < -40 || info.velocity.x < -400) && activeChildIdx < children.length - 1) {
      light();
      switchChildProfile(activeChildIdx + 1);
    } else if ((info.offset.x > 40 || info.velocity.x > 400) && activeChildIdx > 0) {
      light();
      switchChildProfile(activeChildIdx - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'absolute', inset: 0, background: T.bg,
        fontFamily: T.fontSans, overflowY: 'auto',
        scrollbarWidth: 'none',
      }}
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
        ...GLASS_HEADER,
        padding: `calc(${T.safeTop} + 12px) 20px 12px`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { light(); onBack(); }} style={GLASS_CHROME_BTN}>
          <Icon name="back" size={20} color={T.ink} />
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { light(); onEdit(); }} style={GLASS_CHROME_BTN}>
          <Icon name="edit" size={18} color={T.ink} />
        </motion.button>
      </div>

      {/* Swipeable child carousel */}
      <div style={{ padding: '24px 0 0', position: 'relative', zIndex: 1 }}>
        <div style={{ overflow: 'hidden', position: 'relative', height: 128 }}>
          <motion.div
            drag={children.length > 1 ? 'x' : false}
            dragConstraints={{ left: -Math.max(children.length - 1, 0) * ITEM_W, right: 0 }}
            dragElastic={0.12}
            animate={{ x: -activeChildIdx * ITEM_W }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onDragEnd={handleDragEnd}
            style={{
              display: 'flex', width: 'fit-content',
              paddingLeft: `calc(50% - ${ITEM_W / 2}px)`,
              cursor: children.length > 1 ? 'grab' : 'default', touchAction: 'pan-y',
            }}
          >
            {children.map((c, idx) => {
              const isActive = idx === activeChildIdx;
              const grad = CHILD_PALETTES[c.colorIdx % CHILD_PALETTES.length];
              const init = (c.name || '?')[0].toUpperCase();
              return (
                <motion.button
                  key={c.id}
                  whileTap={{ scale: isActive ? 0.96 : 0.9 }}
                  onClick={() => { if (!isActive) { light(); switchChildProfile(idx); } }}
                  animate={{ scale: isActive ? 1 : 0.7, opacity: isActive ? 1 : 0.45 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                  style={{
                    width: ITEM_W, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div style={{
                    width: 92, height: 92, borderRadius: 46,
                    background: c.photoUri ? 'transparent' : grad,
                    overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isActive ? '0 8px 28px rgba(139,111,199,0.24)' : 'none',
                  }}>
                    {c.photoUri ? (
                      <img src={c.photoUri} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontFamily: T.fontSerif, fontStyle: 'italic', fontSize: 36, color: '#fff' }}>{init}</span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '4px 24px 0', position: 'relative', zIndex: 1,
        }}>
          <div style={{
            fontFamily: T.fontSerif, fontStyle: 'italic',
            fontSize: 28, color: T.ink, marginBottom: 8, letterSpacing: '-0.02em',
          }}>{child.name}</div>

          <div style={{ fontSize: 13, color: T.inkMuted, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {child.pronouns && (
              <span style={{
                background: T.bgCool, borderRadius: 999,
                padding: '2px 10px', fontSize: 12, color: T.lavenderDeep,
              }}>{child.pronouns}</span>
            )}
            {[ageText, dobText].filter(Boolean).join(' · ')}
          </div>

          {children.length > 1 && (
            <div style={{ display: 'flex', gap: 5, marginTop: 12 }}>
              {children.map((c, idx) => (
                <div key={c.id} style={{
                  width: idx === activeChildIdx ? 16 : 5, height: 5, borderRadius: 3,
                  background: idx === activeChildIdx ? T.lavenderDeep : T.line,
                  transition: 'width 0.2s',
                }} />
              ))}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { medium(); onAddChild(); }}
            style={{
              marginTop: 16, background: 'none', border: `1.5px dashed ${T.line}`,
              borderRadius: 999, padding: '7px 16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12.5, color: T.inkMuted, fontFamily: T.fontSans,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Icon name="plus" size={13} color={T.inkMuted} strokeWidth={2} />
            Add another child
          </motion.button>
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

      {/* Keepsake book */}
      <div style={{ padding: '24px 20px 0', position: 'relative', zIndex: 1 }}>
        <div style={{
          background: T.card, borderRadius: 18, overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
        }}>
          <motion.button
            whileTap={{ scale: 0.99, backgroundColor: T.bgCool }}
            onClick={() => { light(); onOpenKeepsake(); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              padding: '15px 16px', background: 'none', border: 'none',
              cursor: 'pointer', textAlign: 'left',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 12, background: T.bgCool,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon name="heart" size={16} color={T.lavenderDeep} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 500, color: T.ink }}>Yearly keepsake book</div>
              <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 1 }}>Your {currentYear} in memories</div>
            </div>
            <Icon name="chevron" size={14} color={T.inkFaint} />
          </motion.button>
        </div>
      </div>

      {/* Security */}
      <div style={{ padding: '20px 20px 0', position: 'relative', zIndex: 1 }}>
        <div style={{
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: T.inkMuted, marginBottom: 10, paddingLeft: 4,
        }}>Security</div>
        <div style={{
          background: T.card, borderRadius: 18,
          boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
          padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12, background: T.bgCool,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon name="lock" size={16} color={T.lavenderDeep} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 500, color: T.ink }}>Face ID / Touch ID</div>
            <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 1 }}>Require biometrics to open</div>
          </div>
          <Toggle value={settings.faceId} onChange={(v) => updateSettings({ faceId: v })} />
        </div>
      </div>

      {/* Sign out */}
      <div style={{ padding: '16px 20px 0', position: 'relative', zIndex: 1 }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { medium(); handleSignOut(); }}
          style={{
            width: '100%', height: 50, borderRadius: 16,
            background: 'transparent', border: `1.5px solid ${T.line}`,
            color: T.inkSoft, fontSize: 14.5, fontWeight: 500,
            fontFamily: T.fontSans, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Icon name="logout" size={17} color={T.inkSoft} />
          Sign out
        </motion.button>
      </div>

      {/* Footer credit */}
      <div style={{
        padding: '28px 20px 110px', textAlign: 'center', position: 'relative', zIndex: 1,
      }}>
        <div style={{
          fontFamily: T.fontSerif, fontStyle: 'italic',
          fontSize: 13.5, color: T.inkFaint,
        }}>
          built with love by you mama and dada
        </div>
      </div>
    </motion.div>
  );
}
