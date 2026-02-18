import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Common';
import { useNavigate, useParams } from 'react-router-dom';

import { Run, Certificate } from '../types';

import { certificateService } from '../services/CertificateService';
import { runService } from '../services/RunService';

export const CertificateDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [runData, setRunData] = useState<Run | null>(null);
    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [historyError, setHistoryError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            certificateService.getCertificate(id)
                .then(cert => {
                    setCertificate(cert);
                    return runService.getRun(cert.runId);
                })
                .then(run => setRunData(run))
                .catch(err => {
                    console.error(err);
                    setHistoryError(err.message || "Failed to load assessment history");
                })
                .finally(() => setIsLoading(false));
        }
    }, [id]);

    const getDuration = () => {
        if (!runData || !runData.steps || runData.steps.length === 0) return 'N/A';
        const start = new Date(runData.timestamp).getTime();
        const end = new Date(runData.steps[runData.steps.length - 1].timestamp).getTime();
        const diffMs = end - start;
        if (diffMs < 60000) return `${Math.round(diffMs / 1000)}s`;
        return `${Math.round(diffMs / 60000)} min`;
    };

    const getSkills = (): string[] => {
        if (!runData?.templateSkills) return [];
        try { return JSON.parse(runData.templateSkills); }
        catch { return []; }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-background-dark flex items-center justify-center text-white">Loading Verification Data...</div>;
    }

    if (!certificate) {
        return <div className="min-h-screen bg-background-dark flex items-center justify-center text-white">Certificate Not Found</div>;
    }

    const skills = getSkills();

    return (
        <div className="min-h-screen bg-background-dark text-white font-display overflow-x-hidden relative">

            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>

            <header className="flex items-center justify-between border-b border-white/10 bg-[#111722]/80 backdrop-blur-md px-10 py-4 sticky top-0 z-50">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/certificates')}>
                    <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-2xl">verified_user</span>
                    </div>
                    <div>
                        <h2 className="text-base font-bold leading-tight">Verifiable AI</h2>
                        <p className="text-xs text-slate-400">Certificate Verification Portal</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        className="hidden sm:flex"
                        icon="grid_view"
                        onClick={() => navigate('/certificates')}
                    >
                        All Certificates
                    </Button>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-10 relative z-10">
                <div className="w-full max-w-4xl animate-fade-in-up">
                    {/* Header and Details */}
                    <div className="flex items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="size-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                            <span className="text-sm font-semibold text-green-400 tracking-wide uppercase">Live Verification</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <span className="material-symbols-outlined text-[18px]">history</span>
                            <span>Last checked: Just now</span>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-[#1a1d24] shadow-2xl">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-400 to-primary"></div>
                        <div className="p-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-8 border-b border-surface-border">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold mb-3 uppercase tracking-wider">
                                        <span className="material-symbols-outlined text-[16px]">check_circle</span> Verified Valid
                                    </div>
                                    <h1 className="text-4xl font-black tracking-tight mb-2">Certificate of Evaluation</h1>
                                    <p className="text-slate-400 text-base max-w-lg">This record confirms the authentic performance evaluation of an AI Agent against standardized safety benchmarks.</p>
                                </div>
                                <div className="flex flex-col items-center justify-center bg-[#13161c] border border-surface-border rounded-xl p-4 min-w-[140px]">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Final Score</span>
                                    <div className="text-4xl font-black text-primary">{certificate.score}</div>
                                    <span className="text-xs font-medium text-slate-500">out of 100</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                                {[
                                    ['Agent ID', certificate.agentName],
                                    ['Template', runData?.templateName || certificate.templateName || 'Standard'],
                                    ['Difficulty', runData?.templateDifficulty || 'N/A'],
                                    ['Duration', getDuration()],
                                    ['Evaluation Date', new Date(certificate.issuedAt).toLocaleDateString()],
                                    ['Certificate ID', certificate.id]
                                ].map(([label, val]) => (
                                    <div key={label} className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
                                        <div className="text-base font-semibold text-slate-200 truncate pr-2" title={String(val)}>{val}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Skills & Template Info */}
                            <div className="rounded-xl bg-[#13161c] border border-surface-border p-6 mb-10">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-[18px]">science</span> Assessment Details
                                    </h3>
                                </div>
                                {skills.length > 0 && (
                                    <div className="mb-4">
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-bold">Skills Tested</div>
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map(tag => (
                                                <span key={tag} className="px-2.5 py-1 rounded-md text-xs font-medium bg-surface-border text-slate-300">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {runData?.templateDescription && (
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-bold">Template Description</div>
                                        <p className="text-sm text-slate-400 leading-relaxed">{runData.templateDescription}</p>
                                    </div>
                                )}
                                {!skills.length && !runData?.templateDescription && (
                                    <p className="text-sm text-slate-500 italic">No template details recorded for this assessment.</p>
                                )}
                            </div>

                            <div className="border border-primary/20 rounded-xl p-6 overflow-hidden relative">
                                <div className="absolute inset-0 bg-primary/5 -z-10"></div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-primary">encrypted</span> Cryptographic Proof of Integrity
                                </h3>
                                <div className="grid gap-4">
                                    <div className="flex flex-col sm:flex-row justify-between gap-3 p-3 rounded-lg bg-[#11141a] border border-surface-border hover:border-primary/40 transition-colors">
                                        <div className="flex flex-col gap-1 overflow-hidden">
                                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Certificate Hash</span>
                                            <code className="text-xs sm:text-sm font-mono text-slate-300 truncate">{certificate.dataHash}</code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assessment History Section */}
                {historyError && (
                    <div className="w-full max-w-4xl text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6">
                        Failed to load assessment history: {historyError}
                    </div>
                )}

                {runData && runData.steps && (
                    <div className="w-full max-w-4xl animate-fade-in-up delay-100">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-primary text-2xl">history_edu</span>
                            <h2 className="text-xl font-bold text-white">Assessment History</h2>
                        </div>

                        <div className="space-y-4">
                            {runData.steps.reduce((acc: any[], step, index) => {
                                if (step.gradingHistory && step.gradingHistory.length > 0) {
                                    // Find the most recent interviewer question before this step
                                    let question = null;
                                    if (runData.steps) {
                                        for (let i = index - 1; i >= 0; i--) {
                                            if (runData.steps[i].role === 'interviewer') {
                                                question = runData.steps[i];
                                                break;
                                            }
                                        }
                                    }

                                    acc.push({
                                        step,
                                        question,
                                        number: acc.length + 1
                                    });
                                }
                                return acc;
                            }, []).map(({ step, question, number }: any) => (
                                <div key={step.id} className="bg-[#1a1d24] border border-surface-border rounded-xl p-6 hover:border-surface-border/80 transition-colors">
                                    <div className="flex items-start justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-surface-dark border border-surface-border flex items-center justify-center text-slate-400 font-mono text-xs">
                                                {number}
                                            </div>
                                            <h3 className="font-semibold text-slate-200 text-sm">Evaluation Step</h3>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded text-xs font-bold border ${step.score && step.score >= 70 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                            Final Score: {step.score || 0}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid gap-4">
                                            {question && (
                                                <div className="bg-[#11141a] rounded-lg p-4 border border-surface-border/50">
                                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-bold">Interviewer Question</div>
                                                    <div className="text-sm text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">{question.content}</div>
                                                </div>
                                            )}

                                            <div className="bg-[#11141a] rounded-lg p-4 border border-surface-border/50">
                                                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-bold">Agent Answer</div>
                                                <div className="text-sm text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">{step.content}</div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-3 font-bold">Grading Analysis</div>
                                            <div className="space-y-3">
                                                {step.gradingHistory!.map((grade: any, gIdx: number) => (
                                                    <div
                                                        key={gIdx}
                                                        className={`rounded-lg p-4 border text-sm transition-all ${grade.isSelected
                                                            ? 'bg-primary/5 border-primary/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                                                            : 'bg-[#0d1016] border-surface-border/50 opacity-80 hover:opacity-100'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded ${grade.source === 'human' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                                    {grade.source === 'human' ? 'Human Review' : 'AI Analysis'}
                                                                </span>
                                                                {grade.isSelected && (
                                                                    <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                                                                        <span className="material-symbols-outlined text-[14px]">check_circle</span> Elected
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className={`font-mono font-bold ${grade.score >= 70 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                {grade.score}/100
                                                            </div>
                                                        </div>
                                                        <div className="text-slate-400 leading-relaxed pl-1 border-l-2 border-surface-border">
                                                            {grade.reasoning}
                                                        </div>
                                                        {grade.createdAt && (
                                                            <div className="mt-2 text-[10px] text-slate-600 font-mono text-right">
                                                                {new Date(grade.createdAt).toLocaleString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {runData.steps.filter(s => s.gradingHistory && s.gradingHistory.length > 0).length === 0 && (
                                <div className="text-center py-8 text-slate-500 bg-[#1a1d24] rounded-xl border border-surface-border">
                                    No graded steps found in this assessment.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};