import { useMemo } from 'react';
import FormModal, { type FieldConfig } from '../../../components/FormModal';

interface CampaignEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (formData: Record<string, any>) => void;
  initialData?: Record<string, any> | null;
  isDarkMode: boolean;
}

export default function CampaignEditModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  initialData,
  isDarkMode,
}: CampaignEditModalProps) {
  
  const editFields: FieldConfig[] = useMemo(() => {
    return [
      { 
        name: 'campaign_name', 
        label: 'Campaign Name', 
        placeholder: 'Masukkan nama campaign', 
        required: true 
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { label: 'Active', value: 'Active' },
          { label: 'Non Active', value: 'Non Active' }
        ],
        required: true
      }
    ];
  }, []);

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmitSuccess={onSubmitSuccess}
      initialData={initialData}
      titleCreate="Edit Data Campaign"
      titleEdit="Edit Data Campaign"
      fields={editFields}
      isDarkMode={isDarkMode}
    />
  );
}