/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Genre, InstrumentType } from '../types';

export const GENRES: Genre[] = [
  {
    id: 'tech-house',
    name: 'Tech House',
    defaultBpm: 126,
    description: 'Groovy, syncopated, dancefloor-focused.',
    instruments: ['BD', 'SD', 'CH', 'OH', 'CP', 'RS', 'MT']
  },
  {
    id: 'melodic-techno',
    name: 'Melodic Techno',
    defaultBpm: 124,
    description: 'Hypnotic, atmospheric, driving.',
    instruments: ['BD', 'CH', 'OH', 'SD', 'CP', 'HT']
  },
  {
    id: 'minimal-techno',
    name: 'Minimal Techno',
    defaultBpm: 127,
    description: 'Sparse, glitchy, repetitive.',
    instruments: ['BD', 'RS', 'CH', 'OH', 'MT', 'LT']
  },
  {
    id: 'high-tech-minimal',
    name: 'High Tech Minimal',
    defaultBpm: 128,
    description: 'Fast, clean, energetic, Boris Brejcha style.',
    instruments: ['BD', 'CH', 'OH', 'SD', 'CP', 'RS']
  },
  {
    id: 'detroit-techno',
    name: 'Detroit Techno',
    defaultBpm: 128,
    description: 'Soulful, experimental, industrial origins.',
    instruments: ['BD', 'SD', 'CH', 'OH', 'CP', 'CY']
  },
  {
    id: 'berlin-techno',
    name: 'Berlin Techno',
    defaultBpm: 135,
    description: 'Dark, heavy, industrial, warehouse vibes.',
    instruments: ['BD', 'SD', 'CH', 'OH', 'CP', 'RS']
  },
  {
    id: 'acid-techno',
    name: 'Acid Techno',
    defaultBpm: 140,
    description: 'Resonant, squelchy, high energy.',
    instruments: ['BD', 'SD', 'CH', 'OH', 'CP', 'RS']
  },
  {
    id: 'trance',
    name: 'Trance',
    defaultBpm: 138,
    description: 'Uplifting, high-velocity, driving kicks.',
    instruments: ['BD', 'CH', 'OH', 'CP', 'SD', 'CY']
  },
  {
    id: 'psytrance',
    name: 'Psytrance',
    defaultBpm: 142,
    description: 'Rolling bass, intricate percussion, fast rhythms.',
    instruments: ['BD', 'CH', 'OH', 'SD', 'MT', 'LT']
  },
  {
    id: 'drum-and-bass',
    name: 'Drum and Bass',
    defaultBpm: 172,
    description: 'Broken beats, heavy sub, fast tempo.',
    instruments: ['BD', 'SD', 'CH', 'OH', 'CY', 'RS']
  },
  {
    id: 'hardstyle',
    name: 'Hardstyle',
    defaultBpm: 150,
    description: 'Distorted kicks, off-beat reverse bass vibes.',
    instruments: ['BD', 'CH', 'OH', 'SD', 'CP']
  },
  {
    id: 'acid-house',
    name: 'Acid House',
    defaultBpm: 124,
    description: 'Classic 303/808 vibes, groovy and raw.',
    instruments: ['BD', 'SD', 'CH', 'OH', 'RS', 'CP']
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    defaultBpm: 100,
    description: 'Industrial, aggressive, mid-tempo grit.',
    instruments: ['BD', 'SD', 'CH', 'OH', 'CP', 'MT']
  }
];
