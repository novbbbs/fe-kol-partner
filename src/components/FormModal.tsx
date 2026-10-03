import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Search, ChevronDown, Check, Plus, Save, AlertCircle, Ticket } from 'lucide-react';
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
  value?: any; 
  defaultValue?: any;
  onChange?: (val: any, updateFormValue?: (field: string, val: any) => void) => void;
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

  const selectedOption = normalizedOptions.find((opt) => {
    if (value !== undefined && value !== null && value !== '') {
      const valStr = typeof value === 'object' 
        ? String(value.value !== undefined ? value.value : (value.label || ''))
        : String(value);
      return String(opt.value).trim().toLowerCase() === valStr.trim().toLowerCase() || 
             String(opt.label).trim().toLowerCase() === valStr.trim().toLowerCase();
    }
    return false;
  });

  const filteredOptions = normalizedOptions
    .filter((opt) =>
      opt.label.toLowerCase().includes((searchQuery || '').toLowerCase())
    )
    .sort((a, b) => {
      if (a.value === '' || a.label.includes('Pilih')) return -1;
      if (b.value === '' || b.label.includes('Pilih')) return 1;
      
      const isSelectedA = selectedOption && String(a.value).trim().toLowerCase() === String(selectedOption.value).trim().toLowerCase();
      const isSelectedB = selectedOption && String(b.value).trim().toLowerCase() === String(selectedOption.value).trim().toLowerCase();
      
      if (isSelectedA) return -1;
      if (isSelectedB) return 1;
      
      return 0;
    });

  return (
    <div className="relative w-full text-xs" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 px-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
          isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
        }`}
      >
        <span className={selectedOption ? '' : 'text-slate-400 truncate'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className={`absolute left-0 right-0 top-full mt-2 rounded-2xl border shadow-2xl z-50 overflow-hidden backdrop-blur-md ${
          isDarkMode ? 'bg-[#1f2028]/95 border-[#2e303a] text-white' : 'bg-white/95 border-slate-200 text-slate-800'
        }`}>
          <div className="p-2.5 border-b border-slate-100 dark:border-[#2e303a] flex items-center gap-2 bg-slate-50/50 dark:bg-[#16171d]/50">
            <Search className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari provinsi..."
              className="w-full bg-transparent outline-none text-xs placeholder-slate-400 font-medium"
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto p-1.5 space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isSelected = selectedOption && String(selectedOption.value).trim().toLowerCase() === String(opt.value).trim().toLowerCase();
                return (
                  <div
                    key={opt.value !== undefined ? String(opt.value) : idx}
                    onClick={() => {
                      onChange(opt.label);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`px-3.5 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition text-xs ${
                      isSelected
                        ? 'bg-emerald-500 text-white font-semibold shadow-xs'
                        : 'hover:bg-slate-100 dark:hover:bg-[#262833]'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 shrink-0 text-white" />}
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-slate-400 text-xs">
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
  const formDataRef = useRef<Record<string, any>>({});
  formDataRef.current = formData;

  useEffect(() => {
    if (!isOpen) return;

    setValidationError(null);
    if (initialData) {
      const normalizedInitial = { ...initialData };
      
      const provVal = normalizedInitial.province_name || normalizedInitial.provinsi || '';
      const cleanProv = typeof provVal === 'object' && provVal !== null ? (provVal.value || provVal.label || '') : String(provVal);
      normalizedInitial.province_name = cleanProv;
      normalizedInitial.provinsi = cleanProv;
      
      const cityVal = normalizedInitial.city_name || normalizedInitial.kota_asal || '';
      const cleanCity = typeof cityVal === 'object' && cityVal !== null ? (cityVal.value || cityVal.label || '') : String(cityVal);
      normalizedInitial.city_name = cleanCity;
      normalizedInitial.kota_asal = cleanCity;

      setFormData(normalizedInitial);
    } else {
      const initialValues: Record<string, any> = {};
      fields.forEach((field) => {
        if (field.name === 'kode_referral' || field.name === 'referral_code') {
          initialValues[field.name] = generateRandomReferral();
        } else if (field.defaultValue !== undefined) {
          initialValues[field.name] = field.defaultValue;
        } else if (field.value !== undefined) {
          initialValues[field.name] = field.value;
        } else {
          initialValues[field.name] = '';
        }
      });

      if (!initialValues.type && !initialValues.tipe_kol) {
        const hasTypeField = fields.some(f => f.name === 'type' || f.name === 'tipe_kol');
        if (!hasTypeField) {
          initialValues.type = 'Reguler';
        }
      }

      setFormData(initialValues);
    }
  }, [isOpen, initialData]);

  const updateFormValue = (fieldName: string, value: any) => {
    let cleanVal = value;
    if (typeof cleanVal === 'object' && cleanVal !== null) {
      cleanVal = cleanVal.value || cleanVal.label || '';
    }
    setFormData((prev) => {
      const updated = { ...prev, [fieldName]: cleanVal };
      if (fieldName === 'province_name') updated.provinsi = cleanVal;
      if (fieldName === 'provinsi') updated.province_name = cleanVal;
      if (fieldName === 'city_name') updated.kota_asal = cleanVal;
      if (fieldName === 'kota_asal') updated.city_name = cleanVal;
      return updated;
    });
  };

  const handleChange = (field: FieldConfig, value: any) => {
    setValidationError(null);
    let newValue = value;

    if (field.name === 'province_name' || field.name === 'provinsi' || field.name === 'city_name' || field.name === 'kota_asal' || field.type === 'select') {
      if (typeof newValue === 'object' && newValue !== null) {
        newValue = newValue.value || newValue.label || '';
      }
    }

    if (field.type === 'number-only' || field.name === 'whatsapp') {
      newValue = String(newValue).replace(/\D/g, '');
      const maxLen = field.name === 'whatsapp' ? 15 : (field.maxLength || 15);
      if (newValue.length > maxLen) {
        newValue = newValue.slice(0, maxLen);
      }
    }

    setFormData((prev) => {
      const updated = { ...formDataRef.current, ...prev, [field.name]: newValue };
      if (field.name === 'province_name') updated.provinsi = newValue;
      if (field.name === 'provinsi') updated.province_name = newValue;
      if (field.name === 'city_name') updated.kota_asal = newValue;
      if (field.name === 'kota_asal') updated.city_name = newValue;
      return updated;
    });

    if (typeof field.onChange === 'function') {
      field.onChange(newValue, updateFormValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    try {
      setIsSubmitting(true);
      
      const resolvedName = formData.name || formData.campaign_name || formData.nama_kol || formData.title || '';
      const resolvedProvince = formData.province_name || formData.provinsi || '';
      const resolvedCity = formData.city_name || formData.kota_asal || '';

      const finalPayload = {
        ...formData,
        name: resolvedName,
        campaign_name: resolvedName,
        whatsapp: String(formData.whatsapp || '').replace(/\D/g, ''),
        type: formData.type || formData.tipe_kol || 'Reguler',
        province_name: resolvedProvince,
        provinsi: resolvedProvince,
        city_name: resolvedCity,
        kota_asal: resolvedCity,
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

  // Pisahkan field kode referral dari field biasa agar bisa diposisikan di tengah atas
  const referralField = fields.find(f => f.name === 'kode_referral' || f.name === 'referral_code');
  const otherFields = fields.filter(f => f.name !== 'kode_referral' && f.name !== 'referral_code');

  const referralVal = referralField ? (formData[referralField.name] || referralField.value || '') : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        style={{ 
          width: '92vw', 
          maxWidth: '980px',
          backgroundColor: isDarkMode ? '#1f2028' : '#ffffff' 
        }}
        className={`rounded-3xl border-0 p-0 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          isDarkMode ? 'dark bg-[#1f2028] text-white' : 'bg-white text-slate-800'
        }`}
      >
        {/* Header Modal (Fixed) */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-[#2e303a] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold">
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

        {/* Body Form (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {validationError && (
              <Alert variant="destructive" className="rounded-2xl bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 py-2.5 px-4">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <AlertTitle className="text-xs font-bold">Peringatan Validasi</AlertTitle>
                <AlertDescription className="text-xs opacity-90">{validationError}</AlertDescription>
              </Alert>
            )}
            
            <div className={`px-6 sm:px-8 py-6 sm:py-8 rounded-3xl border ${isDarkMode ? 'bg-[#16171d]/40 border-[#2e303a]' : 'bg-white border-blue-200/80 shadow-xs'}`}>
              
              {/* TAMPILAN KODE REFERRAL DI TENGAH ATAS */}
              {referralField && (
                <div className="mb-6 pb-6 border-b border-slate-100 dark:border-[#2e303a] flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    {referralField.label}
                  </span>
                  <div className="inline-flex items-center gap-1.5 font-mono text-sm font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-[#16171d] px-4 py-1.5 rounded-full border border-slate-200 dark:border-[#2e303a]">
                    <Ticket className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{referralVal || '---'}</span>
                  </div>
                </div>
              )}

              {/* GRID FORM LAINNYA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6">
                {otherFields.map((field) => {
                  const isTextarea = field.type === 'textarea';
                  
                  const rawVal = formData[field.name];
                  let fieldValue = rawVal !== undefined && rawVal !== null 
                    ? (typeof rawVal === 'object' ? (rawVal.value !== undefined ? rawVal.value : rawVal.label) : rawVal) 
                    : (field.value !== undefined ? field.value : '');

                  if (typeof fieldValue === 'object' && fieldValue !== null) {
                    fieldValue = fieldValue.value || fieldValue.label || '';
                  }

                  return (
                    <div key={field.name} className={`space-y-2 relative overflow-visible ${isTextarea ? 'lg:col-span-4' : ''}`}>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>

                      {field.type === 'date' ? (
                        <DatePicker
                          value={fieldValue}
                          onChange={(dateString) => handleChange(field, dateString)}
                          placeholder={field.placeholder || `Pilih ${field.label.toLowerCase()}`}
                          isDarkMode={isDarkMode}
                        />
                      ) : field.type === 'select' ? (
                        <SearchableSelect
                          options={field.options || []}
                          value={fieldValue}
                          onChange={(val) => handleChange(field, val)}
                          placeholder={`Pilih ${field.label}`}
                          isDarkMode={isDarkMode}
                        />
                      ) : isTextarea ? (
                        <textarea
                          rows={3}
                          required={field.required}
                          value={fieldValue}
                          onChange={(e) => handleChange(field, e.target.value)}
                          placeholder={field.placeholder || `Masukkan ${field.label}`}
                          className={`w-full p-3 rounded-xl border text-xs outline-none transition resize-none ${isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                        />
                      ) : (
                        <input
                          type="text"
                          inputMode={field.type === 'number-only' || field.name === 'whatsapp' ? 'numeric' : 'text'}
                          required={field.required}
                          maxLength={field.name === 'whatsapp' ? 15 : (field.maxLength || 525)}
                          value={fieldValue}
                          onChange={(e) => handleChange(field, e.target.value)}
                          placeholder={field.placeholder || `Masukkan ${field.label}`}
                          className={`w-full h-11 px-3.5 rounded-xl border text-xs outline-none transition ${
                            isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Tombol (Fixed di bawah modal) */}
          <div style={{ backgroundColor: isDarkMode ? '#1f2028' : '#ffffff' }} className="p-5 px-6 border-t border-slate-100 dark:border-[#2e303a] flex items-center justify-end gap-3 shrink-0">
            <Button type="button" onClick={onClose} className="rounded-full h-10 px-6 text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white cursor-pointer">
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-full h-10 px-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer flex items-center gap-1.5">
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}