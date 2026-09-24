import { useState, useRef, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { DatePicker } from '../../../components/ui/date-picker';

interface KolFilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (filters: { startDate: string; endDate: string; status: string }) => void;
  isDarkMode?: boolean;
}

export default function KolFilterDropdown({
  isOpen,
  onClose,
  onApplyFilter,
  isDarkMode = false,
}: KolFilterDropdownProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('Semua');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Klik di luar area untuk menutup filter
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Abaikan penutupan jika klik berasal dari Popover, Select, Portal, atau Dialog Shadcn UI/Radix
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
    setStartDate('');
    setEndDate('');
    setStatus('Semua');
    onApplyFilter({ startDate: '', endDate: '', status: 'Semua' });
    onClose();
  };

  const handleApply = () => {
    onApplyFilter({ startDate, endDate, status });
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      onClick={(e) => e.stopPropagation()}
      className={`absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl shadow-2xl border p-5 z-50 space-y-4 animate-in fade-in zoom-in duration-150 text-xs ${
        isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* 1. Tanggal Reservasi Memakai Shadcn DatePicker */}
      <div className="space-y-1.5">
        <label className="block font-medium text-slate-500 dark:text-slate-400">
          Tanggal Reservasi
        </label>
        <div className="grid grid-cols-2 gap-2">
          {/* Start Date */}
          <DatePicker
            value={startDate}
            onChange={(val) => setStartDate(val)}
            placeholder="Start Date"
            isDarkMode={isDarkMode}
          />

          {/* End Date */}
          <DatePicker
            value={endDate}
            onChange={(val) => setEndDate(val)}
            placeholder="End Date"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* 2. Status Dropdown Menggunakan Shadcn UI Select */}
      <div className="space-y-1.5">
        <label className="block font-medium text-slate-500 dark:text-slate-400">
          Status
        </label>
        <Select 
          value={status} 
          onValueChange={(val) => setStatus(val ?? 'Semua')}
        >
          <SelectTrigger className={`w-full rounded-xl h-10 text-xs px-3 border outline-none ${
            isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-700'
          }`}>
            <SelectValue placeholder="Pilih Status" />
          </SelectTrigger>
          <SelectContent 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className={isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200'}
          >
            <SelectItem value="Semua" className="text-xs cursor-pointer">Semua Status</SelectItem>
            <SelectItem value="ACTIVE" className="text-xs cursor-pointer">ACTIVE</SelectItem>
            <SelectItem value="NON-ACTIVE" className="text-xs cursor-pointer">NON-ACTIVE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Garis Pembatas */}
      <hr className="border-slate-100 dark:border-[#2e303a]" />

      {/* Bagian Tombol Aksi Bawah */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleReset}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium flex items-center gap-1 cursor-pointer transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>

        <button
          type="button"
          onClick={handleApply}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer transition"
        >
          Terapkan Filter
        </button>
      </div>
    </div>
  );
}