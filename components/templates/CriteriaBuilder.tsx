import React, { useState } from 'react';
import { Button, Input, Textarea } from '../ui/Common';
import { Criterion } from '../../types';

export const CriteriaBuilder: React.FC<{ criteria: Criterion[]; onChange: (c: Criterion[]) => void; error?: string }> = ({ criteria, onChange, error }) => {
    const [localError, setLocalError] = useState('');

    const addCriterion = () => {
        const hasEmpty = criteria.some(c => !c.prompt.trim() || !c.expected.trim());
        if (hasEmpty) {
            setLocalError('Please complete the existing test case fields before adding a new one.');
            return;
        }
        setLocalError('');
        onChange([...criteria, { id: Math.random().toString(36).substr(2, 9), prompt: '', expected: '', minScore: 75 }]);
    };

    const updateCriterion = (id: string, field: keyof Criterion, value: any) => {
        const newCriteria = criteria.map(c => c.id === id ? { ...c, [field]: value } : c);
        onChange(newCriteria);
        if (localError) setLocalError('');
    };

    const removeCriterion = (id: string) => {
        onChange(criteria.filter(c => c.id !== id));
        if (localError) setLocalError('');
    };

    const displayError = localError || error;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">checklist</span> Evaluation Criteria
                </h3>
                <Button variant="secondary" onClick={addCriterion} icon="add" className="text-xs py-2">Add Test Case</Button>
            </div>

            {displayError && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2 animate-fade-in-up"><span className="material-symbols-outlined text-[18px]">error</span>{displayError}</div>}

            {criteria.length === 0 && (
                <div className={`text-center py-12 border-2 border-dashed ${displayError ? 'border-red-500/30 bg-red-500/5' : 'border-surface-border bg-surface-dark/50'} rounded-xl transition-colors`}>
                    <span className={`material-symbols-outlined ${displayError ? 'text-red-500' : 'text-slate-500'} text-4xl mb-2`}>playlist_add</span>
                    <p className={displayError ? 'text-red-400' : 'text-slate-400'}>No evaluation criteria defined.</p>
                    <p className="text-slate-500 text-xs mt-1">Add explicit prompts to test the agent's capabilities.</p>
                    <Button variant="ghost" onClick={addCriterion} className="mt-4">Add First Criteria</Button>
                </div>
            )}

            <div className="space-y-3">
                {criteria.map((c, index) => {
                    // Check if specific fields are empty when an error condition is active
                    const showPromptError = !!displayError && !c.prompt.trim();
                    const showExpectedError = !!displayError && !c.expected.trim();

                    return (
                        <div key={c.id} className={`p-5 rounded-xl bg-surface-dark border relative group animate-fade-in-up transition-all ${showPromptError || showExpectedError ? 'border-red-500/30 shadow-[0_0_15px_-5px_rgba(239,68,68,0.1)]' : 'border-surface-border hover:border-surface-border/80'}`}>
                            <div className="flex justify-between items-center mb-4 pb-3 border-b border-surface-border/50">
                                <div className="flex items-center gap-3">
                                    <span className={`flex items-center justify-center size-6 rounded text-xs font-mono shadow-sm ${showPromptError || showExpectedError ? 'bg-red-500/20 text-red-400' : 'bg-surface-border text-slate-400'}`}>{index + 1}</span>
                                    <span className={`text-xs font-bold uppercase tracking-wider ${showPromptError || showExpectedError ? 'text-red-400' : 'text-slate-500'}`}>Test Case</span>
                                </div>
                                <button 
                                    onClick={() => removeCriterion(c.id)} 
                                    className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded transition-all flex items-center gap-1 group/btn"
                                    title="Delete this criterion"
                                >
                                    <span className="text-xs font-medium opacity-0 group-hover/btn:opacity-100 transition-opacity">Delete</span>
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            </div>
                            
                            <div className="grid gap-5">
                                <div className="grid gap-4 md:grid-cols-[1fr_200px] items-start">
                                    <div className="space-y-4">
                                        <Input 
                                            label="Prompt / Question"
                                            placeholder="Enter the prompt or question for the agent..." 
                                            value={c.prompt}
                                            onChange={(e) => updateCriterion(c.id, 'prompt', e.target.value)}
                                            className={showPromptError ? "" : "bg-[#111620]"}
                                            error={showPromptError ? "Prompt is required" : undefined}
                                        />
                                        <Textarea 
                                            label="Expected Response Criteria"
                                            placeholder="Describe the expected successful output or behavior..." 
                                            value={c.expected}
                                            onChange={(e) => updateCriterion(c.id, 'expected', e.target.value)}
                                            className={showExpectedError ? "min-h-[80px]" : "bg-[#111620] min-h-[80px]"}
                                            error={showExpectedError ? "Expected criteria is required" : undefined}
                                        />
                                    </div>
                                    
                                    <div className="bg-[#111620] p-4 rounded-lg border border-surface-border h-full flex flex-col justify-center">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accept Level</label>
                                            <div className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${c.minScore >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : c.minScore >= 60 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                {c.minScore}%
                                            </div>
                                        </div>
                                        
                                        <div className="relative h-6 flex items-center">
                                            <input 
                                                type="range" 
                                                min="0" 
                                                max="100" 
                                                step="5"
                                                value={c.minScore}
                                                onChange={(e) => updateCriterion(c.id, 'minScore', parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-surface-border rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-hover relative z-10"
                                            />
                                        </div>
                                        
                                        <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-2">
                                            <span>Lenient</span>
                                            <span>Strict</span>
                                        </div>
                                        
                                        <div className="mt-4 pt-4 border-t border-surface-border/50 text-center">
                                            <p className="text-[10px] text-slate-500 leading-tight">
                                                {c.minScore >= 90 ? "Requires near-perfect match." : 
                                                 c.minScore >= 70 ? "Allows minor variations." : 
                                                 "Broad conceptual match only."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};