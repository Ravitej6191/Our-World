import type { EmotionKind } from '../tokens';

export const CHILD_PALETTES = [
  'linear-gradient(135deg, #f5c8c0, #e8a0d8)',
  'linear-gradient(135deg, #f8d8b0, #f0b890)',
  'linear-gradient(135deg, #b8e8d0, #90d8c0)',
  'linear-gradient(135deg, #c8b8e8, #a898d8)',
  'linear-gradient(135deg, #f5e0a0, #e8c870)',
  'linear-gradient(135deg, #c0d8c0, #98c8a0)',
];

// Maps emotion kind to memory card tone / photo gradient key
export const EMOTION_TONE: Record<EmotionKind, string> = {
  joy:     'peach',
  calm:    'sky',
  love:    'blush',
  wonder:  'mint',
  sleepy:  'dusk',
  playful: 'lavender',
};

// Milestone-specific context copy for the detail screen
export const MILESTONE_COPY: Record<string, { done: string; pending: string }> = {
  smile:  {
    done:    'That first smile changes you forever. A reflex becomes recognition, and suddenly you know — she knows you.',
    pending: 'First smiles come out of nowhere. Keep your phone close; this one deserves to be captured.',
  },
  laugh:  {
    done:    'A real belly laugh from a baby is one of the purest sounds in the world. You earned that one.',
    pending: 'First laughs usually arrive by surprise. Keep being silly — your efforts will pay off.',
  },
  roll:   {
    done:    'Rolling over is the first taste of independence. One small movement, one giant shift in the world.',
    pending: "Tummy time and floor play are the training ground. One day it'll just happen.",
  },
  sit:    {
    done:    'Sitting up alone opens a whole new perspective — literally. The world looks different from here.',
    pending: 'Sitting up takes core strength and balance. Props and pillows help during practice.',
  },
  crawl:  {
    done:    'The world just got much bigger. Everything is now within reach, and nothing is safe from tiny hands.',
    pending: 'Some babies skip crawling; others army-crawl first. Every path is valid.',
  },
  step:   {
    done:    'First steps are wobbly and brave. One of those moments you\'ll describe to her when she\'s grown.',
    pending: 'Cruising along furniture comes first. Those little legs are getting ready.',
  },
  word:   {
    done:    'A first word is a door opening. Language is the start of a whole new kind of closeness.',
    pending: 'Babbling is early language practice. Keep narrating your day — it all goes in.',
  },
  tooth:  {
    done:    'That first tiny tooth marks the end of the all-gums era. Teething rings at the ready.',
    pending: 'Drooling and chewing on everything are the usual signals something is on the way.',
  },
  solid:  {
    done:    'First tastes are a whole production. The face she made will stay with you forever.',
    pending: 'Around 6 months, most babies show signs of readiness — sitting up and eyeing your food.',
  },
  wave:   {
    done:    'A wave hello or goodbye is intentional communication. She understands more than she can say.',
    pending: 'Waving is usually learned by watching. Wave at her every day — it\'ll come back.',
  },
  clap:   {
    done:    'Clapping hands together is pure joy in motion. She\'s learning that she can make things happen.',
    pending: 'Clapping often appears around 9–12 months, usually during songs or play.',
  },
  hug:    {
    done:    'A real, intentional hug from a small person who has learned that closeness is love. Nothing compares.',
    pending: 'Hugs come when she understands the gesture. Keep hugging her — she\'s taking notes.',
  },
};

export function getMilestoneCopy(milestoneId: string, label: string, done: boolean): string {
  const copy = MILESTONE_COPY[milestoneId];
  if (copy) return done ? copy.done : copy.pending;
  return done
    ? `${label} is one of those firsts you'll always want to remember — the look on her face, the sounds she made, and how time seemed to pause for a second.`
    : `${label} is a milestone worth waiting for. When it happens, come back here and capture every detail.`;
}
