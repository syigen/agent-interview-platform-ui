import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);