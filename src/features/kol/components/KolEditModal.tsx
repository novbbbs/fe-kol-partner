import { useMemo } from 'react';
import FormModal from '../../../components/FormModal';
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
}: KolEditModalProps) {
  
  const editFields = useMemo(() => {
    return [
      { name: 'name', label: 'Name', placeholder: 'Masukkan Name', required: true },
      { name: 'username', label: 'Username', placeholder: 'Masukkan Username', required: true },
      { 
        name: 'whatsapp', 
        label: 'Whatsapp', 
        placeholder: 'Masukkan Whatsapp (11-14 digit)', 
        type: 'number-only' as const,
        minLength: 11,
        maxLength: 14,
        required: true 
      },
      { 
        name: 'province_name', 
        label: 'Provinsi', 
        type: 'select' as const, 
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
        type: 'select' as const, 
        options: cityOptions,
        required: true,
      },
      { 
        name: 'type', 
        label: 'Type (Campaign)', 
        type: 'select' as const, 
        options: campaignOptions,
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
      titleCreate="Edit Data KOL"
      titleEdit="Edit Data KOL"
      fields={editFields}
      isDarkMode={isDarkMode}
    />
  );
}