import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../tokens';
import Icon from '../components/Icon';
import Toggle from '../components/Toggle';

interface Props {
  onClose: () => void;
  onInvited: (info: { name: string }) => void;
}

type Step = 'pick' | 'compose' | 'permissions' | 'sent';

type Role = {
  id: string;
  label: string;
  sub: string;
  color: string;
  bg: string;
  initial: string;
};

const ROLES: Role[] = [
  { id: 'grandparent', label: 'Grandparent',  sub: 'Nana, Papa, or Opa',              color: '#e89898', bg: '#fce8e8', initial: 'G' },
  { id: 'partner',     label: 'Partner',      sub: 'The other parent',                color: '#93b8e0', bg: '#daeef8', initial: 'P' },
  { id: 'sibling',     label: 'Sibling',      sub: 'A brother or sister',             color: '#b8a0e0', bg: '#ede5f8', initial: 'S' },
  { id: 'friend',      label: 'Close friend', sub: 'Someone who truly cares',         color: '#88d0a8', bg: '#d8f0e8', initial: 'F' },
  { id: 'caregiver',   label: 'Caregiver',    sub: 'Nanny, au pair, or childminder',  color: '#e8c870', bg: '#faf0d0', initial: 'C' },
];

const chromeBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 20,
  background: 'rgba(255,255,255,0.85)', border: `1px solid ${T.lineSoft}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent' as any,
};

function Divider() {
  return <div style={{ height: 1, background: T.lineSoft }} />;
}

export default function InviteFlow({ onClose, onInvited }: Props) {
  const [step, setStep] = useState<Step>('pick');
  const [role, setRole] = useState<Role | null>(null);
  const [contactMode, setContactMode] = useState<'email' | 'text'>('email');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [canView] = useState(true);
  const [canReact, setCanReact] = useState(true);
  const [canAdd, setCanAdd] = useState(false);
  const [notifyNew, setNotifyNew] = useState(true);

  const handleSend = () => {
    setStep('sent');
    setTimeout(() => { onInvited({ name }); }, 3000);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 110,
      background: T.bg, fontFamily: T.fontSans,
      display: 'flex', flexDirection: 'column',
    }}>
      <AnimatePresence mode="wait">
        {step === 'pick' && (
          <motion.div
            key="pick"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.22 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '56px 24px 40px' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
              <div style={{ fontSize: 26, fontWeight: 500, color: T.ink, letterSpacing: '-0.02em', lineHeight: 1.2, flex: 1, paddingRight: 16 }}>
                Who are you{' '}
                <em style={{ fontFamily: T.fontSerif, fontStyle: 'italic' }}>inviting in?</em>
              </div>
              <button onClick={onClose} style={chromeBtn}>
                <Icon name="close" size={18} color={T.inkSoft} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', display: 'flex', flexDirection: 'column', gap: 10 } as any}>
              {ROLES.map((r) => (
                <button key={r.id} onClick={() => { setRole(r); setStep('compose'); }} style={{
                  background: T.card, border: `1px solid ${T.line}`, borderRadius: 20,
                  padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer', width: '100%',
                  boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
                  WebkitTapHighlightColor: 'transparent' as any,
                }}>
                  <div style={{ width: 48, height: 48, borderRadius: 24, background: r.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: T.fontSerif, fontStyle: 'italic', fontSize: 20, color: r.color }}>{r.initial}</span>
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: T.ink, marginBottom: 3 }}>{r.label}</div>
                    <div style={{ fontSize: 12.5, color: T.inkMuted }}>{r.sub}</div>
                  </div>
                  <Icon name="chevron" size={16} color={T.inkFaint} />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'compose' && (
          <motion.div
            key="compose"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.22 }}
            style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' } as any}
          >
            <div style={{ padding: '56px 24px 40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <button onClick={() => setStep('pick')} style={chromeBtn}>
                  <Icon name="back" size={20} color={T.ink} />
                </button>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 3 }}>Step 2 of 3</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: T.ink, letterSpacing: '-0.02em' }}>How to reach them?</div>
                </div>
              </div>
              <div style={{ display: 'flex', background: T.lineSoft, borderRadius: 14, padding: 3, marginBottom: 24, width: 'fit-content' }}>
                {(['email', 'text'] as const).map((mode) => (
                  <button key={mode} onClick={() => setContactMode(mode)} style={{
                    padding: '8px 20px', borderRadius: 11, border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 500, fontFamily: T.fontSans,
                    background: contactMode === mode ? T.card : 'transparent',
                    color: contactMode === mode ? T.ink : T.inkMuted,
                    boxShadow: contactMode === mode ? '0 1px 3px rgba(58,50,69,0.08)' : 'none',
                    transition: 'all 0.15s ease', WebkitTapHighlightColor: 'transparent' as any, whiteSpace: 'nowrap',
                  }}>
                    {mode === 'email' ? 'Email' : 'Text message'}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ borderBottom: `1.5px solid ${T.line}`, paddingBottom: 10 }}>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Their name…" style={{
                    width: '100%', border: 'none', outline: 'none', background: 'transparent',
                    fontFamily: T.fontSerif, fontStyle: 'italic', fontSize: 22, color: T.ink, lineHeight: 1.3,
                  } as any} />
                </div>
                <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 8 }}>
                    {contactMode === 'email' ? 'Email address' : 'Phone number'}
                  </div>
                  <input value={contact} onChange={(e) => setContact(e.target.value)}
                    placeholder={contactMode === 'email' ? 'hello@example.com' : '+1 (555) 000-0000'}
                    type={contactMode === 'email' ? 'email' : 'tel'}
                    style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 16, color: T.ink, fontFamily: T.fontSans } as any} />
                </div>
                <div style={{ background: T.bgCool, borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <Icon name="info" size={16} color={T.lavenderDeep} />
                  <div style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.55 }}>
                    They'll receive a private link and can create an account to view the world you share.
                  </div>
                </div>
                <button onClick={() => setStep('permissions')} disabled={!name.trim() || !contact.trim()} style={{
                  width: '100%', height: 54, borderRadius: 18,
                  background: name.trim() && contact.trim() ? 'linear-gradient(135deg, #8b6fc7, #d4736a)' : T.lineSoft,
                  border: 'none', cursor: name.trim() && contact.trim() ? 'pointer' : 'default',
                  color: name.trim() && contact.trim() ? '#fff' : T.inkFaint,
                  fontSize: 15, fontWeight: 600, fontFamily: T.fontSans,
                  boxShadow: name.trim() && contact.trim() ? '0 6px 20px rgba(139,111,199,0.35)' : 'none',
                  WebkitTapHighlightColor: 'transparent' as any,
                }}>
                  Next: Set permissions
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'permissions' && (
          <motion.div
            key="permissions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.22 }}
            style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' } as any}
          >
            <div style={{ padding: '56px 24px 40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <button onClick={() => setStep('compose')} style={chromeBtn}>
                  <Icon name="back" size={20} color={T.ink} />
                </button>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 3 }}>Step 3 of 3</div>
                  <div style={{ fontSize: 22, fontWeight: 500, color: T.ink, letterSpacing: '-0.02em' }}>
                    What can <em style={{ fontFamily: T.fontSerif, fontStyle: 'italic' }}>they do?</em>
                  </div>
                </div>
              </div>
              <div style={{ background: T.card, borderRadius: 18, overflow: 'hidden', boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)', marginBottom: 20 }}>
                {[
                  { label: 'View shared memories', sub: 'See what you share with them', value: canView, onChange: undefined, disabled: true },
                  { label: 'React to memories',    sub: 'Heart and comment',            value: canReact, onChange: setCanReact, disabled: false },
                  { label: 'Add memories',          sub: 'Contribute to the timeline',  value: canAdd,   onChange: setCanAdd,   disabled: false },
                  { label: 'Notify on new',         sub: 'Get a nudge when you add',    value: notifyNew, onChange: setNotifyNew, disabled: false },
                ].map((perm, i, arr) => (
                  <React.Fragment key={perm.label}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px' }}>
                      <div>
                        <div style={{ fontSize: 14.5, fontWeight: 500, color: perm.disabled ? T.inkSoft : T.ink }}>{perm.label}</div>
                        <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 2 }}>{perm.sub}</div>
                      </div>
                      <Toggle value={perm.value} onChange={perm.onChange} disabled={perm.disabled} />
                    </div>
                    {i < arr.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </div>
              <button onClick={handleSend} style={{
                width: '100%', height: 54, borderRadius: 18,
                background: 'linear-gradient(135deg, #8b6fc7, #d4736a)',
                border: 'none', cursor: 'pointer', color: '#fff',
                fontSize: 15, fontWeight: 600, fontFamily: T.fontSans,
                boxShadow: '0 6px 20px rgba(139,111,199,0.35)',
                WebkitTapHighlightColor: 'transparent' as any,
              }}>
                Send invitation
              </button>
            </div>
          </motion.div>
        )}

        {step === 'sent' && (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 18, stiffness: 260, delay: 0.1 }}
              style={{
                width: 80, height: 80, borderRadius: 40,
                background: 'linear-gradient(135deg, #7de8b0, #4ab898)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 28px rgba(77,184,152,0.4)', marginBottom: 24,
              }}
            >
              <Icon name="check" size={34} color="#fff" strokeWidth={2.4} />
            </motion.div>
            <div style={{ fontFamily: T.fontSerif, fontStyle: 'italic', fontSize: 30, color: T.ink, marginBottom: 10, letterSpacing: '-0.02em' }}>
              Invitation sent
            </div>
            <div style={{ fontSize: 15, color: T.inkMuted, textAlign: 'center', lineHeight: 1.5, marginBottom: 28 }}>
              {name || 'They'} will get a private link to join the world.
            </div>
            <div style={{
              background: T.card, borderRadius: 16, padding: '14px 18px', width: '100%',
              boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: T.bgCool, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="link" size={16} color={T.lavenderDeep} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: T.inkMuted, marginBottom: 2 }}>Private link</div>
                <div style={{ fontFamily: T.fontMono, fontSize: 13, color: T.ink, letterSpacing: '0.02em' }}>our.world/m-7f3a</div>
              </div>
              <Icon name="share" size={16} color={T.inkMuted} />
            </div>
            <button onClick={onClose} style={{
              width: '100%', height: 54, borderRadius: 18,
              background: T.ink, border: 'none', cursor: 'pointer',
              color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: T.fontSans,
              WebkitTapHighlightColor: 'transparent' as any,
            }}>
              Back to family
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
