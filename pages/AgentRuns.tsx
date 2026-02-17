import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, Button, Input, Badge } from '../components/ui/Common';
import { Run } from '../types';
import { useNavigate } from 'react-router-dom';
import { RunDetailsPanel } from '../components/RunDetailsPanel';
import { useAppSelector } from '../store/hooks';

const dummyRuns: Run[] = [
  { id: 'RUN-3920', agentId: 'AGT-774', agentName: 'Support-Genius-v2', timestamp: 'Just now', status: 'running' },
  { id: 'RUN-3919', agentId: 'AGT-882', agentName: 'Market-Analyst-Pro', timestamp: '12 mins ago', status: 'pass', score: 94 },
  { id: 'RUN-3918', agentId: 'AGT-104', agentName: 'Code-Refactor-Bot', timestamp: '45 mins ago', status: 'fail', score: 62 },
  { id: 'RUN-3917', agentId: 'AGT-774', agentName: 'Support-Genius-v2', timestamp: '2 hours ago', status: 'pass', score: 88 },
  { id: 'RUN-3916', agentId: 'AGT-991', agentName: 'Legal-Doc-Reviewer', timestamp: '5 hours ago', status: 'pass', score: 91 },
  { id: 'RUN-3915', agentId: 'AGT-332', agentName: 'Translation-Matrix-X', timestamp: '1 day ago', status: 'pass', score: 97 },
  { id: 'RUN-3914', agentId: 'AGT-882', agentName: 'Market-Analyst-Pro', timestamp: '1 day ago', status: 'fail', score: 45 },
  { id: 'RUN-3913', agentId: 'AGT-104', agentName: 'Code-Refactor-Bot', timestamp: '2 days ago', status: 'pass', score: 85 },
  { id: 'RUN-3912', agentId: 'AGT-551', agentName: 'Ethical-Constraint-v1', timestamp: '3 days ago', status: 'pass', score: 100 },
  { id: 'RUN-3911', agentId: 'AGT-003', agentName: 'Chaos-Monkey-Agent', timestamp: '4 days ago', status: 'fail', score: 12 },
];

