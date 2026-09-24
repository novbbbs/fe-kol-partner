import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Search, ChevronDown, Check } from 'lucide-react';
import { DatePicker } from './ui/date-picker';

interface FieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'select' | 'date';
  options?: any[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (formData: Record<string, any>) => Promise<void>;
  initialData?: Record<string, any> | null;
  titleCreate?: string;
  titleEdit?: string;
  fields: FieldConfig[];
  isDarkMode?: boolean;
}

const generateRandomReferral = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomLetters = '';
  for (let i = 0; i < 3; i++) {
    randomLetters += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  const randomNumbers = Math.floor(10000 + Math.random() * 90000);
  return `${randomLetters}${randomNumbers}`;
};

function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Pilih opsi...',
  isDarkMode = false,
}: {
  options: any[];
  value: any;
  onChange: (val: any) => void;
  placeholder?: string;
  isDarkMode?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedOptions = (Array.isArray(options) ? options : []).map((opt) => {
    if (!opt && opt !== 0) return { label: '', value: '' };
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { label: String(opt), value: opt };
    }
    const label = opt.label !== undefined ? opt.label : (opt.name || opt.nama_provinsi || opt.provinsi || opt.text || '');
    const val = opt.value !== undefined ? opt.value : (opt.id !== undefined ? opt.id : label);
    return { label: String(label), value: val };
  });

  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));

  return (
    <div className="relative w-full text-xs" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
          isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}
      >
        <span className={selectedOption !== undefined ? '' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className={`absolute left-0 right-0 mt-1 rounded-xl border shadow-xl z-50 overflow-hidden ${
          isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="p-2 border-b border-slate-200 dark:border-[#2e303a] flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari..."
              className="w-full bg-transparent outline-none text-xs placeholder-slate-400"
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <div
                  key={opt.value !== undefined ? String(opt.value) : idx}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer transition ${
                    String(value) === String(opt.value)
                      ? 'bg-emerald-50 text-emerald-600 font-semibold dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'hover:bg-slate-100 dark:hover:bg-[#262833]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {String(value) === String(opt.value) && <Check className="w-3.5 h-3.5" />}
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-slate-400 text-[11px]">
                Tidak ada hasil ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FormModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  initialData = null,
  titleCreate = 'Tambah Data Baru',
  titleEdit = 'Edit Data',
  fields,
  isDarkMode = false,
}: FormModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const initialValues: Record<string, any> = {};
      fields.forEach((field) => {
        if (field.name === 'kode_referral' || field.name === 'referral_code') {
          initialValues[field.name] = generateRandomReferral();
        } else if (field.type === 'select' && field.options && field.options.length > 0) {
          const firstOpt = field.options[0];
          initialValues[field.name] = typeof firstOpt === 'object' && firstOpt !== null 
            ? (firstOpt.value !== undefined ? firstOpt.value : firstOpt.name || '') 
            : firstOpt;
        } else {
          initialValues[field.name] = '';
        }
      });
      setFormData(initialValues);
    }
  }, [initialData, isOpen, fields]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSubmitSuccess(formData);
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error('Gagal menyimpan form:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={isDarkMode ? 'dark bg-[#1f2028] text-white border-[#2e303a]' : 'bg-white text-slate-800'}>
        <DialogHeader>
          <DialogTitle>{isEditMode ? titleEdit : titleCreate}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Perbarui informasi data yang sudah ada.' : 'Masukkan data baru ke dalam sistem.'}
          </DialogDescription>
        </DialogHeader>

        <form 
          onSubmit={handleSubmit} 
          className="space-y-4 text-xs mt-2 max-h-[70vh] overflow-y-auto px-1 no-scrollbar"
        >
          {fields.map((field) => {
            return (
              <div key={field.name}>
                {field.type === 'date' ? (
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-500 dark:text-slate-400">
                      {field.label}
                    </label>
                    <DatePicker
                      value={formData[field.name] || ''}
                      onChange={(dateString) => handleChange(field.name, dateString)}
                      placeholder={field.placeholder || `Pilih ${field.label.toLowerCase()}`}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold mb-1 text-slate-500 dark:text-slate-400">
                      {field.label}
                    </label>
                    {field.type === 'select' ? (
                      <SearchableSelect
                        options={field.options || []}
                        value={formData[field.name]}
                        onChange={(val) => handleChange(field.name, val)}
                        isDarkMode={isDarkMode}
                      />
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          required={field.required}
                          disabled={field.name === 'kode_referral' && !isEditMode}
                          value={formData[field.name] !== undefined ? formData[field.name] : ''}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                          placeholder={field.placeholder || ''}
                          className={`w-full p-2.5 rounded-xl border outline-none transition ${
                            field.name === 'kode_referral' && !isEditMode ? 'bg-slate-100 dark:bg-[#16171d]/50 text-slate-400 cursor-not-allowed font-mono tracking-wider' : ''
                          } ${
                            isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                        {field.name === 'kode_referral' && !isEditMode && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-500 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                            Auto-Generated
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-[#2e303a]">
            <Button 
              type="button" 
              onClick={onClose}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}