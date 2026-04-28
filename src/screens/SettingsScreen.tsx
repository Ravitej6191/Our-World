import React, { useState } from 'react';
import { T } from '../tokens';
import Icon from '../components/Icon';
import Toggle from '../components/Toggle';

interface Props {
  onBack: () => void;
}

function SettingsRow({ icon, label, sub, right, onPress }: {
  icon: string;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={onPress}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '13px 16px', background: pressed ? T.bgCool : 'none',
        border: 'none', cursor: onPress ? 'pointer' : 'default', textAlign: 'left',
        transition: 'background 0.1s',
        WebkitTapHighlightColor: 'transparent' as any,
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: T.bgCool,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={icon as any} size={17} color={T.lavenderDeep} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14.5, fontWeight: 500, color: T.ink }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 1.5 }}>{sub}</div>}
      </div>
      {right ?? (onPress && <Icon name="chevron" size={14} color={T.inkFaint} />)}
    </button>
  );
}

function Divider() {
  return <div style={{ height: 1, background: T.lineSoft, marginLeft: 62 }} />;
}

export default function SettingsScreen({ onBack }: Props) {
  const [faceId, setFaceId] = useState(false);
  const [privateMode, setPrivateMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div style={{
      position: 'absolute', inset: 0, background: T.bg,
      display: 'flex', flexDirection: 'column', fontFamily: T.fontSans,
    }}>
      {/* Header */}
      <div style={{ padding: '56px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: 20,
          background: 'rgba(255,255,255,0.85)', border: `1px solid ${T.lineSoft}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', padding: 0,
        }}>
          <Icon name="back" size={20} color={T.ink} />
        </button>
        <div style={{ fontSize: 16, fontWeight: 600, color: T.ink, letterSpacing: '-0.01em' }}>Settings</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 40px' }}>

        {/* Security */}
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 10, paddingLeft: 4 }}>Security</div>
        <div style={{ background: T.card, borderRadius: 18, border: `1px solid ${T.lineSoft}`, overflow: 'hidden', marginBottom: 20 }}>
          <SettingsRow
            icon="lock"
            label="Face ID / Touch ID"
            sub="Require biometrics to open"
            right={<Toggle value={faceId} onChange={setFaceId} />}
          />
          <Divider />
          <SettingsRow
            icon="eye"
            label="Private mode"
            sub="Blur content in app switcher"
            right={<Toggle value={privateMode} onChange={setPrivateMode} />}
          />
        </div>

        {/* Storage */}
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 10, paddingLeft: 4 }}>Storage</div>
        <div style={{ background: T.card, borderRadius: 18, border: `1px solid ${T.lineSoft}`, overflow: 'hidden', marginBottom: 20 }}>
          <SettingsRow
            icon="cloud"
            label="Auto-save to cloud"
            sub="Backed up after every memory"
            right={<Toggle value={autoSave} onChange={setAutoSave} />}
          />
          <Divider />
          <SettingsRow
            icon="download"
            label="Export all memories"
            sub="Download a zip of your archive"
            onPress={() => {}}
          />
          <Divider />
          <SettingsRow
            icon="trash"
            label="Clear local cache"
            onPress={() => {}}
          />
        </div>

        {/* About */}
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 10, paddingLeft: 4 }}>About</div>
        <div style={{ background: T.card, borderRadius: 18, border: `1px solid ${T.lineSoft}`, overflow: 'hidden', marginBottom: 20 }}>
          <SettingsRow icon="info" label="Privacy policy" onPress={() => {}} />
          <Divider />
          <SettingsRow icon="info" label="Terms of service" onPress={() => {}} />
          <Divider />
          <SettingsRow icon="info" label="Licences" onPress={() => {}} />
        </div>

        <div style={{ textAlign: 'center', paddingTop: 4 }}>
          <div style={{ fontSize: 12, color: T.inkFaint }}>Our World · Version 1.0.0</div>
        </div>
      </div>
    </div>
  );
}
