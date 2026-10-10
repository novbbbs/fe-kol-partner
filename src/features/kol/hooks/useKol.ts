import { useState, useEffect, useCallback } from 'react';
import { kolService } from '../services/kol.service';
import type { Kol } from '../types/kol.type';

interface FetchParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export function useKol() {
  const [kols, setKols] = useState<Kol[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Menerima parameter opsional params
  const fetchKols = useCallback(async (params?: FetchParams) => {
    try {
      setLoading(true);
      const data = await kolService.getAllKols(params);
      
      if (Array.isArray(data)) {
        setKols(data);
      } else if (data && typeof data === 'object') {
        const resolvedData = (data as any).data || (data as any).kols || [];
        setKols(Array.isArray(resolvedData) ? resolvedData : []);
      } else {
        setKols([]);
      }
    } catch (error) {
      console.error('Gagal mengambil data KOL dari backend:', error);
      setKols([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKols();
  }, [fetchKols]);

  const addKol = async (payload: any) => {
    try {
      setLoading(true);
      await kolService.createKol(payload);
      await fetchKols();
    } catch (error) {
      console.error('Gagal menambahkan data KOL:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateKol = async (id: number | string, payload: any) => {
    try {
      setLoading(true);
      const axios = (await import('axios')).default;
      const token = localStorage.getItem('auth_token');
      
      await axios.put(`http://127.0.0.1:8000/api/kols/${id}`, payload, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json'
        }
      });
      
      await fetchKols();
    } catch (error) {
      console.error('Gagal memperbarui data KOL:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeKol = async (id: number) => {
    try {
      setLoading(true);
      await kolService.deleteKol(id);
      await fetchKols();
    } catch (error) {
      console.error('Gagal menghapus data KOL:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { 
    kols, 
    loading, 
    refetch: fetchKols as (params?: FetchParams) => Promise<void>, 
    addKol, 
    updateKol, 
    removeKol 
  };
}