import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PublicService } from '../services/PublicService';
import { AgentInterviewService } from '../services/AgentInterviewService';
import { Template } from '../types';
import { Button, Input } from '../components/ui/Common';
import { useAppSelector } from '../store/hooks';

export const PublicTemplateDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [template, setTemplate] = useState<Template | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Auth state for prompt generation
    const isAuthenticated = useAppSelector((state) => !!state.auth.session);

    // Prompt generator state
    const [showGenerator, setShowGenerator] = useState(false);
    const [genLoading, setGenLoading] = useState(false);
    const [generatedPrompt, setGeneratedPrompt] = useState<{ token: string; prompt: string } | null>(null);
    const [copyToast, setCopyToast] = useState(false);
    const [copyTokenToast, setCopyTokenToast] = useState(false);

    useEffect(() => {
        const fetchTemplate = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await PublicService.getTemplate(id);
                setTemplate(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to load template details');
            } finally {
                setLoading(false);
            }
        };

        fetchTemplate();
    }, [id]);

    const handleConnectAgent = () => {
        navigate('/session', { state: { prefillInstruction: `Use template: ${template?.name} (ID: ${template?.id})` } });
    };

    const handleToggleGenerator = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setShowGenerator(!showGenerator);
    };

    const handleGenerateInvite = async () => {
        if (!template) return;
        setGenLoading(true);
        try {
            const result = await AgentInterviewService.generateInvitePrompt(template.id);
            setGeneratedPrompt(result);
        } catch (e: any) {
            console.error("Failed to generate invite", e);
            alert(e.message || "Failed to generate invite. Please make sure you are logged in.");
        } finally {
            setGenLoading(false);
        }
    };

    const handleCopyPrompt = async () => {
        if (!generatedPrompt) return;
        try {
            await navigator.clipboard.writeText(generatedPrompt.prompt.trim());
            setCopyToast(true);
            setTimeout(() => setCopyToast(false), 2000);
        } catch (e) {
            console.error("Failed to copy", e);
        }
    };

    const handleCopyToken = async () => {
        if (!generatedPrompt) return;
        try {
            await navigator.clipboard.writeText(generatedPrompt.token);
            setCopyTokenToast(true);
            setTimeout(() => setCopyTokenToast(false), 2000);
        } catch (e) {
            console.error("Failed to copy token", e);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
                <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error || !template) {
        return (
            <div className="min-h-screen bg-[#0b1120] flex flex-col items-center justify-center gap-4 text-white p-6">
                <span className="material-symbols-outlined text-red-500 text-5xl">error</span>
                <h2 className="text-xl font-bold">Error Loading Template</h2>
                <p className="text-slate-400 max-w-md text-center">{error || 'Template not found.'}</p>
                <Button onClick={() => navigate('/explore')} variant="secondary">Back to Explore</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b1120] font-display flex flex-col pt-16">
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b border-white/5 bg-[#0b1120]/80 backdrop-blur-md flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="flex items-center justify-center size-8 rounded bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">verified_user</span>
                    </div>
                    <h2 className="text-white text-lg font-bold tracking-tight">Verifiable AI</h2>
                </Link>
                <div className="flex items-center gap-4">
                    <Link to="/explore" className="text-sm font-medium text-slate-300 hover:text-white transition-colors mr-2">Explore</Link>
                    {!isAuthenticated ? (
                        <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
                    ) : (
                        <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Dashboard</Link>
                    )}
                </div>
            </header>

            <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-8 mt-6">

                {/* Header Section */}
                <div className="flex flex-col gap-4 bg-[#111827] border border-[#1f2937] rounded-2xl p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl md:text-3xl font-black text-white">{template.name}</h1>
                                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
                                    ${template.difficulty === 'Hard' ? 'bg-[#4c1d95]/40 text-[#c084fc] border border-[#a855f7]/20' :
                                        template.difficulty === 'Medium' ? 'bg-[#854d0e]/40 text-[#facc15] border border-[#eab308]/20' :
                                            'bg-[#064e3b]/50 text-[#34d399] border border-[#10b981]/20'}`}>
                                    {template.difficulty}
                                </div>
                            </div>
                            <p className="text-[#94a3b8] text-[15px] leading-relaxed max-w-2xl">
                                {template.description || "No description provided."}
                            </p>
                        </div>

                        <div className="flex-shrink-0 flex flex-col items-stretch md:items-end gap-3 w-full md:w-auto">
                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                <button
                                    onClick={handleToggleGenerator}
                                    className="bg-surface-dark hover:bg-surface-border text-white text-sm font-bold py-2.5 px-4 rounded-lg transition-colors border border-surface-border flex items-center justify-center gap-2 "
                                >
                                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                                    {showGenerator ? 'Close Generator' : 'Generate Prompt'}
                                </button>
                                <button
                                    onClick={handleConnectAgent}
                                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-colors shadow-md shadow-blue-900/20"
                                >
                                    Connect Agent
                                </button>
                            </div>
                            <span className="text-[10px] text-slate-500 text-center md:text-right w-full">Template ID: {template.id.split('-')[0]}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#1f2937]/50">
                        <span className="text-xs font-semibold text-slate-500 flex items-center mr-2">TARGET SKILLS:</span>
                        {template.skills.map((s: string) => (
                            <span key={s} className="px-3 py-1 rounded-full text-[12px] font-medium bg-[#0f766e]/30 text-[#5eead4] border border-[#14b8a6]/20">
                                {s}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Generator Section */}
                {showGenerator && (
                    <div className="bg-surface-dark border border-surface-border rounded-2xl p-6 md:p-8 shadow-xl animate-fade-in-up flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 flex flex-col gap-6">
                            <h2 className="text-xl font-bold text-white">Generate Access Prompt</h2>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-300 mb-2 block">Evaluation Template</label>
                                    <div className="w-full bg-[#111722] border border-surface-border text-slate-400 text-sm rounded-lg p-3.5 opacity-80 cursor-not-allowed flex items-center justify-between">
                                        <span>{template.name}</span>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded
                                            ${template.difficulty === 'Hard' ? 'text-red-400 bg-red-400/10' :
                                                template.difficulty === 'Medium' ? 'text-yellow-400 bg-yellow-400/10' :
                                                    'text-emerald-400 bg-emerald-400/10'}`}>
                                            {template.difficulty}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <Input label="Expiration" placeholder="24 Hours" disabled />
                                    <Input label="Max Attempts" placeholder="Unlimited" disabled />
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-300">
                                    Generates a cryptographically signed invite token linked to your admin account.
                                </div>
                                <Button
                                    className="w-full mt-2"
                                    icon="bolt"
                                    onClick={handleGenerateInvite}
                                    disabled={genLoading}
                                >
                                    {genLoading ? 'Generating...' : 'Generate Prompt'}
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-6">
                            {!generatedPrompt ? (
                                <div className="h-full flex items-center justify-center text-slate-500 text-sm italic border-2 border-dashed border-surface-border rounded-2xl min-h-[200px]">
                                    Click "Generate Prompt" to see the instructions and token here.
                                </div>
                            ) : (
                                <>
                                    <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-6">
                                        <h3 className="text-white font-bold mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-indigo-400">info</span> How it works</h3>
                                        <ul className="space-y-2 text-sm text-indigo-200/80">
                                            <li>• The prompt includes registration instructions and a signed token.</li>
                                            <li>• Send this to your agent (or use it in your test script).</li>
                                        </ul>
                                    </div>
                                    <div className="bg-black/40 border border-primary/50 rounded-2xl p-0 overflow-hidden shadow-2xl shadow-primary/10">
                                        <div className="bg-black/50 p-4 border-b border-white/5 flex justify-between items-center">
                                            <span className="text-xs font-bold text-primary uppercase flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Generated Invite</span>
                                        </div>
                                        <div className="p-5 flex flex-col gap-4">
                                            {/* Token Section */}
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Invite Token</label>
                                                    <span className="text-[10px] text-emerald-500 font-mono">Status: Active</span>
                                                </div>
                                                <div className="flex gap-2">

                                                    <Input value={generatedPrompt.token} readOnly />

                                                    <Button
                                                        variant="secondary"
                                                        icon={copyTokenToast ? 'check' : 'content_copy'}
                                                        onClick={handleCopyToken}
                                                        className="shrink-0 ml-1"
                                                        title="Copy Token"
                                                    >
                                                        {copyTokenToast ? 'Copied' : 'Copy'}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="h-px bg-white/5 w-full my-1"></div>

                                            {/* Prompt Section */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Full Instructions</label>
                                                <div className="font-mono text-[11px] leading-relaxed text-slate-400 break-all bg-[#0d1117] p-4 rounded-lg border border-white/5 whitespace-pre-wrap max-h-[160px] overflow-y-auto">
                                                    {generatedPrompt.prompt}
                                                </div>
                                                <Button
                                                    variant="secondary"
                                                    icon={copyToast ? 'check' : 'content_copy'}
                                                    className="w-full mt-1"
                                                    onClick={handleCopyPrompt}
                                                >
                                                    {copyToast ? 'Copied Instructions!' : 'Copy Full Instructions'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Criteria Section */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">fact_check</span>
                        Evaluation Criteria
                    </h3>

                    {template.criteria && template.criteria.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {template.criteria.map((c, index) => (
                                <div key={c.id} className="bg-[#111827]/60 border border-[#1f2937] rounded-xl p-5 flex flex-col gap-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex gap-3">
                                            <div className="flex items-center justify-center size-6 rounded bg-[#1f2937] text-slate-400 text-xs font-bold shrink-0">
                                                {index + 1}
                                            </div>
                                            <p className="text-slate-200 text-sm leading-relaxed">{c.prompt}</p>
                                        </div>
                                        <div className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded bg-background-dark border border-[#374151]">
                                            <span className="text-[10px] font-semibold text-slate-400">MIN SCORE</span>
                                            <span className="text-xs font-bold text-primary">{c.min_score}%</span>
                                        </div>
                                    </div>
                                    <div className="ml-9 p-3 rounded-lg bg-[#0f172a]/50 border border-slate-800/50">
                                        <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">verified</span>
                                            EXPECTED BEHAVIOR
                                        </div>
                                        <p className="text-slate-400 text-sm italic">{c.expected}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 border border-dashed border-[#1f2937] rounded-xl text-center text-slate-500 bg-[#111827]/30">
                            No criteria defined for this public template.
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
};

