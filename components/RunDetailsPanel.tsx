import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Textarea, Badge } from './ui/Common';
import { Run, ChatStep, GradeEntry } from '../types';
import { llmService } from '../services/LLMService';
import { runService } from '../services/RunService';

// Mock logs data for demonstration
const dummyLogs: Record<string, ChatStep[]> = {
    'default': [
        { id: '1', role: 'system', content: 'Session initialized.', timestamp: '00:00:01', status: 'info' },
        { id: '2', role: 'interviewer', content: 'Explain recursion.', timestamp: '00:00:05', status: 'info' },
        { id: '3', role: 'agent', content: 'Recursion is a function calling itself.', timestamp: '00:00:08', status: 'pass' },
        { id: '4', role: 'system', content: 'Basic definition provided.', timestamp: '00:00:09', status: 'pass', score: 85, category: 'Knowledge', gradingHistory: [{ source: 'ai', score: 85, reasoning: 'Basic definition provided.', createdAt: new Date().toISOString() }] }
    ]
};

interface RunDetailsPanelProps {
    run: Run | null;
    onClose: () => void;
}

interface RerunError {
    stepId: string;
    indexInQueue: number;
    message: string;
}

const LoadingSkeleton = ({ role }: { role: 'agent' | 'system' }) => (
    <div className={`relative pl-8 animate-fade-in-up`}>
        {/* Connector Line Ghost */}
        <div className="absolute left-[11px] top-0 h-full w-px bg-surface-border opacity-50"></div>

        <div className={`absolute left-0 top-0 size-6 rounded-full border-2 flex items-center justify-center z-10 bg-[#111722] ${role === 'agent' ? 'border-primary' : 'border-slate-600'}`}>
            <span className={`material-symbols-outlined text-[14px] ${role === 'agent' ? 'text-primary' : 'text-slate-400'}`}>{role === 'agent' ? 'smart_toy' : 'terminal'}</span>
        </div>
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <div className="h-3 w-20 bg-surface-border/50 rounded animate-pulse"></div>
                <div className="h-3 w-12 bg-surface-border/30 rounded animate-pulse"></div>
            </div>
            <div className={`p-4 rounded-lg border ${role === 'agent' ? 'border-primary/20 bg-primary/5' : 'border-surface-border bg-surface-dark'}`}>
                <div className="space-y-2.5">
                    <div className={`h-2 bg-current opacity-20 rounded animate-pulse ${role === 'agent' ? 'text-primary w-3/4' : 'text-slate-400 w-1/2'}`}></div>
                    <div className={`h-2 bg-current opacity-10 rounded animate-pulse ${role === 'agent' ? 'text-primary w-1/2' : 'text-slate-400 w-1/3'}`}></div>
                </div>
            </div>
        </div>
    </div>
);

interface GradingHistoryItemProps {
    entry: GradeEntry;
    isElected: boolean;
    onElect: () => void;
    readOnly?: boolean;
}

