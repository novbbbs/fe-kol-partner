import { useState, useRef, useEffect } from 'react';
import { Megaphone, RotateCcw, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

interface CampaignFilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (filters: { status: string }) => void;
  isDarkMode?: boolean;
}

export default function CampaignFilterDropdown({
  isOpen,
  onClose,
  onApplyFilter,
  isDarkMode = false,
}: CampaignFilterDropdownProps) {
  const [status, setStatus] = useState('Semua Status');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mencegah penutupan prematur saat berinteraksi dengan elemen Portal milik Radix/Shadcn
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (
        target &&
        (target.closest('[data-radix-popper-content-wrapper]') ||
          target.closest('[role="dialog"]') ||
          target.closest('[role="listbox"]') ||
          target.closest('[data-radix-select-viewport]'))
      ) {
        return;
      }

      if (dropdownRef.current && !dropdownRef.current.contains(target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleReset = () => {
    setStatus('Semua Status');
    onApplyFilter({ status: 'Semua Status' });
    onClose();
  };

  const handleApply = () => {
    onApplyFilter({ status });
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      onClick={(e) => e.stopPropagation()}
      className={`absolute right-0 mt-3 w-72 rounded-2xl shadow-2xl border p-5 z-50 space-y-4 animate-in fade-in zoom-in duration-150 text-xs ${
        isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2e303a]">
        <h3 className="font-bold text-xs flex items-center gap-1.5 text-slate-800 dark:text-white">
          <Megaphone className="w-3.5 h-3.5 text-emerald-500" />
          Filter Status Campaign
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1.5 text-center">
        <label className="block text-[11px] font-semibold text-slate-400">
          Pilih Status
        </label>
        <Select 
          value={status} 
          onValueChange={(val) => setStatus(val ?? 'Semua Status')}
        >
          <SelectTrigger className={`w-full rounded-xl h-10 text-xs px-3 border outline-none ${
            isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <SelectValue placeholder="Pilih Status" />
          </SelectTrigger>
          <SelectContent 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className={isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200'}
          >
            <SelectItem value="Semua Status" className="text-xs cursor-pointer">Semua Status</SelectItem>
            <SelectItem value="Active" className="text-xs cursor-pointer">Active</SelectItem>
            <SelectItem value="Non Active" className="text-xs cursor-pointer">Non Active</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <hr className="border-slate-100 dark:border-[#2e303a]" />

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleReset}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium flex items-center gap-1 cursor-pointer transition text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs rounded-xl"
          >
            Batal
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-8 text-xs rounded-xl cursor-pointer transition"
          >
            Terapkan
          </Button>
        </div>
      </div>
    </div>
  );
}