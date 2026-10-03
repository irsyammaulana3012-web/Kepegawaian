import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'emerald' | 'gold' | 'blue' | 'purple' | 'slate' | 'rose';
  onClick?: () => void;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'emerald',
  onClick,
  trend
}) => {
  const iconBgStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    gold: 'bg-amber-50 text-amber-700 border-amber-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-100'
  };

  const topBorderStyles = {
    emerald: 'border-t-4 border-t-emerald-700',
    gold: 'border-t-4 border-t-amber-500',
    blue: 'border-t-4 border-t-blue-600',
    purple: 'border-t-4 border-t-purple-600',
    slate: 'border-t-4 border-t-slate-500',
    rose: 'border-t-4 border-t-rose-600'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-sm shadow-slate-100 transition-all duration-200 ${topBorderStyles[variant]} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 truncate">{title}</p>
          <p className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">{value}</p>
          {subtitle && <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5 line-clamp-2 sm:line-clamp-none">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 text-[11px] sm:text-xs font-semibold mt-2 ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-xl border ${iconBgStyles[variant]} shrink-0 shadow-sm`}>
          {React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement<any>, {
                className: 'w-4 h-4 sm:w-6 sm:h-6'
              })
            : icon}
        </div>
      </div>
    </div>
  );
};
