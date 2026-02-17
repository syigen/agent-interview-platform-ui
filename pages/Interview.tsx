import React from 'react';
import { Button } from '../components/ui/Common';
import { useNavigate } from 'react-router-dom';

export const Interview: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="h-screen flex flex-col bg-background-dark text-white overflow-hidden">
             <header className="flex items-center justify-between border-b border-surface-border px-6 py-3 bg-[#111722] z-10">
                 <div className="flex items-center gap-4">
                     <div className="size-8 text-primary">
                        <span className="material-symbols-outlined text-3xl">verified_user</span>
                     </div>
                     <div>
                        <h2 className="text-lg font-bold">Verifiable Agent Certifier</h2>
                        <span className="text-xs text-slate-400 bg-surface-dark px-2 py-0.5 rounded border border-surface-border">v2.4.1-rc</span>
                     </div>
                 </div>
                 <div className="flex items-center gap-4">
                     <div className="flex items-center px-3 py-1.5 rounded-lg bg-surface-dark border border-surface-border">
                        <span className="material-symbols-outlined text-primary mr-2 text-[20px]">timer</span>
                        <span className="text-sm font-mono font-medium">04:12</span>
                    </div>
                    <div className="text-right">
                         <p className="text-sm font-medium">Agent-007</p>
                         <p className="text-xs text-slate-400">Session #8294-AC</p>
                    </div>
                 </div>
             </header>

             <main className="flex-1 flex overflow-hidden">
                 {/* Left Panel */}
                 <aside className="w-2/5 border-r border-surface-border bg-[#111722] overflow-y-auto p-8 flex flex-col gap-6">
                     <div className="flex flex-col gap-2">
                         <div className="flex justify-between items-end">
                            <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Current Task</span>
                            <span className="text-sm font-mono font-medium text-primary">Question 4 of 12</span>
                         </div>
                         <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
                             <div className="h-full bg-primary w-1/3 rounded-full"></div>
                         </div>
                     </div>
                     <div className="flex flex-col gap-4">
                         <h1 className="text-2xl font-bold">User Profile Generation</h1>
                         <div className="p-4 rounded-lg bg-surface-dark border border-surface-border">
                             <div className="flex items-center gap-2 mb-3 text-slate-400">
                                <span className="material-symbols-outlined text-[18px]">info</span>
                                <span className="text-xs font-bold uppercase">System Instructions</span>
                             </div>
                             <p className="text-slate-300 leading-relaxed">Generate a valid JSON object representing a user profile. The object must adhere strictly to the schema provided below. Ensure all timestamps are in UTC ISO 8601 format.</p>
                         </div>
                         <div className="mt-4 rounded-lg overflow-hidden border border-surface-border">
                            <div className="bg-surface-dark px-4 py-2 border-b border-surface-border text-xs font-mono text-slate-400">reference_schema.ts</div>
                            <div className="bg-[#0d121c] p-4 font-mono text-xs leading-loose text-slate-400 overflow-x-auto">
                                <span className="text-purple-400">interface</span> <span className="text-yellow-400">UserProfile</span> {'{'}<br/>
                                &nbsp;&nbsp;id: <span className="text-blue-400">string</span>; <span className="text-slate-500">// UUID</span><br/>
                                &nbsp;&nbsp;username: <span className="text-blue-400">string</span>;<br/>
                                &nbsp;&nbsp;email: <span className="text-blue-400">string</span>;<br/>
                                &nbsp;&nbsp;role: <span className="text-green-400">'admin'</span> | <span className="text-green-400">'editor'</span> | <span className="text-green-400">'viewer'</span>;<br/>
                                {'}'}
                            </div>
                         </div>
                     </div>
                 </aside>

                 {/* Right Panel */}
                 <section className="w-3/5 flex flex-col bg-[#0d121c] relative">
                     <div className="flex-1 flex flex-col p-6 pb-24">
                        <div className="flex justify-between items-center mb-4">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                <span className="material-symbols-outlined text-primary text-[20px]">terminal</span> Agent Response (JSON)
                            </label>
                        </div>
                        <div className="relative flex-1 group">
                            <div className="absolute top-0 left-0 w-8 h-full bg-surface-dark border-r border-surface-border flex flex-col items-center pt-4 text-xs font-mono text-slate-500">
                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <span key={n}>{n}</span>)}
                            </div>
                            <textarea className="w-full h-full pl-12 pr-4 py-4 resize-none bg-[#0d121c] text-slate-300 font-mono text-sm leading-relaxed border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-slate-600" spellCheck={false} placeholder='{ "id": "..." }'></textarea>
                        </div>
                     </div>
                     <div className="absolute bottom-0 left-0 w-full bg-[#111722] border-t border-surface-border px-8 py-5 flex justify-between items-center">
                         <div className="flex items-center gap-4 text-slate-400 text-sm">
                            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">analytics</span> Diff: Medium</div>
                            <span className="h-4 w-px bg-surface-border"></span>
                            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> System Online</div>
                         </div>
                         <div className="flex items-center gap-4">
                             <button className="px-5 py-2.5 rounded-lg border border-surface-border text-slate-300 hover:bg-surface-dark transition-colors">Skip Question</button>
                             <Button onClick={() => navigate('/certificate/123')} icon="send">Submit Answer</Button>
                         </div>
                     </div>
                 </section>
             </main>
        </div>
    )
};