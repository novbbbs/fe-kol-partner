import type { LucideIcon } from 'lucide-react';

interface ReusableMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  isDarkMode?: boolean;
}

export default function ReusableMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-emerald-500',
  isDarkMode = false,
}: ReusableMetricCardProps) {
  return (
    <div className={`p-5 rounded-2xl border shadow-sm transition-colors duration-300 ${
      isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">{title}</span>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="text-2xl font-bold mt-2">{value}</div>
      {subtitle && (
        <span className="text-[11px] text-slate-400 mt-1 inline-block font-medium">{subtitle}</span>
      )}
    </div>
  );
}