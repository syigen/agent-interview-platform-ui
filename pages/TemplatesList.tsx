import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/ui/Common';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { deleteTemplate, duplicateTemplate, updateTemplate } from '../store/slices/templateSlice';
import { addRun, updateRunStatus } from '../store/slices/runSlice';
import { TemplateCard } from '../components/templates/TemplateCard';
import { RunDetailsPanel } from '../components/RunDetailsPanel';
import { geminiService } from '../services/GeminiService';
import { ChatStep, Run } from '../types';

export const TemplatesList: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const templates = useAppSelector((state) => state.templates.items);
    const runs = useAppSelector((state) => state.runs.items);
    
    const [filterText, setFilterText] = useState('');
    const [difficulty, setDifficulty] = useState<string>('All');
    
    // Viewing active run state
    const [viewingRunId, setViewingRunId] = useState<string | null>(null);

    // Derived view of the current run object from store to ensure live updates
    const viewingRun = runs.find(r => r.id === viewingRunId) || null;

    const filteredTemplates = templates.filter(t => {
        const matchesText = t.name.toLowerCase().includes(filterText.toLowerCase()) || 
                            t.skills.some(s => s.toLowerCase().includes(filterText.toLowerCase())) ||
                            t.id.toLowerCase().includes(filterText.toLowerCase());
        const matchesDiff = difficulty === 'All' || t.difficulty === difficulty;
        return matchesText && matchesDiff;
    });

    const handleDuplicate = (id: string) => {
        const newId = `TMP-${Math.floor(1000 + Math.random() * 9000)}`;
        dispatch(duplicateTemplate({ id, newId }));
        navigate(`/templates/edit/${newId}`);
    };

    const handleSimulateStream = async (templateId: string) => {
        const selectedTemplate = templates.find(t => t.id === templateId);
        if (!selectedTemplate) return;

        const runId = `RUN-${Math.floor(Math.random() * 9000) + 1000}`;
        const agentName = `Simulated-Agent-${selectedTemplate.id.split('-')[1]}`;
        const totalSteps = selectedTemplate.criteria ? selectedTemplate.criteria.length : 0;
        
        // 1. Initialize Run
        dispatch(addRun({
            id: runId,
            agentId: 'SIM-AGENT-01',
            agentName: agentName,
            timestamp: 'Just now',
            status: 'running',
            steps: [],
            totalSteps: totalSteps
        }));

        // 2. Open Panel Immediately
        setViewingRunId(runId);

        // 3. Start Stream
        const chatSteps: ChatStep[] = [];
        
        // Initial System Step
        chatSteps.push({
            id: 'init',
            role: 'system',
            content: `Simulation started for template: ${selectedTemplate.name}`,
            timestamp: new Date().toLocaleTimeString(),
            status: 'info'
        });
        dispatch(updateRunStatus({ id: runId, status: 'running', steps: [...chatSteps] }));

        let earnedScore = 0;
        let potentialScore = 0;

        try {
            if (selectedTemplate.criteria) {
                for (let i = 0; i < totalSteps; i++) {
                    const criterion = selectedTemplate.criteria[i];
                    
                    // Question
                    await new Promise(r => setTimeout(r, 800)); // Visual delay for stream effect
                    const questionStep: ChatStep = {
                        id: `q-${i}`,
                        role: 'interviewer',
                        content: criterion.prompt,
                        timestamp: new Date().toLocaleTimeString(),
                        status: 'info'
                    };
                    chatSteps.push(questionStep);
                    dispatch(updateRunStatus({ id: runId, status: 'running', steps: [...chatSteps] }));

                    // Answer
                    await new Promise(r => setTimeout(r, 1200)); // Thinking delay
                    const agentAnswer = await geminiService.simulateAgentResponse(
                        {
                            skills: selectedTemplate.skills,
                            description: selectedTemplate.description || ''
                        },
                        criterion.prompt
                    );
                    
                    const answerStep: ChatStep = {
                        id: `a-${i}`,
                        role: 'agent',
                        content: agentAnswer,
                        timestamp: new Date().toLocaleTimeString(),
                        status: 'info',
                        metadata: { 'model': 'gemini-3-flash-preview' }
                    };
                    chatSteps.push(answerStep);
                    dispatch(updateRunStatus({ id: runId, status: 'running', steps: [...chatSteps] }));

                    // Grading
                    await new Promise(r => setTimeout(r, 1000));
                    const gradeResult = await geminiService.evaluateResponse(
                        criterion.prompt,
                        criterion.expected,
                        agentAnswer
                    );

                    earnedScore += gradeResult.score;
                    potentialScore += 100;

                    const gradeStep: ChatStep = {
                        id: `g-${i}`,
                        role: 'system',
                        content: gradeResult.reasoning,
                        timestamp: new Date().toLocaleTimeString(),
                        status: gradeResult.score >= criterion.minScore ? 'pass' : 'fail',
                        score: gradeResult.score,
                        category: selectedTemplate.skills[0] || 'General',
                        isHumanGraded: false,
                        gradingHistory: [{
                            source: 'ai',
                            score: gradeResult.score,
                            reasoning: gradeResult.reasoning,
                            timestamp: new Date().toLocaleTimeString()
                        }]
                    };
                    chatSteps.push(gradeStep);
                    dispatch(updateRunStatus({ id: runId, status: 'running', steps: [...chatSteps] }));
                }
            }

            // Finalize
            await new Promise(r => setTimeout(r, 500));
            const finalAvg = potentialScore > 0 ? Math.round(earnedScore / (totalSteps)) : 0;
            const finalStatus = finalAvg >= 70 ? 'pass' : 'fail';
            
            chatSteps.push({
                id: 'end',
                role: 'system',
                content: `Evaluation Complete. Final Score: ${finalAvg}/100`,
                timestamp: new Date().toLocaleTimeString(),
                status: finalStatus
            });

            dispatch(updateRunStatus({ 
                id: runId, 
                status: finalStatus, 
                score: finalAvg,
                steps: [...chatSteps]
            }));

        } catch (error) {
            console.error("Simulation failed", error);
            chatSteps.push({ id: 'err', role: 'system', content: 'Simulation Error occurred.', timestamp: 'now', status: 'fail' });
            dispatch(updateRunStatus({ id: runId, status: 'fail', steps: [...chatSteps] }));
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto p-6 md:p-12">
            <RunDetailsPanel 
                run={viewingRun} 
                onClose={() => setViewingRunId(null)} 
            />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-white">Interview Templates</h1>
                    <p className="text-slate-400 text-base font-normal max-w-2xl">Manage and create standardized evaluation frameworks for your AI agents.</p>
                </div>
                <Link to="/templates/create">
                    <Button icon="add">Create Template</Button>
                </Link>
            </div>

            <Card className="p-5 flex flex-col gap-4">
                <Input 
                    icon="search" 
                    placeholder="Search templates by name, skill, or ID..." 
                    value={filterText} 
                    onChange={e => setFilterText(e.target.value)} 
                />
                <div className="flex flex-wrap gap-3 items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-1">Filters:</span>
                    
                    {/* Difficulty Filter */}
                    <div className="relative group">
                        <select 
                            className="appearance-none bg-background-dark border border-surface-border hover:border-slate-500 text-slate-200 text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                        >
                            <option value="All">All Difficulties</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                    </div>

                    <button className="group flex items-center gap-2 h-[38px] px-3 rounded-lg border border-surface-border bg-background-dark hover:bg-surface-border transition-colors">
                        <span className="text-sm font-medium text-slate-200">Last Updated</span>
                        <span className="material-symbols-outlined text-[18px] text-slate-400">arrow_drop_down</span>
                    </button>
                </div>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-surface-border/50 border-b border-surface-border">
                                <th className="px-6 py-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Template Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Targeted Skills</th>
                                <th className="px-6 py-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Difficulty</th>
                                <th className="px-6 py-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Last Updated</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                            {filteredTemplates.length > 0 ? (
                                filteredTemplates.map(t => (
                                    <TemplateCard 
                                        key={t.id} 
                                        template={t} 
                                        onDelete={(id) => dispatch(deleteTemplate(id))} 
                                        onDuplicate={handleDuplicate}
                                        onStatusChange={(id, status) => dispatch(updateTemplate({ id, changes: { status } }))}
                                        onSimulate={handleSimulateStream}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-3xl opacity-50">search_off</span>
                                            <p>No templates found matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};