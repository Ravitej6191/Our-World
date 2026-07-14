import type { EmotionKind } from '../tokens';

export interface Memory {
  id: string;
  date: string;
  dateShort?: string;
  time?: string;
  group?: string;
  title: string;
  note: string;
  media: 'photo' | 'video' | 'voice' | 'text';
  tone: string;
  label: string;
  emotion: EmotionKind;
  milestone: boolean;
  milestoneLabel?: string;
  milestoneId?: string;
  duration?: string;
  mediaUri?: string;
  posterUri?: string;
  createdAt?: number;
  // Absent on memories created before multi-child support — treated as
  // belonging to the first child (see useStore's activeChildId fallback).
  childId?: string;
}

export interface Milestone {
  id: string;
  label: string;
  date: string;
  done: boolean;
  tone?: string;
  emotion?: EmotionKind;
  childId?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  initial: string;
  color: string;
  gradient: string;
  joined: string;
  notifyNew?: boolean;
  canAdd?: boolean;
  inviteUrl?: string;
  inviteContact?: string;
}

export interface Child {
  id: string;
  name: string;
  pronouns: string;
  colorIdx: number;
  dob?: { m: string; d: string; y: string };
  photoUri?: string;
}

export interface ToastState {
  text: string;
  variant?: 'success' | 'error';
}

export type TabId = 'home' | 'milestones' | 'add' | 'family' | 'profile';
