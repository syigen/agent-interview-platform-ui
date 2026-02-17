import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Common';
import { Run, ChatStep, GradeEntry } from '../types';
import { geminiService } from '../services/GeminiService';
import { useAppDispatch } from '../store/hooks';
import { updateRunStatus } from '../store/slices/runSlice';

// Mock logs data for demonstration
const dummyLogs: Record<string, ChatStep[]> = {
    'default': [
        { id: '1', role: 'system', content: 'Session initialized.', timestamp: '00:00:01', status: 'info' },
        { id: '2', role: 'interviewer', content: 'Explain recursion.', timestamp: '00:00:05', status: 'info' },
        { id: '3', role: 'agent', content: 'Recursion is a function calling itself.', timestamp: '00:00:08', status: 'pass' },
        { id: '4', role: 'system', content: 'Basic definition provided.', timestamp: '00:00:09', status: 'pass', score: 85, category: 'Knowledge', gradingHistory: [{ source: 'ai', score: 85, reasoning: 'Basic definition provided.', timestamp: '00:00:09' }] }
    ]
};

// --- Sub-Components ---

interface ScoreDisplayProps {
    step: ChatStep;
    isLocked: boolean;
    onEdit: () => void;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ step, isLocked, onEdit }) => (
    <div className="flex flex-col items-center gap-2 z-10 max-w-lg w-full group relative">
        <div className={`
        flex items-center gap-3 px-5 py-2 rounded-full border shadow-lg relative transition-all duration-300
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
            <span className="font-mono font-bold text-lg">{step.score}</span>

            {/* Plus Button Overlay - ONLY visible if NOT locked */}
            {!isLocked && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="absolute -right-3 -top-3 size-6 rounded-full bg-primary text-white shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-110 transition-transform z-20 border border-white/20"
                    title="Add Review / Edit"
                >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
            )}
        </div>
        {!step.isHumanGraded && step.content && (
            <div className="text-xs text-slate-500 max-w-xs text-center italic opacity-80">
                "{step.content}"
            </div>
        )}
        {step.isHumanGraded && step.humanNote && (
            <div className="text-xs text-yellow-500/80 max-w-xs text-center italic">
                Note: "{step.humanNote}"
            </div>
        )}
    </div>
);

interface GradingEditorProps {
    step: ChatStep;
    onSave: () => void;
    onCancel: () => void;
    onUpdate: (updates: Partial<ChatStep>) => void;
    onAddReview: (score: number, note: string) => void;
    onSelectHistory: (entry: GradeEntry) => void;
}

const GradingEditor: React.FC<GradingEditorProps> = ({ step, onSave, onCancel, onUpdate, onAddReview, onSelectHistory }) => {
    return (
        <div className={`flex flex-col items-center gap-4 bg-[#1a2332] p-5 rounded-xl border border-primary shadow-[0_0_30px_-5px_rgba(37,99,235,0.3)] z-20 w-full max-w-sm animate-fade-in-up`}>
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-primary uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">edit_note</span>
                    Review Panel
                </span>
                <span className="text-2xl font-black text-white">{step.score}</span>
            </div>

            {/* Slider */}
            <div className="w-full">
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={step.score} 
                    onChange={(e) => onUpdate({ score: parseInt(e.target.value), isHumanGraded: true })}
                    className="w-full h-2 bg-surface-border rounded-lg appearance-none cursor-pointer accent-primary mb-2"
                />
            </div>

            {/* Note Input */}
            <div className="w-full pt-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Reviewer Note</label>
                <textarea 
                    className="w-full bg-[#111722] border border-surface-border rounded-lg text-xs text-white p-3 resize-none focus:border-primary/50 outline-none"
                    rows={3}
                    value={step.humanNote || ''}
                    onChange={(e) => onUpdate({ humanNote: e.target.value, isHumanGraded: true })}
                    placeholder="Enter reasoning..."
                />
            </div>
            
            {/* Add Review Action */}
            <div className="w-full flex justify-end pt-2 border-b border-white/5 pb-4">
                <Button 
                    variant="primary" 
                    onClick={() => onAddReview(step.score || 0, step.humanNote || '')} 
                    className="py-1.5 px-3 h-auto text-xs w-full" 
                    icon="add_comment"
                >
                    Add New Review
                </Button>
            </div>

            {/* History Grid */}
            {step.gradingHistory && step.gradingHistory.length > 0 && (
                <div className="w-full pt-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">History Selection</label>
                    <div className="grid grid-cols-4 gap-2">
                        {step.gradingHistory.map((entry, i) => {
                            const isActive = entry.score === step.score && 
                                (entry.source === 'human' ? entry.reasoning === step.humanNote : entry.reasoning === step.content);
                            
                            return (
                                <div key={i} className="relative group/history">
                                    <button 
                                        onClick={() => onSelectHistory(entry)}
                                        className={`w-full flex flex-col items-center justify-center gap-0.5 py-1.5 rounded border transition-all
                                            ${isActive 
                                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 font-bold' 
                                                : 'bg-[#111722] border-surface-border text-slate-500 hover:border-slate-400'
                                            }`}
                                    >
                                        <span className="text-xs font-mono">{entry.score}</span>
                                        <span className="material-symbols-outlined text-[10px] opacity-70">{entry.source === 'ai' ? 'smart_toy' : 'person'}</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Footer Actions */}
            <div className="w-full flex gap-3 mt-2 pt-2 border-t border-white/5">
                <Button variant="ghost" onClick={onCancel} className="flex-1 py-1.5 h-auto text-xs">Cancel</Button>
                <Button variant="secondary" onClick={onSave} className="flex-1 py-1.5 h-auto text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">Save</Button>
            </div>
        </div>
    );
};


// --- Main Component ---

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

export const RunDetailsPanel: React.FC<RunDetailsPanelProps> = ({ run, onClose }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [localLogs, setLocalLogs] = useState<ChatStep[]>([]);
    const [originalLogs, setOriginalLogs] = useState<ChatStep[] | null>(null);
    const scrollEndRef = useRef<HTMLDivElement>(null);
    
    // Editor State
    const [editingStepId, setEditingStepId] = useState<string | null>(null);
    const [preEditSnapshot, setPreEditSnapshot] = useState<ChatStep | null>(null);

    // Rerun State
    const [showRerunConfirm, setShowRerunConfirm] = useState(false);
    const [regradingStepId, setRegradingStepId] = useState<string | null>(null);
    const [isRunningFullRegrade, setIsRunningFullRegrade] = useState(false);
    const [rerunError, setRerunError] = useState<RerunError | null>(null);
    const [regradeProgress, setRegradeProgress] = useState(0);
    const [currentRegradeIndex, setCurrentRegradeIndex] = useState(-1);
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
            if (run.status === 'running') {
                setTimeout(() => {
                    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        }
    }, [run]);

    if (!run) return null;

    // A run is locked if it's explicitly certified or currently processing
    const isLocked = !!run.isCertified || run.status === 'running' || isRunningFullRegrade;
    
    const avgScore = localLogs.filter(s => s.score !== undefined).length > 0 
        ? Math.round(localLogs.filter(s => s.score !== undefined).reduce((acc, curr) => acc + (curr.score || 0), 0) / localLogs.filter(s => s.score !== undefined).length) 
        : 0;
    
    // --- Actions ---

    const handleEditClick = (step: ChatStep) => {
        if (isLocked) return;
        setPreEditSnapshot(JSON.parse(JSON.stringify(step)));
        setEditingStepId(step.id);
    };

    const handleUpdateStep = (stepId: string, updates: Partial<ChatStep>) => {
        setLocalLogs(prev => prev.map(s => s.id === stepId ? { ...s, ...updates } : s));
    };

    const handleAddReview = (stepId: string, score: number, note: string) => {
        setLocalLogs(prev => prev.map(step => {
            if (step.id !== stepId) return step;
            const newEntry: GradeEntry = {
                source: 'human',
                score,
                reasoning: note,
                timestamp: new Date().toLocaleTimeString()
            };
            return {
                ...step,
                score,
                isHumanGraded: true,
                humanNote: note,
                gradingHistory: step.gradingHistory ? [...step.gradingHistory, newEntry] : [newEntry]
            };
        }));
    };

    const handleSelectHistory = (stepId: string, entry: GradeEntry) => {
         setLocalLogs(prev => prev.map(step => {
            if (step.id !== stepId) return step;
            return {
                ...step,
                score: entry.score,
                isHumanGraded: entry.source === 'human',
                humanNote: entry.source === 'human' ? entry.reasoning : undefined,
                content: entry.source === 'ai' && entry.reasoning ? entry.reasoning : step.content
            };
        }));
    };

    const handleSaveEditor = () => {
        setEditingStepId(null);
        setPreEditSnapshot(null);
        // Here we would typically save the entire run state to the backend/store
        // For now, localLogs has the latest "Add Review" commit or "Preview"
        // Since we want "Save" to persist whatever is in the view:
        if (run && editingStepId) {
             const updatedStep = localLogs.find(s => s.id === editingStepId);
             if (updatedStep) {
                 // In a real app, dispatch an update to the store for this specific step
             }
        }
    };

    const handleCancelEditor = () => {
        if (preEditSnapshot && editingStepId) {
            setLocalLogs(prev => prev.map(s => s.id === editingStepId ? preEditSnapshot : s));
        }
        setEditingStepId(null);
        setPreEditSnapshot(null);
    };

    const handleIssueCertificate = () => {
        if (window.confirm("Issuing a certificate will lock this transcript. Continue?")) {
            dispatch(updateRunStatus({ id: run.id, isCertified: true }));
        }
    };

    // --- Rerun Logic (Simulated) ---
    const executeRegradeLoop = async (startIndex: number) => {
        const stepsToRegrade = localLogs
            .map((step, index) => ({ step, index, queueIndex: -1 }))
            .filter(({ step }) => step.role === 'system' && step.score !== undefined);
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
                // Mock AI regrade
                const newScore = Math.min(100, Math.max(0, (step.score || 0) + Math.floor(Math.random() * 10 - 5)));
                const reasoning = "Automated re-evaluation based on standard criteria.";
                
                setLocalLogs(prev => prev.map(s => {
                     if (s.id !== step.id) return s;
                     const newEntry: GradeEntry = { source: 'ai', score: newScore, reasoning, timestamp: new Date().toLocaleTimeString() };
                     return { ...s, score: newScore, isHumanGraded: false, content: reasoning, gradingHistory: [...(s.gradingHistory||[]), newEntry] };
                }));

                setRegradeProgress(Math.round(((i + 1) / stepsToRegrade.length) * 100));
            } catch (error) {
                setRerunError({ stepId: step.id, indexInQueue: i, message: "Execution interrupted." });
                setIsRunningFullRegrade(false);
                return;
            }
        }
        setCurrentRegradeIndex(-1);
        setIsRunningFullRegrade(false);
        setRegradeProgress(100);
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isRunningFullRegrade && run.status !== 'running' && onClose()}></div>
             <div className="relative w-full max-w-3xl bg-[#111722] border-l border-surface-border shadow-2xl h-full flex flex-col animate-fade-in-up">
                
                {/* Header */}
                <div className="flex flex-col border-b border-surface-border bg-surface-dark/50 z-20">
                    <div className="flex items-center justify-between p-6 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
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
                        <div className="flex items-center gap-4">
                             <div className="flex flex-col items-end">
                                <span className="text-xs font-bold uppercase text-slate-500">Current Score</span>
                                <span className={`text-3xl font-black transition-all ${avgScore > 80 ? 'text-emerald-400' : avgScore > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {avgScore}
                                </span>
                             </div>
                             <button onClick={onClose} disabled={isRunningFullRegrade || run.status === 'running'} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors disabled:opacity-50">
                                <span className="material-symbols-outlined text-2xl">close</span>
                            </button>
                        </div>
                    </div>
                    {(run.status === 'running' || isRunningFullRegrade) && (
                        <div className="w-full h-1 bg-surface-border relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${regradeProgress}%` }}></div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-gradient-to-b from-[#111722] to-[#0d121c]">
                    {localLogs.map((step, idx) => {
                        const isScoreStep = step.role === 'system' && step.score !== undefined;
                        const isEditing = editingStepId === step.id;
                        const isProcessing = regradingStepId === step.id;
                        const isPendingReRun = isRunningFullRegrade && idx > currentRegradeIndex && !isProcessing;
                        const containerClasses = `relative py-4 group transition-all duration-500 ${isProcessing ? 'scale-[1.02]' : ''} ${isPendingReRun ? 'opacity-30 blur-[1px] grayscale' : 'opacity-100'}`;

                        if (isScoreStep) {
                            return (
                                <div key={step.id} id={`step-${step.id}`} className={containerClasses}>
                                     <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-surface-border -z-10"></div>
                                     <div className="flex justify-center">
                                         {isEditing ? (
                                             <GradingEditor 
                                                step={step}
                                                onSave={handleSaveEditor}
                                                onCancel={handleCancelEditor}
                                                onUpdate={(updates) => handleUpdateStep(step.id, updates)}
                                                onAddReview={(s, n) => handleAddReview(step.id, s, n)}
                                                onSelectHistory={(entry) => handleSelectHistory(step.id, entry)}
                                             />
                                         ) : (
                                             <ScoreDisplay 
                                                step={step} 
                                                isLocked={isLocked} 
                                                onEdit={() => handleEditClick(step)} 
                                             />
                                         )}
                                     </div>
                                </div>
                            );
                        }

                        // Regular Message
                        return (
                            <div key={step.id} className={`relative pl-8 group animate-fade-in-up ${isPendingReRun ? 'opacity-30 blur-[1px]' : ''} transition-all duration-500`}>
                                {!isScoreStep && idx !== localLogs.length - 1 && localLogs[idx+1].role !== 'system' && (
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
                                        <span className={`text-xs font-bold uppercase tracking-wider ${step.role === 'agent' ? 'text-primary' : step.role === 'system' ? 'text-slate-500' : 'text-emerald-400'}`}>
                                            {step.role}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-600">{step.timestamp}</span>
                                    </div>
                                    <div className={`p-4 rounded-lg text-sm leading-relaxed border relative
                                        ${step.role === 'agent' ? 'bg-primary/5 border-primary/20 text-slate-200' : 
                                          step.role === 'system' ? 'bg-surface-dark border-surface-border text-slate-400 font-mono text-xs' : 
                                          'bg-[#1a2332] border-surface-border text-white'}`}>
                                        {step.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollEndRef}></div>
                </div>
                
                {/* Footer */}
                <div className="p-6 border-t border-surface-border bg-surface-dark/50 relative overflow-hidden">
                    {showRerunConfirm ? (
                        <div className="flex items-center justify-between animate-fade-in-up">
                            <div className="flex items-center gap-2 text-yellow-400">
                                <span className="material-symbols-outlined">warning</span>
                                <span className="text-sm font-bold">Confirm Re-run Analysis?</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => setShowRerunConfirm(false)}>Cancel</Button>
                                <Button onClick={() => { setOriginalLogs(JSON.parse(JSON.stringify(localLogs))); setShowRerunConfirm(false); executeRegradeLoop(0); }} icon="check_circle">Yes, Execute</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">
                                    {run.status === 'running' ? 'Live Streaming...' : isLocked ? 'Transcript Locked' : 'Review Mode Active'}
                                </span>
                            </div>
                            <div className="flex gap-3">
                                {/* Conditional Action Button based on Certificate Status */}
                                {run.isCertified ? (
                                    <Button variant="secondary" icon="verified" onClick={() => navigate(`/certificate/${run.id}`)}>
                                        View Certificate
                                    </Button>
                                ) : (
                                    run.status === 'pass' && (
                                        <Button variant="primary" icon="approval" onClick={handleIssueCertificate} disabled={isRunningFullRegrade}>
                                            Issue Certificate
                                        </Button>
                                    )
                                )}
                                
                                {!run.isCertified && (
                                    <>
                                        <Button variant="secondary" icon="download" disabled={isRunningFullRegrade || run.status === 'running'}>Export</Button>
                                        <Button icon="replay" onClick={() => setShowRerunConfirm(true)} disabled={isRunningFullRegrade || run.status === 'running'}>Re-run</Button>
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