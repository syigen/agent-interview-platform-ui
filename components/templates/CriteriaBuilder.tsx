import React from 'react';
import { Button, Input, Textarea } from '../ui/Common';
import { Criterion } from '../../types';

export const CriteriaBuilder: React.FC<{ criteria: Criterion[]; onChange: (c: Criterion[]) => void }> = ({ criteria, onChange }) => {
    const addCriterion = () => {
        onChange([...criteria, { id: Math.random().toString(36).substr(2, 9), prompt: '', expected: '' }]);
    };

    const updateCriterion = (id: string, field: keyof Criterion, value: string) => {
        onChange(criteria.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const removeCriterion = (id: string) => {
        onChange(criteria.filter(c => c.id !== id));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">checklist</span> Evaluation Criteria
                </h3>
                <Button variant="secondary" onClick={addCriterion} icon="add" className="text-xs py-2">Add Test Case</Button>
            </div>

            {criteria.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-surface-border rounded-xl bg-surface-dark/50">
                    <span className="material-symbols-outlined text-slate-500 text-4xl mb-2">playlist_add</span>
                    <p className="text-slate-400">No evaluation criteria defined.</p>
                    <p className="text-slate-500 text-xs mt-1">Add explicit prompts to test the agent's capabilities.</p>
                    <Button variant="ghost" onClick={addCriterion} className="mt-4">Add First Criteria</Button>
                </div>
            )}

            <div className="space-y-3">
                {criteria.map((c, index) => (
                    <div key={c.id} className="p-4 rounded-xl bg-surface-dark border border-surface-border relative group animate-fade-in-up">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => removeCriterion(c.id)} className="text-slate-500 hover:text-red-400">
                                <span className="material-symbols-outlined">delete</span>
                             </button>
                        </div>
                        <div className="grid gap-4">
                            <div className="flex items-start gap-3">
                                <span className="flex items-center justify-center size-6 rounded bg-surface-border text-xs font-mono text-slate-400 mt-0.5">{index + 1}</span>
                                <div className="flex-1 space-y-3">
                                    <Input 
                                        placeholder="Enter the prompt or question for the agent..." 
                                        value={c.prompt}
                                        onChange={(e) => updateCriterion(c.id, 'prompt', e.target.value)}
                                        className="bg-[#111620]"
                                    />
                                    <Textarea 
                                        placeholder="Describe the expected successful output or behavior..." 
                                        value={c.expected}
                                        onChange={(e) => updateCriterion(c.id, 'expected', e.target.value)}
                                        className="bg-[#111620] min-h-[80px]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};