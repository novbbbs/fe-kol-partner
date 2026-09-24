import { useState, useEffect, useCallback } from 'react';
import { campaignService } from '../services/campaign.service';

export function useCampaign() {
  const [campaignList, setCampaignList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const data = await campaignService.getAllCampaigns();
      setCampaignList(data);
    } catch (error) {
      console.error('Gagal mengambil data campaign:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const addCampaign = async (data: { campaign_name: string; status?: number | string }) => {
    await campaignService.createCampaign(data);
    await fetchCampaigns();
  };

  const updateCampaign = async (id: number, data: { campaign_name: string; status: number | string }) => {
    await campaignService.updateCampaign(id, data);
    await fetchCampaigns();
  };

  const removeCampaign = async (id: number) => {
    await campaignService.deleteCampaign(id);
    await fetchCampaigns();
  };

  return {
    campaignList,
    loading,
    refetch: fetchCampaigns,
    addCampaign,
    updateCampaign,
    removeCampaign,
  };
}