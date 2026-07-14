import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../tokens';
import Icon from '../components/Icon';
import Toggle from '../components/Toggle';
import { useHaptics } from '../hooks/useHaptics';
import { useStore } from '../store';
import { GLASS_CHROME_BTN } from '../shared/constants';
import type { FamilyMember } from '../types';

interface Props {
  member: FamilyMember | undefined;
  onBack: () => void;
  onRemove: (id: string) => void;
}

const chromeBtn = GLASS_CHROME_BTN;

function Divider() {
  return <div style={{ height: 1, background: T.lineSoft, marginLeft: 20 }} />;
}

export default function MemberDetailScreen({ member, onBack, onRemove }: Props) {
  const { light, medium } = useHaptics();
  const updateMember = useStore((s) => s.updateMember);
  const showToast = useStore((s) => s.showToast);
  const [notifyNew, setNotifyNew] = useState(member?.notifyNew ?? true);
  const [canAdd, setCanAdd] = useState(member?.canAdd ?? false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(member?.name ?? '');
  const [editRelation, setEditRelation] = useState(member?.relation ?? '');

  if (!member) {
    return (
      <div style={{
        position: 'absolute', inset: 0, background: T.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: T.fontSans, color: T.inkMuted,
      }}>
        Member not found
      </div>
    );
  }

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    updateMember(member.id, {
      name: editName.trim(),
      relation: editRelation.trim(),
      initial: (editName.trim()[0] ?? member.initial).toUpperCase(),
    });
    setEditing(false);
    showToast({ text: 'Profile updated', variant: 'success' });
  };

  const handleResendInvite = async () => {
    light();
    const url = member.inviteUrl ?? `https://ourworld.app/invite/${member.id.slice(-8)}`;
    const text = `${member.name} has been invited to view a private world on Our World.\n\nTap to join: ${url}`;
    if (member.inviteContact) {
      const isEmail = member.inviteContact.includes('@');
      if (isEmail) {
        const subject = encodeURIComponent(`You're invited to Our World`);
        const body = encodeURIComponent(text);
        window.open(`mailto:${member.inviteContact}?subject=${subject}&body=${body}`, '_blank');
      } else {
        window.open(`sms:${member.inviteContact}?body=${encodeURIComponent(text)}`, '_blank');
      }
    } else {
      try {
        if (navigator.share) {
          await navigator.share({ title: 'Join Our World', url });
        } else {
          await navigator.clipboard.writeText(url);
          showToast({ text: 'Invite link copied', variant: 'success' });
        }
      } catch { /* cancelled */ }
    }
  };

  const handleCopyUrl = async () => {
    light();
    const url = member.inviteUrl ?? `https://ourworld.app/invite/${member.id.slice(-8)}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast({ text: 'Link copied to clipboard', variant: 'success' });
    } catch { /* clipboard unavailable */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'absolute', inset: 0, background: T.bg,
        fontFamily: T.fontSans, display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Top chrome */}
      <div style={{
        position: 'absolute', top: `calc(${T.safeTop} + 2px)`, left: 0, right: 0,
        padding: '0 16px', display: 'flex', justifyContent: 'space-between',
        zIndex: 10,
      }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { light(); onBack(); }} style={chromeBtn}>
          <Icon name="back" size={20} color={T.ink} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { light(); setEditing((e) => !e); setEditName(member.name); setEditRelation(member.relation); }}
          style={chromeBtn}
        >
          <Icon name={editing ? 'close' : 'edit'} size={18} color={T.ink} />
        </motion.button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
        {/* Hero section */}
        <div style={{
          paddingTop: `calc(${T.safeTop} + 56px)`, paddingBottom: 28,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: `linear-gradient(180deg, ${T.bgCool} 0%, ${T.bg} 100%)`,
        }}>
          <div style={{
            width: 96, height: 96, borderRadius: 48,
            background: member.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(58,50,69,0.14)',
            marginBottom: 18,
          }}>
            <span style={{
              fontFamily: T.fontSerif, fontStyle: 'italic',
              fontSize: 40, color: '#fff', fontWeight: 400,
            }}>{editing ? (editName[0]?.toUpperCase() ?? member.initial) : member.initial}</span>
          </div>

          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{ width: '100%', padding: '0 32px', display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Name"
                  style={{
                    border: 'none', borderBottom: `2px solid ${T.lavenderDeep}`,
                    background: 'transparent', outline: 'none', textAlign: 'center',
                    fontFamily: T.fontSerif, fontStyle: 'italic',
                    fontSize: 26, color: T.ink, paddingBottom: 6,
                    width: '100%',
                  }}
                />
                <input
                  value={editRelation}
                  onChange={(e) => setEditRelation(e.target.value)}
                  placeholder="Relation (e.g. Grandparent)"
                  style={{
                    border: 'none', borderBottom: `1.5px solid ${T.lineSoft}`,
                    background: 'transparent', outline: 'none', textAlign: 'center',
                    fontSize: 14, color: T.inkSoft, paddingBottom: 6, fontFamily: T.fontSans,
                    width: '100%',
                  }}
                />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveEdit}
                  disabled={!editName.trim()}
                  style={{
                    marginTop: 4, height: 44, borderRadius: 14,
                    background: editName.trim() ? T.lavenderDeep : T.lineSoft,
                    border: 'none', cursor: editName.trim() ? 'pointer' : 'default',
                    color: editName.trim() ? '#fff' : T.inkFaint,
                    fontSize: 14, fontWeight: 600, fontFamily: T.fontSans,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  Save changes
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  fontFamily: T.fontSerif, fontStyle: 'italic',
                  fontSize: 28, color: T.ink, letterSpacing: '-0.02em',
                  marginBottom: 6,
                }}>{member.name}</div>
                <div style={{ fontSize: 14, color: T.inkMuted }}>
                  {member.relation} · {member.joined}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Invite link section */}
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{
            fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: T.inkMuted, marginBottom: 12, fontWeight: 500,
          }}>Invite link</div>
          <div style={{
            background: T.card, borderRadius: 18, overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
          }}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleCopyUrl}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: T.bgCool,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon name="link" size={16} color={T.lavenderDeep} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: T.inkMuted, marginBottom: 2 }}>Private link · tap to copy</div>
                <div style={{
                  fontFamily: T.fontMono, fontSize: 12, color: T.ink,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {member.inviteUrl ?? `ourworld.app/invite/${member.id.slice(-8)}`}
                </div>
              </div>
              <Icon name="download" size={14} color={T.inkFaint} strokeWidth={2} />
            </motion.button>
            <Divider />
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleResendInvite}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: T.bgCool,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon name="mail" size={16} color={T.lavenderDeep} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 500, color: T.ink }}>Resend invite</div>
                <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 1 }}>
                  {member.inviteContact ? `Send to ${member.inviteContact}` : 'Share the invite link again'}
                </div>
              </div>
              <Icon name="chevron" size={14} color={T.inkFaint} />
            </motion.button>
          </div>
        </div>

        {/* Permissions section */}
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{
            fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: T.inkMuted, marginBottom: 12, fontWeight: 500,
          }}>Permissions</div>

          <div style={{
            background: T.card, borderRadius: 18, overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(58,50,69,0.04), 0 2px 8px rgba(58,50,69,0.06)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '15px 18px',
            }}>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 500, color: T.inkSoft }}>
                  Can view shared memories
                </div>
                <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 2 }}>
                  Always on
                </div>
              </div>
              <Toggle value={true} disabled={true} />
            </div>

            <Divider />

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '15px 18px',
            }}>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 500, color: T.ink }}>
                  Notify on new memories
                </div>
                <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 2 }}>
                  They'll get a gentle nudge
                </div>
              </div>
              <Toggle value={notifyNew} onChange={(v) => { light(); setNotifyNew(v); updateMember(member.id, { notifyNew: v }); }} />
            </div>

            <Divider />

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '15px 18px',
            }}>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 500, color: T.ink }}>
                  Can add memories
                </div>
                <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 2 }}>
                  Contribute to the timeline
                </div>
              </div>
              <Toggle value={canAdd} onChange={(v) => { light(); setCanAdd(v); updateMember(member.id, { canAdd: v }); }} />
            </div>
          </div>
        </div>

        {/* Remove button */}
        <div style={{ padding: '0 20px 110px' }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { light(); setShowRemoveConfirm(true); }}
            style={{
              width: '100%', height: 50, borderRadius: 16,
              background: 'transparent',
              border: `1.5px solid #f5c0bc`,
              color: T.blushDeep,
              fontSize: 14.5, fontWeight: 600,
              fontFamily: T.fontSans, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Icon name="trash" size={16} color={T.blushDeep} />
            Remove from family
          </motion.button>
        </div>
      </div>

      {/* Remove confirmation overlay */}
      <AnimatePresence>
        {showRemoveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 200,
              background: 'rgba(58,50,69,0.55)',
              display: 'flex', alignItems: 'flex-end',
            }}
            onClick={() => setShowRemoveConfirm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', background: T.card,
                borderRadius: '24px 24px 0 0',
                padding: '24px 24px 40px',
                fontFamily: T.fontSans,
              }}
            >
              <div style={{
                width: 40, height: 4, borderRadius: 2,
                background: T.lineSoft, margin: '0 auto 24px',
              }} />
              <div style={{ fontSize: 18, fontWeight: 600, color: T.ink, marginBottom: 8 }}>
                Remove {member.name}?
              </div>
              <div style={{ fontSize: 14, color: T.inkMuted, marginBottom: 28, lineHeight: 1.5 }}>
                {member.name} will lose access to the world. You can invite them again later.
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { medium(); setShowRemoveConfirm(false); onRemove(member.id); }}
                style={{
                  width: '100%', height: 52, borderRadius: 16,
                  background: '#d4736a', border: 'none', cursor: 'pointer',
                  color: '#fff', fontSize: 15, fontWeight: 600,
                  fontFamily: T.fontSans, marginBottom: 12,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Yes, remove
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { light(); setShowRemoveConfirm(false); }}
                style={{
                  width: '100%', height: 52, borderRadius: 16,
                  background: 'transparent', border: `1.5px solid ${T.line}`,
                  cursor: 'pointer', color: T.ink, fontSize: 15,
                  fontWeight: 500, fontFamily: T.fontSans,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
