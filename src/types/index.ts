import type { EmotionKind } from '../tokens';

export interface Memory {
  id: string;
  date: string;
  dateShort?: string;
  title: string;
  note: string;
  media: 'photo' | 'video' | 'voice' | 'text';
  tone: string;
  label: string;
  emotion: EmotionKind;
  milestone: boolean;
  milestoneLabel?: string;
  duration?: string;
}

export interface Milestone {
  id: string;
  label: string;
  date: string;
  done: boolean;
  tone?: string;
  emotion?: EmotionKind;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  initial: string;
  color: string;
  gradient: string;
  joined: string;
}

export interface Child {
  name: string;
  pronouns: string;
  colorIdx: number;
  dob?: { m: string; d: string; y: string };
}

export interface ToastState {
  text: string;
  icon?: string;
}

export type TabId = 'home' | 'milestones' | 'add' | 'family' | 'profile';
