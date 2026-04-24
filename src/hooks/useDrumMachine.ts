/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import MidiWriter from 'midi-writer-js';
import { GENRES } from '../constants/genres';
import { KITS } from '../constants/kits';
import { audioEngine } from '../services/audioEngine';
import { Genre, InstrumentType, Pattern, SoundKit } from '../types';
import { generatePattern, generateSoundBank } from '../utils/sequencer';

export function useDrumMachine() {
  const [genre, setGenre] = useState<Genre>(GENRES[0]);
  const [kit, setKit] = useState<SoundKit>(KITS[0]);
  const [bpm, setBpm] = useState(genre.defaultBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [activeChannel, setActiveChannel] = useState<InstrumentType>('BD');
  const [bank, setBank] = useState<Pattern[]>([]);
  const [patternIndex, setPatternIndex] = useState(0);

  const bankRef = useRef<Pattern[]>([]);

  useEffect(() => {
    const initialBank = generateSoundBank(genre.id, genre.instruments);
    setBank(initialBank);
    bankRef.current = initialBank;
    setPatternIndex(0);
    setBpm(genre.defaultBpm);
    setActiveChannel(genre.instruments[0] || 'BD');
    audioEngine.setBpm(genre.defaultBpm);
  }, [genre]);

  useEffect(() => {
    if (bank[patternIndex]) {
      audioEngine.updatePattern(bank[patternIndex]);
    }
  }, [patternIndex, bank]);

  useEffect(() => {
    audioEngine.setKit(kit.id);
  }, [kit]);

  const currentPattern = bank[patternIndex] || null;

  const toggleStep = useCallback((instrument: InstrumentType, stepIndex: number) => {
    setBank(prevBank => {
      const newBank = [...prevBank];
      const newPattern = { ...newBank[patternIndex] };
      newPattern[instrument] = [...newPattern[instrument]];
      newPattern[instrument][stepIndex] = {
        ...newPattern[instrument][stepIndex],
        active: !newPattern[instrument][stepIndex].active
      };
      newBank[patternIndex] = newPattern;
      bankRef.current = newBank;
      audioEngine.updatePattern(newPattern);
      return newBank;
    });
  }, [patternIndex]);

  const togglePlayback = () => {
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
      setCurrentStep(-1);
    } else {
      audioEngine.setBpm(bpm);
      audioEngine.start((step) => {
        setCurrentStep(step);
      });
      setIsPlaying(true);
    }
  };

  const randomizePattern = () => {
    const newPattern = generatePattern(genre.id, genre.instruments);
    setBank(prev => {
      const next = [...prev];
      next[patternIndex] = newPattern;
      bankRef.current = next;
      audioEngine.updatePattern(newPattern);
      return next;
    });
  };

  const updateBpm = (val: number) => {
    setBpm(val);
    audioEngine.setBpm(val);
  };

  const downloadWav = async () => {
    if (!currentPattern) return;
    const blob = await audioEngine.renderToWav(currentPattern, bpm, kit.id);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `X-Gen_${genre.id}_${patternIndex + 1}_${bpm}BPM.wav`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadMidi = () => {
    if (!currentPattern) return;
    
    // Standard MIDI Note numbers for GM Drums
    const trackMapping: Record<InstrumentType, number> = {
      BD: 36, SD: 38, CH: 42, OH: 46, CP: 39, RS: 37, MT: 45, LT: 41, HT: 48, CY: 49
    };

    const tracks: any[] = [];
    const ticksPerBeat = 128; // Standard PPQ
    const ticksPer16th = ticksPerBeat / 4; // 32 ticks
    
    // We iterate over the fixed genre instruments to guarantee all 7 tracks are exported
    genre.instruments.forEach((inst) => {
      const track = new MidiWriter.Track();
      track.addTrackName(inst);
      track.setTempo(bpm);
      
      const channelPattern = currentPattern[inst];
      if (channelPattern) {
        channelPattern.forEach((step, i) => {
          if (step.active) {
            track.addEvent(new MidiWriter.NoteEvent({
              pitch: [trackMapping[inst] || 60],
              duration: '16',
              startTick: i * ticksPer16th,
              velocity: Math.floor(step.velocity * 127)
            }));
          }
        });
      }
      tracks.push(track);
    });

    const writer = new MidiWriter.Writer(tracks);
    const build = writer.buildFile();
    const blob = new Blob([build], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `X-Gen_${genre.id}_Pattern${patternIndex + 1}_${bpm}BPM.mid`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadMidiSingle = () => {
    if (!currentPattern) return;
    
    const trackMapping: Record<InstrumentType, number> = {
      BD: 36, SD: 38, CH: 42, OH: 46, CP: 39, RS: 37, MT: 45, LT: 41, HT: 48, CY: 49
    };

    const ticksPerBeat = 128;
    const ticksPer16th = ticksPerBeat / 4;
    
    const track = new MidiWriter.Track();
    track.addTrackName('X-GEN FULL');
    track.setTempo(bpm);
    
    genre.instruments.forEach((inst) => {
      const channelPattern = currentPattern[inst];
      if (channelPattern) {
        channelPattern.forEach((step, i) => {
          if (step.active) {
            track.addEvent(new MidiWriter.NoteEvent({
              pitch: [trackMapping[inst] || 60],
              duration: '16',
              startTick: i * ticksPer16th,
              velocity: Math.floor(step.velocity * 127)
            }));
          }
        });
      }
    });

    const writer = new MidiWriter.Writer([track]);
    const build = writer.buildFile();
    const blob = new Blob([build], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `X-Gen_${genre.id}_FullTrack_${bpm}BPM.mid`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return {
    genre,
    setGenre,
    kit,
    setKit,
    bpm,
    updateBpm,
    isPlaying,
    togglePlayback,
    currentStep,
    currentPattern,
    activeChannel,
    setActiveChannel,
    toggleStep,
    patternIndex,
    setPatternIndex,
    randomizePattern,
    instruments: genre.instruments,
    downloadWav,
    downloadMidi,
    downloadMidiSingle
  };
}
