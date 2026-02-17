import React from 'react';

export const StepIndicator: React.FC<{ currentStep: number; totalSteps: number; steps: string[] }> = ({ currentStep, totalSteps, steps }) => {
    return (
        <div className="border-b border-surface-border bg-[#151e2e] p-6">
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-primary">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm text-slate-400">{steps[currentStep - 1]}</span>
            </div>
            <div className="w-full bg-surface-border rounded-full h-1.5 mb-2">
                <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-medium">
                {steps.map((step, idx) => (
                    <span key={step} className={currentStep > idx ? 'text-white' : ''}>{step}</span>
                ))}
            </div>
        </div>
    );
};