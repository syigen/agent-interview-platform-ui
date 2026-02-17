import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, Badge, Button } from '../components/ui/Common';
import { Run, Metric } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { RunDetailsPanel } from '../components/RunDetailsPanel';

const metrics: Metric[] = [
  { label: 'Interview Templates', value: '12', change: '+2 this week', trend: 'up', icon: 'library_books' },
  { label: 'Active Runs', value: '4', change: 'Live Processing', trend: 'up', icon: 'memory' },
  { label: 'Certificates Issued', value: '843', change: '+5% vs last month', trend: 'up', icon: 'verified' },
];

const runs: Run[] = [
  { id: '1', agentId: 'A2', agentName: 'Agent-Alpha-v2', timestamp: 'Just now', status: 'pass', score: 98 },
  { id: '2', agentId: 'CB', agentName: 'Customer-Support-Bot', timestamp: '2 mins ago', status: 'running' },
  { id: '3', agentId: 'TX', agentName: 'Trading-Algo-X', timestamp: '15 mins ago', status: 'fail', score: 45 },
  { id: '4', agentId: 'MA', agentName: 'Medi-Assist-Beta', timestamp: '1 hour ago', status: 'pass', score: 92 },
  { id: '5', agentId: 'LE', agentName: 'Legal-Ease-v1', timestamp: '3 hours ago', status: 'pass', score: 88 },
];

const MetricCard: React.FC<{ metric: Metric }> = ({ metric }) => {
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
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);

  return (
    <Layout>
      <RunDetailsPanel run={selectedRun} onClose={() => setSelectedRun(null)} />
      
      <div className="p-4 md:p-8 lg:px-12 xl:px-16 max-w-[1400px] mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">Dashboard Overview</h1>
                <p className="text-slate-400 text-base font-normal">Real-time metrics for verifiable AI agent certification.</p>
            </div>
            <Link to="/runs">
                <Button icon="add_circle">New Evaluation Run</Button>
            </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map((m) => <MetricCard key={m.label} metric={m} />)}
        </div>

        {/* Recent Activity */}
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-white text-xl font-bold tracking-tight">Recent Activity</h2>
                <button 
                    onClick={() => navigate('/runs')}
                    className="text-primary text-sm font-medium hover:text-blue-400 transition-colors"
                >
                    View All History
                </button>
            </div>

            <div className="w-full overflow-hidden rounded-xl border border-surface-border bg-surface-dark shadow-sm">
                <div className="overflow-x-auto">
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
                            {runs.map((run) => (
                                <tr 
                                    key={run.id} 
                                    className="group hover:bg-[#1f293a] transition-colors cursor-pointer"
                                    onClick={() => setSelectedRun(run)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                                {run.agentId}
                                            </div>
                                            <span className="font-medium text-white font-mono">{run.agentName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">{run.timestamp}</td>
                                    <td className="px-6 py-4">
                                        {run.status === 'pass' && <Badge type="pass" icon="check_circle">Certified</Badge>}
                                        {run.status === 'fail' && <Badge type="fail" icon="cancel">Failed</Badge>}
                                        {run.status === 'running' && <Badge type="progress" icon="sync">In Progress</Badge>}
                                    </td>
                                    <td className="px-6 py-4">
                                        {run.score ? (
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
                                                    setSelectedRun(run);
                                                }}
                                            >
                                                {run.status === 'running' ? 'Monitor' : 'View Report'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

      </div>
    </Layout>
  );
};