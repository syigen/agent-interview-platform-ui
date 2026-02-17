import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ icon, label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
        )}
        <input
          className={`w-full bg-background-light dark:bg-background-dark border ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-surface-border focus:border-primary focus:ring-primary'} text-slate-900 dark:text-white text-sm rounded-lg focus:ring-2 block p-2.5 ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-400 font-medium animate-fade-in-up">{error}</p>}
    </div>
  );
};