export const AgentRuns: React.FC = () => {
    const navigate = useNavigate();
    const templates = useAppSelector((state) => state.templates.items);
    const [showGenerator, setShowGenerator] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRun, setSelectedRun] = useState<Run | null>(null);

    const filteredRuns = dummyRuns.filter(run => 
        run.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        run.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        run.agentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter out drafts for the generator dropdown
    const availableTemplates = templates.filter(t => t.status !== 'draft');

    return (
        <Layout>
            <RunDetailsPanel run={selectedRun} onClose={() => setSelectedRun(null)} />

            <div className="p-8 max-w-[1200px] mx-auto flex flex-col gap-8">
                 <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                     <div>
                        <h1 className="text-3xl font-black text-white">Agent Runs & Results</h1>
                        <p className="text-slate-400">Comprehensive audit log of all agent evaluation attempts.</p>
                     </div>
                     <Button icon="bolt" onClick={() => setShowGenerator(!showGenerator)}>
                        {showGenerator ? 'Close Generator' : 'Generate Access Prompt'}
                     </Button>
                </div>

                {showGenerator && (
                    <div className="bg-surface-dark border border-surface-border rounded-2xl p-8 shadow-xl animate-fade-in-up flex flex-col lg:flex-row gap-8">
                        {/* Generator Content */}
                        <div className="flex-1 flex flex-col gap-6">
                            <h2 className="text-xl font-bold text-white">Generate Access Prompt</h2>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-300 mb-2 block">Evaluation Template</label>
                                    <select className="w-full bg-background-dark border border-surface-border text-white text-sm rounded-lg p-3.5 focus:ring-2 focus:ring-primary focus:outline-none">
                                        {availableTemplates.length > 0 ? (
                                            availableTemplates.map(t => (
                                                <option key={t.id} value={t.id}>{t.name} ({t.difficulty})</option>
                                            ))
                                        ) : (
                                            <option disabled>No published templates available</option>
                                        )}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <Input label="Expiration" placeholder="24 Hours" />
                                    <Input label="Max Attempts" placeholder="3" type="number" />
                                </div>
                                <Input label="Bind to Agent ID (Optional)" placeholder="e.g. agent_sha256_..." icon="fingerprint" />
                                <Button className="w-full mt-2" icon="bolt">Generate Prompt</Button>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-6">
                             <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-indigo-400">info</span> How it works</h3>
                                <ul className="space-y-2 text-sm text-indigo-200/80">
                                    <li>• The generated prompt contains a cryptographic challenge.</li>
                                    <li>• Access is strictly limited by time and attempts.</li>
                                </ul>
                             </div>
                             <div className="bg-black/40 border border-primary/50 rounded-2xl p-0 overflow-hidden shadow-2xl shadow-primary/10">
                                 <div className="bg-black/50 p-4 border-b border-white/5 flex justify-between items-center">
                                    <span className="text-xs font-bold text-primary uppercase flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Generated String</span>
                                    <span className="text-[10px] text-slate-500 font-mono">ID: 8X29-B422</span>
                                 </div>
                                 <div className="p-5 flex flex-col gap-4">
                                     <div className="font-mono text-sm text-slate-300 break-all bg-white/5 p-3 rounded border border-white/5">
                                        PROMPT-AGENT-8X29-B422-VERIFIED-ACCESS-SIG-7782-9901-AB
                                     </div>
                                     <Button variant="secondary" icon="content_copy" className="w-full">Copy to Clipboard</Button>
                                 </div>
                             </div>
                        </div>
                    </div>
                )}
                
                <Card className="flex flex-col gap-0 overflow-hidden">
                    <div className="p-5 border-b border-surface-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-dark">
                         <div className="flex items-center gap-2">
                             <span className="material-symbols-outlined text-slate-500">history</span>
                             <h3 className="font-bold text-white">Execution Log</h3>
                             <span className="bg-surface-border text-slate-400 text-xs px-2 py-0.5 rounded-full">{filteredRuns.length}</span>
                         </div>
                         <div className="w-full sm:w-72">
                            <Input 
                                icon="search" 
                                placeholder="Search by Agent Name or ID..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-[#111620]"
                            />
                         </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-surface-border/30 border-b border-surface-border">
                                    <th className="px-6 py-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Run ID / Agent</th>
                                    <th className="px-6 py-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Timestamp</th>
                                    <th className="px-6 py-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Status</th>
                                    <th className="px-6 py-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Score</th>
                                    <th className="px-6 py-4 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border bg-surface-dark/50">
                                {filteredRuns.length > 0 ? (
                                    filteredRuns.map((run) => (
                                        <tr 
                                            key={run.id} 
                                            className="group hover:bg-surface-hover transition-colors cursor-pointer"
                                            onClick={() => setSelectedRun(run)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-white group-hover:text-primary transition-colors">{run.agentName}</span>
                                                        <span className="text-xs text-slate-500 font-mono">{run.id} • {run.agentId}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                                                {run.timestamp}
                                            </td>
                                            <td className="px-6 py-4">
                                                {run.status === 'pass' && <Badge type="pass" icon="check_circle">Certified</Badge>}
                                                {run.status === 'fail' && <Badge type="fail" icon="cancel">Failed</Badge>}
                                                {run.status === 'running' && <Badge type="progress" icon="sync">Running</Badge>}
                                                {run.status === 'in_progress' && <Badge type="neutral" icon="pending">Pending</Badge>}
                                            </td>
                                            <td className="px-6 py-4">
                                                {run.score !== undefined ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-full max-w-[60px] h-1.5 bg-surface-border rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full ${run.score > 80 ? 'bg-emerald-500' : run.score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                                                style={{ width: `${run.score}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className={`font-mono font-bold ${run.score > 80 ? 'text-white' : run.score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                            {run.score}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-600 text-xs italic">--</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-1">
                                                    {run.status === 'pass' && (
                                                        <button 
                                                            className="text-emerald-500 hover:text-emerald-400 transition-colors p-2 rounded hover:bg-emerald-500/10" 
                                                            title="View Certificate"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/certificate/${run.id}`);
                                                            }}
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">verified</span>
                                                        </button>
                                                    )}
                                                    <button 
                                                        className="text-slate-500 hover:text-white transition-colors p-2 rounded hover:bg-white/5" 
                                                        title="View Report"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedRun(run);
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">description</span>
                                                    </button>
                                                    <button className="text-slate-500 hover:text-primary transition-colors p-2 rounded hover:bg-primary/10" title="Rerun">
                                                        <span className="material-symbols-outlined text-[20px]">replay</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            No runs found matching "{searchTerm}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </Layout>
    )
}