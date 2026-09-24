import axios from 'axios';
import type { CampaignItem } from '../types/campaign.type';

const API_URL = 'http://127.0.0.1:8000/api/campaigns';

export const campaignService = {
  async getAllCampaigns(): Promise<CampaignItem[]> {
    const response = await axios.get(API_URL);
    return response.data.data;
  },

  async createCampaign(data: { campaign_name: string; status?: number | string }): Promise<CampaignItem> {
    const response = await axios.post(API_URL, data);
    return response.data.data;
  },

  async updateCampaign(id: number, data: { campaign_name: string; status: number | string }): Promise<CampaignItem> {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data.data;
  },

  async deleteCampaign(id: number): Promise<void> {
    await axios.delete(`${API_URL}/${id}`);
  },
};