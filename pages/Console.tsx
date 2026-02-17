import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Common';
import { useNavigate } from 'react-router-dom';

export const Console: React.FC = () => {
    const navigate = useNavigate();
    const [lines, setLines] = useState<string[]>([]);
    
    useEffect(() => {
        const sequence = [
            "Initializing handshake protocol...",
            "Verifying cryptographic proofs for <span class='text-yellow-400'>agt_8832x_eval</span>",
            "<span class='text-green-500 font-bold'>OK</span> Identity verified via SHA-256 signature.",
            "Loading safety protocols (v2.4_Certified_Safety)...",
            "Establishing secure channel with remote node...",
            "<span class='text-green-500 font-bold'>OK</span> Channel active. Latency: 12ms.",
            "Ready for execution. Awaiting user command..."
        ];
        
        let i = 0;
        const interval = setInterval(() => {
            if (i < sequence.length) {
                setLines(prev => [...prev, sequence[i]]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 600);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-background-dark text-white font-display flex flex-col relative overflow-hidden">
            <header className="flex items-center justify-between border-b border-surface-border px-6 py-4 bg-surface-dark/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-4">
                     <div className="size-8 flex items-center justify-center rounded bg-primary/20 text-primary">
                        <span className="material-symbols-outlined text-[20px]">terminal</span>
                    </div>
                    <div>
                        <h2 className="text-white text-lg font-bold">Agent Session Console</h2>
                        <p className="text-xs text-slate-400 font-mono">v2.14.0-stable</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono font-medium">
                        <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span> CONNECTED
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface-dark border border-surface-border text-slate-300 text-xs font-mono">
                        <span className="material-symbols-outlined text-[14px]">wifi</span> 12ms
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-8 z-10">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold mb-3">Session Initialization</h1>
                    <p className="text-slate-400 text-lg">Environment ready for verifiable agent evaluation.</p>
                </div>

                <div className="w-full max-w-5xl bg-[#0a0e17] rounded-lg border border-surface-border shadow-2xl overflow-hidden flex flex-col">
                    <div className="bg-surface-dark px-4 py-2 flex items-center justify-between border-b border-surface-border">
                         <div className="flex gap-2">
                            <div className="size-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                            <div className="size-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                            <div className="size-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                        </div>
                        <div className="text-xs font-mono text-slate-500">system_log.txt — read-only</div>
                        <div className="size-4"></div>
                    </div>
                    <div className="p-6 font-mono text-sm leading-relaxed h-[320px] overflow-y-auto text-slate-300 relative bg-[#0a0e17]">
                         <div className="space-y-2">
                            {lines.map((line, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <span className="text-slate-600 select-none">09:41:{22 + idx}</span>
                                    <span className="text-primary font-bold">&gt;</span>
                                    <span dangerouslySetInnerHTML={{ __html: line }} />
                                </div>
                            ))}
                            {lines.length === 7 && <div className="inline-block w-2 h-4 bg-primary align-middle ml-1 animate-pulse"></div>}
                         </div>
                    </div>
                </div>

                <div className="mt-8">
                    <Button onClick={() => navigate('/interview')} className="px-8 py-4 text-lg min-w-[240px]" icon="play_circle">Start Interview</Button>
                </div>
            </main>
        </div>
    )
};