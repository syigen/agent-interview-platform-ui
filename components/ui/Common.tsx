import React from 'react';

// --- Buttons ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  icon?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', icon, children, className = '', ...props }) => {
  const baseStyle = "flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20",
    secondary: "bg-surface-dark border border-surface-border text-slate-300 hover:text-white hover:bg-surface-hover",
    ghost: "text-slate-500 hover:text-primary hover:bg-primary/10",
    outline: "border border-surface-border text-slate-400 hover:text-white hover:border-slate-500"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} px-4 py-2.5 ${className}`} {...props}>
      {icon && <span className="material-symbols-outlined text-[20px]">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

// --- Inputs ---

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  label?: string;
}

export const Input: React.FC<InputProps> = ({ icon, label, className = '', ...props }) => {
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
          className={`w-full bg-background-light dark:bg-background-dark border border-slate-200 dark:border-surface-border text-slate-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary block p-2.5 ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};

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

// --- Badges ---

interface BadgeProps {
  type: 'pass' | 'fail' | 'progress' | 'neutral';
  children: React.ReactNode;
  icon?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, children, icon }) => {
  const styles = {
    pass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    fail: "bg-red-500/10 text-red-500 border-red-500/20",
    progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    neutral: "bg-slate-700/50 text-slate-400 border-slate-600/50"
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[type]}`}>
      {icon && <span className={`material-symbols-outlined text-[14px] ${type === 'progress' ? 'animate-spin' : ''}`}>{icon}</span>}
      {children}
    </span>
  );
};

// --- Cards ---

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);