import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Button, Input, Textarea, Card } from '../components/ui/Common';
import { Link, useNavigate, useParams, Routes, Route } from 'react-router-dom';
import { useTemplates } from '../context/TemplateContext';
import { Template, Criterion } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// --- Sub-components for Create/Edit Wizard ---

const StepIndicator: React.FC<{ currentStep: number; totalSteps: number; steps: string[] }> = ({ currentStep, totalSteps, steps }) => {
    return (
        <div className="border-b border-surface-border bg-[#151e2e] p-6">
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-primary">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm text-slate-400">{steps[currentStep - 1]}</span>
            </div>
            <div className="w-full bg-surface-border rounded-full h-1.5 mb-2">
                <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-medium">
                {steps.map((step, idx) => (
                    <span key={step} className={currentStep > idx ? 'text-white' : ''}>{step}</span>
                ))}
            </div>
        </div>
    );
};

const SkillSelector: React.FC<{ skills: string[]; onChange: (skills: string[]) => void }> = ({ skills, onChange }) => {
    const [input, setInput] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && input.trim()) {
            e.preventDefault();
            if (!skills.includes(input.trim())) {
                onChange([...skills, input.trim()]);
            }
            setInput('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        onChange(skills.filter(s => s !== skillToRemove));
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Required Skills (Press Enter to add)</label>
            <div className="w-full rounded-lg bg-background-dark border border-surface-border p-2 flex flex-wrap gap-2 min-h-[50px] focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
                {skills.map(skill => (
                    <span key={skill} className="bg-primary/20 text-primary text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 border border-primary/30 animate-fade-in-up">
                        {skill} 
                        <button onClick={() => removeSkill(skill)} className="hover:text-white"><span className="material-symbols-outlined text-[14px]">close</span></button>
                    </span>
                ))}
                <input 
                    className="bg-transparent text-sm text-white outline-none flex-1 min-w-[120px] placeholder:text-slate-600" 
                    placeholder={skills.length === 0 ? "e.g. Python, Logic, Ethics..." : ""}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
        </div>
    );
};

const CriteriaBuilder: React.FC<{ criteria: Criterion[]; onChange: (c: Criterion[]) => void }> = ({ criteria, onChange }) => {
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

// --- Main Components ---

const TemplateCard: React.FC<{ template: Template; onDelete: (id: string) => void; onDuplicate: (id: string) => void }> = ({ template, onDelete, onDuplicate }) => {
    const navigate = useNavigate();
    return (
        <tr className="hover:bg-surface-border/30 transition-colors group">
            <td className="px-6 py-4">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/templates/edit/${template.id}`)}>{template.name}</span>
                    <span className="text-xs text-slate-500">ID: {template.id}</span>
                    {template.description && <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">{template.description}</span>}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                    {template.skills.slice(0, 3).map((s: string) => (
                        <span key={s} className="px-2 py-0.5 rounded text-xs font-medium bg-surface-border text-slate-300 border border-slate-700">{s}</span>
                    ))}
                    {template.skills.length > 3 && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-surface-border text-slate-500 border border-slate-700">+{template.skills.length - 3}</span>
                    )}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${template.difficulty === 'Hard' ? 'bg-red-500' : template.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                    <span className="text-slate-300">{template.difficulty}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-slate-400">{template.lastUpdated}</td>
            <td className="px-6 py-4 text-right relative">
                 <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                    <button 
                        className="text-slate-400 hover:text-white p-1" 
                        title="Duplicate"
                        onClick={() => onDuplicate(template.id)}
                    >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                    <button 
                        className="text-slate-400 hover:text-white p-1" 
                        title="Edit"
                        onClick={() => navigate(`/templates/edit/${template.id}`)}
                    >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button 
                        className="text-slate-400 hover:text-red-400 p-1" 
                        title="Delete"
                        onClick={() => onDelete(template.id)}
                    >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                 </div>
            </td>
        </tr>
    );
};

const TemplatesList: React.FC = () => {
    const navigate = useNavigate();
    const { templates, deleteTemplate, duplicateTemplate } = useTemplates();
    const [filterText, setFilterText] = useState('');
    const [difficulty, setDifficulty] = useState<string>('All');

    const filteredTemplates = templates.filter(t => {
        const matchesText = t.name.toLowerCase().includes(filterText.toLowerCase()) || 
                            t.skills.some(s => s.toLowerCase().includes(filterText.toLowerCase())) ||
                            t.id.toLowerCase().includes(filterText.toLowerCase());
        const matchesDiff = difficulty === 'All' || t.difficulty === difficulty;
        return matchesText && matchesDiff;
    });

    const handleDuplicate = (id: string) => {
        const newId = duplicateTemplate(id);
        if (newId) {
            navigate(`/templates/edit/${newId}`);
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto p-6 md:p-12">
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
                                        onDelete={deleteTemplate} 
                                        onDuplicate={handleDuplicate}
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

const TemplateEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { templates, addTemplate, updateTemplate } = useTemplates();
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Check if we are in Edit mode
    const isEditMode = !!id;
    
    const [data, setData] = useState<Omit<Template, 'id' | 'lastUpdated'>>({
        name: '',
        description: '',
        type: 'manual',
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

    const updateData = (field: keyof Omit<Template, 'id' | 'lastUpdated'>, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!data.name) {
            alert("Please enter a template name.");
            return;
        }

        if (isEditMode && id) {
            updateTemplate(id, data);
        } else {
            addTemplate(data);
        }
        navigate('/templates');
    };

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
                
                Return the output as a JSON object containing an array of criteria with 'prompt' and 'expected' fields.`,
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
                                        expected: { type: Type.STRING, description: "A summary of the expected correct response or behavior." }
                                    },
                                    required: ['prompt', 'expected']
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
                         expected: c.expected
                     }));
                     updateData('criteria', newCriteria);
                     // Switch to manual to show the generated items
                     updateData('type', 'manual');
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

                                    <SkillSelector skills={data.skills} onChange={s => updateData('skills', s)} />

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
                                <CriteriaBuilder criteria={data.criteria || []} onChange={c => updateData('criteria', c)} />
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
                                                <div>
                                                    <p className="text-sm text-slate-200">{c.prompt || 'Untitled Prompt'}</p>
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
                        onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/templates')}
                        className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>
                    <div className="flex gap-3">
                         {step < 3 ? (
                            <Button onClick={() => setStep(s => s + 1)} icon="arrow_forward">Next Step</Button>
                         ) : (
                            <Button onClick={handleSave} icon="save">{isEditMode ? 'Update' : 'Create'} Template</Button>
                         )}
                    </div>
                </div>
            </Card>
        </div>
    )
}

export const Templates: React.FC = () => {
    return (
        <Layout>
            <Routes>
                <Route index element={<TemplatesList />} />
                <Route path="create" element={<TemplateEditor />} />
                <Route path="edit/:id" element={<TemplateEditor />} />
            </Routes>
        </Layout>
    );
};