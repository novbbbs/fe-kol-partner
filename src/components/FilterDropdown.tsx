import { useState, useRef, useEffect } from 'react';
import { RotateCcw, ChevronDown, X, Check } from 'lucide-react';
import { DatePicker } from './ui/date-picker';

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (filters: { 
    startDate?: string; 
    endDate?: string; 
    status: string;
    namaKol?: string;
    typeKol?: string;
  }) => void;
  isDarkMode?: boolean;
  title?: string;
  showDateFilter?: boolean;
  statusOptions?: { label: string; value: string }[];
  showKolFilters?: boolean;
}

export default function FilterDropdown({
  isOpen,
  onClose,
  onApplyFilter,
  isDarkMode = false,
  showDateFilter = true,
  statusOptions = [
    { label: 'Semua Status', value: 'Semua' },
    { label: 'Success', value: 'Success' },
    { label: 'Pending', value: 'Pending' },
  ],
  showKolFilters = false,
}: FilterDropdownProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('Semua');
  
  // State untuk Nama KOL & Type KOL (Kode Referral sudah dihapus)
  const [namaKol, setNamaKol] = useState('');
  const [typeKol, setTypeKol] = useState('');

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (statusDropdownRef.current && statusDropdownRef.current.contains(target)) {
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
    setNamaKol('');
    setTypeKol('');
    setIsStatusOpen(false);
    onApplyFilter({ startDate: '', endDate: '', status: 'Semua', namaKol: '', typeKol: '' });
  };

  const handleStatusSelect = (val: string) => {
    setStatus(val);
    setIsStatusOpen(false);
    onApplyFilter({ startDate, endDate, status: val, namaKol, typeKol });
  };

  const handleDateChange = (type: 'start' | 'end', val: string) => {
    if (type === 'start') {
      setStartDate(val);
      onApplyFilter({ startDate: val, endDate, status, namaKol, typeKol });
    } else {
      setEndDate(val);
      onApplyFilter({ startDate, endDate: val, status, namaKol, typeKol });
    }
  };

  const selectedStatusLabel = statusOptions.find(opt => opt.value === status)?.label || status;

  // TAMPILAN KONDISI TANPA TANGGAL (Compact)
  if (!showDateFilter && !showKolFilters) {
    return (
      <div
        ref={dropdownRef}
        onClick={(e) => e.stopPropagation()}
        className={`absolute right-0 top-full mt-2 w-72 rounded-2xl shadow-2xl border p-3.5 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150 text-xs text-left ${
          isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#2e303a]">
          <span className="font-bold text-slate-700 dark:text-slate-200">Filter Status</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1 text-left relative" ref={statusDropdownRef}>
          <label className="block font-semibold text-slate-600 dark:text-slate-300 text-[11px]">
            Status
          </label>
          <div
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className={`w-full h-9 px-3 rounded-xl border flex items-center justify-between cursor-pointer transition text-xs ${
              isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <span className="font-medium truncate">{selectedStatusLabel}</span>
            <ChevronDown className={`w-4 h-4 opacity-75 transition-transform shrink-0 ${isStatusOpen ? 'rotate-180' : ''}`} />
          </div>

          {isStatusOpen && (
            <div className={`absolute left-0 right-0 top-full mt-1 rounded-xl border shadow-xl z-50 overflow-hidden p-1 space-y-0.5 ${
              isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              {statusOptions.map((opt) => {
                const isSelected = opt.value === status;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleStatusSelect(opt.value)}
                    className={`px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer transition text-xs ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-[#262833]'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-[#2e303a] flex items-center justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-medium flex items-center gap-1.5 cursor-pointer transition py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#16171d]"
          >
            <RotateCcw className="w-3.5 h-3.5" /> <span>Reset</span>
          </button>
        </div>
      </div>
    );
  }

  // TAMPILAN LENGKAP
  return (
    <div
      ref={dropdownRef}
      onClick={(e) => e.stopPropagation()}
      className={`absolute right-0 top-full mt-2 w-[320px] sm:w-[460px] rounded-2xl shadow-2xl border p-3.5 sm:p-4 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150 text-xs text-left ${
        isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#2e303a]">
        <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Filter Data</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Start Date & End Date (1 Baris Sejajar) */}
      {showDateFilter && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1 text-left">
            <label className="block font-semibold text-slate-600 dark:text-slate-300 text-[11px]">
              Start Date
            </label>
            <DatePicker
              value={startDate}
              onChange={(val) => handleDateChange('start', val)}
              placeholder="DD-MM-YYYY"
              isDarkMode={isDarkMode}
            />
          </div>
          <div className="space-y-1 text-left">
            <label className="block font-semibold text-slate-600 dark:text-slate-300 text-[11px]">
              End Date
            </label>
            <DatePicker
              value={endDate}
              onChange={(val) => handleDateChange('end', val)}
              placeholder="DD-MM-YYYY"
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      )}

      {/* Filter Nama KOL & Type KOL (2 Kolom Sejajar, Kode Referral Dihilangkan) */}
      {showKolFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1 text-left">
            <label className="block font-semibold text-slate-600 dark:text-slate-300 text-[11px]">Nama KOL</label>
            <input
              type="text"
              value={namaKol}
              onChange={(e) => {
                setNamaKol(e.target.value);
                onApplyFilter({ startDate, endDate, status, namaKol: e.target.value, typeKol });
              }}
              placeholder="Cari nama KOL..."
              className={`w-full h-9 px-3 rounded-xl border text-xs outline-none transition ${
                isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400'
              }`}
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="block font-semibold text-slate-600 dark:text-slate-300 text-[11px]">Type KOL</label>
            <input
              type="text"
              value={typeKol}
              onChange={(e) => {
                setTypeKol(e.target.value);
                onApplyFilter({ startDate, endDate, status, namaKol, typeKol: e.target.value });
              }}
              placeholder="Type KOL..."
              className={`w-full h-9 px-3 rounded-xl border text-xs outline-none transition ${
                isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400'
              }`}
            />
          </div>
        </div>
      )}

      {/* Status Selector */}
      <div className="space-y-1 text-left relative" ref={statusDropdownRef}>
        <label className="block font-semibold text-slate-600 dark:text-slate-300 text-[11px]">
          Status
        </label>
        <div
          onClick={() => setIsStatusOpen(!isStatusOpen)}
          className={`w-full h-9 px-3 rounded-xl border flex items-center justify-between cursor-pointer transition text-xs ${
            isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <span className="font-medium truncate">{selectedStatusLabel}</span>
          <ChevronDown className={`w-4 h-4 opacity-70 transition-transform shrink-0 ${isStatusOpen ? 'rotate-180' : ''}`} />
        </div>

        {isStatusOpen && (
          <div className={`absolute left-0 right-0 top-full mt-1 rounded-xl border shadow-xl z-50 overflow-hidden p-1 space-y-0.5 ${
            isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            {statusOptions.map((opt) => {
              const isSelected = opt.value === status;
              return (
                <div
                  key={opt.value}
                  onClick={() => handleStatusSelect(opt.value)}
                  className={`px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer transition text-xs ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-[#262833]'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-[#2e303a] flex items-center justify-end">
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium flex items-center gap-1.5 cursor-pointer transition py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#16171d]"
        >
          <RotateCcw className="w-3.5 h-3.5" /> <span>Reset</span>
        </button>
      </div>
    </div>
  );
}