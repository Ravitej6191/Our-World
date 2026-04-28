import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';

interface Props {
  text: string | null;
  onDone: () => void;
}

export default function Toast({ text, onDone }: Props) {
  useEffect(() => {
    if (!text) return;
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [text]);

  return (
    <AnimatePresence>
      {text && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          style={{
            position: 'absolute', left: 20, right: 20, bottom: 100, zIndex: 160,
            padding: '12px 16px', borderRadius: 16,
            display: 'flex', gap: 10, alignItems: 'center',
            background: '#2a2438', color: '#fff',
            boxShadow: '0 18px 36px rgba(42,36,56,0.3)',
          }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: 11,
            background: '#7de8b0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon name="check" size={12} color="#2a2438" strokeWidth={2.6} />
          </div>
          <span style={{ fontSize: 13.5, fontWeight: 500, flex: 1 }}>{text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
