import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button, Input, Textarea, Card } from '../components/ui/Common';
import { useTemplates } from '../context/TemplateContext';
import { Template } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { StepIndicator } from '../components/templates/StepIndicator';
import { SkillSelector } from '../components/templates/SkillSelector';
import { CriteriaBuilder } from '../components/templates/CriteriaBuilder';

export const TemplateEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { templates, addTemplate, updateTemplate } = useTemplates();
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // Check if we are in Edit mode
    const isEditMode = !!id;
    
    const [data, setData] = useState<Omit<Template, 'id' | 'lastUpdated'>>({
        name: '',
        description: '',
        type: 'manual',
        status: 'draft', // Default is draft
        difficulty: 'Medium',
        skills: ['Reasoning'],
        criteria: []
    });

    // Load existing data if editing
    useEffect(() => {
        if (isEditMode) {
            const templateToEdit = templates.find(t => t.id === id);
            if (templateToEdit) {
                setData({
                    name: templateToEdit.name,
                    description: templateToEdit.description || '',
                    type: templateToEdit.type,
                    status: templateToEdit.status,
                    difficulty: templateToEdit.difficulty,
                    skills: templateToEdit.skills,
                    criteria: templateToEdit.criteria || []
                });
            } else {
                // If ID invalid, redirect back
                navigate('/templates');
            }
        }
    }, [id, isEditMode, templates, navigate]);

    // Auto-promote draft to private when reaching review step if it's a new template or currently a draft
    useEffect(() => {
        if (step === 3 && data.status === 'draft') {
            // We set it to private as the default "Finish" state
            setData(prev => ({ ...prev, status: 'private' }));
        }
    }, [step, data.status]);

    const updateData = (field: keyof Omit<Template, 'id' | 'lastUpdated'>, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
        // Clear specific error when user updates field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateStep = (stepIdx: number): boolean => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (stepIdx === 1) {
             if (!data.name?.trim()) {
                 newErrors.name = "Template name is required.";
                 isValid = false;
             }
             if (data.skills.length === 0) {
                 newErrors.skills = "At least one skill tag is required.";
                 isValid = false;
             }
        }
        if (stepIdx === 2) {
            // If manual, enforce at least one criteria
            if (data.type === 'manual' && (!data.criteria || data.criteria.length === 0)) {
                newErrors.criteria = "Please add at least one evaluation criterion.";
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    }

    const handleTabClick = (targetStep: number) => {
        if (targetStep === step) return;

        // Always allow going backwards
        if (targetStep < step) {
            setStep(targetStep);
            return;
        }

        // Validate strictly from current step up to target-1
        for (let i = step; i < targetStep; i++) {
             if (!validateStep(i)) {
                 if (i !== step) setStep(i);
                 return;
             }
        }
        setStep(targetStep);
    }

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(s => s + 1);
        }
    }

    const handleSave = () => {
        // Final validation of all steps
        if (!validateStep(1)) { setStep(1); return; }
        if (!validateStep(2)) { setStep(2); return; }

        if (isEditMode && id) {
            updateTemplate(id, data);
        } else {
            addTemplate(data);
        }
        navigate('/templates');
    };

    const handleCancel = () => {
        const isDirty = data.name || data.description || (data.skills.length > 0 && (data.skills.length > 1 || data.skills[0] !== 'Reasoning'));
        if (isDirty) {
            if (!window.confirm("Discard unsaved changes?")) return;
        }
        navigate('/templates');
    }

    const generateAICriteria = async () => {
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Generate 5 detailed evaluation criteria (interview questions) for an AI agent with the following profile:
                Name: ${data.name}
                Description: ${data.description}
                Skills: ${data.skills.join(', ')}
                Difficulty: ${data.difficulty}
                
                Return the output as a JSON object containing an array of criteria with 'prompt', 'expected', and 'minScore' fields.
                'minScore' should be an integer between 0 and 100 representing the acceptance threshold percentage (difficulty of passing this specific question).`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            criteria: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        prompt: { type: Type.STRING, description: "The specific question or prompt to test the agent." },
                                        expected: { type: Type.STRING, description: "A summary of the expected correct response or behavior." },
                                        minScore: { type: Type.INTEGER, description: "The acceptance threshold percentage (0-100)." }
                                    },
                                    required: ['prompt', 'expected', 'minScore']
                                }
                            }
                        },
                        required: ['criteria']
                    }
                }
            });
            
            if (response.text) {
                 const result = JSON.parse(response.text);
                 if (result.criteria && Array.isArray(result.criteria)) {
                     const newCriteria = result.criteria.map((c: any) => ({
                         id: Math.random().toString(36).substr(2, 9),
                         prompt: c.prompt,
                         expected: c.expected,
                         minScore: c.minScore || 75
                     }));
                     updateData('criteria', newCriteria);
                     // Switch to manual to show the generated items
                     updateData('type', 'manual');
                     
                     // Clear any criteria errors
                     if (errors.criteria) {
                        setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.criteria;
                            return newErrors;
                        });
                     }
                 }
            }
        } catch (err) {
            console.error("AI Generation failed", err);
            alert("Failed to generate content. Please check your API key and try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col items-center py-12 px-4 animate-fade-in-up">
             <div className="w-full max-w-[800px] mb-8">
                <Link to="/templates" className="inline-flex items-center text-slate-500 hover:text-white mb-4 transition-colors">
                    <span className="material-symbols-outlined text-lg mr-1">arrow_back</span> Back to Templates
                </Link>
                <h1 className="text-3xl font-black text-white mb-2">{isEditMode ? 'Edit Template' : 'Create Evaluation Template'}</h1>
                <p className="text-slate-400">
                    {isEditMode ? `Modifying template parameters for ${data.name || 'selected item'}.` : 'Configure the parameters for the new agent assessment module.'}
                </p>
            </div>

            <Card className="w-full max-w-[800px] overflow-hidden flex flex-col min-h-[600px]">
                <StepIndicator 
                    currentStep={step} 
                    totalSteps={3} 
                    steps={['Configuration', 'Criteria', 'Review']} 
                    onStepClick={handleTabClick}
                />

                <div className="flex-1 p-8">
                    {step === 1 && (
                        <div className="space-y-8 animate-fade-in-up">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">badge</span> Identity
                                </h3>
                                <div className="ml-8 space-y-4">
                                    <Input 
                                        label="Template Name" 
                                        placeholder="e.g. Senior Python Developer - Agent V3" 
                                        value={data.name}
                                        onChange={e => updateData('name', e.target.value)}
                                        error={errors.name}
                                    />
                                    <Textarea 
                                        label="Description" 
                                        placeholder="Describe the purpose of this evaluation template..."
                                        value={data.description}
                                        onChange={e => updateData('description', e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">tune</span> Parameters
                                </h3>
                                <div className="ml-8 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Construction Method</label>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div 
                                                onClick={() => updateData('type', 'auto')}
                                                className={`p-4 rounded-lg border cursor-pointer transition-all ${data.type === 'auto' ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-surface-border bg-background-dark hover:bg-surface-border'}`}
                                            >
                                                <div className="flex justify-between mb-2">
                                                    <span className={`material-symbols-outlined text-2xl ${data.type === 'auto' ? 'text-primary' : 'text-slate-400'}`}>smart_toy</span>
                                                    <div className={`size-5 rounded-full border-2 flex items-center justify-center ${data.type === 'auto' ? 'border-primary bg-primary' : 'border-surface-border'}`}>
                                                        {data.type === 'auto' && <div className="size-2 bg-white rounded-full"></div>}
                                                    </div>
                                                </div>
                                                <p className="font-semibold text-white">AI-Generated</p>
                                                <p className="text-xs text-slate-400 mt-1">Automatically generate questions based on skill tags.</p>
                                            </div>
                                            <div 
                                                onClick={() => updateData('type', 'manual')}
                                                className={`p-4 rounded-lg border cursor-pointer transition-all ${data.type === 'manual' ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-surface-border bg-background-dark hover:bg-surface-border'}`}
                                            >
                                                <div className="flex justify-between mb-2">
                                                    <span className={`material-symbols-outlined text-2xl ${data.type === 'manual' ? 'text-primary' : 'text-slate-400'}`}>construction</span>
                                                    <div className={`size-5 rounded-full border-2 flex items-center justify-center ${data.type === 'manual' ? 'border-primary bg-primary' : 'border-surface-border'}`}>
                                                        {data.type === 'manual' && <div className="size-2 bg-white rounded-full"></div>}
                                                    </div>
                                                </div>
                                                <p className="font-semibold text-white">Manual Construction</p>
                                                <p className="text-xs text-slate-400 mt-1">Manually input specific questions and test cases.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <SkillSelector 
                                        skills={data.skills} 
                                        onChange={s => updateData('skills', s)} 
                                        error={errors.skills}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Difficulty Level</label>
                                        <div className="flex bg-background-dark p-1 rounded-lg border border-surface-border">
                                            {['Easy', 'Medium', 'Hard'].map((d) => (
                                                <button 
                                                    key={d} 
                                                    onClick={() => updateData('difficulty', d)}
                                                    className={`flex-1 text-center py-2 text-sm font-medium rounded transition-all ${data.difficulty === d ? 'bg-surface-border text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                                >
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                         <div className="animate-fade-in-up">
                            {data.type === 'auto' ? (
                                <div className="text-center py-16">
                                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 text-primary mb-4 animate-pulse">
                                        <span className="material-symbols-outlined text-4xl">auto_awesome</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">AI Generation Enabled</h3>
                                    <p className="text-slate-400 max-w-md mx-auto mb-6">Based on the skills <strong>{data.skills.join(', ')}</strong>, the system will dynamically generate evaluation questions.</p>
                                    
                                    <div className="bg-surface-dark p-4 rounded-lg border border-surface-border max-w-sm mx-auto text-left relative overflow-hidden">
                                        {isGenerating && (
                                            <div className="absolute inset-0 bg-surface-dark/95 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                                                <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
                                                <p className="text-xs font-bold text-primary mt-2 uppercase tracking-widest">Generating...</p>
                                            </div>
                                        )}
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Configuration Preview</p>
                                        <div className="space-y-2 text-sm text-slate-300">
                                            <div className="flex justify-between"><span>Focus:</span> <span className="text-white">{data.skills.length > 0 ? data.skills[0] : 'General'}</span></div>
                                            <div className="flex justify-between"><span>Count:</span> <span className="text-white">5 Questions</span></div>
                                            <div className="flex justify-between"><span>Model:</span> <span className="text-white">Gemini 3.0 Flash</span></div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-center gap-4">
                                         <Button 
                                            onClick={generateAICriteria} 
                                            disabled={isGenerating}
                                            icon={isGenerating ? undefined : "auto_awesome"}
                                            className={isGenerating ? "opacity-80" : ""}
                                         >
                                            {isGenerating ? 'Designing Protocol...' : 'Generate Criteria Now'}
                                         </Button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-4">This will generate a static list of questions that you can edit.</p>
                                </div>
                            ) : (
                                <CriteriaBuilder 
                                    criteria={data.criteria || []} 
                                    onChange={c => {
                                        updateData('criteria', c);
                                        // Clear validation error if we have items now
                                        if (c.length > 0 && errors.criteria) {
                                             setErrors(prev => {
                                                const newErrors = { ...prev };
                                                delete newErrors.criteria;
                                                return newErrors;
                                            });
                                        }
                                    }} 
                                    error={errors.criteria}
                                />
                            )}
                         </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
                                <span className="material-symbols-outlined text-green-500 mt-0.5">check_circle</span>
                                <div>
                                    <h4 className="text-green-400 font-bold text-sm">Ready to {isEditMode ? 'Update' : 'Create'}</h4>
                                    <p className="text-green-400/80 text-xs mt-1">Review the details below before finalizing the template.</p>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Template Name</label>
                                    <p className="text-white font-medium text-lg">{data.name || 'Untitled Template'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type</label>
                                    <p className="text-white font-medium capitalize flex items-center gap-2">
                                        {data.type === 'auto' ? <span className="material-symbols-outlined text-primary text-sm">smart_toy</span> : <span className="material-symbols-outlined text-primary text-sm">construction</span>}
                                        {data.type}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Difficulty</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`h-2.5 w-2.5 rounded-full ${data.difficulty === 'Hard' ? 'bg-red-500' : data.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                        <span className="text-slate-200">{data.difficulty}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skills</label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {data.skills.map(s => <span key={s} className="px-2 py-0.5 bg-surface-dark border border-surface-border rounded text-xs text-slate-300">{s}</span>)}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Publication Status</label>
                                <div className="flex bg-background-dark p-1 rounded-lg border border-surface-border w-full max-w-md">
                                    <button 
                                        onClick={() => updateData('status', 'private')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded transition-all ${data.status === 'private' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">lock</span>
                                        Private
                                    </button>
                                    <button 
                                        onClick={() => updateData('status', 'public')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded transition-all ${data.status === 'public' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">public</span>
                                        Public
                                    </button>
                                    <button 
                                        onClick={() => updateData('status', 'draft')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded transition-all ${data.status === 'draft' ? 'bg-slate-700/50 text-slate-300 border border-slate-600 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">edit_document</span>
                                        Draft
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500">
                                    {data.status === 'private' && "Only visible to you and organization admins."}
                                    {data.status === 'public' && "Visible to all verifiable AI platform users."}
                                    {data.status === 'draft' && "Work in progress. Not available for execution runs."}
                                </p>
                            </div>
                            
                            <div className="h-px bg-surface-border w-full"></div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Evaluation Content</label>
                                {data.type === 'auto' ? (
                                    <div className="text-slate-400 text-sm italic">Content will be generated dynamically at runtime.</div>
                                ) : (
                                    <div className="space-y-2">
                                        {data.criteria && data.criteria.length > 0 ? data.criteria.map((c, i) => (
                                            <div key={c.id} className="p-3 rounded-lg bg-surface-dark border border-surface-border flex gap-3">
                                                <span className="text-xs font-mono text-slate-500 mt-1">{i + 1}.</span>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="text-sm text-slate-200">{c.prompt || 'Untitled Prompt'}</p>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ml-4 ${c.minScore >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : c.minScore >= 60 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                            {c.minScore}% Threshold
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{c.expected}</p>
                                                </div>
                                            </div>
                                        )) : <p className="text-slate-500 text-sm">No criteria defined.</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-surface-border bg-[#151e2e] p-6 flex justify-between items-center">
                    <button 
                        onClick={() => step > 1 ? setStep(s => s - 1) : handleCancel()}
                        className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>
                    <div className="flex gap-3">
                         {step < 3 ? (
                            <Button onClick={handleNext} icon="arrow_forward">Next Step</Button>
                         ) : (
                            <Button onClick={handleSave} icon="save">{isEditMode ? 'Update' : 'Create'} Template</Button>
                         )}
                    </div>
                </div>
            </Card>
        </div>
    )
};