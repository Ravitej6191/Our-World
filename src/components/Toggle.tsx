import React from 'react';
import { T } from '../tokens';

interface Props {
  value: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}

export default function Toggle({ value, onChange, disabled = false }: Props) {
  return (
    <button
      onClick={() => !disabled && onChange?.(!value)}
      style={{
        width: 44, height: 26, borderRadius: 13, padding: 2, border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        background: value ? (disabled ? '#c4b5e8' : T.lavenderDeep) : T.inkFaint,
        transition: 'background 0.2s ease',
        opacity: disabled ? 0.7 : 1,
        display: 'flex', alignItems: 'center',
        justifyContent: value ? 'flex-end' : 'flex-start',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: 11, background: '#fff',
        boxShadow: '0 1px 3px rgba(58,50,69,0.25)',
      }} />
    </button>
  );
}
