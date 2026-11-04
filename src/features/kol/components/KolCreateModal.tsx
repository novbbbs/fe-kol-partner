import { useMemo, useRef, useEffect } from 'react';
import FormModal, { type FieldConfig } from '../../../components/FormModal';

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

  // Gunakan useRef agar fungsi callback tidak memicu re-create pada useMemo fields
  const onProvinceChangeRef = useRef(onProvinceChange);
  useEffect(() => {
    onProvinceChangeRef.current = onProvinceChange;
  }, [onProvinceChange]);

  const createFields: FieldConfig[] = useMemo(() => {
    const defaultCampaignValue = campaignOptions.length > 0 ? campaignOptions[0].value : 'Reguler';

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

          // Panggil menggunakan ref agar stabil
          onProvinceChangeRef.current(provName, updateFormValue);
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
        defaultValue: defaultCampaignValue,
        required: true
      },
      { 
        name: 'campaign_start_date', 
        label: 'Mulai Campaign', 
        type: 'date', 
        defaultValue: defaultStartDate, 
        required: true,
        onChange: (selectedVal: any, updateFormValue?: any) => {
          const startDateStr = typeof selectedVal === 'object' && selectedVal !== null
            ? String(selectedVal.value || selectedVal.label || '')
            : String(selectedVal || '');

          if (!startDateStr || !updateFormValue) return;

          const startDate = new Date(startDateStr);
          if (isNaN(startDate.getTime())) return;

          const targetMonth = startDate.getMonth() + 1;
          startDate.setMonth(targetMonth);

          if (startDate.getMonth() !== targetMonth % 12) {
            startDate.setDate(0); 
          }

          const year = startDate.getFullYear();
          const month = String(startDate.getMonth() + 1).padStart(2, '0');
          const day = String(startDate.getDate()).padStart(2, '0');
          const newEndDateStr = `${year}-${month}-${day}`;

          updateFormValue('campaign_end_date', newEndDateStr);
        }
      },
      { 
        name: 'campaign_end_date', 
        label: 'Selesai Campaign', 
        type: 'date', 
        defaultValue: defaultEndDate, 
        required: true 
      }
    ];
  // Hapus cityOptions dan onProvinceChange dari array dependency agar field tidak ke-reset saat kota/provinsi berubah
  }, [provinceOptions, campaignOptions, defaultStartDate, defaultEndDate]);

  // Update options city secara dinamis tanpa mereset instance fields utama
  const finalFields = useMemo(() => {
    return createFields.map((field) => {
      if (field.name === 'city_name') {
        return { ...field, options: cityOptions };
      }
      return field;
    });
  }, [createFields, cityOptions]);

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmitSuccess={onSubmitSuccess}
      initialData={null}
      titleCreate="Tambah KOL Baru"
      titleEdit="Edit KOL"
      fields={finalFields}
      isDarkMode={isDarkMode}
    />
  );
}