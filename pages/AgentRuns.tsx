import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, Button, Input, Badge } from '../components/ui/Common';
import { Run, ChatStep } from '../types';
import { useNavigate } from 'react-router-dom';
import { RunDetailsPanel } from '../components/RunDetailsPanel';
import { RunSimulationModal } from '../components/RunSimulationModal';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { addRun, updateRunLocal, fetchRuns, createRun } from '../store/slices/runSlice';
import { fetchTemplates } from '../store/slices/templateSlice';
import { llmService } from '../services/LLMService';
import { runService } from '../services/RunService';

export const AgentRuns: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const runs = useAppSelector((state) => state.runs.items);
    const templates = useAppSelector((state) => state.templates.items);

    useEffect(() => {
        dispatch(fetchRuns());
        if (templates.length === 0) {
            dispatch(fetchTemplates());
        }
    }, [dispatch, templates.length]);

    const [showGenerator, setShowGenerator] = useState(false);
    const [showSimulationModal, setShowSimulationModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingRunId, setViewingRunId] = useState<string | null>(null);

    const filteredRuns = runs.filter(run =>
        run.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        run.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        run.agentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const viewingRun = runs.find(r => r.id === viewingRunId) || null;
    const availableTemplates = templates.filter(t => t.status !== 'draft');

    const handleStartSimulation = async (templateId: string) => {
        const selectedTemplate = templates.find(t => t.id === templateId);
        if (!selectedTemplate) return;

        // 1. Create Run in Backend
        const agentName = `Simulated-Agent-${selectedTemplate.id.split('-')[1] || '007'}`;
        const totalSteps = selectedTemplate.criteria ? selectedTemplate.criteria.length : 0;

        // We use a temporary ID for optimistic UI, but we'll replace it or use the real one.
        // Actually, let's await the creation to get the real ID to avoid complexity.
        // But to make it snappy we could use optimistic. For now, let's await.

        let runId = '';
        try {
            const newRun = await dispatch(createRun({
                agentId: 'SIM-AGENT-01',
                agentName: agentName,
                status: 'running',
                score: 0,
                // We typically wouldn't send steps here, but the type allows it.
                // The backend creates the ID.
            })).unwrap(); // unwrap to get the result payload or throw error

            runId = newRun.id;
            // The run is already added to store by createRun.fulfilled
        } catch (e) {
            console.error("Failed to create run", e);
            return;
        }

        setViewingRunId(runId);

        const chatSteps: ChatStep[] = [];
        const initStep = {
            role: 'system',
            content: `Simulation started for template: ${selectedTemplate.name}`,
            status: 'info'
        };

        // Persist Init Step
        try {
            const savedStep = await runService.addStep(runId, initStep);
            chatSteps.push(savedStep); // Use the returned step with ID/Timestamp
            dispatch(updateRunLocal({ id: runId, status: 'running', steps: [...chatSteps] }));
        } catch (e) {
            console.error("Failed to add init step", e);
            // fallback for UI even if persist failed? 
            // Ideally we stop or show error. For simulation, let's continue but warn.
        }

        let earnedScore = 0;
        let potentialScore = 0;

        try {
            if (selectedTemplate.criteria) {
                for (let i = 0; i < totalSteps; i++) {
                    const criterion = selectedTemplate.criteria[i];

                    await new Promise(r => setTimeout(r, 1000));

                    // Question Step
                    const questionStepPayload = {
                        role: 'interviewer',
                        content: criterion.prompt,
                        status: 'info'
                    };
                    const savedQuestion = await runService.addStep(runId, questionStepPayload);
                    chatSteps.push(savedQuestion);
                    dispatch(updateRunLocal({ id: runId, status: 'running', steps: [...chatSteps] }));

                    await new Promise(r => setTimeout(r, 2000));
                    const agentAnswer = await llmService.simulateAgentResponse(
                        {
                            skills: selectedTemplate.skills,
                            description: selectedTemplate.description || ''
                        },
                        criterion.prompt
                    );

                    // Answer Step
                    const answerStepPayload = {
                        role: 'agent',
                        content: agentAnswer,
                        status: 'info',
                        metadata: { 'model': 'gemini-3-flash-preview' }
                    };
                    const savedAnswer = await runService.addStep(runId, answerStepPayload);
                    chatSteps.push(savedAnswer);
                    dispatch(updateRunLocal({ id: runId, status: 'running', steps: [...chatSteps] }));

                    await new Promise(r => setTimeout(r, 1200));
                    const gradeResult = await llmService.evaluateResponse(
                        criterion.prompt,
                        criterion.expected,
                        agentAnswer
                    );

                    earnedScore += gradeResult.score;
                    potentialScore += 100;

                    // Grade Step
                    const gradeStepPayload = {
                        role: 'system',
                        content: gradeResult.reasoning,
                        status: gradeResult.score >= criterion.minScore ? 'pass' : 'fail',
                        score: gradeResult.score,
                        category: selectedTemplate.skills[0] || 'General',
                        isHumanGraded: false,
                        gradingHistory: [{
                            source: 'ai',
                            score: gradeResult.score,
                            reasoning: gradeResult.reasoning,
                            timestamp: new Date().toISOString() // Backend expects datetime or string? Pydantic ISO is safe.
                        }]
                    };
                    const savedGrade = await runService.addStep(runId, gradeStepPayload);
                    chatSteps.push(savedGrade);
                    dispatch(updateRunLocal({ id: runId, status: 'running', steps: [...chatSteps] }));
                }
            }

            await new Promise(r => setTimeout(r, 800));
            const finalAvg = potentialScore > 0 ? Math.round(earnedScore / (totalSteps)) : 0;
            const finalStatus = finalAvg >= 70 ? 'pass' : 'fail';

            // End Step
            const endStepPayload = {
                role: 'system',
                content: `Evaluation Complete. Final Score: ${finalAvg}/100`,
                status: finalStatus
            };
            const savedEnd = await runService.addStep(runId, endStepPayload);
            chatSteps.push(savedEnd);

            // Update Run Status in Backend & Frontend
            // We use runService.updateRun via thunk or direct. 
            // Since we want to update the store too, let's use the thunk if possible or just updateRunLocal + service call.
            // But we created `updateRunStatus` thunk earlier.

            // Wait, I replaced updateRunStatus with updateRunLocal in previous steps.
            // I need to import updateRunStatus if I want to use it, or just use runService.updateRun directly and then updateRunLocal.
            // The user wants persistence.

            await runService.updateRun(runId, { status: finalStatus, score: finalAvg });

            dispatch(updateRunLocal({
                id: runId,
                status: finalStatus, // Cast if needed, but strings match
                score: finalAvg,
                steps: [...chatSteps]
            }));

        } catch (error) {
            console.error("Simulation failed", error);
            const errStep = { role: 'system', content: 'Simulation Error occurred.', status: 'fail' };
            await runService.addStep(runId, errStep); // Try to persist error
            chatSteps.push({ ...errStep, id: 'err', timestamp: 'now' } as ChatStep); // Fallback obj

            await runService.updateRun(runId, { status: 'fail' });
            dispatch(updateRunLocal({ id: runId, status: 'fail', steps: [...chatSteps] }));
        }
    };

    return (
        <Layout>
            <RunDetailsPanel run={viewingRun} onClose={() => setViewingRunId(null)} />
            <RunSimulationModal
                isOpen={showSimulationModal}
                onClose={() => setShowSimulationModal(false)}
                onStart={handleStartSimulation}
            />

            <div className="p-4 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-8">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white">Agent Runs & Results</h1>
                        <p className="text-slate-400">Comprehensive audit log of all agent evaluation attempts.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button variant="secondary" icon="smart_toy" onClick={() => setShowSimulationModal(true)}>
                            Run Simulation
                        </Button>
                        <Button icon="bolt" onClick={() => setShowGenerator(!showGenerator)}>
                            {showGenerator ? 'Close' : 'Generate Prompt'}
                        </Button>
                    </div>
                </div>

                {/* Generator Section */}
                {showGenerator && (
                    <div className="bg-surface-dark border border-surface-border rounded-2xl p-8 shadow-xl animate-fade-in-up flex flex-col lg:flex-row gap-8">
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
                    <div className="p-5 border-b border-surface-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-dark">
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

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
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
                                            onClick={() => setViewingRunId(run.id)}
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
                                                            setViewingRunId(run.id);
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">description</span>
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

                    {/* Mobile Card View */}
                    <div className="md:hidden flex flex-col p-4 gap-3 bg-[#111722]">
                        {filteredRuns.length > 0 ? (
                            filteredRuns.map((run) => (
                                <div
                                    key={run.id}
                                    onClick={() => setViewingRunId(run.id)}
                                    className="bg-surface-dark border border-surface-border rounded-lg p-4 active:bg-[#1a2332] active:scale-[0.98] transition-all"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white text-sm">{run.agentName}</span>
                                            <span className="text-[10px] text-slate-500 font-mono mt-1">{run.id} • {run.agentId}</span>
                                        </div>
                                        {run.status === 'pass' && <Badge type="pass" icon="check_circle">Certified</Badge>}
                                        {run.status === 'fail' && <Badge type="fail" icon="cancel">Failed</Badge>}
                                        {run.status === 'running' && <Badge type="progress" icon="sync">Run</Badge>}
                                        {run.status === 'in_progress' && <Badge type="neutral" icon="pending">Pending</Badge>}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-surface-border/50 pt-3 mt-1">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase text-slate-500 font-bold">Score</span>
                                            <span className={`font-bold text-sm ${run.score !== undefined && run.score > 80 ? 'text-white' : 'text-red-400'}`}>
                                                {run.score !== undefined ? `${run.score}/100` : '--'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono self-end mb-1">{run.timestamp}</div>
                                        <div className="flex gap-2">
                                            {run.status === 'pass' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/certificate/${run.id}`);
                                                    }}
                                                    className="size-8 flex items-center justify-center rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">verified</span>
                                                </button>
                                            )}
                                            <button className="size-8 flex items-center justify-center rounded bg-white/5 text-slate-400">
                                                <span className="material-symbols-outlined text-[18px]">description</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                No runs found matching "{searchTerm}"
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </Layout>
    )
}