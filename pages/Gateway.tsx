import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Common';

export const Gateway: React.FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');

  const handleRun = () => {
    // Basic routing logic simulation
    if (input.includes('agent')) {
        navigate('/session');
    } else {
        navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background-dark flex flex-col relative overflow-hidden font-display">
       {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full"></div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 z-50 border-b border-white/5 bg-background-dark/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-8 rounded bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
            <h2 className="text-white text-lg font-bold tracking-tight">Verifiable AI // <span className="text-slate-500 font-normal">Access Gateway</span></h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">System Online</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <div className="w-full max-w-[720px] flex flex-col animate-fade-in-up">
            <div className="text-center mb-12 space-y-4">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-4 shadow-glow ring-1 ring-primary/20">
                    <span className="material-symbols-outlined text-[32px]">terminal</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white">Initialize Session</h1>
                <p className="text-slate-400 text-lg max-w-lg mx-auto">Enter owner credentials or agent instructions to begin certification protocol.</p>
            </div>

            {/* Terminal Card */}
            <div className="relative group rounded-xl overflow-hidden bg-[#151c2a] border border-slate-700 shadow-2xl transition-all focus-within:ring-2 focus-within:ring-primary">
                {/* Terminal Bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#1a2332] border-b border-slate-700">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></div>
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Secure Environment v2.4</div>
                </div>

                <div className="flex flex-col relative h-[240px]">
                    <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#1a2332] border-r border-slate-700 flex flex-col items-center pt-[19px] text-slate-600 select-none font-mono text-xs leading-6">
                        {[1,2,3,4,5,6,7,8].map(n => <span key={n}>{n}</span>)}
                    </div>
                    <textarea 
                        className="w-full h-full resize-none border-0 bg-transparent pl-14 pr-4 py-4 text-slate-200 font-mono text-sm leading-6 placeholder:text-slate-600 focus:ring-0 focus:outline-none"
                        placeholder="> Awaiting instruction sequence...&#10;> Paste prompt or key here."
                        spellCheck={false}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    ></textarea>
                     <div className="absolute bottom-4 right-4 text-xs font-mono text-slate-500 pointer-events-none flex items-center">
                        <span className="inline-block size-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>READY
                    </div>
                </div>

                 <div className="px-4 py-3 bg-[#1a2332] border-t border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="material-symbols-outlined text-[16px]">info</span>
                        <span>Supports RSA-4096 Keys & JSON Prompts</span>
                    </div>
                    <Button onClick={handleRun} icon="play_arrow">RUN PROTOCOL</Button>
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
                <p className="text-sm text-center text-slate-500">Compatible with Human Owners & Autonomous Agents via API</p>
                <div className="flex items-center gap-2 px-3 py-1 rounded bg-white/5 text-slate-500 text-[10px] font-mono tracking-wider uppercase">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    <span>End-to-End Encrypted Session</span>
                    <span className="mx-1 opacity-30">|</span>
                    <span>ID: 8F3A-29C1</span>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};