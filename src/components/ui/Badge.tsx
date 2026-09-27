import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'gold' | 'blue' | 'rose' | 'slate' | 'amber' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  size = 'md',
  className = ''
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] font-semibold',
    md: 'px-2.5 py-1 text-xs font-semibold'
  };

  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    gold: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200',
    amber: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full tracking-wide transition ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
