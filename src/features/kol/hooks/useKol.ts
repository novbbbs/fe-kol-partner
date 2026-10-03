import { useState, useEffect, useCallback } from 'react';
import { kolService } from '../services/kol.service';
import type { Kol } from '../types/kol.type';

export function useKol() {
  const [kols, setKols] = useState<Kol[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Ambil semua data dari database Laravel
  const fetchKols = useCallback(async () => {
    try {
      setLoading(true);
      const data = await kolService.getAllKols();
      setKols(data);
    } catch (error) {
      console.error('Gagal mengambil data KOL dari backend:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKols();
  }, [fetchKols]);

  // Fungsi untuk menambah data KOL baru ke backend (handleCreate)
  const addKol = async (payload: any) => {
    try {
      setLoading(true);
      await kolService.createKol(payload);
      // Ambil ulang data terbaru setelah berhasil nambah
      await fetchKols();
    } catch (error) {
      console.error('Gagal menambahkan data KOL:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menghapus data KOL dari backend
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
    refetch: fetchKols, 
    addKol, 
    removeKol 
  };
}