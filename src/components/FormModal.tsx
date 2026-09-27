import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Search, ChevronDown, Check, Plus, Save, AlertCircle } from 'lucide-react';
import { DatePicker } from './ui/date-picker';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

interface FieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'select' | 'date' | 'number-only' | 'textarea';
  options?: any[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minLength?: number;
  maxLength?: number;
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (formData: Record<string, any>) => Promise<void> | void;
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
    const label = opt.label !== undefined ? opt.label : (opt.name || opt.text || '');
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
        className={`w-full h-10 px-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
          isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
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
  const [validationError, setValidationError] = useState<string | null>(null);

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (!isOpen) return;

    setValidationError(null);
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
  }, [isOpen, initialData, fields]);

  const handleChange = (field: FieldConfig, value: any) => {
    setValidationError(null);
    let newValue = value;

    if (field.type === 'number-only' || field.name === 'whatsapp') {
      newValue = String(newValue).replace(/\D/g, '');
      const maxLen = field.name === 'whatsapp' ? 15 : (field.maxLength || 15);
      if (newValue.length > maxLen) {
        newValue = newValue.slice(0, maxLen);
      }
    }

    setFormData((prev) => ({ ...prev, [field.name]: newValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    try {
      setIsSubmitting(true);
      
      const resolvedName = formData.name || formData.campaign_name || formData.nama_kol || formData.title || '';

      const finalPayload = {
        ...formData,
        name: resolvedName,
        campaign_name: resolvedName,
        whatsapp: String(formData.whatsapp || '').replace(/\D/g, ''),
      };

      if (!resolvedName) {
        setValidationError('Nama atau judul wajib diisi.');
        setIsSubmitting(false);
        return;
      }

      await onSubmitSuccess(finalPayload);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Gagal menyimpan form:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`rounded-3xl border-0 p-0 shadow-2xl max-w-4xl w-full overflow-hidden ${
        isDarkMode ? 'bg-[#1f2028] text-white' : 'bg-white text-slate-800'
      }`}>
        
        {/* HEADER MODAL (Tanpa tombol X manual agar tidak bertindih) */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-[#2e303a]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <DialogHeader className="space-y-0.5 text-left">
              <DialogTitle className="text-base font-bold tracking-tight">
                {isEditMode ? titleEdit : titleCreate}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                {isEditMode ? 'Perbarui informasi data yang sudah ada.' : 'Masukkan data baru ke dalam sistem.'}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
            {validationError && (
              <Alert variant="destructive" className="rounded-2xl bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 py-2.5 px-4">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <AlertTitle className="text-xs font-bold">Peringatan Validasi</AlertTitle>
                <AlertDescription className="text-xs opacity-90">{validationError}</AlertDescription>
              </Alert>
            )}
            
            <div className={`px-8 py-6 rounded-3xl border ${
              isDarkMode ? 'bg-[#16171d]/40 border-[#2e303a]' : 'bg-white border-blue-200/80 shadow-xs'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {fields.map((field) => {
                  const isTextarea = field.type === 'textarea';
                  return (
                    <div 
                      key={field.name} 
                      className={`space-y-1.5 ${isTextarea ? 'sm:col-span-2' : ''}`}
                    >
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>

                      {field.type === 'date' ? (
                        <DatePicker
                          value={formData[field.name] || ''}
                          onChange={(dateString) => handleChange(field, dateString)}
                          placeholder={field.placeholder || `Pilih ${field.label.toLowerCase()}`}
                          isDarkMode={isDarkMode}
                        />
                      ) : field.type === 'select' ? (
                        <SearchableSelect
                          options={field.options || []}
                          value={formData[field.name]}
                          onChange={(val) => handleChange(field, val)}
                          placeholder={`Pilih ${field.label}`}
                          isDarkMode={isDarkMode}
                        />
                      ) : isTextarea ? (
                        <textarea
                          rows={3}
                          required={field.required}
                          value={formData[field.name] !== undefined ? formData[field.name] : ''}
                          onChange={(e) => handleChange(field, e.target.value)}
                          placeholder={field.placeholder || `Masukkan ${field.label}`}
                          className={`w-full p-3 rounded-xl border text-xs outline-none transition resize-none ${
                            isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-2xs'
                          }`}
                        />
                      ) : (
                        <div className="relative">
                          <input
                            type="text"
                            inputMode={field.type === 'number-only' || field.name === 'whatsapp' ? 'numeric' : 'text'}
                            required={field.required}
                            disabled={field.name === 'kode_referral' && !isEditMode}
                            maxLength={field.name === 'whatsapp' ? 15 : (field.maxLength || 525)}
                            value={formData[field.name] !== undefined ? formData[field.name] : ''}
                            onChange={(e) => handleChange(field, e.target.value)}
                            placeholder={field.placeholder || `Masukkan ${field.label}`}
                            className={`w-full h-10 px-3.5 rounded-xl border text-xs outline-none transition ${
                              field.name === 'kode_referral' && !isEditMode ? 'bg-slate-100 dark:bg-[#16171d]/50 text-slate-400 cursor-not-allowed font-mono tracking-wider' : ''
                            } ${
                              isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-2xs'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FOOTER TOMBOL */}
          <div className="p-5 px-6 border-t border-slate-100 dark:border-[#2e303a] flex items-center justify-end gap-3 bg-white dark:bg-[#1f2028]">
            <Button
              type="button"
              variant="destructive"
              onClick={onClose}
              className="rounded-full h-10 px-6 text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white cursor-pointer shadow-sm transition"
            >
              Batal
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full h-10 px-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}