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
        <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-100 ${headerClassName}`}>
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={noPadding ? bodyClassName : `p-6 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};
