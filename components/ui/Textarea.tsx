import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>}
      <textarea
        className={`w-full bg-background-light dark:bg-background-dark border ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-surface-border focus:border-primary focus:ring-primary'} text-slate-900 dark:text-white text-sm rounded-lg focus:ring-2 block p-2.5 resize-none ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400 font-medium animate-fade-in-up">{error}</p>}
    </div>
  );
};