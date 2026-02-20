import React, { useState, useEffect } from 'react';
import { Button, Input, Textarea } from '../ui/Common';
import { Criterion } from '../../types';

export const CriteriaBuilder: React.FC<{
    criteria: Criterion[];
    onChange: (c: Criterion[]) => void;
    error?: string;
    onGenerateAI?: (config: { focus: string, count: number, model: string, extraInfo: string }) => void;
    isGenerating?: boolean;
    skills?: string[];
}> = ({ criteria, onChange, error, onGenerateAI, isGenerating, skills = [] }) => {
    const [localError, setLocalError] = useState('');

    // AI Generation Config State
    const [aiConfig, setAiConfig] = useState<{
        focusTags: string[];
        focusInput: string;
        count: number;
        model: string;
        customModel: string;
        extraInfo: string;
    }>({
        focusTags: skills.length > 0 ? [...skills] : [],
        focusInput: '',
        count: 5,
        model: 'Gemini 3.0 Flash',
        customModel: '',
        extraInfo: ''
    });

    useEffect(() => {
        setAiConfig(prev => ({
            ...prev,
            focusTags: skills.length > 0 ? [...skills] : []
        }));
    }, [skills]);

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
        <div className="space-y-6">
            {onGenerateAI && (
                <div className="bg-surface-dark border border-surface-border rounded-xl p-6 text-left relative overflow-hidden shadow-sm">
                    {isGenerating && (
                        <div className="absolute inset-0 bg-[#0f172a]/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                            <span className="material-symbols-outlined text-[#3b82f6] text-4xl animate-spin">sync</span>
                            <p className="text-[11px] font-bold text-[#3b82f6] mt-3 uppercase tracking-widest">Generating...</p>
                        </div>
                    )}
                    <h3 className="text-[13px] font-bold text-white uppercase tracking-wider mb-6">GENERATION SETTINGS</h3>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-slate-200 text-[13px]">Focus</label>
                                <div className="relative flex flex-wrap gap-2 bg-[#0f172a] border border-surface-border rounded-lg p-2 min-h-[42px] focus-within:border-[#3b82f6] transition-colors items-center shadow-inner">
                                    {aiConfig.focusTags.map((tag, idx) => (
                                        <div key={idx} className="bg-[#1e293b] text-[#cbd5e1] text-[12px] px-2 py-1 rounded flex items-center gap-1 font-medium border border-[#334155]">
                                            {tag}
                                            <button
                                                onClick={() => {
                                                    const newTags = aiConfig.focusTags.filter((_, i) => i !== idx);
                                                    setAiConfig(prev => ({ ...prev, focusTags: newTags }));
                                                }}
                                                disabled={isGenerating}
                                                className="hover:text-white flex items-center justify-center p-0.5 rounded-full hover:bg-white/10 ml-0.5"
                                            >
                                                <span className="material-symbols-outlined text-[13px]">close</span>
                                            </button>
                                        </div>
                                    ))}
                                    <input
                                        type="text"
                                        value={aiConfig.focusInput}
                                        onChange={e => setAiConfig({ ...aiConfig, focusInput: e.target.value })}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && aiConfig.focusInput.trim()) {
                                                e.preventDefault();
                                                if (!aiConfig.focusTags.includes(aiConfig.focusInput.trim())) {
                                                    setAiConfig(prev => ({
                                                        ...prev,
                                                        focusTags: [...prev.focusTags, prev.focusInput.trim()],
                                                        focusInput: ''
                                                    }));
                                                }
                                            }
                                        }}
                                        placeholder={aiConfig.focusTags.length === 0 ? "e.g. System Design, Coding" : ""}
                                        className="flex-1 min-w-[120px] bg-transparent text-white caret-white focus:outline-none text-[13px]"
                                        disabled={isGenerating}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-slate-200 text-[13px]">Count</label>
                                <input
                                    type="number"
                                    min="1" max="20"
                                    value={aiConfig.count}
                                    onChange={e => setAiConfig({ ...aiConfig, count: parseInt(e.target.value) || 5 })}
                                    className="w-full bg-[#0f172a] border border-surface-border rounded-lg text-white font-medium h-[42px] px-4 focus:outline-none focus:border-[#3b82f6] transition-colors text-[13px] shadow-inner"
                                    disabled={isGenerating}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-slate-200 text-[13px]">Model Selection</label>
                            <div className="relative">
                                <select
                                    value={aiConfig.model}
                                    onChange={e => setAiConfig({ ...aiConfig, model: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-surface-border rounded-lg text-white font-medium h-[42px] px-4 appearance-none focus:outline-none transition-colors text-[13px] shadow-inner"
                                    disabled={true}
                                >
                                    <option className="bg-[#0f172a]" value="Gemini 3.0 Flash">Default Model External API</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#64748b]">
                                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-slate-200 text-[13px]">Extra Information</label>
                            <textarea
                                placeholder="Generate questions that test understanding of different reasoning types."
                                value={aiConfig.extraInfo}
                                onChange={e => setAiConfig({ ...aiConfig, extraInfo: e.target.value })}
                                className="w-full bg-[#0f172a] border border-surface-border rounded-lg text-slate-300 font-medium min-h-[80px] p-4 focus:outline-none focus:border-[#3b82f6] transition-colors resize-y text-[13px] shadow-inner placeholder:text-slate-500"
                                disabled={isGenerating}
                            />
                        </div>

                        <button
                            onClick={() => {
                                onGenerateAI({
                                    focus: aiConfig.focusTags.join(', '),
                                    count: aiConfig.count,
                                    model: aiConfig.model,
                                    extraInfo: aiConfig.extraInfo
                                });
                            }}
                            disabled={isGenerating}
                            className={`w-full inline-flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium text-[14px] h-[44px] rounded-lg transition-all shadow-sm mt-2 ${isGenerating ? 'opacity-80 cursor-not-allowed' : ''}`}
                        >
                            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                            {isGenerating ? 'Generating...' : 'Generate Criteria Now'}
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-[20px] font-semibold text-white">
                        Evaluation Criteria
                    </h3>
                    <button
                        onClick={addCriterion}
                        className="text-sm py-2 px-4 bg-transparent border border-surface-border hover:bg-surface-border/50 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span> Add Test Case
                    </button>
                </div>

                {displayError && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2 animate-fade-in-up"><span className="material-symbols-outlined text-[18px]">error</span>{displayError}</div>}

                {criteria.length === 0 && (
                    <div className={`text-center py-12 border-2 border-dashed ${displayError ? 'border-red-500/30 bg-red-500/5' : 'border-surface-border bg-surface-dark'} rounded-xl transition-colors`}>
                        <p className={displayError ? 'text-red-400' : 'text-slate-400'}>No evaluation criteria defined.</p>
                        <button onClick={addCriterion} className="text-[#3b82f6] hover:underline text-sm mt-2">Add First Criteria</button>
                    </div>
                )}

                <div className="space-y-4">
                    {criteria.map((c, index) => {
                        const showPromptError = !!displayError && !c.prompt.trim();
                        const showExpectedError = !!displayError && !c.expected.trim();

                        return (
                            <div key={c.id} className={`p-6 rounded-xl bg-surface-dark border relative group animate-fade-in-up transition-all ${showPromptError || showExpectedError ? 'border-red-500/30' : 'border-surface-border'}`}>
                                <div className="flex justify-between items-center mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center bg-surface-border size-7 rounded-md text-slate-300 text-sm font-semibold">{index + 1}</div>
                                        <span className="text-[14px] font-bold text-white uppercase tracking-wide">Test Case</span>
                                    </div>
                                    <button
                                        onClick={() => removeCriterion(c.id)}
                                        className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete test case"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </div>

                                <div className="grid gap-6 md:grid-cols-[1fr_200px]">
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-slate-200 text-[13px]">Prompt / Question</label>
                                            <textarea
                                                value={c.prompt}
                                                onChange={(e) => updateCriterion(c.id, 'prompt', e.target.value)}
                                                className={`w-full bg-[#0f172a] border ${showPromptError ? 'border-red-500/50' : 'border-surface-border'} rounded-lg text-slate-300 font-medium min-h-[80px] p-4 focus:outline-none focus:border-[#3b82f6] transition-colors resize-y text-[13px] shadow-inner`}
                                                placeholder="Explain the difference between deductive and inductive reasoning."
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-slate-200 text-[13px]">Expected Response Criteria</label>
                                            <textarea
                                                value={c.expected}
                                                onChange={(e) => updateCriterion(c.id, 'expected', e.target.value)}
                                                className={`w-full bg-[#0f172a] border ${showExpectedError ? 'border-red-500/50' : 'border-surface-border'} rounded-lg text-slate-300 font-medium min-h-[80px] p-4 focus:outline-none focus:border-[#3b82f6] transition-colors resize-y text-[13px] shadow-inner`}
                                                placeholder="The response should clearly distinguish between deductive reasoning..."
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center gap-3 pt-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-300 text-[12px] font-semibold uppercase tracking-wider">Accept Level</span>
                                            <span className="text-slate-400 text-[13px]">{c.minScore}%</span>
                                        </div>

                                        <div className="relative h-6 flex items-center mb-1">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="5"
                                                value={c.minScore}
                                                onChange={(e) => updateCriterion(c.id, 'minScore', parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-[#0f172a] border border-surface-border rounded-lg appearance-none cursor-pointer accent-[#3b82f6] hover:accent-[#2563eb]"
                                            />
                                        </div>

                                        <button className="w-full py-2.5 rounded text-yellow-500 text-[13px] font-bold border border-yellow-500/40 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors uppercase tracking-widest text-center shadow-sm">
                                            {c.minScore >= 90 ? 'STRICT' : c.minScore >= 70 ? 'MODERATE' : 'AEI'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};