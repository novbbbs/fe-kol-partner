import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import {
  Search,
  ChevronDown,
  Check,
  Plus,
  Save,
  AlertCircle,
} from 'lucide-react';
import { DatePicker } from './ui/date-picker';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from './ui/alert';

export interface FieldConfig {
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
  onChange?: (
    val: any,
    updateFormValue?: (field: string, val: any) => void
  ) => void;
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (
    formData: Record<string, any>
  ) => Promise<void> | void;
  initialData?: Record<string, any> | null;
  titleCreate?: string;
  titleEdit?: string;
  fields: FieldConfig[];
  isDarkMode?: boolean;
}

/* =========================================================
   SEARCHABLE SELECT (REUSABLE)
========================================================= */

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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  const normalizedOptions = (
    Array.isArray(options) ? options : []
  ).map((opt) => {
    if (!opt && opt !== 0) {
      return {
        label: '',
        value: '',
      };
    }

    if (
      typeof opt === 'string' ||
      typeof opt === 'number'
    ) {
      return {
        label: String(opt),
        value: opt,
      };
    }

    const label =
      opt.label !== undefined
        ? opt.label
        : opt.name || opt.text || '';

    const val =
      opt.value !== undefined
        ? opt.value
        : opt.id !== undefined
        ? opt.id
        : label;

    return {
      label: String(label),
      value: val,
    };
  });

  const selectedOption = normalizedOptions.find(
    (opt) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {
        const valStr =
          typeof value === 'object'
            ? String(
                value.value !== undefined
                  ? value.value
                  : value.label || ''
              )
            : String(value);

        return (
          String(opt.value)
            .trim()
            .toLowerCase() ===
            valStr.trim().toLowerCase() ||
          String(opt.label)
            .trim()
            .toLowerCase() ===
            valStr.trim().toLowerCase()
        );
      }

      return false;
    }
  );

  const filteredOptions = normalizedOptions
    .filter((opt) =>
      opt.label
        .toLowerCase()
        .includes(
          (searchQuery || '').toLowerCase()
        )
    )
    .sort((a, b) => {
      const isPlaceholderA =
        a.value === '' ||
        a.label.toLowerCase().includes('pilih');
      const isPlaceholderB =
        b.value === '' ||
        b.label.toLowerCase().includes('pilih');

      if (isPlaceholderA) return -1;
      if (isPlaceholderB) return 1;

      return 0;
    });

  return (
    <div
      className="relative w-full text-sm"
      ref={dropdownRef}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 px-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition uppercase ${
          isDarkMode
            ? 'bg-[#16171d] border-[#2e303a] text-white'
            : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
        }`}
      >
        <span
          className={
            selectedOption
              ? 'uppercase truncate font-medium'
              : 'text-slate-400 truncate normal-case font-medium'
          }
        >
          {selectedOption
            ? selectedOption.label
            : placeholder}
        </span>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-1.5 rounded-lg border shadow-xl z-50 overflow-hidden backdrop-blur-md ${
            isDarkMode
              ? 'bg-[#1f2028] border-[#2e303a] text-white'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="p-2 border-b border-slate-100 dark:border-[#2e303a] flex items-center gap-2 bg-slate-50/50 dark:bg-[#16171d]/50">
            <Search className="w-4 h-4 text-slate-400 ml-1" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Cari..."
              className="w-full bg-transparent outline-none text-sm placeholder-slate-400 font-medium"
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto p-1 space-y-0.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isSelected =
                  selectedOption &&
                  String(selectedOption.value)
                    .trim()
                    .toLowerCase() ===
                    String(opt.value)
                      .trim()
                      .toLowerCase();

                const isPlaceholderItem =
                  opt.value === '' ||
                  opt.label.toLowerCase().includes('pilih');

                return (
                  <div
                    key={
                      opt.value !== undefined
                        ? String(opt.value)
                        : idx
                    }
                    onClick={() => {
                      onChange(opt.value !== '' ? opt.value : '');
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`px-3.5 py-2.5 rounded-md flex items-center justify-between cursor-pointer transition text-sm ${
                      isPlaceholderItem
                        ? 'normal-case text-slate-400 hover:bg-slate-100 dark:hover:bg-[#262833]'
                        : isSelected
                        ? 'bg-emerald-600 text-white font-semibold uppercase'
                        : 'uppercase hover:bg-slate-100 dark:hover:bg-[#262833]'
                    }`}
                  >
                    <span className="truncate">
                      {opt.label}
                    </span>

                    {isSelected && (
                      <Check className="w-4 h-4 shrink-0 text-white" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-center text-slate-400 text-sm">
                Tidak ada hasil ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   BASE FORM MODAL TEMPLATE
========================================================= */

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

  // PERBAIKAN UTAMA: Hanya jalankan saat modal pertama kali dibuka (isOpen berubah menjadi true)
  useEffect(() => {
    if (!isOpen) return;

    setValidationError(null);

    if (initialData) {
      setFormData({ ...initialData });
    } else {
      const initialValues: Record<string, any> = {};

      fields.forEach((field) => {
        if (field.defaultValue !== undefined) {
          initialValues[field.name] = field.defaultValue;
        } else if (field.value !== undefined) {
          initialValues[field.name] = field.value;
        } else {
          initialValues[field.name] = '';
        }
      });

      setFormData(initialValues);
    }
  }, [isOpen]); // Hapus 'fields' dan 'initialData' dari dependency agar tidak mereset saat user mengetik/memilih select!

  const updateFormValue = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleChange = (field: FieldConfig, value: any) => {
    setValidationError(null);
    let newValue = value;

    if (
      field.type === 'number-only' ||
      field.name === 'whatsapp'
    ) {
      newValue = String(newValue).replace(/\D/g, '');
      const maxLen = field.maxLength || 15;
      if (newValue.length > maxLen) {
        newValue = newValue.slice(0, maxLen);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [field.name]: newValue,
    }));

    if (typeof field.onChange === 'function') {
      field.onChange(newValue, updateFormValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    try {
      setIsSubmitting(true);
      await onSubmitSuccess(formData);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Gagal menyimpan form:', error);
      setIsSubmitting(false);
    }
  };

  const isSimpleForm = fields.length <= 2;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        style={{
          width: '94vw',
          maxWidth: isSimpleForm ? '540px' : '980px',
          backgroundColor: isDarkMode ? '#1f2028' : '#ffffff',
        }}
        className={`rounded-xl border-0 p-0 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-none overflow-visible ${
          isDarkMode
            ? 'dark bg-[#1f2028] text-white'
            : 'bg-white text-slate-800'
        }`}
      >
        <div className="p-5 px-6 flex items-center justify-between border-b border-slate-200 dark:border-[#2e303a] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-600 font-bold border border-emerald-600/20">
              <Plus className="w-5 h-5" />
            </div>

            <DialogHeader className="space-y-0.5 text-left">
              <DialogTitle className="text-base font-bold tracking-tight">
                {isEditMode ? titleEdit : titleCreate}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                {isEditMode
                  ? 'Perbarui informasi data yang sudah ada.'
                  : 'Masukkan data baru ke dalam sistem.'}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-visible"
        >
          <div className="p-6 space-y-4 max-h-[65vh] sm:max-h-none overflow-y-auto sm:overflow-visible flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700">
            {validationError && (
              <Alert
                variant="destructive"
                className="rounded-lg bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 py-3 px-4 text-sm"
              >
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <AlertTitle className="text-sm font-bold">
                  Peringatan Validasi
                </AlertTitle>
                <AlertDescription className="text-sm opacity-90">
                  {validationError}
                </AlertDescription>
              </Alert>
            )}

            <div
              className={`px-6 py-6 rounded-lg border overflow-visible ${
                isDarkMode
                  ? 'bg-[#16171d]/60 border-[#2e303a]'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div
                className={`grid ${
                  isSimpleForm
                    ? 'grid-cols-1 gap-y-3'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-5 gap-y-5'
                } overflow-visible`}
              >
                {fields.map((field) => {
                  const isTextarea = field.type === 'textarea';
                  const fieldValue = formData[field.name] !== undefined && formData[field.name] !== null ? formData[field.name] : '';

                  return (
                    <div
                      key={field.name}
                      className={`space-y-1.5 relative overflow-visible ${
                        isTextarea ? 'lg:col-span-2' : ''
                      }`}
                    >
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                        {field.label}
                        {field.required && (
                          <span className="text-rose-500 ml-0.5">*</span>
                        )}
                      </label>

                      {field.type === 'date' ? (
                        <DatePicker
                          value={fieldValue}
                          onChange={(dateString) =>
                            handleChange(field, dateString)
                          }
                          placeholder={
                            field.placeholder || 'DD MM YYYY'
                          }
                          isDarkMode={isDarkMode}
                        />
                      ) : field.type === 'select' ? (
                        <SearchableSelect
                          options={field.options || []}
                          value={fieldValue}
                          onChange={(val) =>
                            handleChange(field, val)
                          }
                          placeholder={field.placeholder || `Pilih ${field.label}`}
                          isDarkMode={isDarkMode}
                        />
                      ) : isTextarea ? (
                        <textarea
                          rows={3}
                          required={field.required}
                          value={fieldValue}
                          onChange={(e) =>
                            handleChange(field, e.target.value)
                          }
                          placeholder={
                            field.placeholder ||
                            `Masukkan ${field.label}`
                          }
                          className={`w-full p-3 rounded-lg border text-sm outline-none transition resize-none font-medium ${
                            isDarkMode
                              ? 'bg-[#16171d] border-[#2e303a] text-white'
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        />
                      ) : (
                        <input
                          type="text"
                          inputMode={
                            field.type === 'number-only' ||
                            field.name === 'whatsapp'
                              ? 'numeric'
                              : 'text'
                          }
                          required={field.required}
                          maxLength={field.maxLength || 525}
                          value={fieldValue}
                          onChange={(e) =>
                            handleChange(field, e.target.value)
                          }
                          placeholder={
                            field.placeholder ||
                            `Masukkan ${field.label}`
                          }
                          className={`w-full h-11 px-3.5 rounded-lg border text-sm outline-none transition font-medium ${
                            isDarkMode
                              ? 'bg-[#16171d] border-[#2e303a] text-white'
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: isDarkMode ? '#1f2028' : '#ffffff',
            }}
            className="p-4 px-6 border-t border-slate-200 dark:border-[#2e303a] flex items-center justify-end gap-3 shrink-0 rounded-b-xl"
          >
            <Button
              type="button"
              onClick={onClose}
              className="rounded-lg h-10 px-6 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
            >
              Batal
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg h-10 px-7 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}