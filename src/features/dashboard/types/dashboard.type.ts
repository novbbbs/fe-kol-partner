export interface DashboardMetrics {
  total_kol: number;
  total_reservasi: number;
  total_visitor: number;
}

export interface TopKolItem {
  id: number | string;
  name?: string;
  nama_kol?: string;
  username: string;
  city_name?: string;
  kota_asal?: string;
  reservation_count?: number;
  visitor_count?: number;
  revenue?: string;
}

export interface TopCityItem {
  city_name: string;
  province_name: string;
  total_kol: number;
  total_visitor: number;
}

export interface DashboardResponse {
  success: boolean;
  program_type: 'reguler' | 'event';
  selected_campaign?: string | null;
  metrics: DashboardMetrics;
  top_5_kol: TopKolItem[];
  top_5_city: TopCityItem[];
}