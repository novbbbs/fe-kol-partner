import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboard.service';

export function useDashboard(activeCategory: 'reguler' | 'event', selectedCampaign: string | number) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Memanggil fungsi dari dashboard.service.ts
      const data = await dashboardService.getDashboardSummary({
        type: activeCategory,
        campaign: activeCategory === 'event' ? selectedCampaign : null
      });

      if (data?.success) {
        setDashboardData(data);
      }
    } catch (err: any) {
      console.error('Gagal mengambil data dashboard:', err);
      setError(err.message || 'Terjadi kesalahan saat memuat data dashboard.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, selectedCampaign]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    refetch: fetchDashboardData
  };
}