import React from 'react';
import { motion } from 'framer-motion';
import { T } from '../tokens';

interface Props {
  onClick: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  variant?: 'default' | 'glass';
}

export const chromeBtnStyle: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 20,
  background: 'rgba(255,255,255,0.85)', border: `1px solid ${T.lineSoft}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent' as any,
};

export default function ChromeBtn({ onClick, children, style, variant = 'default' }: Props) {
  const base: React.CSSProperties = variant === 'glass'
    ? { ...chromeBtnStyle, background: T.card, border: `1px solid ${T.lineSoft}` }
    : chromeBtnStyle;

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      style={{ ...base, ...style }}
    >
      {children}
    </motion.button>
  );
}
