import axios from 'axios';
import type { CampaignItem } from '../types/campaign.type';

const API_URL = 'http://127.0.0.1:8000/api/campaigns';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      Accept: 'application/json',
    },
  };
};

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

    const url = `${API_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axios.get(url, getAuthHeaders());
    return response.data.data || response.data;
  },

  async createCampaign(data: { campaign_name: string; status?: number | string }): Promise<CampaignItem> {
    const response = await axios.post(API_URL, data, getAuthHeaders());
    return response.data.data || response.data;
  },

  async updateCampaign(id: number | string, data: { campaign_name?: string; status?: number | string }): Promise<CampaignItem> {
    const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeaders());
    return response.data.data || response.data;
  },

  async deleteCampaign(id: number | string): Promise<void> {
    await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
  },
};