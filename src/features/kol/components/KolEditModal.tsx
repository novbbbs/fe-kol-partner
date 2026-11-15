import { useMemo } from 'react';
import { RefreshCw, Eye } from 'lucide-react';
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
        required: true 
      },
      { 
        name: 'province_name', 
        label: 'Provinsi', 
        type: 'select', 
        options: provinceOptions,
        required: true,
        onChange: (selectedVal: any, updateFormValue?: any) => {
          const provName = typeof selectedVal === 'object' && selectedVal !== null 
            ? String(selectedVal.value || selectedVal.label || '') 
            : String(selectedVal || '');

          onProvinceChange(provName, updateFormValue);
        }
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
        required: true 
      },
      { 
        name: 'campaign_start_date', 
        label: 'Mulai Campaign', 
        type: 'date', 
        required: true 
      },
      { 
        name: 'campaign_end_date', 
        label: 'Selesai Campaign', 
        type: 'date', 
        required: true 
      }
    ];
  }, [provinceOptions, cityOptions, campaignOptions, onProvinceChange]);

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmitSuccess={onSubmitSuccess}
      initialData={initialData}
      titleCreate="Tambah Data KOL"
      titleEdit="Edit Data & Aksi KOL"
      fields={editFields}
      isDarkMode={isDarkMode}
      customFooterButtons={initialData ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onClose(); // Tutup modal edit dulu agar dialog SweetAlert/Regenerate muncul di atasnya
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
              onClose(); // Tutup modal edit dulu
              if (onRegenerate) onRegenerate(initialData);
            }}
            className="px-3 h-9 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 cursor-pointer shadow-sm transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>
        </div>
      ) : undefined}
    />
  );
}