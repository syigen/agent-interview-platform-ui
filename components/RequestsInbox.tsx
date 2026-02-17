import React from 'react';
import { useAccessRequests } from '../context/AccessRequestContext';

interface RequestsInboxProps {
    isOpen: boolean;
    onClose: () => void;
}

export const RequestsInbox: React.FC<RequestsInboxProps> = ({ isOpen, onClose }) => {
    const { requests, markAsRead } = useAccessRequests();
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
             <div className="relative w-full max-w-2xl bg-[#111722] border border-surface-border rounded-xl shadow-2xl flex flex-col max-h-[80vh] animate-fade-in-up">
                <div className="flex items-center justify-between p-6 border-b border-surface-border bg-surface-dark/50 rounded-t-xl">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">inbox</span>
                        Access Requests
                    </h3>
                    <button onClick={onClose}><span className="material-symbols-outlined text-slate-400 hover:text-white text-2xl">close</span></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0d121c]">
                    {requests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">mark_email_read</span>
                            <p>No pending access requests.</p>
                        </div>
                    ) : (
                        requests.map(req => (
                            <div key={req.id} className={`p-5 rounded-lg border transition-all ${req.status === 'unread' ? 'bg-[#1a2332] border-primary/30 shadow-[0_0_15px_-5px_rgba(19,91,236,0.2)]' : 'bg-transparent border-surface-border/50 opacity-75'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`size-2 rounded-full ${req.status === 'unread' ? 'bg-primary animate-pulse' : 'bg-transparent'}`}></div>
                                        <div>
                                            <div className="font-bold text-white text-sm">{req.requesterName}</div>
                                            <div className="text-xs text-slate-400 font-mono">{req.requesterContact}</div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-500 bg-surface-dark px-2 py-1 rounded border border-surface-border">{req.timestamp}</span>
                                </div>
                                
                                <div className="ml-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Requested Certificate:</span>
                                        <span className="text-xs text-primary font-mono bg-primary/10 px-2 py-0.5 rounded">{req.certificateName}</span>
                                    </div>
                                    <div className="text-sm text-slate-300 leading-relaxed bg-black/20 p-3 rounded border border-white/5 italic">
                                        "{req.message}"
                                    </div>
                                    
                                    <div className="flex justify-end gap-2 mt-4">
                                        <a href={`mailto:${req.requesterContact}`} className="text-xs flex items-center gap-1 text-slate-400 hover:text-white px-3 py-1.5 rounded bg-white/5 border border-transparent hover:border-slate-500 transition-colors">
                                            <span className="material-symbols-outlined text-[14px]">reply</span> Reply
                                        </a>
                                        {req.status === 'unread' && (
                                            <button onClick={() => markAsRead(req.id)} className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                                                <span className="material-symbols-outlined text-[14px]">check</span> Mark as Read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 border-t border-surface-border bg-surface-dark/50 rounded-b-xl flex justify-between items-center text-xs text-slate-500">
                    <span>Showing {requests.length} total requests</span>
                </div>
             </div>
        </div>
    )
};