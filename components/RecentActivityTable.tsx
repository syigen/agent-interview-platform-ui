import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Run } from '../types';
import { Badge } from './ui/Common';

interface RecentActivityTableProps {
    runs: Run[];
    onSelectRun: (run: Run) => void;
}

export const RecentActivityTable: React.FC<RecentActivityTableProps> = ({ runs, onSelectRun }) => {
    const navigate = useNavigate();

    return (
        <div className="w-full overflow-hidden rounded-xl border border-surface-border bg-surface-dark shadow-sm animate-fade-in-up">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-surface-border bg-[#151c2a]">
                            <th className="px-6 py-4 font-semibold text-slate-300">Agent ID</th>
                            <th className="px-6 py-4 font-semibold text-slate-300">Timestamp</th>
                            <th className="px-6 py-4 font-semibold text-slate-300">Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-300">Score</th>
                            <th className="px-6 py-4 font-semibold text-slate-300 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                        {runs.length > 0 ? (
                            runs.map((run) => (
                                <tr 
                                    key={run.id} 
                                    className="group hover:bg-[#1f293a] transition-colors cursor-pointer"
                                    onClick={() => onSelectRun(run)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                                {run.agentId.substring(0, 2)}
                                            </div>
                                            <span className="font-medium text-white font-mono">{run.agentName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">{run.timestamp}</td>
                                    <td className="px-6 py-4">
                                        {run.status === 'pass' && <Badge type="pass" icon="check_circle">Certified</Badge>}
                                        {run.status === 'fail' && <Badge type="fail" icon="cancel">Failed</Badge>}
                                        {run.status === 'running' && <Badge type="progress" icon="sync">In Progress</Badge>}
                                        {run.status === 'in_progress' && <Badge type="neutral" icon="pending">Pending</Badge>}
                                    </td>
                                    <td className="px-6 py-4">
                                        {run.score !== undefined ? (
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold ${run.score > 80 ? 'text-white' : 'text-red-400'}`}>{run.score}</span>
                                                <span className="text-slate-500 text-xs">/100</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-500 italic text-xs">Running...</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            {run.status === 'pass' && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/certificate/${run.id}`);
                                                    }}
                                                    className="text-emerald-500 hover:text-emerald-400 font-medium text-xs flex items-center gap-1 transition-colors uppercase tracking-wider"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">verified</span>
                                                    Certificate
                                                </button>
                                            )}
                                            <button 
                                                className="text-slate-400 hover:text-white font-medium text-sm transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectRun(run);
                                                }}
                                            >
                                                {run.status === 'running' ? 'Monitor' : 'View Report'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                    No recent activity found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col p-4 gap-3 bg-[#111722]">
                {runs.length > 0 ? (
                    runs.map((run) => (
                        <div 
                            key={run.id} 
                            onClick={() => onSelectRun(run)}
                            className="bg-surface-dark border border-surface-border rounded-lg p-4 active:bg-[#1a2332] active:scale-[0.98] transition-all"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                        {run.agentId.substring(0, 2)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white text-sm">{run.agentName}</span>
                                        <span className="text-[10px] text-slate-500 font-mono">{run.timestamp}</span>
                                    </div>
                                </div>
                                {run.status === 'pass' && <Badge type="pass" icon="check_circle">Certified</Badge>}
                                {run.status === 'fail' && <Badge type="fail" icon="cancel">Failed</Badge>}
                                {run.status === 'running' && <Badge type="progress" icon="sync">Running</Badge>}
                                {run.status === 'in_progress' && <Badge type="neutral" icon="pending">Pending</Badge>}
                            </div>

                            <div className="flex items-center justify-between border-t border-surface-border/50 pt-3 mt-1">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase text-slate-500 font-bold">Score</span>
                                    <span className={`font-bold text-sm ${run.score !== undefined && run.score > 80 ? 'text-white' : 'text-red-400'}`}>
                                        {run.score !== undefined ? `${run.score}/100` : '--'}
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    {run.status === 'pass' && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/certificate/${run.id}`);
                                            }}
                                            className="text-emerald-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">verified</span> Cert
                                        </button>
                                    )}
                                    <button className="text-slate-400 hover:text-white">
                                        <span className="material-symbols-outlined text-[20px]">{run.status === 'running' ? 'visibility' : 'description'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        No recent activity found.
                    </div>
                )}
            </div>
        </div>
    );
};