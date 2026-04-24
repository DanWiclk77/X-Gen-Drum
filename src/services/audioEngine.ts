/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InstrumentType, Pattern } from '../types';

class AudioEngine {
  ctx: AudioContext | null = null;
  lookahead = 25.0; // How far ahead to schedule audio (ms)
  scheduleAheadTime = 0.1; // How far from now to schedule (s)
  nextTickTime = 0.0; // When the next note is due
  timerID: number | null = null;
  
  bpm = 126;
  currentStep = 0;
  isPlaying = false;

  // Store pattern data that can be updated in real-time
  private activePattern: Pattern | null = null;
  private kitId: string = 'tb-808';

  onStepChange: (step: number) => void = () => {};

  init() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
  }

  setBpm(bpm: number) {
    this.bpm = bpm;
  }

  setKit(kitId: string) {
    this.kitId = kitId;
  }

  updatePattern(pattern: Pattern) {
    this.activePattern = pattern;
  }

  start(onStepChange: (step: number) => void) {
    if (this.isPlaying) return;
    this.init();
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
    this.onStepChange = onStepChange;
    this.isPlaying = true;
    this.currentStep = 0;
    this.nextTickTime = this.ctx!.currentTime;
    this.scheduler();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerID) {
      window.clearTimeout(this.timerID);
    }
  }

  scheduler() {
    while (this.nextTickTime < this.ctx!.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentStep, this.nextTickTime);
      this.advanceNote();
    }
    this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  private advanceNote() {
    const secondsPerBeat = 60.0 / this.bpm;
    this.nextTickTime += 0.25 * secondsPerBeat; // 16th note
    this.currentStep = (this.currentStep + 1) % 16;
    this.onStepChange(this.currentStep);
  }

  private scheduleNote(step: number, time: number) {
    if (!this.activePattern) return;
    
    Object.keys(this.activePattern).forEach((type) => {
      const stepData = this.activePattern![type as InstrumentType][step];
      if (stepData.active) {
        this.playInstrument(type as InstrumentType, stepData.velocity, this.kitId, time, this.ctx!);
      }
    });
  }

  // --- Synthesis ---

  playInstrument(type: InstrumentType, velocity: number, kitId: string, time: number, context: BaseAudioContext) {
    switch (type) {
      case 'BD': this.playKick(time, velocity, kitId, context); break;
      case 'SD': this.playSnare(time, velocity, kitId, context); break;
      case 'CH': this.playHiHat(time, velocity, false, kitId, context); break;
      case 'OH': this.playHiHat(time, velocity, true, kitId, context); break;
      case 'CP': this.playClap(time, velocity, kitId, context); break;
      case 'RS': this.playRimshot(time, velocity, kitId, context); break;
      case 'MT':
      case 'LT':
      case 'HT': 
        this.playTom(time, velocity, type, kitId, context); break;
      case 'CY': this.playCymbal(time, velocity, kitId, context); break;
    }
  }

  private playKick(time: number, vel: number, kit: string, ctx: BaseAudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    const freq = kit === 'tb-808' ? 50 : 55;
    osc.frequency.setValueAtTime(freq * 3, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.1);
    
    gain.gain.setValueAtTime(vel, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.5);
  }

  private playSnare(time: number, vel: number, kit: string, ctx: BaseAudioContext) {
    const noise = ctx.createBufferSource();
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    // Pseudo-random noise for offline consistency if needed, but Math.random is fine for drums
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = kit === 'tb-909' ? 1200 : 1000;
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(vel, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(vel * 0.3, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    noise.start(time);
    osc.start(time);
    osc.stop(time + 0.2);
  }

  private playHiHat(time: number, vel: number, open: boolean, kit: string, ctx: BaseAudioContext) {
    const noise = ctx.createBufferSource();
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = kit === 'tb-707' ? 8000 : 7000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vel * 0.5, time);
    const decay = open ? 0.3 : 0.05;
    gain.gain.exponentialRampToValueAtTime(0.01, time + decay);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(time);
    noise.stop(time + decay);
  }

  private playClap(time: number, vel: number, kit: string, ctx: BaseAudioContext) {
    const duration = 0.2;
    const noise = ctx.createBufferSource();
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1500;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(vel, time + 0.005);
    gain.gain.linearRampToValueAtTime(0.3, time + 0.01);
    gain.gain.linearRampToValueAtTime(vel, time + 0.02);
    gain.gain.linearRampToValueAtTime(0.3, time + 0.03);
    gain.gain.linearRampToValueAtTime(vel, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(time);
  }

  private playRimshot(time: number, vel: number, kit: string, ctx: BaseAudioContext) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1700, time);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vel, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.02);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.02);
  }

  private playTom(time: number, vel: number, type: InstrumentType, kit: string, ctx: BaseAudioContext) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    let freq = 120;
    if (type === 'MT') freq = 160;
    if (type === 'HT') freq = 200;

    osc.frequency.setValueAtTime(freq * 1.5, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.1);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vel * 0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.4);
  }

  private playCymbal(time: number, vel: number, kit: string, ctx: BaseAudioContext) {
    const noise = ctx.createBufferSource();
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vel * 0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(time);
    noise.stop(time + 2);
  }

  async renderToWav(pattern: Pattern, bpm: number, kitId: string): Promise<Blob> {
    const sampleRate = 44100;
    const duration = (60 / bpm) * 4; // 1 bar (4 beats)
    const offlineCtx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

    const secondsPerBeat = 60.0 / bpm;
    const stepTime = 0.25 * secondsPerBeat;

    Object.keys(pattern).forEach((type) => {
      pattern[type as InstrumentType].forEach((step, i) => {
        if (step.active) {
          const time = i * stepTime;
          this.playInstrument(type as InstrumentType, step.velocity, kitId, time, offlineCtx);
        }
      });
    });

    const renderedBuffer = await offlineCtx.startRendering();
    return this.bufferToWav(renderedBuffer);
  }

  private bufferToWav(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded)

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // write interleaved data
    for (i = 0; i < buffer.numberOfChannels; i++)
      channels.push(buffer.getChannelData(i));

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true); // write 16-bit sample
        pos += 2;
      }
      offset++; // next source sample
    }

    return new Blob([bufferArray], { type: 'audio/wav' });

    function setUint16(data: number) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: number) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  }
}

export const audioEngine = new AudioEngine();
