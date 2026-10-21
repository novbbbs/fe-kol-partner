import api from '../lib/api';

// ==================== KOL API ====================
export const kolApi = {
  getAll: async (params?: any) => {
    const response = await api.get('/kols', { params });
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/kols', data);
    return response.data;
  },
  update: async (id: string | number, data: any) => {
    const response = await api.put(`/kols/${id}`, data);
    return response.data;
  },
  delete: async (id: string | number) => {
    const response = await api.delete(`/kols/${id}`);
    return response.data;
  }
};

// ==================== CAMPAIGN API ====================
export const campaignApi = {
  getAll: async (params?: any) => {
    const response = await api.get('/campaigns', { params });
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/campaigns', data);
    return response.data;
  },
  update: async (id: string | number, data: any) => {
    const response = await api.put(`/campaigns/${id}`, data);
    return response.data;
  },
  delete: async (id: string | number) => {
    const response = await api.delete(`/campaigns/${id}`);
    return response.data;
  },
  toggleStatus: async (id: string | number, data: any) => {
    const response = await api.put(`/campaigns/${id}`, data);
    return response.data;
  }
};

// ==================== DASHBOARD API ====================
export const dashboardApi = {
  getSummary: async (type: string, campaign?: string) => {
    let url = `/dashboard/summary?type=${type}`;
    if (type === 'event' && campaign) {
      url += `&campaign=${encodeURIComponent(campaign)}`;
    }
    const response = await api.get(url);
    return response.data;
  }
};