import { useState, useMemo } from 'react';
import { RefreshCw, Eye, MoreVertical } from 'lucide-react';
import FormModal, { type FieldConfig } from '../../../components/FormModal';
import type { Kol } from '../types/kol.type';

interface KolEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (formData: Record<string, any>) => void;
  initialData: Kol | null;
  isDarkMode: boolean;
  provinceOptions: { label: string; value: string | number }[];
  cityOptions: { label: string; value: string }[];
  campaignOptions: { label: string; value: string }[];
  onProvinceChange: (provinceName: string, updateFormValue?: any) => void;
  onRegenerate?: (item: Kol) => void;
  onViewDetail?: (item: Kol) => void;
}

export default function KolEditModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  initialData,
  isDarkMode,
  provinceOptions,
  cityOptions,
  campaignOptions,
  onProvinceChange,
  onRegenerate,
  onViewDetail,
}: KolEditModalProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const editFields: FieldConfig[] = useMemo(() => {
    return [
      { name: 'name', label: 'Name', placeholder: 'Masukkan Name', required: true },
      { name: 'username', label: 'Username', placeholder: 'Masukkan Username', required: true },
      {
        name: 'whatsapp',
        label: 'Whatsapp',
        placeholder: 'Masukkan Whatsapp (11-14 digit)',
        type: 'number-only',
        minLength: 11,
        maxLength: 14,
        required: true,
      },
      {
        name: 'province_name',
        label: 'Provinsi',
        type: 'select',
        options: provinceOptions,
        required: true,
        onChange: (selectedVal: any, updateFormValue?: any) => {
          const provName =
            typeof selectedVal === 'object' && selectedVal !== null
              ? String(selectedVal.value || selectedVal.label || '')
              : String(selectedVal || '');

          onProvinceChange(provName, updateFormValue);
        },
      },
      {
        name: 'city_name',
        label: 'Kota Asal',
        type: 'select',
        options: cityOptions,
        required: true,
      },
      {
        name: 'type',
        label: 'Type (Campaign)',
        type: 'select',
        options: campaignOptions,
        required: true,
      },
      {
        name: 'campaign_start_date',
        label: 'Mulai Campaign',
        type: 'date',
        required: true,
      },
      {
        name: 'campaign_end_date',
        label: 'Selesai Campaign',
        type: 'date',
        required: true,
      },
    ];
  }, [provinceOptions, cityOptions, campaignOptions, onProvinceChange]);

  const handleCloseModal = () => {
    setIsMobileMenuOpen(false);
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleCloseModal}
      onSubmitSuccess={onSubmitSuccess}
      initialData={initialData}
      titleCreate="Tambah Data KOL"
      titleEdit="Edit Data & Aksi KOL"
      fields={editFields}
      isDarkMode={isDarkMode}
      customFooterButtons={
        initialData ? (
          <>
            {/* Tampilan Desktop: tombol sejajar seperti biasa */}
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleCloseModal();
                  if (onViewDetail) onViewDetail(initialData);
                }}
                className="px-3 h-9 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer shadow-sm transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Detail & Log</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleCloseModal();
                  if (onRegenerate) onRegenerate(initialData);
                }}
                className="px-3 h-9 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 cursor-pointer shadow-sm transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>
            </div>

            {/* Tampilan Mobile: menu dropdown vertikal hanya untuk Detail & Log dan Regenerate */}
            <div className="relative md:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className={`px-3 h-9 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition ${
                  isDarkMode
                    ? 'bg-[#16171d] border-[#2e303a] text-slate-200 hover:bg-[#262833]'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                <MoreVertical className="w-4 h-4" />
                <span>Aksi</span>
              </button>

              {isMobileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  <div
                    className={`absolute bottom-11 left-0 z-20 w-44 rounded-2xl border p-1.5 shadow-xl space-y-1 ${
                      isDarkMode
                        ? 'bg-[#1f2028] border-[#2e303a] text-white'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleCloseModal();
                        if (onViewDetail) onViewDetail(initialData);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2.5 cursor-pointer transition"
                    >
                      <Eye className="w-4 h-4 shrink-0" />
                      <span>Detail & Log</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleCloseModal();
                        if (onRegenerate) onRegenerate(initialData);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2.5 cursor-pointer transition"
                    >
                      <RefreshCw className="w-4 h-4 shrink-0" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : undefined
      }
    />
  );
}