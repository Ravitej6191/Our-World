import React from 'react';
import { motion } from 'framer-motion';
import { T } from '../tokens';
import Icon from './Icon';
import { useHaptics } from '../hooks/useHaptics';
import type { TabId } from '../types';

interface Props {
  active: TabId;
  onNav: (id: TabId) => void;
}

const tabs: { id: TabId; icon: string; label: string; center?: boolean }[] = [
  { id: 'home',       icon: 'timeline', label: 'Timeline' },
  { id: 'milestones', icon: 'star',     label: 'Milestones' },
  { id: 'add',        icon: 'plus',     label: 'Add', center: true },
  { id: 'family',     icon: 'heart',    label: 'Family' },
  { id: 'profile',    icon: 'user',     label: 'Profile' },
];

export default function TabBar({ active, onNav }: Props) {
  const { light, medium } = useHaptics();

  return (
    <div style={{
      position: 'absolute', left: 12, right: 12, bottom: 'max(14px, env(safe-area-inset-bottom, 14px))',
      zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 20px',
      background: 'rgba(255,255,255,0.86)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      border: `1px solid ${T.lineSoft}`,
      borderRadius: 28,
      boxShadow: '0 8px 24px rgba(139,111,199,0.1), 0 1px 2px rgba(139,111,199,0.06)',
    }}>
      {tabs.map((t) => {
        const isActive = active === t.id;
        if (t.center) {
          return (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.88 }}
              onClick={() => { medium(); onNav(t.id); }}
              style={{
                width: 48, height: 48, borderRadius: 24,
                background: 'linear-gradient(135deg, #8b6fc7, #d4736a)',
                border: 'none', cursor: 'pointer', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(139,111,199,0.45)',
                marginTop: -14, flexShrink: 0,
              }}
            >
              <Icon name="plus" size={24} color="#fff" strokeWidth={2.2} />
            </motion.button>
          );
        }
        return (
          <motion.button
            key={t.id}
            whileTap={{ scale: 0.88 }}
            onClick={() => { light(); onNav(t.id); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              color: isActive ? T.lavenderDeep : T.inkFaint,
              padding: '4px 10px', minWidth: 44,
            }}
          >
            <Icon
              name={t.icon}
              size={22}
              color={isActive ? T.lavenderDeep : T.inkFaint}
              strokeWidth={isActive ? 2.1 : 1.7}
            />
            {isActive && (
              <motion.div
                layoutId="tabIndicator"
                style={{ width: 4, height: 4, borderRadius: 2, background: T.lavenderDeep }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
