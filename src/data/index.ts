import type { Memory, Milestone, FamilyMember } from '../types';

export const SAMPLE_MEMORIES: Memory[] = [
  {
    id: 'm1',
    date: 'Tue, 22 Apr 2025', dateShort: 'Apr 22', time: '8:42 AM', group: 'April 2025',
    title: 'The first real giggle',
    note: 'I was just folding laundry and suddenly — a real belly laugh. I had to sit down.',
    media: 'photo', tone: 'blush', label: 'mira laughing',
    emotion: 'joy', milestone: false,
  },
  {
    id: 'm2',
    date: 'Mon, 21 Apr 2025', dateShort: 'Apr 21', time: '7:15 AM', group: 'April 2025',
    title: 'First Smile',
    note: 'Not gas. A real one. For her dad.',
    media: 'photo', tone: 'peach', label: 'morning light',
    emotion: 'love', milestone: true, milestoneLabel: 'First Smile', milestoneId: 'smile',
  },
  {
    id: 'm3',
    date: 'Sun, 20 Apr 2025', dateShort: 'Apr 20', time: '3:30 PM', group: 'April 2025',
    title: 'Tiny hand around my finger',
    note: "She held on for a whole minute. I didn't dare move.",
    media: 'photo', tone: 'lavender', label: 'hands',
    emotion: 'love', milestone: false,
  },
  {
    id: 'm4',
    date: 'Sat, 19 Apr 2025', dateShort: 'Apr 19', time: '2:15 PM', group: 'April 2025',
    title: 'The long afternoon nap',
    note: 'Three hours. Both of us. The house was so quiet.',
    media: 'voice', tone: 'dusk', label: '0:42 voice note',
    emotion: 'sleepy', milestone: false, duration: '0:42',
  },
  {
    id: 'm5',
    date: 'Fri, 18 Apr 2025', dateShort: 'Apr 18', time: '10:05 AM', group: 'April 2025',
    title: 'Watching the curtains move',
    note: 'She stared for ten full minutes like it was the most fascinating thing in the world.',
    media: 'photo', tone: 'sky', label: 'curtains',
    emotion: 'wonder', milestone: false,
  },
  {
    id: 'm6',
    date: 'Sun, 30 Mar 2025', dateShort: 'Mar 30', time: '6:30 PM', group: 'March 2025',
    title: 'Rolled over — three times!',
    note: "She just did it. Like she'd been practicing in secret.",
    media: 'video', tone: 'mint', label: 'rolling · 0:18',
    emotion: 'playful', milestone: true, milestoneLabel: 'Rolled Over', milestoneId: 'roll', duration: '0:18',
  },
  {
    id: 'm7',
    date: 'Fri, 28 Mar 2025', dateShort: 'Mar 28', time: '8:00 AM', group: 'March 2025',
    title: 'Splashy bath',
    note: 'She discovered she can kick the water. Big news.',
    media: 'video', tone: 'sky', label: 'bath time',
    emotion: 'playful', milestone: false, duration: '0:12',
  },
];

export const MILESTONES: Milestone[] = [
  { id: 'smile',  label: 'First Smile',       date: 'Apr 21, 2025', done: true,  tone: 'peach',    emotion: 'love'    },
  { id: 'laugh',  label: 'First Laugh',        date: 'Apr 22, 2025', done: true,  tone: 'blush',    emotion: 'joy'     },
  { id: 'roll',   label: 'Rolled Over',        date: 'Mar 30, 2025', done: true,  tone: 'mint',     emotion: 'wonder'  },
  { id: 'sit',    label: 'Sat Up Alone',       date: '',             done: false                                       },
  { id: 'crawl',  label: 'First Crawl',        date: '',             done: false                                       },
  { id: 'step',   label: 'First Steps',        date: '',             done: false                                       },
  { id: 'word',   label: 'First Word',         date: '',             done: false                                       },
  { id: 'tooth',  label: 'First Tooth',        date: '',             done: false                                       },
  { id: 'solid',  label: 'First Food',         date: '',             done: false                                       },
  { id: 'wave',   label: 'First Wave',         date: '',             done: false                                       },
  { id: 'clap',   label: 'First Clap',         date: '',             done: false                                       },
  { id: 'hug',    label: 'First Real Hug',     date: '',             done: false                                       },
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
