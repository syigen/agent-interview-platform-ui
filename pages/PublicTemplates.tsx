import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input, Card } from '../components/ui/Common';
import { Template } from '../types';
import { PublicService } from '../services/PublicService';
import { PublicTemplateCard } from '../components/templates/PublicTemplateCard';

export const PublicTemplates: React.FC = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filterText, setFilterText] = useState('');
    const [difficulty, setDifficulty] = useState<string>('All');

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoading(true);
                const data = await PublicService.getTemplates();
                setTemplates(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to load templates');
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    const filteredTemplates = templates.filter(t => {
        const matchesText = t.name.toLowerCase().includes(filterText.toLowerCase()) ||
            t.skills.some(s => s.toLowerCase().includes(filterText.toLowerCase())) ||
            t.id.toLowerCase().includes(filterText.toLowerCase());
        const matchesDiff = difficulty === 'All' || t.difficulty === difficulty;
        return matchesText && matchesDiff;
    });

    return (
        <div className="min-h-screen bg-background-dark font-display flex flex-col pt-16">
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b border-white/5 bg-background-dark/80 backdrop-blur-md flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="flex items-center justify-center size-8 rounded bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">verified_user</span>
                    </div>
                    <h2 className="text-white text-lg font-bold tracking-tight">Verifiable AI</h2>
                </Link>
                <div className="flex items-center gap-4">
                    <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
                </div>
            </header>

            <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-6">
                <div className="flex flex-col gap-2 mt-4">
                    <h1 className="text-4xl md:text-[44px] font-black leading-tight tracking-tight text-white flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center size-10 rounded-full text-blue-500 border-2 border-blue-500">
                            <span className="material-symbols-outlined font-bold text-[26px]" style={{ transform: 'rotate(-45deg)' }}>explore</span>
                        </div>
                        Explore Templates
                    </h1>
                    <p className="text-[#8e9bb0] text-[17px] font-normal max-w-2xl leading-relaxed mt-2">
                        Discover standardized evaluation frameworks created by the community.<br />
                        These templates define the skills and scenarios used to verify AI agents.
                    </p>
                </div>

                <div className="p-6 flex flex-col gap-5 mt-6 bg-[#1a202c]/40 border border-[#2d3748]/60 rounded-xl">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                        <input
                            type="text"
                            className="bg-[#111827] w-full text-[15px] text-slate-200 border border-[#374151] rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                            placeholder="Search templates by name, skill, or ID..."
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4 items-center pl-1">
                        <span className="text-[12px] font-bold uppercase tracking-widest text-[#64748b]">FILTERS:</span>

                        {/* Difficulty Filter */}
                        <div className="relative group">
                            <select
                                className="appearance-none bg-transparent font-medium border border-transparent hover:border-[#374151] hover:bg-[#1f2937] text-white text-[14px] rounded-md pl-3 pr-8 py-1.5 focus:outline-none cursor-pointer transition-colors"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <option value="All" className="bg-[#1f2937]">All Difficulties</option>
                                <option value="Easy" className="bg-[#1f2937]">Easy</option>
                                <option value="Medium" className="bg-[#1f2937]">Medium</option>
                                <option value="Hard" className="bg-[#1f2937]">Hard</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mt-2">
                        Error loading templates: {error}
                    </div>
                )}

                <div className="mt-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full"></div>
                            <span className="text-slate-400 font-medium">Loading templates...</span>
                        </div>
                    ) : filteredTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredTemplates.map(t => (
                                <PublicTemplateCard key={t.id} template={t} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center py-16">
                            <div className="size-16 rounded-full bg-surface-border/30 flex items-center justify-center mb-4 text-slate-400">
                                <span className="material-symbols-outlined text-3xl">search_off</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No templates found</h3>
                            <p className="text-slate-400 max-w-sm text-sm">
                                We couldn't find any public templates matching your search criteria. Try adjusting your filters.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
