import type { ReactNode } from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog';

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  icon?: ReactNode;
  variant?: 'danger' | 'success';
  isDarkMode?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
  icon,
  variant = 'success',
  isDarkMode = false,
}: ConfirmDialogProps) {
  
  const confirmButtonClass = variant === 'danger'
    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20'
    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20';

  const defaultIconBg = variant === 'danger'
    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-500 border-rose-100 dark:border-rose-900/50'
    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border-emerald-100 dark:border-emerald-900/50';

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className={`rounded-3xl border p-6 shadow-2xl max-w-md ${
        isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <AlertDialogHeader className="space-y-3 text-center sm:text-left">
          {icon && (
            <div className={`mx-auto sm:mx-0 w-12 h-12 rounded-2xl flex items-center justify-center border ${defaultIconBg}`}>
              {icon}
            </div>
          )}
          <div className="space-y-1">
            <AlertDialogTitle 
              style={{ color: isDarkMode ? '#ffffff' : undefined }}
              className="text-base font-bold tracking-tight text-slate-900 dark:text-white"
            >
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription 
              style={{ color: isDarkMode ? '#f3f4f6' : undefined }}
              className="text-sm text-slate-500 dark:text-slate-100 leading-relaxed font-normal"
            >
              {description}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 bg-transparent border-0">
          <AlertDialogCancel 
            onClick={() => {
              if (onCancel) onCancel();
              onOpenChange(false);
            }} 
            className={`w-full sm:w-1/2 rounded-xl h-10 text-sm font-semibold transition-all ${
              isDarkMode 
                ? 'bg-rose-600/20 text-rose-400 border border-rose-900/50 hover:bg-rose-600/30 hover:text-rose-300' 
                : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className={`w-full sm:w-1/2 rounded-xl h-10 text-sm font-semibold transition-all cursor-pointer ${confirmButtonClass}`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}