const GradingHistoryItem: React.FC<GradingHistoryItemProps> = ({ entry, isElected, onElect, readOnly }) => {
    // Determine container classes based on state
    const containerClasses = [
        "relative flex flex-col p-4 rounded-xl border transition-all duration-300 ml-0",
        isElected
            ? "bg-[#1a2332] border-primary shadow-lg opacity-100 z-10 scale-[1.01]"
            : "bg-[#111722] border-surface-border opacity-50 hover:opacity-100 grayscale hover:grayscale-0" // "Colored out" (dimmed & grayscale) for non-elected
    ].join(" ");

    return (
        <div className={containerClasses}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <div className={`size-6 rounded-full flex items-center justify-center border ${isElected ? 'bg-primary border-primary text-white' : 'bg-surface-dark border-slate-600 text-slate-500'}`}>
                        <span className="material-symbols-outlined text-[14px]">
                            {isElected ? 'check' : (entry.source === 'ai' ? 'smart_toy' : 'person')}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            {entry.source === 'human' ? 'Human Review' : 'AI Graded'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono opacity-60">
                            Created: {new Date(entry.createdAt).toLocaleString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                            {isElected && entry.electedAt && (
                                <>
                                    <span className="mx-1">•</span>
                                    <span className="text-emerald-400">
                                        Elected: {new Date(entry.electedAt).toLocaleString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </>
                            )}
                        </span>
                    </div>
                </div>
                <div className="font-mono text-xl font-bold tracking-tight text-white/90">
                    {entry.score}
                </div>
            </div>      <p className="text-sm text-slate-300 mb-3 pl-9 whitespace-pre-wrap">{entry.reasoning}</p>

            {!isElected && !readOnly && (
                <div className="pl-9">
                    <Button
                        variant="ghost"
                        className="text-xs h-7 px-3 border border-surface-border hover:border-primary hover:bg-primary/10"
                        icon="check_circle"
                        onClick={onElect}
                    >
                        Elect as Final
                    </Button>
                </div>
            )}
        </div>
    );
};

interface GradingFormProps {
    currentScore: number;
    onSubmit: (score: number, note: string) => void;
    onAIReGrade: () => void;
    isProcessing: boolean;
}

const GradingForm: React.FC<GradingFormProps> = ({ currentScore, onSubmit, onAIReGrade, isProcessing }) => {
    const [score, setScore] = useState(currentScore);
    const [note, setNote] = useState('');

    return (
        <div className="mt-2 p-4 rounded-xl border border-dashed border-surface-border bg-surface-dark/30 hover:bg-surface-dark transition-colors relative z-10 group/form">
            <div className="absolute left-[27px] top-[-24px] h-6 w-0.5 bg-surface-border -z-10"></div>
            <div className="flex items-center gap-2 mb-3">
                <div className="size-6 rounded-full bg-surface-border flex items-center justify-center text-slate-400 group-hover/form:text-white transition-colors">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                </div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover/form:text-white transition-colors">Add New Review</h4>
            </div>

            <div className="pl-9 space-y-3">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="text-xs font-bold text-slate-500">Score:</span>
                    <input
                        type="number"
                        className="bg-[#0a0e17] border border-surface-border rounded px-2 py-1 text-white text-sm w-20 text-center focus:border-primary outline-none"
                        placeholder="0-100"
                        value={score}
                        onChange={(e) => setScore(Number(e.target.value))}
                        min={0} max={100}
                    />
                    <input
                        type="range"
                        className="flex-1 accent-primary h-2 bg-surface-border rounded-lg appearance-none cursor-pointer min-w-[120px]"
                        min="0" max="100"
                        value={score}
                        onChange={(e) => setScore(Number(e.target.value))}
                    />
                </div>
                <textarea
                    className="w-full bg-[#0a0e17] border border-surface-border rounded-lg p-3 text-sm text-white resize-none focus:border-primary outline-none"
                    rows={2}
                    placeholder="Enter reasoning for new grade..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                ></textarea>
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-2 gap-2">
                    <Button
                        variant="secondary"
                        className="text-xs h-8 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/50 justify-center"
                        icon="smart_toy"
                        onClick={onAIReGrade}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Evaluating...' : 'Re-evaluate by AI'}
                    </Button>

                    <Button
                        icon="add_comment"
                        className="text-xs h-8 justify-center"
                        onClick={() => {
                            if (note.trim()) {
                                onSubmit(score, note);
                                setNote('');
                            }
                        }}
                    >
                        Submit Review
                    </Button>
                </div>
            </div>
        </div>
    );
}

export const RunDetailsPanel: React.FC<RunDetailsPanelProps> = ({ run, onClose }) => {
    const navigate = useNavigate();
    const [localLogs, setLocalLogs] = useState<ChatStep[]>([]);
    const [originalLogs, setOriginalLogs] = useState<ChatStep[] | null>(null);
    const scrollEndRef = useRef<HTMLDivElement>(null);

    const [isGradingMode, setIsGradingMode] = useState(false);
    const [showRerunConfirm, setShowRerunConfirm] = useState(false);
    const [regradingStepId, setRegradingStepId] = useState<string | null>(null);
    const [isRunningFullRegrade, setIsRunningFullRegrade] = useState(false);
    const [rerunError, setRerunError] = useState<RerunError | null>(null);

    // Progress state for re-runs
    const [regradeProgress, setRegradeProgress] = useState(0);
    const [currentRegradeIndex, setCurrentRegradeIndex] = useState(-1);

    // History expansion state
    const [expandedHistoryIds, setExpandedHistoryIds] = useState<Set<string>>(new Set());
    const [addingReviewForStep, setAddingReviewForStep] = useState<string | null>(null);
    const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);

    const toggleHistory = (stepId: string) => {
        setExpandedHistoryIds(prev => {
            const next = new Set(prev);
            if (next.has(stepId)) {
                next.delete(stepId);
            } else {
                next.add(stepId);
            }
            return next;
        });
    };

    // Track if we should continue running (for error handling cancellation)
    const shouldContinueRef = useRef(true);

    useEffect(() => {
        if (run) {
            let logs: ChatStep[] = [];
            if (run.steps && run.steps.length > 0) {
                logs = run.steps;
            } else {
                logs = dummyLogs[run.id] || dummyLogs['default'];
            }

            setLocalLogs(JSON.parse(JSON.stringify(logs)));

            // Auto-scroll on update if running
            if (run.status === 'running') {
                setTimeout(() => {
                    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        }
    }, [run]);

    if (!run) return null;

    // Calculate Progress
    const stepsCount = localLogs.length;
    const totalEstimatedSteps = run.totalSteps ? (run.totalSteps * 3) + 2 : (Math.max(stepsCount + 2, 20));

    let displayProgress = 0;
    if (isRunningFullRegrade) {
        displayProgress = regradeProgress;
    } else if (run.status === 'running') {
        displayProgress = Math.min(100, Math.round((stepsCount / totalEstimatedSteps) * 100));
    }

    const lastStep = localLogs[localLogs.length - 1];
    let pendingRole: 'agent' | 'system' | null = null;

    if (run.status === 'running' && lastStep) {
        if (lastStep.role === 'interviewer') pendingRole = 'agent';
        else if (lastStep.role === 'agent') pendingRole = 'system';
    }

    const scoredSteps = localLogs.filter(s => typeof s.score === 'number');
    const avgScore = scoredSteps.length > 0
        ? Math.round(scoredSteps.reduce((acc, curr) => acc + (curr.score || 0), 0) / scoredSteps.length)
        : 0;

    const updateStepGrade = async (stepId: string, source: 'human' | 'ai', newScore: number, note?: string) => {
        let updatedStep: ChatStep | null = null;

        setLocalLogs(prev => prev.map(step => {
            if (step.id !== stepId) return step;

            const newEntry: GradeEntry = {
                source,
                score: newScore,
                reasoning: note,
                createdAt: new Date().toISOString()
            };

            // Preserve existing state if history is empty
            let history = step.gradingHistory ? [...step.gradingHistory] : [];
            if (history.length === 0) {
                history.push({
                    source: step.isHumanGraded ? 'human' : 'ai',
                    score: step.score || 0,
                    reasoning: step.humanNote || step.content,
                    createdAt: step.timestamp // This is already a datetime string from DB/API
                });
            }
            // Reset isSelected for all, then set for new entry
            const updatedHistory = history.map(h => ({ ...h, isSelected: false }));
            newEntry.isSelected = true;
            newEntry.electedAt = newEntry.createdAt; // Inherit creation time as election time for new entries
            updatedHistory.push(newEntry);

            updatedStep = {
                ...step,
                score: newScore,
                isHumanGraded: source === 'human',
                humanNote: source === 'human' ? note : undefined,
                content: source === 'ai' && note ? note : step.content,
                gradingHistory: updatedHistory
            };

            return updatedStep;
        }));

        // Persist to backend - Only sending history and content (for AI text updates)
        if (updatedStep && run) {
            try {
                // @ts-ignore
                await runService.updateStep(run.id, stepId, {
                    gradingHistory: updatedStep.gradingHistory,
                    content: updatedStep.content
                });
            } catch (err) {
                console.error("Failed to persist step update", err);
                // Optionally revert local state or show notification
            }
        }
    };

    const handleElectEntry = async (stepId: string, entryIndex: number) => {
        let updatedStep: ChatStep | null = null;

        setLocalLogs(prev => prev.map(step => {
            if (step.id !== stepId) return step;
            if (!step.gradingHistory) return step;

            const selectedEntry = step.gradingHistory[entryIndex];
            if (!selectedEntry) return step;

            // Update history: Select this one, deselect others, set electedAt
            const now = new Date().toISOString();
            const updatedHistory = step.gradingHistory.map((h, idx) => ({
                ...h,
                isSelected: idx === entryIndex,
                electedAt: idx === entryIndex ? (h.electedAt || now) : h.electedAt // Keep existing if already set? Or update? User said "elected time", implying *when* it was elected. Let's update it to now if it's being re-elected, or specifically if it becomes the SELECTED one.
                // Actually, if I re-elect an old one, does the time change? 
                // "It should have elected time if its elected". 
                // Let's set it to NOW whenever it becomes isSelected=true.
            }));

            // Correction: If we want to track when it was elected, we should update it. 
            // However, modifying the history map above is slightly complex logic for "update only if changing to true".
            // Let's simplify: Just set electedAt = now for the selected one.
            const finalHistory = step.gradingHistory.map((h, idx) => {
                if (idx === entryIndex) {
                    return { ...h, isSelected: true, electedAt: now };
                }
                return { ...h, isSelected: false };
            });

            updatedStep = {
                ...step,
                score: selectedEntry.score,
                isHumanGraded: selectedEntry.source === 'human',
                humanNote: selectedEntry.source === 'human' ? selectedEntry.reasoning : undefined,
                content: selectedEntry.source === 'ai' ? (selectedEntry.reasoning || step.content) : step.content,
                gradingHistory: finalHistory
            };

            return updatedStep;
        }));

        if (updatedStep && run) {
            try {
                // @ts-ignore
                await runService.updateStep(run.id, stepId, {
                    gradingHistory: updatedStep.gradingHistory,
                    content: updatedStep.content
                });
            } catch (err) {
                console.error("Failed to persist election", err);
            }
        }
    };

    const handleAIReGrade = async (stepId: string, stepIndex: number): Promise<void> => {
        setRegradingStepId(stepId);
        try {
            let question = "Unknown Question";
            let answer = "Unknown Answer";
            for (let i = stepIndex - 1; i >= 0; i--) {
                const s = localLogs[i];
                if (s.role === 'agent' && answer === "Unknown Answer") answer = s.content;
                if (s.role === 'interviewer' && question === "Unknown Question") {
                    question = s.content;
                    break;
                }
            }

            const result = await llmService.reEvaluateResponse(question, answer);
            updateStepGrade(stepId, 'ai', result.score, result.reasoning);

        } catch (e) {
            console.error("Re-grading failed", e);
            throw e;
        } finally {
            setRegradingStepId(null);
        }
    };

    const handleSaveGrades = () => {
        setIsGradingMode(false);
        setOriginalLogs(null);
    };

    const executeRegradeLoop = async (startIndex: number) => {
        const stepsToRegrade = localLogs
            .map((step, index) => ({ step, index, queueIndex: -1 }))
            .filter(({ step }) => step.role === 'system' && typeof step.score === 'number');

        stepsToRegrade.forEach((item, idx) => item.queueIndex = idx);

        shouldContinueRef.current = true;
        setIsRunningFullRegrade(true);
        setRegradeProgress(0);
        setRerunError(null);

        for (let i = startIndex; i < stepsToRegrade.length; i++) {
            if (!shouldContinueRef.current) break;

            const { step, index } = stepsToRegrade[i];

            setCurrentRegradeIndex(index);
            setRegradeProgress(Math.round(((i) / stepsToRegrade.length) * 100));

            const el = document.getElementById(`step-${step.id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });

            try {
                await new Promise(resolve => setTimeout(resolve, 800));
                await handleAIReGrade(step.id, index);
                setRegradeProgress(Math.round(((i + 1) / stepsToRegrade.length) * 100));
            } catch (error) {
                setRerunError({
                    stepId: step.id,
                    indexInQueue: i,
                    message: "Execution interrupted: Unable to verify response."
                });
                setIsRunningFullRegrade(false);
                return;
            }
        }

        setCurrentRegradeIndex(-1);
        setIsRunningFullRegrade(false);
        setRegradeProgress(100);
    };

    const handleFullReRun = async () => {
        setOriginalLogs(JSON.parse(JSON.stringify(localLogs)));
        setShowRerunConfirm(false);
        executeRegradeLoop(0);
    };

    const handleRetryRun = () => {
        if (rerunError) {
            executeRegradeLoop(rerunError.indexInQueue);
        }
    };

    const handleDiscardRun = () => {
        if (originalLogs) {
            setLocalLogs(originalLogs);
            setOriginalLogs(null);
        }
        setRerunError(null);
        setIsRunningFullRegrade(false);
        setRegradeProgress(0);
        setCurrentRegradeIndex(-1);
    };

    const handleExport = async () => {
        if (!run) return;
        try {
            const apiBase = `${(import.meta as any).env?.VITE_API_BASE_URL || ''}/api/runs`;
            const response = await fetch(`${apiBase}/${run.id}/export`);
            if (!response.ok) throw new Error(`Export failed: ${response.statusText}`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `run-${run.id}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed', err);
        }
    };

    const handleGenerateCertificate = async () => {
        if (!run) return;
        setIsGeneratingCertificate(true);
        try {
            const cert = await runService.issueCertificate(run.id);
            // Navigate to certificate view
            onClose();
            navigate(`/certificate/${cert.id}`);
        } catch (err) {
            console.error("Failed to issue certificate", err);
            // Could add toast notification here
        } finally {
            setIsGeneratingCertificate(false);
        }
    };


    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isRunningFullRegrade && run.status !== 'running' && onClose()}></div>
            <div className="relative w-full md:max-w-3xl bg-[#111722] md:border-l border-surface-border shadow-2xl h-full flex flex-col animate-fade-in-up">

                {/* Error Overlay */}
                {rerunError && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-fade-in-up">
                        <div className="bg-[#1a2332] border border-red-500/30 rounded-xl p-6 max-w-md w-full shadow-2xl">
                            <div className="flex items-center gap-3 mb-4 text-red-500">
                                <span className="material-symbols-outlined text-3xl">error</span>
                                <h3 className="text-xl font-bold text-white">Execution Failed</h3>
                            </div>
                            <p className="text-slate-300 mb-2">The automated re-evaluation process encountered an error at step <span className="font-mono text-white">{rerunError.indexInQueue + 1}</span>.</p>
                            <p className="text-xs text-red-400 font-mono bg-red-500/10 p-2 rounded border border-red-500/10 mb-6">{rerunError.message}</p>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <Button variant="ghost" onClick={handleDiscardRun}>Discard</Button>
                                <Button onClick={handleRetryRun} icon="refresh">Retry</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col border-b border-surface-border bg-surface-dark/50 z-20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 gap-4 sm:gap-0">
                        <div className="flex justify-between items-start sm:block">
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-3">
                                    {run.agentName}
                                    {(run.status === 'running' || isRunningFullRegrade) && (
                                        <span className="flex h-2 w-2 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                    )}
                                </h2>
                                <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                                    <span className="font-mono bg-surface-border/50 px-1.5 rounded text-xs">{run.id}</span>
                                    <span>•</span>
                                    <span>{run.timestamp}</span>
                                </div>
                            </div>

                            {/* Mobile Close Button (Top Right) */}
                            <button onClick={onClose} disabled={isRunningFullRegrade || run.status === 'running'} className="sm:hidden p-2 -mr-2 -mt-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors disabled:opacity-50">
                                <span className="material-symbols-outlined text-2xl">close</span>
                            </button>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0">
                            <div className="flex flex-col items-start sm:items-end">
                                <span className="text-[10px] font-bold uppercase text-slate-500">Current Score</span>
                                <span className={`text-2xl md:text-3xl font-black transition-all ${avgScore > 80 ? 'text-emerald-400' : avgScore > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {avgScore}
                                </span>
                            </div>

                            {/* Desktop Close Button */}
                            <button onClick={onClose} disabled={isRunningFullRegrade || run.status === 'running'} className="hidden sm:block p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors disabled:opacity-50">
                                <span className="material-symbols-outlined text-2xl">close</span>
                            </button>
                        </div>
                    </div>

                    {(run.status === 'running' || isRunningFullRegrade) && (
                        <div className="w-full h-1 bg-surface-border relative overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
                                style={{ width: `${displayProgress}%` }}
                            ></div>
                            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"></div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth bg-gradient-to-b from-[#111722] to-[#0d121c]">
                    {localLogs.map((step, idx) => {
                        const isScoreStep = step.role === 'system' && typeof step.score === 'number';
                        const isProcessing = regradingStepId === step.id;

                        const isPendingReRun = isRunningFullRegrade && idx > currentRegradeIndex && !isProcessing;

                        const containerClasses = `relative py-4 group transition-all duration-500 
                            ${isProcessing ? 'scale-[1.02]' : ''} 
                            ${isPendingReRun ? 'opacity-30 blur-[1px] grayscale' : 'opacity-100'}`;

                        if (isScoreStep) {
                            // Construct valid history
                            const history = step.gradingHistory && step.gradingHistory.length > 0
                                ? [...step.gradingHistory]
                                : [{
                                    source: step.isHumanGraded ? 'human' : 'ai',
                                    score: step.score || 0,
                                    reasoning: step.humanNote || step.content,
                                    createdAt: step.timestamp
                                } as GradeEntry];

                            return (
                                <div key={step.id} id={`step-${step.id}`} className={containerClasses}>
                                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-surface-border -z-10"></div>
                                    <div className="flex justify-center w-full">
                                        {isGradingMode ? (
                                            <div className="flex flex-col gap-6 w-full max-w-lg relative animate-fade-in-up">
                                                {/* Timeline Track */}
                                                <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-surface-border -z-10"></div>

                                                {(() => {
                                                    // Identify the elected entry
                                                    let selectedIndex = history.findIndex(entry =>
                                                        entry.isSelected ?? (entry.score === step.score &&
                                                            entry.source === (step.isHumanGraded ? 'human' : 'ai') &&
                                                            entry.reasoning === (step.isHumanGraded ? step.humanNote : step.content))
                                                    );

                                                    // Default to last if none explicitly matched (shouldn't happen with correct data)
                                                    if (selectedIndex === -1) selectedIndex = history.length - 1;

                                                    const selectedEntry = history[selectedIndex];

                                                    // Get others and reverse them (latest first)
                                                    const otherEntries = history
                                                        .map((entry, index) => ({ entry, originalIndex: index }))
                                                        .filter(item => item.originalIndex !== selectedIndex)
                                                        .reverse();

                                                    return (
                                                        <>
                                                            {/* 1. Elected Entry (Top) */}
                                                            <GradingHistoryItem
                                                                key={`selected-${selectedIndex}`}
                                                                entry={selectedEntry}
                                                                isElected={true}
                                                                onElect={() => { }} // Already elected
                                                            />

                                                            {/* 2. Add Button & Form Panel */}
                                                            <div className="flex flex-col items-center gap-4 my-2">
                                                                {!addingReviewForStep && (
                                                                    <div className="w-full flex items-center gap-4">
                                                                        <div className="h-px bg-surface-border flex-1"></div>
                                                                        <Button
                                                                            variant="secondary"
                                                                            className="rounded-full size-8 p-0 flex items-center justify-center border-dashed border-slate-500 text-slate-400 hover:text-white hover:border-white"
                                                                            onClick={() => setAddingReviewForStep(step.id)}
                                                                        >
                                                                            <span className="material-symbols-outlined text-lg">add</span>
                                                                        </Button>
                                                                        <div className="h-px bg-surface-border flex-1"></div>
                                                                    </div>
                                                                )}

                                                                {addingReviewForStep === step.id && (
                                                                    <div className="w-full animate-fade-in-up">
                                                                        <GradingForm
                                                                            currentScore={step.score || 0}
                                                                            onSubmit={(score, note) => {
                                                                                updateStepGrade(step.id, 'human', score, note);
                                                                                setAddingReviewForStep(null);
                                                                            }}
                                                                            onAIReGrade={async () => {
                                                                                await handleAIReGrade(step.id, idx);
                                                                                setAddingReviewForStep(null);
                                                                            }}
                                                                            isProcessing={isProcessing}
                                                                        />
                                                                        <div className="flex justify-center mt-2">
                                                                            <Button variant="ghost" className="text-xs text-slate-500" onClick={() => setAddingReviewForStep(null)}>Cancel</Button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* 3. Other Entries (Latest First) */}
                                                            {otherEntries.map(({ entry, originalIndex }) => (
                                                                <GradingHistoryItem
                                                                    key={originalIndex}
                                                                    entry={entry}
                                                                    isElected={false}
                                                                    onElect={() => handleElectEntry(step.id, originalIndex)}
                                                                />
                                                            ))}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        ) : (
                                            // View Mode Pill
                                            <div className="flex flex-col items-center gap-2 z-10 max-w-lg w-full">
                                                <div
                                                    onClick={() => toggleHistory(step.id)}
                                                    className={`
                                                    flex items-center gap-3 px-4 py-1.5 rounded-full border shadow-lg relative transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95
                                                    ${isProcessing ? 'scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : ''}
                                                    ${(step.score || 0) >= 90 ? 'bg-[#062c1e] border-emerald-500/30 text-emerald-400' :
                                                            (step.score || 0) >= 70 ? 'bg-[#2e1d05] border-yellow-500/30 text-yellow-400' :
                                                                'bg-[#2c0b0e] border-red-500/30 text-red-400'}
                                                 `}>
                                                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                        {step.isHumanGraded ? (
                                                            <span className="flex items-center gap-1 text-yellow-400"><span className="material-symbols-outlined text-[14px]">person_edit</span> Human</span>
                                                        ) : (
                                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">auto_awesome</span> AI Graded</span>
                                                        )}
                                                    </span>
                                                    <div className="w-px h-3 bg-current opacity-20"></div>
                                                    <span className="font-mono font-bold">{step.score}/100</span>
                                                    <span className={`material-symbols-outlined text-[16px] transition-transform duration-300 ${expandedHistoryIds.has(step.id) ? 'rotate-180' : ''}`}>expand_more</span>
                                                </div>

                                                {step.gradingHistory && step.gradingHistory.length > 1 && !expandedHistoryIds.has(step.id) && (
                                                    <div className="text-[10px] text-slate-600 bg-surface-dark px-2 py-0.5 rounded border border-surface-border mt-1">
                                                        {step.gradingHistory.length} revisions available
                                                    </div>
                                                )}

                                                {/* Expanded History View */}
                                                {expandedHistoryIds.has(step.id) && history.length > 0 && (
                                                    <div className="flex flex-col gap-3 w-full animate-fade-in-up mt-4">
                                                        <div className="text-[10px] font-bold uppercase text-slate-500 text-center mb-1">Evaluation Details</div>
                                                        {(() => {
                                                            // Identify the elected entry
                                                            let selectedIndex = history.findIndex(entry =>
                                                                entry.isSelected ?? (entry.score === step.score &&
                                                                    entry.source === (step.isHumanGraded ? 'human' : 'ai') &&
                                                                    entry.reasoning === (step.isHumanGraded ? step.humanNote : step.content))
                                                            );

                                                            // Default to last if none explicitly matched
                                                            if (selectedIndex === -1) selectedIndex = history.length - 1;

                                                            const selectedEntry = history[selectedIndex];

                                                            // Get others and reverse them (latest first)
                                                            const otherEntries = history
                                                                .map((entry, index) => ({ entry, originalIndex: index }))
                                                                .filter(item => item.originalIndex !== selectedIndex)
                                                                .reverse();

                                                            return (
                                                                <>
                                                                    {/* 1. Elected Entry (Top) */}
                                                                    <GradingHistoryItem
                                                                        key={`selected-${selectedIndex}`}
                                                                        entry={selectedEntry}
                                                                        isElected={true}
                                                                        onElect={() => { }}
                                                                        readOnly={true}
                                                                    />

                                                                    {/* 2. Divider for others */}
                                                                    {otherEntries.length > 0 && (
                                                                        <div className="w-full h-px bg-surface-border my-2 opacity-50"></div>
                                                                    )}

                                                                    {/* 3. Other Entries (Latest First) */}
                                                                    {otherEntries.map(({ entry, originalIndex }) => (
                                                                        <GradingHistoryItem
                                                                            key={originalIndex}
                                                                            entry={entry}
                                                                            isElected={false}
                                                                            onElect={() => { }}
                                                                            readOnly={true}
                                                                        />
                                                                    ))}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        // Regular Message
                        return (
                            <div key={step.id} className={`relative pl-8 group animate-fade-in-up ${isPendingReRun ? 'opacity-30 blur-[1px]' : ''} transition-all duration-500`}>
                                {!isScoreStep && idx !== localLogs.length - 1 && localLogs[idx + 1].role !== 'system' && (
                                    <div className="absolute left-[11px] top-8 bottom-[-24px] w-px bg-surface-border group-last:hidden"></div>
                                )}

                                <div className={`absolute left-0 top-0 size-6 rounded-full border-2 flex items-center justify-center z-10 
                                    ${step.role === 'agent' ? 'border-primary bg-[#111722]' :
                                        step.role === 'system' ? 'border-slate-600 bg-slate-600' :
                                            'border-emerald-500 bg-[#111722]'}`}>
                                    {step.role === 'agent' && <span className="material-symbols-outlined text-[14px] text-primary">smart_toy</span>}
                                    {step.role === 'interviewer' && <span className="material-symbols-outlined text-[14px] text-emerald-500">person</span>}
                                    {step.role === 'system' && <span className="material-symbols-outlined text-[14px] text-white">terminal</span>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-baseline justify-between">
                                        <span className={`text-xs font-bold uppercase tracking-wider 
                                            ${step.role === 'agent' ? 'text-primary' :
                                                step.role === 'system' ? 'text-slate-500' :
                                                    'text-emerald-400'}`}>
                                            {step.role}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-600">{step.timestamp}</span>
                                    </div>
                                    <div className={`p-4 rounded-lg text-sm leading-relaxed border relative whitespace-pre-wrap
                                        ${step.role === 'agent' ? 'bg-primary/5 border-primary/20 text-slate-200' :
                                            step.role === 'system' ? 'bg-surface-dark border-surface-border text-slate-400 font-mono text-xs' :
                                                'bg-[#1a2332] border-surface-border text-white'}`}>
                                        {step.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Pending Skeleton State */}
                    {pendingRole && <LoadingSkeleton role={pendingRole} />}

                    <div ref={scrollEndRef}></div>
                </div>

                {/* Footer */}
                <div className="p-4 md:p-6 border-t border-surface-border bg-surface-dark/50 relative overflow-hidden">
                    {showRerunConfirm ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-up">
                            <div className="flex items-center gap-2 text-yellow-400">
                                <span className="material-symbols-outlined">warning</span>
                                <span className="text-sm font-bold">Confirm Re-run Analysis?</span>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button variant="ghost" onClick={() => setShowRerunConfirm(false)} className="flex-1 sm:flex-none">Cancel</Button>
                                <Button onClick={handleFullReRun} icon="check_circle" className="flex-1 sm:flex-none">Yes, Execute</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                {isGradingMode ? (
                                    <span className="text-xs text-yellow-500 font-bold flex items-center gap-2 animate-pulse">
                                        <span className="material-symbols-outlined text-[16px]">edit_note</span>
                                        Editing Scores...
                                    </span>
                                ) : (
                                    <span className="text-xs text-slate-500 flex items-center gap-2">
                                        {run.status === 'running' ? 'Live Streaming...' :
                                            run.isCertified ? <><span className="material-symbols-outlined text-[14px] text-emerald-500">lock</span> Certified — Read-only view</> :
                                                'Read-only view'}
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar justify-start sm:justify-end">
                                {isGradingMode ? (
                                    <>
                                        <Button variant="ghost" onClick={() => setIsGradingMode(false)} className="whitespace-nowrap">Cancel</Button>
                                        <Button onClick={handleSaveGrades} icon="save" className="bg-yellow-500 hover:bg-yellow-400 text-black border-transparent whitespace-nowrap">Save Grades</Button>
                                    </>
                                ) : (
                                    <>
                                        {run.isCertified && run.certificate ? (
                                            <Button variant="secondary" icon="verified" onClick={() => navigate(`/certificate/${run.certificate!.id}`)} className="whitespace-nowrap">
                                                View Certificate
                                            </Button>
                                        ) : (
                                            <>
                                                <Button variant="secondary" icon="fact_check" onClick={() => setIsGradingMode(true)} disabled={isRunningFullRegrade || run.status === 'running'} className="whitespace-nowrap">
                                                    Human Review
                                                </Button>
                                                {run.status === 'pass' && (
                                                    <Button variant="secondary" icon="verified" onClick={handleGenerateCertificate} disabled={isRunningFullRegrade || isGeneratingCertificate} className="whitespace-nowrap">
                                                        {isGeneratingCertificate ? 'Issuing...' : 'Generate Certificate'}
                                                    </Button>
                                                )}
                                                <Button icon="replay" onClick={() => setShowRerunConfirm(true)} disabled={isRunningFullRegrade || run.status === 'running'} className="whitespace-nowrap">Re-run</Button>
                                            </>
                                        )}
                                        <Button variant="secondary" icon="download" onClick={handleExport} disabled={isRunningFullRegrade || run.status === 'running'} className="whitespace-nowrap">Export JSON</Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}