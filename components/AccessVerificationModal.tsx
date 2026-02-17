import React, { useState } from 'react';
import { Button, Input, Textarea } from './ui/Common';
import { useAccessRequests } from '../context/AccessRequestContext';

interface AccessVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    certId: string;
    certName: string;
}

export const AccessVerificationModal: React.FC<AccessVerificationModalProps> = ({ isOpen, onClose, onSuccess, certId, certName }) => {
    const { addRequest } = useAccessRequests();
    const [mode, setMode] = useState<'verify' | 'request'>('verify');
    
    // Verify State
    const [key, setKey] = useState('');
    const [error, setError] = useState('');
    const [isChecking, setIsChecking] = useState(false);

    // Request State
    const [reqName, setReqName] = useState('');
    const [reqContact, setReqContact] = useState('');
    const [reqMsg, setReqMsg] = useState('');
    const [reqSuccess, setReqSuccess] = useState(false);

    if (!isOpen) return null;

    const handleVerify = () => {
        setIsChecking(true);
        setError('');
        
        setTimeout(() => {
            setIsChecking(false);
            if (key.trim().toLowerCase() === 'admin') { 
                onSuccess();
                setKey('');
            } else {
                setError('Access Denied: Invalid cryptographic signature or key.');
            }
        }, 800);
    };

    const handleRequestSubmit = () => {
        if (!reqName || !reqContact || !reqMsg) return;
        
        setIsChecking(true);
        setTimeout(() => {
            addRequest({
                certificateId: certId,
                certificateName: certName,
                requesterName: reqName,
                requesterContact: reqContact,
                message: reqMsg
            });
            setIsChecking(false);
            setReqSuccess(true);
        }, 1000);
    };

    const reset = () => {
        setMode('verify');
        setKey('');
        setError('');
        setReqName('');
        setReqContact('');
        setReqMsg('');
        setReqSuccess(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={reset}></div>
            <div className="relative w-full max-w-md bg-[#111722] border border-surface-border rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
                
                {mode === 'verify' ? (
                    <div className="p-6">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="size-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4 border border-red-500/20">
                                <span className="material-symbols-outlined text-2xl">lock</span>
                            </div>
                            <h3 className="text-xl font-bold text-white">Restricted Access</h3>
                            <p className="text-slate-400 text-sm mt-2">The full evaluation transcript contains sensitive proprietary data. Authorization required.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Access Key / Admin PIN</label>
                                <input 
                                    type="password" 
                                    className="w-full bg-[#0a0e17] border border-surface-border focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 outline-none transition-all font-mono"
                                    placeholder="Enter key (Try 'admin')"
                                    value={key}
                                    onChange={(e) => setKey(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                                    autoFocus
                                />
                            </div>
                            
                            {error && (
                                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded border border-red-500/20 animate-pulse">
                                    <span className="material-symbols-outlined text-[16px]">error</span>
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 mt-2">
                                <Button variant="ghost" onClick={reset} className="flex-1">Cancel</Button>
                                <button 
                                    onClick={handleVerify}
                                    disabled={isChecking}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isChecking ? (
                                        <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[18px]">key</span>
                                            Verify Access
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="pt-4 mt-4 border-t border-surface-border text-center">
                                <button 
                                    onClick={() => setMode('request')}
                                    className="text-xs text-primary hover:text-blue-300 transition-colors"
                                >
                                    Don't have a key? Request access
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Request Mode
                    <div className="p-6">
                        {reqSuccess ? (
                            <div className="text-center py-8 flex flex-col items-center animate-fade-in-up">
                                <div className="size-16 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-4xl">check</span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Request Sent</h3>
                                <p className="text-slate-400 text-sm mb-6 max-w-[250px]">
                                    The administrator has been notified. You will receive an email at <span className="text-white">{reqContact}</span> once approved.
                                </p>
                                <Button onClick={reset} className="w-full">Close</Button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-6">
                                    <button onClick={() => setMode('verify')} className="text-slate-400 hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">arrow_back</span>
                                    </button>
                                    <h3 className="text-lg font-bold text-white">Request Transcript Access</h3>
                                </div>

                                <div className="space-y-4">
                                    <Input 
                                        label="Name / Organization" 
                                        placeholder="e.g. Acme Corp Compliance"
                                        value={reqName}
                                        onChange={e => setReqName(e.target.value)}
                                    />
                                    <Input 
                                        label="Contact Email" 
                                        placeholder="email@company.com"
                                        type="email"
                                        value={reqContact}
                                        onChange={e => setReqContact(e.target.value)}
                                    />
                                    <Textarea 
                                        label="Reason for Request" 
                                        placeholder="Briefly explain why you need access to this audit log..."
                                        rows={3}
                                        value={reqMsg}
                                        onChange={e => setReqMsg(e.target.value)}
                                    />

                                    <div className="flex gap-3 mt-4">
                                        <Button variant="ghost" onClick={reset} className="flex-1">Cancel</Button>
                                        <button 
                                            onClick={handleRequestSubmit}
                                            disabled={isChecking || !reqName || !reqContact || !reqMsg}
                                            className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isChecking ? (
                                                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                                    Send Request
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};