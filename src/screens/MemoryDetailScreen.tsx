import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T, EMOTIONS } from '../tokens';
import type { EmotionKind } from '../tokens';
import Icon from '../components/Icon';
import PhotoPlaceholder from '../components/PhotoPlaceholder';
import { EmotionChip } from '../components/EmotionGlyph';
import EmotionGlyph from '../components/EmotionGlyph';
import { useHaptics } from '../hooks/useHaptics';
import type { Memory } from '../types';

interface Props {
  memory: Memory | undefined;
  onBack: () => void;
  onDelete: (id: string) => void;
  onSave: (m: Memory) => void;
}

const chromeBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 20,
  background: 'rgba(255,255,255,0.85)', border: `1px solid ${T.lineSoft}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent' as any,
};

const EMOTIONS_LIST = Object.entries(EMOTIONS) as [EmotionKind, (typeof EMOTIONS)[EmotionKind]][];

export default function MemoryDetailScreen({ memory, onBack, onDelete, onSave }: Props) {
  const { light, medium } = useHaptics();
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editEmotion, setEditEmotion] = useState<EmotionKind>('joy');

  if (!memory) {
    return (
      <div style={{
        position: 'absolute', inset: 0, background: T.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: T.fontSans, color: T.inkMuted,
      }}>
        Memory not found
      </div>
    );
  }

  const startEdit = () => {
    setEditTitle(memory.title);
    setEditNote(memory.note);
    setEditEmotion(memory.emotion);
    setEditing(true);
  };

  const saveEdit = () => {
    medium();
    onSave({ ...memory, title: editTitle.trim() || memory.title, note: editNote, emotion: editEmotion });
    setEditing(false);
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
      } as any}
    >
      {/* Hero */}
      <div style={{ position: 'relative', paddingTop: `calc(${T.safeTop} + 56px)` }}>
        {memory.media === 'text' ? (
          <div style={{
            margin: '0 16px', borderRadius: 28,
            background: 'linear-gradient(135deg, #fdf5dc, #fae8b0)',
            padding: '40px 28px', minHeight: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              fontFamily: T.fontSerif, fontStyle: 'italic',
              fontSize: 22, color: T.ink, lineHeight: 1.55,
              textAlign: 'center', letterSpacing: '-0.01em',
            }}>
              {memory.note || memory.title}
            </div>
          </div>
        ) : memory.media === 'voice' ? (
          <div style={{
            margin: '0 16px', borderRadius: 28, height: 200,
            background: 'linear-gradient(135deg, #e0d8f5, #d8cef0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="mic" size={44} color={T.lavenderDeep} strokeWidth={1.4} />
          </div>
        ) : (
          <PhotoPlaceholder
            label={memory.label}
            tone={memory.tone}
            height={440}
            radius={28}
            style={{ margin: '0 16px' }}
          />
        )}

        {/* Absolute chrome */}
        <div style={{
          position: 'absolute', top: `calc(${T.safeTop} + 2px)`, left: 0, right: 0,
          padding: '0 16px', display: 'flex', justifyContent: 'space-between',
        }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { light(); onBack(); }} style={chromeBtn}>
            <Icon name="back" size={20} color={T.ink} />
          </motion.button>
          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { light(); startEdit(); }}
              style={chromeBtn}
            >
              <Icon name="edit" size={18} color={T.ink} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { light(); setShowDeleteConfirm(true); }}
              style={chromeBtn}
            >
              <Icon name="trash" size={18} color={T.blushDeep} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '28px 24px 110px' }}>
        <div style={{
          fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: T.inkMuted, marginBottom: 12,
        }}>{memory.date}</div>

        <div style={{
          fontFamily: T.fontSerif, fontStyle: 'italic',
          fontSize: 30, color: T.ink, lineHeight: 1.15,
          letterSpacing: '-0.02em', marginBottom: 16,
        }}>{memory.title}</div>

        <div style={{ marginBottom: 20 }}>
          <EmotionChip kind={memory.emotion} size="md" />
        </div>

        {memory.note ? (
          <div style={{
            fontSize: 16.5, color: T.inkSoft, lineHeight: 1.65,
            letterSpacing: '0.01em', marginBottom: 28,
          }}>{memory.note}</div>
        ) : null}

        {/* Milestone badge */}
        {memory.milestone && memory.milestoneLabel && (
          <div style={{
            background: 'linear-gradient(135deg, #fdf5dc, #fae8b0)',
            borderRadius: 18, padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <Icon name="star" size={18} color={T.gold} strokeWidth={2} />
            <div>
              <div style={{
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: T.gold, marginBottom: 2,
              }}>Milestone</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: T.ink }}>
                {memory.milestoneLabel}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit sheet */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            style={{
              position: 'absolute', inset: 0, background: T.bg,
              fontFamily: T.fontSans, overflowY: 'auto',
              scrollbarWidth: 'none',
            } as any}
          >
            <div style={{ padding: `calc(${T.safeTop} + 12px) 20px 40px` }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { light(); setEditing(false); }}
                  style={chromeBtn}
                >
                  <Icon name="close" size={18} color={T.inkSoft} />
                </motion.button>
                <div style={{
                  fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.inkMuted,
                }}>Edit memory</div>
                <motion.button
                  whileTap={editTitle.trim() ? { scale: 0.97 } : {}}
                  onClick={saveEdit}
                  disabled={!editTitle.trim()}
                  style={{
                    padding: '8px 18px', borderRadius: 20,
                    background: editTitle.trim() ? T.lavenderDeep : T.lineSoft,
                    border: 'none', cursor: editTitle.trim() ? 'pointer' : 'default',
                    color: editTitle.trim() ? '#fff' : T.inkFaint,
                    fontSize: 13, fontWeight: 600, fontFamily: T.fontSans,
                    WebkitTapHighlightColor: 'transparent' as any,
                  }}
                >
                  Save
                </motion.button>
              </div>

              {/* Title field */}
              <div style={{ borderBottom: `1.5px solid ${T.line}`, paddingBottom: 10, marginBottom: 16 }}>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%', border: 'none', outline: 'none', background: 'transparent',
                    fontFamily: T.fontSerif, fontStyle: 'italic',
                    fontSize: 22, color: T.ink, lineHeight: 1.3, letterSpacing: '-0.01em',
                  } as any}
                />
              </div>

              {/* Note field */}
              <textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="Add a note…"
                rows={4}
                style={{
                  width: '100%', border: `1px solid ${T.line}`, outline: 'none',
                  background: T.card, borderRadius: 14, padding: '14px 16px',
                  fontFamily: T.fontSans, fontSize: 15, color: T.ink,
                  lineHeight: 1.55, resize: 'none', boxSizing: 'border-box',
                  marginBottom: 20,
                } as any}
              />

              {/* Emotion picker */}
              <div style={{
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: T.inkMuted, fontWeight: 500, marginBottom: 10,
              }}>How does it feel?</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {EMOTIONS_LIST.map(([kind, e]) => {
                  const active = editEmotion === kind;
                  return (
                    <motion.button
                      key={kind}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => { light(); setEditEmotion(kind); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '8px 14px', borderRadius: 999,
                        background: active ? e.ring : T.card,
                        border: active ? `1.5px solid ${e.color}` : `1px solid ${T.line}`,
                        cursor: 'pointer',
                        boxShadow: active ? `0 2px 10px ${e.color}50` : 'none',
                        WebkitTapHighlightColor: 'transparent' as any,
                      }}
                    >
                      <EmotionGlyph kind={kind} size={18} />
                      <span style={{
                        fontSize: 13, fontWeight: active ? 600 : 400,
                        color: active ? T.ink : T.inkSoft,
                      }}>{e.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
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
            onClick={() => setShowDeleteConfirm(false)}
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
                Delete this memory?
              </div>
              <div style={{ fontSize: 14, color: T.inkMuted, marginBottom: 28, lineHeight: 1.5 }}>
                This can't be undone. The memory will be permanently removed.
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { medium(); setShowDeleteConfirm(false); onDelete(memory.id); }}
                style={{
                  width: '100%', height: 52, borderRadius: 16,
                  background: '#d4736a', border: 'none', cursor: 'pointer',
                  color: '#fff', fontSize: 15, fontWeight: 600,
                  fontFamily: T.fontSans, marginBottom: 12,
                  WebkitTapHighlightColor: 'transparent' as any,
                }}
              >
                Yes, delete
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { light(); setShowDeleteConfirm(false); }}
                style={{
                  width: '100%', height: 52, borderRadius: 16,
                  background: 'transparent', border: `1.5px solid ${T.line}`,
                  cursor: 'pointer', color: T.ink, fontSize: 15,
                  fontWeight: 500, fontFamily: T.fontSans,
                  WebkitTapHighlightColor: 'transparent' as any,
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
