import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>}
      <textarea
        className={`w-full bg-background-light dark:bg-background-dark border border-slate-200 dark:border-surface-border text-slate-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary block p-2.5 resize-none ${className}`}
        {...props}
      />
    </div>
  );
};