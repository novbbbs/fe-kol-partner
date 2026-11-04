import { useMemo } from 'react';
import FormModal, { type FieldConfig } from '../../../components/FormModal';

interface CampaignCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (formData: Record<string, any>) => void;
  isDarkMode: boolean;
}

export default function CampaignCreateModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  isDarkMode,
}: CampaignCreateModalProps) {
  
  const createFields: FieldConfig[] = useMemo(() => {
    return [
      { 
        name: 'campaign_name', 
        label: 'Campaign Name', 
        placeholder: 'Masukkan nama campaign', 
        required: true 
      }
    ];
  }, []);

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmitSuccess={onSubmitSuccess}
      initialData={null}
      titleCreate="Tambah Campaign Baru"
      titleEdit="Edit Campaign"
      fields={createFields}
      isDarkMode={isDarkMode}
    />
  );
}