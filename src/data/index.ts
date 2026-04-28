import type { Memory, Milestone, FamilyMember } from '../types';

export const SAMPLE_MEMORIES: Memory[] = [
  {
    id: 'm1', date: 'Today · Apr 22', dateShort: 'Today',
    title: 'The first real giggle',
    note: 'I was just folding laundry and suddenly — a real belly laugh. I had to sit down.',
    media: 'photo', tone: 'blush', label: 'mira laughing',
    emotion: 'joy', milestone: false,
  },
  {
    id: 'm2', date: 'Yesterday · Apr 21', dateShort: 'Yesterday',
    title: 'First Smile',
    note: 'Not gas. A real one. For her dad.',
    media: 'photo', tone: 'peach', label: 'morning light',
    emotion: 'love', milestone: true, milestoneLabel: 'First Smile',
  },
  {
    id: 'm3', date: 'Sun · Apr 20',
    title: 'Tiny hand around my finger',
    note: "She held on for a whole minute. I didn't dare move.",
    media: 'photo', tone: 'lavender', label: 'hands',
    emotion: 'love', milestone: false,
  },
  {
    id: 'm4', date: 'Sat · Apr 19',
    title: 'The long afternoon nap',
    note: 'Three hours. Both of us. The house was so quiet.',
    media: 'voice', tone: 'dusk', label: '0:42 voice note',
    emotion: 'sleepy', milestone: false, duration: '0:42',
  },
  {
    id: 'm5', date: 'Fri · Apr 18',
    title: 'Watching the curtains move',
    note: 'She stared for ten full minutes like it was the most fascinating thing in the world.',
    media: 'photo', tone: 'sky', label: 'curtains',
    emotion: 'wonder', milestone: false,
  },
  {
    id: 'm6', date: 'Thu · Apr 17',
    title: 'Splashy bath',
    note: '',
    media: 'video', tone: 'mint', label: 'bath time · 0:18',
    emotion: 'playful', milestone: false, duration: '0:18',
  },
];

export const MILESTONES: Milestone[] = [
  { id: 'smile',  label: 'First Smile',  date: 'Apr 21',  done: true,  tone: 'peach',    emotion: 'love'    },
  { id: 'laugh',  label: 'First Laugh',  date: 'Apr 22',  done: true,  tone: 'blush',    emotion: 'joy'     },
  { id: 'roll',   label: 'Rolled Over',  date: 'Mar 30',  done: true,  tone: 'mint',     emotion: 'wonder'  },
  { id: 'word',   label: 'First Word',   date: 'Coming…', done: false },
  { id: 'step',   label: 'First Steps',  date: 'Coming…', done: false },
  { id: 'tooth',  label: 'First Tooth',  date: 'Coming…', done: false },
  { id: 'crawl',  label: 'First Crawl',  date: 'Coming…', done: false },
  { id: 'solid',  label: 'First Food',   date: 'Coming…', done: false },
];

export const SAMPLE_MEMBERS: FamilyMember[] = [
  {
    id: 'daniel', name: 'Daniel', relation: 'Partner', initial: 'D',
    color: '#93b8e0',
    gradient: 'linear-gradient(135deg, #b8d5f0, #7aa8d8)',
    joined: 'Joined Feb 2026',
  },
  {
    id: 'june', name: 'Nana June', relation: 'Grandmother', initial: 'J',
    color: '#e89898',
    gradient: 'linear-gradient(135deg, #f5b8b8, #e07878)',
    joined: 'Joined Mar 2026',
  },
  {
    id: 'lou', name: 'Papa Lou', relation: 'Grandfather', initial: 'L',
    color: '#c8b870',
    gradient: 'linear-gradient(135deg, #e0d090, #c0a850)',
    joined: 'Joined Mar 2026',
  },
];
