import { useMemo } from 'react';
import FormModal from '../../../components/FormModal';

interface KolCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (formData: Record<string, any>) => void;
  isDarkMode: boolean;
  provinceOptions: { label: string; value: string | number }[];
  cityOptions: { label: string; value: string }[];
  campaignOptions: { label: string; value: string }[];
  onProvinceChange: (provinceName: string, updateFormValue?: any) => void;
  defaultStartDate: string;
  defaultEndDate: string;
}

export default function KolCreateModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  isDarkMode,
  provinceOptions,
  cityOptions,
  campaignOptions,
  onProvinceChange,
  defaultStartDate,
  defaultEndDate,
}: KolCreateModalProps) {
  
  const createFields = useMemo(() => {
    const defaultCampaignValue = campaignOptions.length > 0 ? campaignOptions[0].value : 'Reguler';

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
        defaultValue: defaultCampaignValue, 
        required: true 
      },
      { name: 'campaign_start_date', label: 'DD MM YYYY', type: 'date' as const, defaultValue: defaultStartDate, required: true },
      { name: 'campaign_end_date', label: 'DD MM YYYY', type: 'date' as const, defaultValue: defaultEndDate, required: true }
    ];
  }, [provinceOptions, cityOptions, campaignOptions, defaultStartDate, defaultEndDate, onProvinceChange]);

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmitSuccess={onSubmitSuccess}
      initialData={null}
      titleCreate="Tambah KOL Baru"
      titleEdit="Tambah KOL Baru"
      fields={createFields}
      isDarkMode={isDarkMode}
    />
  );
}