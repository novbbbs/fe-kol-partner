import api from '../../../lib/api'; 
import { type LoginCredentials, type LoginResponse } from '../types/login.types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/login', credentials);
    
    // Pastikan key respons sesuai dengan struktur dari backend (access_token / token)
    const token = response.data.access_token || (response.data as any).token;
    
    if (token) {
      localStorage.setItem('auth_token', token);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return response.data;
  },

  async getCurrentUser() {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await api.get('/user');
      if (response.data) {
        // Handle jika struktur dari backend berupa { data: { ... } } atau langsung objek user
        const userData = response.data.data || response.data;
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
      return null;
    } catch (error) {
      this.clearLocalAuth();
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Gagal melakukan logout di server:', error);
    } finally {
      this.clearLocalAuth();
    }
  },

  clearLocalAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};