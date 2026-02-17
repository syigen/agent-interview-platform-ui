import React from 'react';
import { Card } from './ui/Common';
import { Metric } from '../types';

export const MetricCard: React.FC<{ metric: Metric }> = ({ metric }) => {
    const isLive = metric.label === 'Active Runs';
    return (
        <Card className={`p-6 flex flex-col gap-4 relative overflow-hidden group ${isLive ? 'border-primary/50 shadow-primary/5' : ''}`}>
            {isLive && (
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <span className="material-symbols-outlined text-[80px] text-primary">{metric.icon}</span>
                </div>
            )}
            <div className="flex items-center justify-between z-10">
                <div className={`p-2 rounded-lg ${isLive ? 'bg-primary/10 text-primary' : 'bg-surface-border text-slate-400'}`}>
                    <span className={`material-symbols-outlined ${isLive ? 'animate-pulse' : ''}`}>{metric.icon}</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${isLive ? 'text-primary bg-primary/10' : 'text-emerald-500 bg-emerald-500/10'}`}>
                    {metric.change}
                </span>
            </div>
            <div className="z-10">
                <p className="text-slate-400 text-sm font-medium">{metric.label}</p>
                <p className="text-white text-3xl font-bold mt-1">{metric.value}</p>
            </div>
            <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden z-10">
                <div className={`h-full rounded-full ${isLive ? 'bg-primary w-[40%] animate-pulse' : 'bg-emerald-500 w-[75%]'}`}></div>
            </div>
        </Card>
    )
};