import type { ReactNode } from 'react';
import { Heading } from './Heading';

interface PageHeaderProps {
  icon: ReactNode;
  title?: string;
  description?: string;
  isDarkMode?: boolean;
  children?: ReactNode; 
  leftContent?: ReactNode; 
  className?: string;
}

export function PageHeader({
  icon,
  title,
  description,
  isDarkMode = false,
  children,
  leftContent,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`w-full shadow-sm border-b py-2.5 px-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
    } ${className}`}>
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 border border-emerald-100 dark:border-emerald-900/50 shadow-2xs shrink-0">
          {icon}
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5 flex-wrap">
            {title && (
              <Heading size="xs" isDarkMode={isDarkMode} className="tracking-tight font-semibold">
                {/* Memaksa ukuran font menggunakan inline style agar pasti mengecil */}
                <span style={{ fontSize: '16px', lineHeight: '1.2' }}>{title}</span>
              </Heading>
            )}
            {leftContent}
          </div>
          {description && (
            <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>

      {children && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}