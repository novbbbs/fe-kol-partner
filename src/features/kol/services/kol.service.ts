import api from '../../../lib/api'; // Sesuaikan jalur relatif foldernya dari file kol.service.ts ke api.ts
import type { Kol } from '../types/kol.type';

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

    // Cukup panggil '/kols' karena baseURL sudah diatur di api.ts
    const response = await api.get('/kols', { params: queryParams });
    return response.data.data || response.data;
  },

  async createKol(data: Partial<Kol>): Promise<Kol> {
    const response = await api.post('/kols', data);
    return response.data.data || response.data;
  },

  async updateKol(id: number | string, data: Partial<Kol>): Promise<Kol> {
    const response = await api.put(`/kols/${id}`, data);
    return response.data.data || response.data;
  },

  async deleteKol(id: number | string): Promise<void> {
    await api.delete(`/kols/${id}`);
  },
};