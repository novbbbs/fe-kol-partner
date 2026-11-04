import { useState, useEffect, useCallback } from 'react';
import { reservasiService } from '@/features/reservasi/services/reservasi.service';
import type { ReservasiParams } from '@/features/reservasi/services/reservasi.service';
import type { Reservasi } from '@/features/reservasi/types/reservasi.type';

export function useReservasi() {
  const [reservasis, setReservasis] = useState<Reservasi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservasi = useCallback(async (params?: ReservasiParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reservasiService.getAllReservasi(params);
      
      // Mendukung berbagai struktur respons (Array langsung, Laravel pagination, atau Object wrapper)
      const rawData = Array.isArray(response) 
        ? response 
        : response?.data || response?.reservasi || [];
        
      setReservasis(rawData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengambil data reservasi.';
      console.error('Error fetching reservasi:', errorMessage);
      setError(errorMessage);
      setReservasis([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservasi();
  }, [fetchReservasi]);

  return {
    reservasis,
    loading,
    error,
    refetch: fetchReservasi
  };
}