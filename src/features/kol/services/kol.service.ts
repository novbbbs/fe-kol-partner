import axios from 'axios';
import type { Kol } from '../types/kol.type';

const API_URL = 'http://127.0.0.1:8000/api/kols';

// Helper untuk mengambil token autentikasi dengan kunci yang sinkron ('auth_token')
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      Accept: 'application/json',
    },
  };
};

// Interface untuk parameter pencarian & filter backend
interface FilterParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const kolService = {
  async getAllKols(params?: FilterParams): Promise<Kol[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status && params.status !== 'Semua') queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('start_date', params.startDate);
    if (params?.endDate) queryParams.append('end_date', params.endDate);

    const url = `${API_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axios.get(url, getAuthHeaders());
    return response.data.data || response.data;
  },

  async createKol(data: Partial<Kol>): Promise<Kol> {
    const response = await axios.post(API_URL, data, getAuthHeaders());
    return response.data.data || response.data;
  },

  async updateKol(id: number | string, data: Partial<Kol>): Promise<Kol> {
    const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeaders());
    return response.data.data || response.data;
  },

  async deleteKol(id: number | string): Promise<void> {
    await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
  },
};