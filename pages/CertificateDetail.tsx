import React, { useState } from 'react';
import { Button } from '../components/ui/Common';
import { useNavigate, useParams } from 'react-router-dom';
import { RunDetailsPanel } from '../components/RunDetailsPanel';
import { Run } from '../types';
import { AccessVerificationModal } from '../components/AccessVerificationModal';
import { certificates } from '../data/certificates';

export const CertificateDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // State for Transcript View
  const [viewingLog, setViewingLog] = useState<Run | null>(null);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  // Find cert data or use default if not found in mock list
  const certData = certificates.find(c => c.id === id) || {
      id: id || 'UNKNOWN',
      agent: 'Unknown Agent',
      date: 'N/A',
      score: 0,
      template: 'Standard'
  };

  const handleAccessGranted = () => {
      setViewingLog({
          id: certData.id,
          agentId: 'AGT-' + certData.id.split('-')[1],
          agentName: certData.agent,
          timestamp: certData.date,
          status: 'pass',
          score: certData.score
      });
      setIsAccessModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background-dark text-white font-display overflow-x-hidden relative">
      <RunDetailsPanel run={viewingLog} onClose={() => setViewingLog(null)} />
      
      <AccessVerificationModal 
        isOpen={isAccessModalOpen} 
        onClose={() => setIsAccessModalOpen(false)} 
        onSuccess={handleAccessGranted} 
        certId={certData.id}
        certName={certData.agent}
      />

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>

      <header className="flex items-center justify-between border-b border-white/10 bg-[#111722]/80 backdrop-blur-md px-10 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/certificates')}>
             <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <div>
                 <h2 className="text-base font-bold leading-tight">Verifiable AI</h2>
                 <p className="text-xs text-slate-400">Certificate Verification Portal</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
             <Button 
                variant="outline" 
                className="hidden sm:flex" 
                icon="grid_view"
                onClick={() => navigate('/certificates')}
             >
                All Certificates
             </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-10 relative z-10">
        <div className="w-full max-w-4xl animate-fade-in-up">
            {/* Header and Details */}
            <div className="flex items-center justify-between gap-4 mb-8">
                 <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-sm font-semibold text-green-400 tracking-wide uppercase">Live Verification</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <span className="material-symbols-outlined text-[18px]">history</span>
                    <span>Last checked: Just now</span>
                 </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-[#1a1d24] shadow-2xl">
                 <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-400 to-primary"></div>
                 <div className="p-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-8 border-b border-surface-border">
                        <div>
                             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold mb-3 uppercase tracking-wider">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span> Verified Valid
                             </div>
                             <h1 className="text-4xl font-black tracking-tight mb-2">Certificate of Evaluation</h1>
                             <p className="text-slate-400 text-base max-w-lg">This record confirms the authentic performance evaluation of an AI Agent against standardized safety benchmarks.</p>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-[#13161c] border border-surface-border rounded-xl p-4 min-w-[140px]">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Final Score</span>
                            <div className="text-4xl font-black text-primary">{certData.score}</div>
                            <span className="text-xs font-medium text-slate-500">out of 100</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {[
                            ['Agent ID', certData.agent],
                            ['Template Version', certData.template],
                            ['Evaluation Date', certData.date],
                            ['Certificate ID', certData.id]
                        ].map(([label, val]) => (
                            <div key={label} className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
                                <div className="text-base font-semibold text-slate-200 truncate pr-2" title={String(val)}>{val}</div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-xl bg-[#13161c] border border-surface-border p-6 mb-10">
                         <div className="flex justify-between items-start mb-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[18px]">science</span> Assessment Methodology
                            </h3>
                         </div>
                         <div className="flex flex-wrap gap-2 mb-4">
                            {['Automated Adversarial Testing', 'Bias Analysis', 'Hallucination Check'].map(tag => (
                                <span key={tag} className="px-2.5 py-1 rounded-md text-xs font-medium bg-surface-border text-slate-300">{tag}</span>
                            ))}
                         </div>
                         <p className="text-sm text-slate-400 leading-relaxed">The agent was subjected to a rigorous 24-hour continuous evaluation cycle involving 15,000+ unique prompt injections designed to test safety boundaries, factual accuracy, and alignment with ethical guidelines.</p>
                         
                         <div className="mt-6 flex justify-center">
                            <Button 
                                variant="secondary" 
                                className="w-full sm:w-auto min-w-[200px]" 
                                icon="lock"
                                onClick={() => setIsAccessModalOpen(true)}
                            >
                                View Private Transcript
                            </Button>
                         </div>
                    </div>

                    <div className="border border-primary/20 rounded-xl p-6 overflow-hidden relative">
                         <div className="absolute inset-0 bg-primary/5 -z-10"></div>
                         <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-primary">encrypted</span> Cryptographic Proof of Integrity
                         </h3>
                         <div className="grid gap-4">
                             <div className="flex flex-col sm:flex-row justify-between gap-3 p-3 rounded-lg bg-[#11141a] border border-surface-border hover:border-primary/40 transition-colors">
                                <div className="flex flex-col gap-1 overflow-hidden">
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Certificate Hash</span>
                                    <code className="text-xs sm:text-sm font-mono text-slate-300 truncate">0x71c93a4f8d2e1b5c6a9d2e4f8a1b3c5d7e9f2a4b6c8d0e2f4a6b8c0d2e4f6a8b</code>
                                </div>
                             </div>
                         </div>
                    </div>
                 </div>
            </div>
        </div>
      </main>
    </div>
  );
};