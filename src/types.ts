/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type InstrumentType = 'BD' | 'SD' | 'CH' | 'OH' | 'CP' | 'RS' | 'MT' | 'LT' | 'HT' | 'CY';

export interface Step {
  active: boolean;
  velocity: number; // 0 to 1
}

export type Pattern = Record<InstrumentType, Step[]>;

export interface Genre {
  id: string;
  name: string;
  defaultBpm: number;
  description: string;
  instruments: InstrumentType[];
}

export interface SoundKit {
  id: string;
  name: string;
  description: string;
}

export interface SoundBank {
  genreId: string;
  patterns: Pattern[]; // 128 patterns
}
