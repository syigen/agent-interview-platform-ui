import React from 'react';
import { Input, Button } from './ui/Common';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setInterviewerName } from '../store/slices/settingsSlice';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const interviewerName = useAppSelector((state) => state.settings.interviewerName);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={onClose}
            ></div>
            
            {/* Panel */}
            <div className="relative w-full max-w-md bg-[#111722] border-l border-surface-border shadow-2xl h-full p-8 flex flex-col animate-fade-in-up">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">settings</span>
                        System Settings
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                <div className="flex-1 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-surface-border">
                            <span className="material-symbols-outlined text-slate-500 text-sm">badge</span>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interviewer Profile</h3>
                        </div>
                        
                        <div className="bg-surface-dark p-4 rounded-xl border border-surface-border flex items-center gap-4 mb-4">
                            <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                                <span className="material-symbols-outlined text-2xl">person</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Current Alias</p>
                                <p className="text-white font-bold">{interviewerName || 'Anonymous'}</p>
                            </div>
                        </div>

                        <Input 
                            label="Display Name" 
                            value={interviewerName}
                            onChange={(e) => dispatch(setInterviewerName(e.target.value))}
                            placeholder="Enter your name..."
                        />
                        
                        <p className="text-xs text-slate-500 leading-relaxed">
                            This identifier is cryptographically bound to all generated certificates and audit logs during your active session.
                        </p>
                    </div>
                </div>

                <div className="border-t border-surface-border pt-6">
                    <Button onClick={onClose} className="w-full" icon="check">Save Configuration</Button>
                </div>
            </div>
        </div>
    );
};