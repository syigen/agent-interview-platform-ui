import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PublicService } from '../services/PublicService';
import { Template } from '../types';
import { Button } from '../components/ui/Common';

export const PublicTemplateDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [template, setTemplate] = useState<Template | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                    <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
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

                        <div className="flex-shrink-0 flex flex-col items-stretch md:items-end gap-3">
                            <button
                                onClick={handleConnectAgent}
                                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-colors shadow-md shadow-blue-900/20 w-full md:w-auto"
                            >
                                Connect Agent
                            </button>
                            <span className="text-[10px] text-slate-500 text-center md:text-right">Template ID: {template.id.split('-')[0]}</span>
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
