import React from 'react';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
    steps: string[];
    onStepClick?: (step: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps, steps, onStepClick }) => {
    return (
        <div className="border-b border-surface-border bg-[#151e2e] p-6">
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-primary">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm text-slate-400">{steps[currentStep - 1]}</span>
            </div>
            <div className="w-full bg-surface-border rounded-full h-1.5 mb-3">
                <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-xs font-medium">
                {steps.map((step, idx) => {
                    const stepNum = idx + 1;
                    const isActive = currentStep === stepNum;
                    const isCompleted = currentStep > stepNum;
                    
                    return (
                        <button 
                            key={step} 
                            onClick={() => onStepClick && onStepClick(stepNum)}
                            className={`transition-colors focus:outline-none ${
                                isActive 
                                    ? 'text-primary font-bold scale-105' 
                                    : isCompleted 
                                        ? 'text-white hover:text-primary/80' 
                                        : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {step}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};