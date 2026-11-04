import api from '../../../lib/api'; // Sesuaikan jalur relatif foldernya ke file api.ts

// Interface untuk parameter ringkasan dashboard
export interface DashboardParams {
  type: 'reguler' | 'event';
  campaign?: string | number | null;
}

export const dashboardService = {
  // Fungsi untuk mengambil data ringkasan dashboard
  async getDashboardSummary(params: DashboardParams) {
    // Cukup gunakan endpoint relatif, baseURL akan otomatis menyesuaikan IP/host
    let url = `/dashboard/summary?type=${params.type}`;
    
    if (params.type === 'event' && params.campaign) {
      url += `&campaign=${encodeURIComponent(String(params.campaign))}`;
    }

    const response = await api.get(url);
    return response.data;
  }
};