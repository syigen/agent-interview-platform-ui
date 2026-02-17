import React, { useState } from 'react';
import { Button, Card } from '../components/ui/Common';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { RunDetailsPanel } from '../components/RunDetailsPanel';
import { Run } from '../types';
import { useAccessRequests } from '../context/AccessRequestContext';
import { RequestsInbox } from '../components/RequestsInbox';
import { certificates } from '../data/certificates';

export const CertificateList: React.FC = () => {
    const navigate = useNavigate();
    const { unreadCount } = useAccessRequests();
    const [viewingLog, setViewingLog] = useState<Run | null>(null);
    const [showGuide, setShowGuide] = useState(false);
    const [showInbox, setShowInbox] = useState(false);
    
    const getScoreTheme = (score: number) => {
        if (score >= 90) return {
            border: '!border-emerald-500/30',
            hoverBorder: 'group-hover:!border-emerald-500/60',
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-500',
            badgeBg: 'bg-emerald-500/10',
            badgeText: 'text-emerald-500',
            shadow: 'hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]'
        };
        if (score >= 70) return {
            border: '!border-yellow-500/30',
            hoverBorder: 'group-hover:!border-yellow-500/60',
            iconBg: 'bg-yellow-500/10',
            iconColor: 'text-yellow-500',
            badgeBg: 'bg-yellow-500/10',
            badgeText: 'text-yellow-500',
            shadow: 'hover:shadow-[0_0_20px_-5px_rgba(234,179,8,0.2)]'
        };
        return {
            border: '!border-red-500/30',
            hoverBorder: 'group-hover:!border-red-500/60',
            iconBg: 'bg-red-500/10',
            iconColor: 'text-red-500',
            badgeBg: 'bg-red-500/10',
            badgeText: 'text-red-500',
            shadow: 'hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.2)]'
        };
    };

    return (
        <Layout>
            <RunDetailsPanel run={viewingLog} onClose={() => setViewingLog(null)} />
            <RequestsInbox isOpen={showInbox} onClose={() => setShowInbox(false)} />

            {/* Score Guide Modal */}
            {showGuide && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowGuide(false)}></div>
                    <div className="relative w-full max-w-lg bg-[#111722] border border-surface-border rounded-xl shadow-2xl p-6 animate-fade-in-up">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">verified</span>
                                    Validation Standards
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">Guide to score levels and certification tiers.</p>
                            </div>
                            <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex gap-4">
                                <div className="size-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">A+</div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-emerald-400 font-bold">90 - 100</span>
                                        <span className="text-[10px] uppercase tracking-wider text-emerald-500/70 font-semibold border border-emerald-500/20 px-1.5 py-0.5 rounded">Excellent</span>
                                    </div>
                                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">High assurance. Suitable for fully autonomous deployment in critical systems.</p>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-4">
                                <div className="size-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold text-sm">B</div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-yellow-400 font-bold">70 - 89</span>
                                        <span className="text-[10px] uppercase tracking-wider text-yellow-500/70 font-semibold border border-yellow-500/20 px-1.5 py-0.5 rounded">Standard</span>
                                    </div>
                                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">Acceptable safety profile. Recommended for supervised human-in-the-loop workflows.</p>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-4">
                                <div className="size-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-sm">C</div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-red-400 font-bold">&lt; 70</span>
                                        <span className="text-[10px] uppercase tracking-wider text-red-500/70 font-semibold border border-red-500/20 px-1.5 py-0.5 rounded">At Risk</span>
                                    </div>
                                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">Significant vulnerabilities detected. Deployment not recommended until remediated.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6 md:p-12 max-w-7xl mx-auto flex flex-col gap-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl md:text-4xl font-black text-white">Issued Certificates</h1>
                        <p className="text-slate-400">Registry of all certified agents and their validation scores.</p>
                    </div>
                    <div className="flex gap-3">
                         <Button 
                            variant={unreadCount > 0 ? "primary" : "outline"} 
                            icon="inbox" 
                            onClick={() => setShowInbox(true)}
                            className="relative"
                         >
                            Access Requests
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 size-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-background-dark">
                                    {unreadCount}
                                </span>
                            )}
                         </Button>
                         <Button variant="outline" icon="info" onClick={() => setShowGuide(true)}>Score Guide</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((cert) => {
                        const theme = getScoreTheme(cert.score);
                        return (
                            <Card 
                                key={cert.id} 
                                className={`p-6 group cursor-pointer transition-all relative overflow-hidden flex flex-col ${theme.border} ${theme.hoverBorder} ${theme.shadow}`}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                                    <span className="material-symbols-outlined text-[80px]">verified_user</span>
                                </div>
                                
                                <div 
                                    onClick={() => navigate(`/certificate/${cert.id}`)}
                                    className="relative z-10 flex flex-col h-full flex-1"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`size-10 rounded-full flex items-center justify-center transition-colors ${theme.iconBg} ${theme.iconColor}`}>
                                            <span className="material-symbols-outlined text-xl">verified</span>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs font-bold ${theme.badgeBg} ${theme.badgeText}`}>
                                            Score: {cert.score}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{cert.agent}</h3>
                                        <p className="text-xs text-slate-500 font-mono">{cert.id}</p>
                                    </div>

                                    <div className="mt-auto space-y-3 pt-4 border-t border-surface-border">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Template</span>
                                            <span className="text-slate-300">{cert.template}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Issued</span>
                                            <span className="text-slate-300">{cert.date}</span>
                                        </div>
                                        
                                        <Button 
                                            variant="secondary" 
                                            className="w-full mt-2 text-xs group-hover:bg-white group-hover:text-background-dark group-hover:border-white transition-colors" 
                                            icon="description"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewingLog({
                                                    id: cert.id,
                                                    agentId: 'AGT-' + cert.id.split('-')[1],
                                                    agentName: cert.agent,
                                                    timestamp: cert.date,
                                                    status: 'pass',
                                                    score: cert.score
                                                });
                                            }}
                                        >
                                            View Transcript
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                    
                     <div 
                        onClick={() => navigate('/runs')}
                        className="rounded-xl border border-dashed border-surface-border bg-surface-dark/30 flex flex-col items-center justify-center gap-4 p-6 cursor-pointer hover:bg-surface-dark hover:border-primary/50 transition-all group min-h-[260px]"
                     >
                         <div className="size-12 rounded-full bg-surface-dark border border-surface-border flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:border-primary transition-colors">
                             <span className="material-symbols-outlined text-2xl">add</span>
                         </div>
                         <p className="text-sm font-medium text-slate-400 group-hover:text-white">Issue New Certificate</p>
                     </div>
                </div>
            </div>
        </Layout>
    );
};