import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Template } from '../../types';

export const PublicTemplateCard: React.FC<{
    template: Template;
}> = ({ template }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-3 group bg-[#111827] border border-[#1f2937] rounded-xl p-5 hover:border-[#374151] hover:shadow-lg transition-all w-full min-h-[180px]">
            <div className="flex items-start justify-between gap-3">
                <h3 className="text-[17px] font-bold text-[#f1f5f9] leading-tight line-clamp-2">{template.name}</h3>
                <div className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
                    ${template.difficulty === 'Hard' ? 'bg-[#4c1d95]/40 text-[#c084fc] border border-[#a855f7]/20' :
                        template.difficulty === 'Medium' ? 'bg-[#854d0e]/40 text-[#facc15] border border-[#eab308]/20' :
                            'bg-[#064e3b]/50 text-[#34d399] border border-[#10b981]/20'}`}>
                    {template.difficulty}
                </div>
            </div>

            {template.description && (
                <p className="text-[14px] text-[#94a3b8] leading-relaxed max-w-3xl line-clamp-2 mt-1">
                    {template.description}
                </p>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
                {template.skills.map((s: string) => (
                    <span key={s} className="px-3 py-1 rounded-full text-[12px] font-medium bg-[#0f766e]/30 text-[#5eead4] border border-[#14b8a6]/20">
                        {s}
                    </span>
                ))}
            </div>

            <div className="mt-auto pt-4 flex justify-end">
                <button
                    onClick={() => navigate(`/explore/${template.id}`)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-bold py-2 px-4 rounded-lg transition-colors shadow-md"
                >
                    View Details
                </button>
            </div>
        </div>
    );
};
