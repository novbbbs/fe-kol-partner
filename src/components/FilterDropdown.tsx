import { useState, useRef, useEffect } from 'react';
import { Filter, RotateCcw, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { DatePicker } from './ui/date-picker';

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (filters: { startDate?: string; endDate?: string; status: string }) => void;
  isDarkMode?: boolean;
  title?: string;
  showDateFilter?: boolean;
  statusOptions?: { label: string; value: string }[];
}

export default function FilterDropdown({
  isOpen,
  onClose,
  onApplyFilter,
  isDarkMode = false,
  title = 'Filter Data',
  showDateFilter = true,
  statusOptions = [
    { label: 'Semua Status', value: 'Semua' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Non Active', value: 'NON-ACTIVE' },
  ],
}: FilterDropdownProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState(statusOptions[0]?.value || 'Semua');
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
    setStartDate('');
    setEndDate('');
    const defaultStatus = statusOptions[0]?.value || 'Semua';
    setStatus(defaultStatus);
    onApplyFilter({ startDate: '', endDate: '', status: defaultStatus });
  };

  const handleStatusChange = (val: string | null | undefined) => {
    const newStatus = val ?? (statusOptions[0]?.value || 'Semua');
    setStatus(newStatus);
    onApplyFilter({ startDate, endDate, status: newStatus });
  };

  const handleDateChange = (type: 'start' | 'end', val: string) => {
    if (type === 'start') {
      setStartDate(val);
      onApplyFilter({ startDate: val, endDate, status });
    } else {
      setEndDate(val);
      onApplyFilter({ startDate, endDate: val, status });
    }
  };

  return (
    <div
      ref={dropdownRef}
      onClick={(e) => e.stopPropagation()}
      className={`absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border p-5 z-50 space-y-4 animate-in fade-in zoom-in duration-150 text-xs ${
        isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* Header Dropdown */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2e303a]">
        <h3 className="font-bold text-xs flex items-center gap-1.5 text-slate-800 dark:text-white uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-emerald-500" />
          {title}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Tanggal */}
      {showDateFilter && (
        <div className="space-y-1.5">
          <label className="block font-semibold text-slate-400 uppercase tracking-wide text-[11px]">
            Tanggal Reservasi / Campaign
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <DatePicker
                value={startDate}
                onChange={(val) => handleDateChange('start', val)}
                placeholder="Start Date"
                isDarkMode={isDarkMode}
              />
            </div>
            <div>
              <DatePicker
                value={endDate}
                onChange={(val) => handleDateChange('end', val)}
                placeholder="End Date"
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Status Dropdown */}
      <div className="space-y-1.5">
        <label className="block font-semibold text-slate-400 uppercase tracking-wide text-[11px]">
          Status
        </label>
        <Select 
          value={status} 
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className={`w-full rounded-xl h-10 text-xs px-3 border outline-none ${
            isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-700'
          }`}>
            <SelectValue placeholder="Pilih Status" />
          </SelectTrigger>
          <SelectContent 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className={`rounded-xl ${isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200'}`}
          >
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs cursor-pointer rounded-lg">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <hr className="border-slate-100 dark:border-[#2e303a]" />

      {/* Bagian Tombol Reset di Kanan */}
      <div className="flex items-center justify-end pt-1">
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium flex items-center gap-1.5 cursor-pointer transition py-2 px-3 rounded-xl border border-slate-200 dark:border-[#2e303a] hover:bg-slate-100 dark:hover:bg-[#16171d]"
        >
          <RotateCcw className="w-3.5 h-3.5" /> <span>Reset</span>
        </button>
      </div>
    </div>
  );
}