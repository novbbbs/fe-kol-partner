export interface Kol {
  id: number;
  uid?: string;
  name: string;
  username: string;
  whatsapp: string;
  province_id?: string;
  province_name: string;
  city_id?: string;
  city_name: string;
  type: number | string;
  campaign_start_date: string;
  campaign_end_date: string;
  status: number | string;
  referral_code?: string;
  kode_referral?: string; // <-- Tambahkan baris ini agar error hilang
  nama_kol?: string;
  nomor_telepon?: string;
  kota_asal?: string;
  provinsi?: string;
  tipe_kol?: string;
}