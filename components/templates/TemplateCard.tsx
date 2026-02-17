import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Template } from '../../types';

export const TemplateCard: React.FC<{ template: Template; onDelete: (id: string) => void; onDuplicate: (id: string) => void }> = ({ template, onDelete, onDuplicate }) => {
    const navigate = useNavigate();
    
    const statusColors = {
        draft: 'bg-slate-700/50 text-slate-400 border-slate-600',
        private: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        public: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    };

    return (
        <tr className="hover:bg-surface-border/30 transition-colors group">
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/templates/edit/${template.id}`)}>{template.name}</span>
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${statusColors[template.status]}`}>
                            {template.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>ID: {template.id}</span>
                        {template.description && (
                             <>
                                <span>•</span>
                                <span className="line-clamp-1 max-w-[200px]">{template.description}</span>
                             </>
                        )}
                    </div>
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