import type { ReactNode } from 'react';
import { Card, CardContent } from '../components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor?: string;
  footerText: string;
  footerValue?: string;
  isDarkMode?: boolean;
  extraContent?: ReactNode;
}

export default function StatsCard({
  title,
  value,
  icon,
  iconBgColor = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50',
  footerText,
  footerValue,
  isDarkMode = false,
  extraContent
}: StatsCardProps) {
  return (
    <Card className={`rounded-xl border shadow-xs ${isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200'}`}>
      <CardContent className="py-3 px-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 ${iconBgColor}`}>
              {icon}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{title}</span>
              <h3 className="text-xl font-bold tracking-tight leading-none mt-0.5">{value}</h3>
            </div>
          </div>
          {extraContent}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#2e303a] text-[11px] text-slate-500">
          <span>{footerText}</span>
          {footerValue && <span className="font-bold text-slate-700 dark:text-slate-300">{footerValue}</span>}
        </div>
      </CardContent>
    </Card>
  );
}