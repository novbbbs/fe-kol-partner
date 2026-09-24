import axios from 'axios';
import type { Kol } from '../types/kol.type';

const API_URL = 'http://127.0.0.1:8000/api/kols';

export const kolService = {
  async getAllKols(): Promise<Kol[]> {
    const response = await axios.get(API_URL);
    return response.data.data || response.data;
  },

  async createKol(data: Partial<Kol>): Promise<Kol> {
    const response = await axios.post(API_URL, data);
    return response.data.data || response.data;
  },

  async updateKol(id: number, data: Partial<Kol>): Promise<Kol> {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data.data || response.data;
  },

  async deleteKol(id: number): Promise<void> {
    await axios.delete(`${API_URL}/${id}`);
  },
};