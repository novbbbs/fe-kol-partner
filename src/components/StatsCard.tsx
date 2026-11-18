import type { ReactNode } from 'react';
import { Card, CardContent } from '../components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor?: string;
  footerText?: string;
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
      {/* Padding vertikal sedikit dipangkas (py-4) agar card lebih ringkas */}
      <CardContent className="py-4 px-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBgColor}`}>
              {icon}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{title}</span>
              {/* Ukuran angka diperbesar menjadi text-2xl atau text-3xl agar lebih menonjol */}
              <h3 className="text-2xl font-extrabold tracking-tight leading-tight mt-0.5">{value}</h3>
            </div>
          </div>
          {extraContent}
        </div>

        {/* Bagian footer bersifat opsional jika ingin disembunyikan saat kosong */}
        {footerText && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#2e303a] text-[11px] text-slate-500">
            <span>{footerText}</span>
            {footerValue && <span className="font-bold text-slate-700 dark:text-slate-300">{footerValue}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}