import React from 'react';
import { T } from '../tokens';
import Icon from './Icon';
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
  return (
    <div style={{
      position: 'absolute', left: 12, right: 12, bottom: 'max(14px, env(safe-area-inset-bottom, 14px))',
      zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 20px',
      background: 'rgba(255,255,255,0.82)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: `1px solid ${T.lineSoft}`,
      borderRadius: 28,
      boxShadow: '0 8px 24px rgba(139,111,199,0.08), 0 1px 2px rgba(139,111,199,0.05)',
    }}>
      {tabs.map((t) => {
        const isActive = active === t.id;
        if (t.center) {
          return (
            <button key={t.id} onClick={() => onNav(t.id)} style={{
              width: 48, height: 48, borderRadius: 24,
              background: 'linear-gradient(135deg, #8b6fc7, #d4736a)',
              border: 'none', cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(139,111,199,0.4)',
              marginTop: -14, flexShrink: 0,
            }}>
              <Icon name="plus" size={24} color="#fff" strokeWidth={2.2} />
            </button>
          );
        }
        return (
          <button key={t.id} onClick={() => onNav(t.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            color: isActive ? T.lavenderDeep : T.inkFaint,
            padding: '4px 8px', minWidth: 44,
          }}>
            <Icon name={t.icon} size={22} color={isActive ? T.lavenderDeep : T.inkFaint} strokeWidth={isActive ? 2.1 : 1.7} />
          </button>
        );
      })}
    </div>
  );
}
