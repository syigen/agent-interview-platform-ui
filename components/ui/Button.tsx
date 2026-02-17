import React from 'react';

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