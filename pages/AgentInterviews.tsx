import React, { useEffect, useState, useMemo } from 'react';
import { AgentInterviewService } from '../services/AgentInterviewService';
import { Run, Template } from '../types';
import { RunDetailsPanel } from '../components/RunDetailsPanel';
import { templateService } from '../services/TemplateService';

type FilterTab = 'all' | 'pending' | 'evaluated' | 'certified';

const getRunStatus = (run: Run): 'pending' | 'evaluated' | 'certified' => {
    if (run.certificate) return 'certified';
    if (typeof run.score === 'number') return 'evaluated';
    return 'pending';
};

const StatusBadge: React.FC<{ run: Run }> = ({ run }) => {
    const status = getRunStatus(run);
    const configs = {
        certified: { label: 'Certified', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: 'verified' },
        evaluated: {
            label: run.status === 'pass' ? `Pass · ${run.score}%` : `Fail · ${run.score}%`,
            cls: run.status === 'pass'
                ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                : 'bg-red-500/15 text-red-400 border-red-500/30',
            icon: run.status === 'pass' ? 'check_circle' : 'cancel'
        },
        pending: { label: 'Pending Review', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', icon: 'schedule' },
    };
    const { label, cls, icon } = configs[status];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${cls}`}>
            <span className="material-symbols-outlined text-[12px]">{icon}</span>
            {label}
        </span>
    );
};

const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'evaluated', label: 'Evaluated' },
    { key: 'certified', label: 'Certified' },
];

const AgentInterviews: React.FC = () => {
    const [runs, setRuns] = useState<Run[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRun, setSelectedRun] = useState<Run | null>(null);
    const [evaluatingRunId, setEvaluatingRunId] = useState<string | null>(null);
    const [processing, setProcessing] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    // Invite Modal State
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [generatingInvite, setGeneratingInvite] = useState(false);
    const [generatedPrompt, setGeneratedPrompt] = useState<{ token: string; prompt: string } | null>(null);

    useEffect(() => { fetchRuns(); }, []);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchRuns = async () => {
        setLoading(true);
        try {
            const data = await AgentInterviewService.getAgentSubmissions();
            setRuns(data);
        } catch {
            showToast('Failed to fetch submissions.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEvaluate = async (run: Run, e: React.MouseEvent) => {
        e.stopPropagation();
        // Open the panel immediately — autoEvaluate will start the live grading loop
        setSelectedRun(run);
        setEvaluatingRunId(run.id);
    };

    const handleEvaluationComplete = async () => {
        if (!evaluatingRunId) return;
        // After the frontend grading loop finishes, call backend to persist final score/status
        try {
            const updated = await AgentInterviewService.evaluateRun(evaluatingRunId);
            setRuns(prev => prev.map(r => r.id === evaluatingRunId ? updated : r));
            setSelectedRun(updated);
            showToast('Evaluation saved.');
        } catch {
            showToast('Failed to save evaluation results.', 'error');
        } finally {
            setEvaluatingRunId(null);
        }
    };

    const handleCertify = async (runId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setProcessing(runId);
        try {
            await AgentInterviewService.issueCertificate(runId);
            showToast('Certificate issued!');
            fetchRuns();
        } catch {
            showToast('Certificate issuance failed.', 'error');
        } finally {
            setProcessing(null);
        }
    };

    const handleOpenInviteModal = async () => {
        setIsInviteModalOpen(true);
        setGeneratedPrompt(null);
        setSelectedTemplateId('');
        try {
            const temps = await templateService.getTemplates();
            // Filter only public/active templates? API returns all, but let's just show all for admin flex
            setTemplates(temps);
            if (temps.length > 0) setSelectedTemplateId(temps[0].id);
        } catch {
            showToast('Failed to load templates', 'error');
        }
    };

    const handleGenerateInvite = async () => {
        if (!selectedTemplateId) return;
        setGeneratingInvite(true);
        try {
            const result = await AgentInterviewService.generateInvitePrompt(selectedTemplateId);
            setGeneratedPrompt(result);
        } catch {
            showToast('Failed to generate invite', 'error');
        } finally {
            setGeneratingInvite(false);
        }
    };

    const handleCopyPrompt = async () => {
        if (!generatedPrompt) return;
        try {
            await navigator.clipboard.writeText(generatedPrompt.prompt.trim());
            showToast('Prompt copied to clipboard!');
        } catch {
            showToast('Failed to copy to clipboard', 'error');
        }
    };

    const filteredRuns = useMemo(() => {
        if (activeTab === 'all') return runs;
        return runs.filter(r => getRunStatus(r) === activeTab);
    }, [runs, activeTab]);

    const tabCounts = useMemo(() => ({
        all: runs.length,
        pending: runs.filter(r => getRunStatus(r) === 'pending').length,
        evaluated: runs.filter(r => getRunStatus(r) === 'evaluated').length,
        certified: runs.filter(r => getRunStatus(r) === 'certified').length,
    }), [runs]);

    return (
        <div className="min-h-screen bg-background-dark text-white">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-[200] flex items-center gap-2 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium animate-fade-in-up
                    ${toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-red-500/20 border-red-500/30 text-red-300'}`}>
                    <span className="material-symbols-outlined text-lg">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
                    {toast.msg}
                </div>
            )}

            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Agent Interviews</h1>
                        <p className="text-slate-400 text-sm mt-1">Review and evaluate agent-submitted interview runs</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleOpenInviteModal}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white transition-colors text-sm font-medium shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-lg">add_link</span>
                            Generate Invite
                        </button>
                        <button
                            onClick={fetchRuns}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-surface-border text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm"
                        >
                            <span className="material-symbols-outlined text-lg">refresh</span>
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 p-1 bg-surface-dark rounded-xl border border-surface-border mb-6 w-fit">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${activeTab === tab.key
                                    ? 'bg-primary text-white shadow'
                                    : 'text-slate-400 hover:text-white'}`}
                        >
                            {tab.label}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono
                                ${activeTab === tab.key ? 'bg-white/20' : 'bg-surface-border text-slate-500'}`}>
                                {tabCounts[tab.key]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-[#111722] border border-surface-border rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20 text-slate-500">
                            <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                            Loading submissions...
                        </div>
                    ) : filteredRuns.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
                            <span className="material-symbols-outlined text-4xl opacity-30">inbox</span>
                            <p>No {activeTab !== 'all' ? activeTab : ''} submissions found.</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-surface-border text-xs uppercase tracking-wider text-slate-500">
                                    <th className="text-left px-6 py-3 font-semibold">Agent</th>
                                    <th className="text-left px-6 py-3 font-semibold">Template</th>
                                    <th className="text-left px-6 py-3 font-semibold">Submitted</th>
                                    <th className="text-left px-6 py-3 font-semibold">Status</th>
                                    <th className="text-right px-6 py-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border">
                                {filteredRuns.map(run => {
                                    const runStatus = getRunStatus(run);
                                    const isProcessing = processing === run.id;
                                    return (
                                        <tr
                                            key={run.id}
                                            onClick={() => setSelectedRun(run)}
                                            className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                                        {(run.agentName || 'A').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white text-sm">{run.agentName || '—'}</div>
                                                        <div className="text-xs text-slate-500 font-mono">{run.agentId?.slice(0, 16)}…</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-300">{run.templateName || '—'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-400">
                                                    {new Date(run.timestamp).toLocaleString(undefined, {
                                                        month: 'short', day: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge run={run} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {runStatus === 'pending' && (
                                                        <button
                                                            onClick={(e) => handleEvaluate(run, e)}
                                                            disabled={isProcessing}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-medium hover:bg-indigo-500/20 hover:border-indigo-500/40 disabled:opacity-40 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                                                            {isProcessing ? 'Evaluating…' : 'Evaluate'}
                                                        </button>
                                                    )}
                                                    {runStatus === 'evaluated' && run.status === 'pass' && (
                                                        <button
                                                            onClick={(e) => handleCertify(run.id, e)}
                                                            disabled={isProcessing}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-medium hover:bg-emerald-500/20 hover:border-emerald-500/40 disabled:opacity-40 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">verified</span>
                                                            {isProcessing ? 'Issuing…' : 'Issue Cert'}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedRun(run); }}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-slate-400 border border-surface-border rounded-lg text-xs hover:text-white hover:border-slate-500 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                                        View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Run Details Slide-over */}
            {selectedRun && (
                <RunDetailsPanel
                    run={selectedRun}
                    onClose={() => { setSelectedRun(null); setEvaluatingRunId(null); }}
                    autoEvaluate={evaluatingRunId === selectedRun.id}
                    onEvaluationComplete={handleEvaluationComplete}
                />
            )}

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsInviteModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-[#1a2332] border border-surface-border rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-surface-border flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">add_link</span>
                                Generate Interview Invite
                            </h2>
                            <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {!generatedPrompt ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Select Template</label>
                                        <select
                                            value={selectedTemplateId}
                                            onChange={(e) => setSelectedTemplateId(e.target.value)}
                                            className="w-full bg-[#111722] border border-surface-border rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                        >
                                            {templates.map(t => (
                                                <option key={t.id} value={t.id}>{t.name} ({t.difficulty})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-300">
                                        Generates a secure, signed invite token. The agent can use this token to register (linking them to your account) and start the interview.
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={handleGenerateInvite}
                                            disabled={generatingInvite || !selectedTemplateId}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                        >
                                            {generatingInvite ? (
                                                <><span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> Generating...</>
                                            ) : (
                                                <><span className="material-symbols-outlined text-lg">bolt</span> Generate Prompt</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-fade-in-up">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-medium text-emerald-400">Invite Prompt Generated!</label>
                                        <button
                                            onClick={() => { setGeneratedPrompt(null); }}
                                            className="text-xs text-slate-400 hover:text-white underline"
                                        >
                                            Generate Another
                                        </button>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={handleCopyPrompt}
                                                className="bg-primary hover:bg-primary/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1 shadow-lg"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                                                Copy
                                            </button>
                                        </div>
                                        <pre className="bg-[#111722] border border-surface-border rounded-lg p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap overflow-y-auto max-h-[300px]">
                                            {generatedPrompt.prompt}
                                        </pre>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={() => setIsInviteModalOpen(false)}
                                            className="px-4 py-2 bg-surface-border hover:bg-slate-700 text-white rounded-lg transition-colors"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentInterviews;
