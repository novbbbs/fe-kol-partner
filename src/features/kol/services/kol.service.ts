import api from '../../../lib/api'; 
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
    if (params?.status && params.status !== 'Semua' && params.status !== 'Semua Status') queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('start_date', params.startDate);
    if (params?.endDate) queryParams.append('end_date', params.endDate);

    const response = await api.get('/kols', { params: queryParams });
    return response.data.data || response.data;
  },

  async createKol(data: Partial<Kol>): Promise<Kol> {
    // Sanitasi data untuk memastikan tipe data & format bersih sebelum dikirim ke backend
    const sanitizedData = {
      ...data,
      // Pastikan type dikirim sebagai string/number bersih jika berupa objek
      type: typeof data.type === 'object' && data.type !== null 
        ? ((data.type as any).value || (data.type as any).label || data.type) 
        : data.type,
      // Bersihkan nomor WhatsApp dari karakter non-digit
      whatsapp: data.whatsapp ? String(data.whatsapp).replace(/\D/g, '') : undefined,
    };

    const response = await api.post('/kols', sanitizedData);
    return response.data.data || response.data;
  },

  async updateKol(id: number | string, data: Partial<Kol>): Promise<Kol> {
    const sanitizedData = {
      ...data,
      type: typeof data.type === 'object' && data.type !== null 
        ? ((data.type as any).value || (data.type as any).label || data.type) 
        : data.type,
      whatsapp: data.whatsapp ? String(data.whatsapp).replace(/\D/g, '') : undefined,
    };

    const response = await api.put(`/kols/${id}`, sanitizedData);
    return response.data.data || response.data;
  },

  async deleteKol(id: number | string): Promise<void> {
    await api.delete(`/kols/${id}`);
  },

  async checkExportData(params?: FilterParams): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status && params.status !== 'Semua' && params.status !== 'Semua Status') queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('start_date', params.startDate);
    if (params?.endDate) queryParams.append('end_date', params.endDate);

    const response = await api.get('/kols/check-export', { params: queryParams });
    return response.data;
  },
};