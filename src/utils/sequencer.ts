/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InstrumentType, Pattern, Step } from './types';

const createEmptyPattern = (instruments: InstrumentType[]): Pattern => {
  const p: any = {};
  instruments.forEach(inst => {
    p[inst] = Array.from({ length: 16 }, () => ({ active: false, velocity: 0.8 }));
  });
  return p as Pattern;
};

export const generatePattern = (genreId: string, instruments: InstrumentType[]): Pattern => {
  const pattern = createEmptyPattern(instruments);
  const rand = Math.random;
  
  // Base patterns for specific genres
  switch (genreId) {
    case 'tech-house':
      [0, 4, 8, 12].forEach(i => { pattern.BD[i].active = true; });
      [4, 12].forEach(i => { if (pattern.CP) pattern.CP[i].active = true; });
      [2, 6, 10, 14].forEach(i => { if (pattern.OH) pattern.OH[i].active = true; });
      // Funky latin-style syncopation
      [3, 7, 11, 15].forEach(i => { if (rand() > 0.7 && pattern.CH) pattern.CH[i].active = true; });
      [14].forEach(i => { if (rand() > 0.5 && pattern.RS) pattern.RS[i].active = true; });
      break;

    case 'melodic-techno':
      [0, 4, 8, 12].forEach(i => { pattern.BD[i].active = true; });
      [2, 6, 10, 14].forEach(i => { if (pattern.OH) pattern.OH[i].active = true; });
      // Shimmering hats
      for (let i = 0; i < 16; i++) { if (i % 2 !== 0 && rand() > 0.6 && pattern.CH) pattern.CH[i].active = true; }
      [12].forEach(i => { if (pattern.CP) pattern.CP[i].active = true; });
      break;

    case 'minimal-techno':
      [0, 4, 8, 12].forEach(i => { pattern.BD[i].active = true; });
      // Tiny glitches
      for (let i = 0; i < 16; i++) {
        if (rand() > 0.85) {
          const inst = instruments[Math.floor(rand() * instruments.length)];
          if (inst !== 'BD') pattern[inst][i].active = true;
        }
      }
      break;

    case 'detroit-techno':
      [0, 4, 8, 12].forEach(i => { pattern.BD[i].active = true; });
      [4, 12].forEach(i => { if (pattern.SD) pattern.SD[i].active = true; });
      // Swingy hats
      [2, 6, 10, 14].forEach(i => { if (pattern.OH) pattern.OH[i].active = true; });
      [1, 5, 9, 13].forEach(i => { if (rand() > 0.5 && pattern.CH) pattern.CH[i].active = true; });
      break;

    case 'acid-house':
      [0, 4, 8, 12].forEach(i => { pattern.BD[i].active = true; });
      [4, 12].forEach(i => { if (pattern.SD) pattern.SD[i].active = true; });
      [2, 6, 10, 14].forEach(i => { if (pattern.OH) pattern.OH[i].active = true; });
      // Heavy snare/clap on 2 & 4
      break;

    case 'drum-and-bass':
      pattern.BD[0].active = true;
      pattern.BD[rand() > 0.5 ? 10 : 11].active = true;
      [4, 12].forEach(i => { pattern.SD[i].active = true; });
      // Ghost notes
      if (rand() > 0.6) pattern.SD[7].active = true;
      if (rand() > 0.6) pattern.SD[15].active = true;
      for (let i = 0; i < 16; i++) { if (rand() > 0.2) pattern.CH[i].active = true; }
      break;

    case 'psytrance':
      [0, 4, 8, 12].forEach(i => { pattern.BD[i].active = true; });
      // Sharp distinct percussion
      for (let i = 0; i < 16; i++) {
        if (i % 4 !== 0 && rand() > 0.7) {
          if (pattern.MT) pattern.MT[i].active = true;
        }
      }
      [2, 6, 10, 14].forEach(i => { if (pattern.OH) pattern.OH[i].active = true; });
      break;

    case 'hardstyle':
      [0, 4, 8, 12].forEach(i => { pattern.BD[i].active = true; });
      // Offbeat drive
      [2, 6, 10, 14].forEach(i => { if (pattern.OH) pattern.OH[i].active = true; });
      [4, 12].forEach(i => { if (pattern.SD) pattern.SD[i].active = true; });
      break;

    case 'cyberpunk':
      [0, 8].forEach(i => { pattern.BD[i].active = true; });
      if (rand() > 0.5) pattern.BD[6].active = true;
      [4, 12].forEach(i => { pattern.SD[i].active = true; });
      // Dark industrial claps
      [4, 12].forEach(i => { if (pattern.CP) pattern.CP[i].active = true; });
      break;

    default:
      // High Tech / Berlin / Industrial Techno
      [0, 4, 8, 12].forEach(i => { pattern.BD[i].active = true; });
      [4, 12].forEach(i => { if (pattern.SD) pattern.SD[i].active = true; });
      [2, 6, 10, 14].forEach(i => { if (pattern.OH) pattern.OH[i].active = true; });
      if (rand() > 0.5) {
        for (let i = 0; i < 16; i++) { if (i % 2 !== 0 && rand() > 0.8 && pattern.RS) pattern.RS[i].active = true; }
      }
      break;
  }

  // Randomize velocities slightly
  Object.values(pattern).forEach(steps => {
    steps.forEach(step => {
      if (step.active) step.velocity = 0.5 + Math.random() * 0.5;
    });
  });

  return pattern;
};

export const generateSoundBank = (genreId: string, instruments: InstrumentType[]): Pattern[] => {
  return Array.from({ length: 128 }, () => generatePattern(genreId, instruments));
};
