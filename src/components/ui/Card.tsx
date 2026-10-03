import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  noPadding = false
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-100 transition-all duration-200 ${className}`}>
      {(title || action) && (
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 ${headerClassName}`}>
          <div className="min-w-0 flex-1">
            {typeof title === 'string' ? (
              <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight leading-snug">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-normal">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">{action}</div>}
        </div>
      )}
      <div className={noPadding ? bodyClassName : `p-4 sm:p-6 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};
