import api from '../../../lib/api'; // Sesuaikan jalur relatif foldernya ke file api.ts
import type { CampaignItem } from '../types/campaign.type';

interface FilterParams {
  search?: string;
  status?: string;
}

export const campaignService = {
  async getAllCampaigns(params?: FilterParams): Promise<CampaignItem[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status && params.status !== 'Semua' && params.status !== 'Semua Status') {
      queryParams.append('status', params.status);
    }

    // Cukup panggil '/campaigns' karena baseURL sudah diatur di api.ts
    const response = await api.get('/campaigns', { params: queryParams });
    return response.data.data || response.data;
  },

  async createCampaign(data: { campaign_name: string; status?: number | string }): Promise<CampaignItem> {
    const response = await api.post('/campaigns', data);
    return response.data.data || response.data;
  },

  async updateCampaign(id: number | string, data: { campaign_name?: string; status?: number | string }): Promise<CampaignItem> {
    const response = await api.put(`/campaigns/${id}`, data);
    return response.data.data || response.data;
  },

  async deleteCampaign(id: number | string): Promise<void> {
    await api.delete(`/campaigns/${id}`);
  },
};