import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div className={`bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl shadow-sm ${className}`} {...props}>
    {children}
  </div>
);