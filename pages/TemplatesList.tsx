import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/ui/Common';
import { useTemplates } from '../context/TemplateContext';
import { TemplateCard } from '../components/templates/TemplateCard';

export const TemplatesList: React.FC = () => {
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