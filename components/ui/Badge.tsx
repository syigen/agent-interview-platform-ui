import React from 'react';

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