import React, { useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Common';
import { Run, Metric } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { RunDetailsPanel } from '../components/RunDetailsPanel';
import { MetricCard } from '../components/MetricCard';
import { RecentActivityTable } from '../components/RecentActivityTable';
import { useAppSelector } from '../store/hooks';

import { RequestsInbox } from '../components/RequestsInbox';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [selectedRun, setSelectedRun] = useState<Run | null>(null);
    const [showInbox, setShowInbox] = useState(false);

    // Connect to Redux Store
    const runs = useAppSelector((state) => state.runs.items);
    const templates = useAppSelector((state) => state.templates.items);
    const accessRequests = useAppSelector((state) => state.accessRequests.items);

    // Calculate Metrics based on real store data
    const metrics = useMemo<Metric[]>(() => {
        const activeRunsCount = runs.filter(r => r.status === 'running' || r.status === 'in_progress').length;
        const passedRunsCount = runs.filter(r => r.status === 'pass').length;
        const unreadRequests = accessRequests.filter(r => r.status === 'unread').length;

        // Use base of 843 to match UI design requirements, plus real dynamic certificates
        const totalCertificates = 0 + passedRunsCount;

        return [
            {
                label: 'Interview Templates',
                value: templates.length.toString(),
                change: '+2 this week',
                trend: 'up',
                icon: 'library_books',
                status: 'neutral'
            },
            {
                label: 'Active Runs',
                value: activeRunsCount.toString(),
                change: activeRunsCount > 0 ? 'Live Processing' : 'System Idle',
                trend: 'up',
                icon: 'memory',
                status: activeRunsCount > 0 ? 'info' : 'neutral'
            },
            {
                label: 'Certificates Issued',
                value: totalCertificates.toString(),
                change: '+5% vs last month',
                trend: 'up',
                icon: 'verified',
                status: 'success'
            },
            {
                label: 'Access Requests',
                value: unreadRequests.toString(),
                change: unreadRequests > 0 ? `${unreadRequests} Pending` : 'All Clear',
                trend: unreadRequests > 0 ? 'up' : 'down',
                icon: 'inbox',
                onClick: () => setShowInbox(true),
                status: unreadRequests > 0 ? 'warning' : 'success'
            }
        ];
    }, [runs, templates, accessRequests]);

    // Get 5 most recent runs
    const recentRuns = useMemo(() => runs.slice(0, 5), [runs]);

    return (
        <Layout>
            <RunDetailsPanel run={selectedRun} onClose={() => setSelectedRun(null)} />
            <RequestsInbox isOpen={showInbox} onClose={() => setShowInbox(false)} />

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                    <RecentActivityTable runs={recentRuns} onSelectRun={setSelectedRun} />
                </div>

            </div>
        </Layout>
    );
};