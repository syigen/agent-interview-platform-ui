import React, { useState } from 'react';
import { Button, Card } from './ui/Common';
import { useAppSelector } from '../store/hooks';

interface RunSimulationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (templateId: string) => void;
}

export const RunSimulationModal: React.FC<RunSimulationModalProps> = ({ isOpen, onClose, onStart }) => {
    const templates = useAppSelector(state => state.templates.items);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

    if (!isOpen) return null;
    const availableTemplates = templates.filter(t => t.status !== 'draft');

    const handleStart = () => {
        if (selectedTemplateId) {
            onStart(selectedTemplateId);
            onClose();
            setSelectedTemplateId('');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-lg bg-[#111722] border border-surface-border rounded-xl shadow-2xl p-8 animate-fade-in-up">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">smart_toy</span>
                            New Simulation Run
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Select a template to initialize an autonomous agent evaluation.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Evaluation Template</label>
                        <select 
                            className="w-full bg-background-dark border border-surface-border text-white text-sm rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none"
                            value={selectedTemplateId}
                            onChange={(e) => setSelectedTemplateId(e.target.value)}
                        >
                            <option value="">-- Choose a Template --</option>
                            {availableTemplates.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.difficulty})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
                        <Button 
                            onClick={handleStart} 
                            disabled={!selectedTemplateId} 
                            icon="play_arrow" 
                            className="flex-1"
                        >
                            Start Simulation
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};