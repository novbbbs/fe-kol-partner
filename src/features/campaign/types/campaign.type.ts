export interface CampaignItem {
  id: number;
  uid?: string;
  campaign_name: string;
  status: number | string; // Mendukung tipe angka (1/0) atau string ('Aktif'/'Non Aktif')
  created_at?: string;
  updated_at?: string;
}