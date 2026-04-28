import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../tokens';

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Sheet({ open, onClose, children }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 120 }}>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(58,50,69,0.35)' }}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{
              position: 'absolute', left: 0, right: 0, bottom: 0,
              background: T.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
              paddingBottom: 'max(28px, env(safe-area-inset-bottom, 28px))',
              boxShadow: '0 -18px 40px rgba(58,50,69,0.12)',
              maxHeight: '90%', display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: T.lineSoft, margin: '12px auto 0' }} />
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
