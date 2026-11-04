import api from '../../../lib/api'; // Sesuaikan dengan path lib/api Anda

// Interface untuk struktur data Reservasi (sesuaikan kolomnya dengan database Anda)
export interface Reservasi {
  id: number;
  id_order?: number;
  kode_booking?: string;
  nama?: string;
  email?: string;
  nama_kol?: string;
  type_kol?: string;
  total_bayar?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface untuk parameter filter/pencarian
export interface ReservasiParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  per_page?: number;
}

export const reservasiService = {
  /**
   * Mengambil semua data reservasi dengan opsi parameter pencarian/filter
   */
  getAllReservasi: async (params?: ReservasiParams) => {
    try {
      const response = await api.get('/admin/reservations', { params });
      return response.data;
    } catch (error: any) {
      // Menangkap pesan error backend yang lebih spesifik jika ada
      console.error('Gagal mengambil data reservasi:', error.response?.data || error.message);
      throw error;
    }
  },
};