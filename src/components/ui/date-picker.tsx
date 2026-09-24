import * as React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Calendar } from './calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';

interface DatePickerProps {
  value?: string;
  onChange?: (dateString: string) => void;
  placeholder?: string;
  isDarkMode?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pilih tanggal',
  isDarkMode = false,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (!value) return undefined;
    try {
      return parseISO(value);
    } catch {
      return undefined;
    }
  });

  React.useEffect(() => {
    if (value) {
      try {
        setDate(parseISO(value));
      } catch {
        setDate(undefined);
      }
    } else {
      setDate(undefined);
    }
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (onChange) {
      const formatted = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
      onChange(formatted);
    }
  };

  return (
    <Popover>
      <PopoverTrigger
        className={`w-full justify-start text-left font-normal h-10 rounded-xl text-xs px-3 border flex items-center transition cursor-pointer ${
          !date ? 'text-slate-400' : ''
        } ${
          isDarkMode
            ? 'bg-[#16171d] border-[#2e303a] text-white hover:bg-[#262833]'
            : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
        }`}
      >
        <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-400 shrink-0" />
        {date ? format(date, 'yyyy-MM-dd') : <span>{placeholder}</span>}
      </PopoverTrigger>
      
      {/* Menggunakan z-50 standar Tailwind untuk menghilangkan warning z-[60] */}
      <PopoverContent
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className={`w-auto p-0 rounded-2xl border shadow-2xl z-50 ${
          isDarkMode
            ? 'bg-[#1f2028] border-[#2e303a] text-white'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}