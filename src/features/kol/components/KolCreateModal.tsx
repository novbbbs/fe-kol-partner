import { useMemo, useRef, useEffect } from 'react';
import { toast } from 'sonner';
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
  initialData?: any;          // Tambahan untuk support Mode Edit / Regenerate
  modalTitle?: string;        // Tambahan untuk kustomisasi judul modal (misal: "Regenerate Campaign KOL")
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
  initialData = null,
  modalTitle,
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
  }, [provinceOptions, campaignOptions, defaultStartDate, defaultEndDate]);

  const finalFields = useMemo(() => {
    return createFields.map((field) => {
      if (field.name === 'city_name') {
        return { ...field, options: cityOptions };
      }
      return field;
    });
  }, [createFields, cityOptions]);

  // Helper untuk membersihkan format tanggal agar aman dibaca FormModal
  const parseDateToYYYYMMDD = (dateVal: any, fallback: string) => {
    if (!dateVal) return fallback;
    const str = String(dateVal).split('T')[0];
    if (str.includes('-') && str.split('-')[0].length === 2) {
      const [d, m, y] = str.split('-');
      return `${y}-${m}-${d}`;
    }
    return str || fallback;
  };

  // Format data awal untuk mengisi field saat modal dibuka (bisa untuk Edit / Regenerate)
  const resolvedInitialData = useMemo(() => {
    if (!initialData) return null;
    return {
      name: initialData.name || initialData.nama_kol || '',
      username: initialData.username || '',
      whatsapp: initialData.whatsapp || '',
      province_name: initialData.province_name || initialData.provinsi || '',
      city_name: initialData.city_name || initialData.kota_asal || '',
      type: initialData.type || initialData.tipe_kol || 'Reguler',
      campaign_start_date: parseDateToYYYYMMDD(initialData.campaign_start_date, defaultStartDate),
      campaign_end_date: parseDateToYYYYMMDD(initialData.campaign_end_date, defaultEndDate),
    };
  }, [initialData, defaultStartDate, defaultEndDate]);

  // Fungsi penengah untuk validasi sebelum data diteruskan ke halaman utama
  const handleFormSubmit = (formData: Record<string, any>) => {
    // 1. Cek field wajib yang kosong
    if (
      !formData.name?.trim() ||
      !formData.username?.trim() ||
      !formData.whatsapp?.trim() ||
      !formData.province_name ||
      !formData.city_name
    ) {
      toast.error('Gagal menyimpan data', {
        description: 'Semua field formulir wajib diisi dengan lengkap.'
      });
      return; 
    }

    // 2. Cek panjang nomor WhatsApp (11-14 digit)
    const cleanWhatsapp = String(formData.whatsapp).replace(/\D/g, '');
    if (cleanWhatsapp.length < 11 || cleanWhatsapp.length > 14) {
      toast.error('Gagal menyimpan data', {
        description: 'Nomor WhatsApp wajib diisi antara 11-14 digit.'
      });
      return; 
    }

    // Jika lolos validasi, teruskan ke parent
    onSubmitSuccess(formData);
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmitSuccess={handleFormSubmit}
      initialData={resolvedInitialData}
      titleCreate={modalTitle || "Tambah KOL Baru"}
      titleEdit={modalTitle || "Edit KOL"}
      fields={finalFields}
      isDarkMode={isDarkMode}
    />
  );
}