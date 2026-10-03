import axios from 'axios';

// Anda bisa membuat interface tipe data jika diperlukan
export interface DashboardParams {
  type: 'reguler' | 'event';
  campaign?: string | number | null;
}

export const dashboardService = {
  // Fungsi untuk mengambil data ringkasan dashboard
  getDashboardSummary: async (params: DashboardParams) => {
    let url = `http://127.0.0.1:8000/api/dashboard/summary?type=${params.type}`;
    
    if (params.type === 'event' && params.campaign) {
      url += `&campaign=${encodeURIComponent(String(params.campaign))}`;
    }

    const response = await axios.get(url);
    return response.data;
  }
};