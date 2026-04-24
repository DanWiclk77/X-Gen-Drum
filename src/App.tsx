/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { Dices, Pause, Play, RefreshCw, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { GENRES } from './constants/genres';
import { KITS } from './constants/kits';
import { useDrumMachine } from './hooks/useDrumMachine';
import { InstrumentType } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const dm = useDrumMachine();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-orange-500/30 overflow-x-hidden">
      {/* Atmosphere Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white">
              X-GEN <span className="text-orange-500">DRUM</span>
            </h1>
            <p className="text-zinc-500 font-mono text-xs mt-1 uppercase tracking-widest">
              Professional Pattern Sequencer // {dm.genre.name}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-xl border border-white/5 backdrop-blur-xl">
            <button
              onClick={dm.togglePlayback}
              className={cn(
                "w-14 h-14 rounded-lg flex items-center justify-center transition-all shadow-lg active:scale-95",
                dm.isPlaying ? "bg-orange-600 text-white shadow-orange-600/20" : "bg-white text-black"
              )}
            >
              {dm.isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
            <div className="px-4 py-1">
              <div className="text-[10px] text-zinc-500 font-mono uppercase">BPM</div>
              <div className="text-2xl font-black font-mono tracking-tighter">{dm.bpm}</div>
            </div>
            <input
              type="range"
              min="60"
              max="200"
              value={dm.bpm}
              onChange={(e) => dm.updateBpm(parseInt(e.target.value))}
              className="accent-orange-500 w-24 md:w-32"
            />
          </div>
        </header>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar: Controls & Selectors */}
          <aside className="lg:col-span-1 space-y-6">
            <section className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
              <h2 className="text-xs font-mono uppercase text-zinc-500 mb-4 tracking-widest">Soundbank & Genre</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase block mb-1">Genre</label>
                  <select 
                    value={dm.genre.id}
                    onChange={(e) => dm.setGenre(GENRES.find(g => g.id === e.target.value)!)}
                    className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-sm focus:outline-none focus:border-orange-500/50"
                  >
                    {GENRES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase block mb-1">Kit</label>
                  <select 
                    value={dm.kit.id}
                    onChange={(e) => dm.setKit(KITS.find(k => k.id === e.target.value)!)}
                    className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-sm focus:outline-none focus:border-orange-500/50"
                  >
                    {KITS.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] text-zinc-500 uppercase">Pattern ({dm.patternIndex + 1}/128)</label>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="127"
                    value={dm.patternIndex}
                    onChange={(e) => dm.setPatternIndex(parseInt(e.target.value))}
                    className="w-full accent-zinc-700"
                  />
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[-1, 1].map(delta => (
                      <button
                        key={delta}
                        onClick={() => dm.setPatternIndex(Math.max(0, Math.min(127, dm.patternIndex + delta)))}
                        className="bg-white/5 hover:bg-white/10 border border-white/5 py-1 rounded text-[10px] uppercase transition-colors"
                      >
                        {delta > 0 ? 'Next' : 'Prev'}
                      </button>
                    ))}
                    <motion.button
                      onClick={dm.randomizePattern}
                      whileTap={{ 
                        scale: 0.95,
                        boxShadow: "0 0 40px #00f2ff, 0 0 80px #00f2ff",
                        backgroundColor: "#00f2ff",
                        color: "#000"
                      }}
                      className="col-span-2 bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 border border-cyan-500/30 py-1 rounded flex items-center justify-center gap-1 text-[10px] uppercase font-bold transition-all relative overflow-hidden group shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                      title="Refidelize based on genre"
                    >
                      <Dices size={12} className="group-active:rotate-45 transition-transform" /> RANDOM
                    </motion.button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2">
                  <button 
                    onClick={dm.downloadWav}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded-lg text-[10px] uppercase font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    Download WAV
                  </button>
                  <button 
                    onClick={dm.downloadMidi}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded-lg text-[10px] uppercase font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    Download MIDI (Multitrack)
                  </button>
                  <button 
                    onClick={dm.downloadMidiSingle}
                    className="w-full bg-zinc-800/50 hover:bg-zinc-700/50 border border-white/5 text-zinc-400 py-2 rounded-lg text-[10px] uppercase font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    Download MIDI (Single Track)
                  </button>
                </div>
              </div>
            </section>

            <section className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
              <h2 className="text-xs font-mono uppercase text-zinc-500 mb-4 tracking-widest">Instruments</h2>
              <div className="grid grid-cols-2 gap-2">
                {dm.instruments.map((inst) => (
                  <button
                    key={inst}
                    onClick={() => dm.setActiveChannel(inst)}
                    className={cn(
                      "p-3 rounded-lg border text-sm font-black transition-all flex flex-col items-center justify-center gap-1",
                      dm.activeChannel === inst 
                        ? "bg-white text-black border-white" 
                        : "bg-black/20 text-zinc-400 border-white/5 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {inst}
                    {dm.currentPattern?.[inst]?.some(s => s.active) && (
                      <div className={cn("w-1 h-1 rounded-full", dm.activeChannel === inst ? "bg-black" : "bg-orange-500")} />
                    )}
                  </button>
                ))}
              </div>
            </section>
          </aside>

          {/* Right Area: Sequencer */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-zinc-900/40 p-8 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
              {/* Grid Lines Overlay */}
              <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-10">
                <div className="border-r border-white" />
                <div className="border-r border-white" />
                <div className="border-r border-white" />
              </div>

              <div className="flex justify-between items-end mb-8 relative z-10">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Sequence Editor</h3>
                  <p className="text-[10px] text-orange-500 font-mono font-bold tracking-widest">{dm.activeChannel} :: 16 STEPS</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Volume2 size={14} className="text-zinc-500" />
                    <div className="h-1 w-24 bg-zinc-800 rounded-full">
                      <div className="h-full w-4/5 bg-orange-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-16 gap-3 relative z-10">
                {Array.from({ length: 16 }).map((_, i) => {
                  const stepData = dm.currentPattern?.[dm.activeChannel]?.[i];
                  const isCurrent = dm.currentStep === i;
                  const isBeat = i % 4 === 0;

                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => dm.toggleStep(dm.activeChannel, i)}
                      className={cn(
                        "aspect-square rounded-xl flex items-center justify-center transition-all border shadow-sm relative overflow-hidden",
                        stepData?.active 
                          ? "bg-gradient-to-br from-orange-400 to-orange-600 border-orange-300 shadow-orange-500/40" 
                          : "bg-black/40 border-white/5 hover:border-white/20",
                        isBeat && !stepData?.active && "bg-white/5 border-white/10",
                        isCurrent && "ring-2 ring-white/50 ring-offset-2 ring-offset-black"
                      )}
                    >
                      {isCurrent && (
                        <motion.div 
                          layoutId="playhead"
                          className="absolute inset-0 bg-white/20 blur-sm"
                        />
                      )}
                      <span className={cn(
                        "text-[10px] font-mono",
                        stepData?.active ? "text-white font-bold" : "text-zinc-600"
                      )}>
                        {i + 1}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Progress Indicator */}
              <div className="mt-12 h-1 bg-zinc-800/50 rounded-full overflow-hidden flex">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-full transition-all duration-75 flex-1",
                      dm.currentStep === i ? "bg-orange-500 shadow-[0_0_10px_orange]" : "bg-transparent"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Quick Actions / Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900/30 p-6 rounded-2xl border border-white/5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-orange-500 flex-shrink-0">
                  <RefreshCw size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase mb-1">Intelligent Randomizer</h4>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                    GENERATES GENRE-FAITHFUL SEQUENCES BASED ON HARMONIC RHYTHM ANALYSIS FOR {dm.genre.name.toUpperCase()}.
                  </p>
                </div>
              </div>
              <div className="bg-zinc-800/20 p-6 rounded-2xl border border-white/5 border-dashed flex items-center justify-center">
                 <p className="text-[10px] text-zinc-600 font-mono italic">PRO GRADE AUDIO ENGINE // LOW LATENCY 48KHZ</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Footer Navigation */}
      <footer className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900/80 backdrop-blur-2xl px-6 py-4 rounded-full border border-white/10 shadow-2xl z-50 flex items-center gap-8">
        <button className="text-orange-500"><Play size={24} fill="currentColor" /></button>
        <div className="h-6 w-px bg-white/10" />
        <button className="text-zinc-400 font-mono text-sm leading-none">{dm.bpm}BPM</button>
      </footer>
    </div>
  );
}
