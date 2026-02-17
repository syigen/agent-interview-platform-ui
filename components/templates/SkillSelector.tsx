import React, { useState } from 'react';

export const SkillSelector: React.FC<{ skills: string[]; onChange: (skills: string[]) => void }> = ({ skills, onChange }) => {
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