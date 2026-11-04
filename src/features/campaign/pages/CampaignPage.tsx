import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Megaphone, Save, Filter } from 'lucide-react';
import Swal from 'sweetalert2';

import ReusableTable from '../../../components/ReusableTable';
import FilterDropdown from '../../../components/FilterDropdown';
import { PageHeader } from '../../../components/ui/PageHeader'; // <-- Menggunakan pondasi PageHeader
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'; 
import { campaignService } from '../services/campaign.service'; 
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';

// Import komponen modal terpisah
import CampaignCreateModal from '../components/CampaignCreateModal';
import CampaignEditModal from '../components/CampaignEditModal';

interface Campaign {
  id: number | string;
  campaign_name: string;
  status: string | number;
}

interface CampaignPageProps {
  isDarkMode?: boolean;
}

export default function CampaignPage({ isDarkMode = false }: CampaignPageProps) {
  const [campaignList, setCampaignList] = useState<Campaign[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [selectedCampaignToEdit, setSelectedCampaignToEdit] = useState<Campaign | null>(null);

  const [deleteItem, setDeleteItem] = useState<Campaign | null>(null);
  const [statusItem, setStatusItem] = useState<Campaign | null>(null);
  const [pendingFormData, setPendingFormData] = useState<Record<string, any> | null>(null);

  // Fungsi Fetch Data Campaign menggunakan campaignService modular
  const fetchCampaigns = async (params?: { search?: string; status?: string }) => {
    try {
      const response = await campaignService.getAllCampaigns(params);
      const rawData = Array.isArray(response) ? response : (response as any)?.data || [];
      setCampaignList(rawData);
    } catch (error) {
      console.error('Gagal mengambil data campaign:', error);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(inputValue);
    }, 400);
    return () => clearTimeout(handler);
  }, [inputValue]);

  useEffect(() => {
    fetchCampaigns({
      search: debouncedSearch,
      status: statusFilter,
    });
  }, [debouncedSearch, statusFilter]);

  const filteredCampaigns = campaignList;

  const handleToggleStatus = (item: Campaign) => {
    setStatusItem(item);
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusItem) return;

    const targetId = statusItem?.id;
    if (!targetId) return;

    const rawStatus = statusItem?.status;
    const isCurrentlyActive = 
      rawStatus === 1 || 
      rawStatus === '1' || 
      String(rawStatus).toLowerCase() === 'active' || 
      String(rawStatus).toLowerCase() === 'aktif';

    const newStatusInt = isCurrentlyActive ? 0 : 1;

    try {
      await campaignService.updateCampaign(targetId, {
        campaign_name: statusItem.campaign_name,
        status: newStatusInt
      });

      await fetchCampaigns({
        search: debouncedSearch,
        status: statusFilter,
      });

      setStatusItem(null);
      Swal.fire({
        title: 'Berhasil!',
        text: `Status campaign "${statusItem.campaign_name}" diubah menjadi ${newStatusInt === 1 ? 'Active' : 'Non Active'}.`,
        icon: 'success',
        timer: 1200,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Gagal mengubah status campaign:', error);
      setStatusItem(null);
      Swal.fire('Gagal!', 'Terjadi kesalahan saat memperbarui status campaign.', 'error');
    }
  };

  const handleInitialFormSubmit = async (formData: Record<string, any>) => {
    const finalData = {
      ...formData,
      status: selectedCampaignToEdit ? formData.status : 'Active'
    };
    setPendingFormData(finalData);
    setIsModalOpen(false);
  };

  const handleConfirmSave = async () => {
    if (!pendingFormData) return;

    const rawStatus = pendingFormData.status;
    const isStatusActive = 
      rawStatus === 'Active' || 
      rawStatus === '1' || 
      rawStatus === 1 || 
      String(rawStatus).toLowerCase() === 'aktif';

    const intStatus = isStatusActive ? 1 : 0;

    const payload = {
      campaign_name: pendingFormData.campaign_name,
      status: intStatus
    };

    const activeEditTarget = selectedCampaignToEdit;

    try {
      if (activeEditTarget && activeEditTarget.id) {
        await campaignService.updateCampaign(activeEditTarget.id, payload);
      } else {
        await campaignService.createCampaign(payload);
      }

      await fetchCampaigns({
        search: debouncedSearch,
        status: statusFilter,
      });

      Swal.fire({
        title: 'Berhasil!',
        text: activeEditTarget 
          ? `Data Campaign ${pendingFormData.campaign_name} berhasil diperbarui.` 
          : `Campaign ${pendingFormData.campaign_name} berhasil ditambahkan.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error: any) {
      console.error('Gagal menyimpan campaign:', error);
      const errorMsg = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data Campaign.';
      Swal.fire('Gagal!', errorMsg, 'error');
    } finally {
      setSelectedCampaignToEdit(null);
      setPendingFormData(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem || !deleteItem.id) return;
    try {
      await campaignService.deleteCampaign(deleteItem.id);
      await fetchCampaigns({
        search: debouncedSearch,
        status: statusFilter,
      });
      setDeleteItem(null);

      Swal.fire({
        title: 'Terhapus!',
        text: 'Data Campaign berhasil dihapus.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error: any) {
      setDeleteItem(null);
      const errorMsg = error.response?.data?.message || 'Terjadi kesalahan saat menghapus data.';
      Swal.fire('Gagal!', errorMsg, 'error');
    }
  };

  // Menambahkan properti 'label' agar nama di dropdown kolom sama persis dengan header tabel
  const columns = [
    {
      accessorKey: 'id',
      header: () => <div className="text-center">ID</div>,
      cell: ({ row }: any) => <div className="text-center font-normal text-slate-800 dark:text-white">{row.index + 1}</div>,
      label: 'ID'
    },
    {
      accessorKey: 'campaign_name',
      header: () => <div className="text-center justify-center flex w-full">Nama Campaign</div>,
      cell: ({ row }: any) => (
        <div className="text-center justify-center flex w-full">
          <span className="font-normal text-center block text-slate-800 dark:text-white">{row.original?.campaign_name || '-'}</span>
        </div>
      ),
      label: 'Nama Campaign'
    },
    {
      accessorKey: 'status',
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }: any) => {
        const rawStatus = row.original?.status;
        const st = String(rawStatus || '').toLowerCase().trim();
        const isActive = rawStatus === 1 || rawStatus === '1' || st === 'active' || st === 'aktif';

        return (
          <div className="flex items-center justify-center">
            <Switch
              checked={isActive}
              onCheckedChange={() => handleToggleStatus(row.original)}
              style={{
                backgroundColor: isActive ? '#0d8a6a' : '#e11d48'
              }}
              className="cursor-pointer shadow-2xs transition-colors"
              title={isActive ? 'Nonaktifkan Campaign' : 'Aktifkan Campaign'}
            />
          </div>
        );
      },
      label: 'Status'
    },
    {
      accessorKey: 'actions',
      header: () => <div className="text-center">Aksi</div>,
      cell: ({ row }: any) => (
        <div className="flex items-center justify-center gap-1.5">
          <Badge
            variant="outline"
            onClick={() => {
              const rawSt = row.original?.status;
              const isStActive = 
                rawSt === 1 || 
                rawSt === '1' || 
                String(rawSt || '').toLowerCase() === 'active' || 
                String(rawSt || '').toLowerCase() === 'aktif';
              
              setSelectedCampaignToEdit({
                id: row.original.id,
                campaign_name: row.original?.campaign_name || '',
                status: isStActive ? 'Active' : 'Non Active'
              });
              setIsModalOpen(true);
            }}
            className="h-9 w-9 p-0 flex items-center justify-center text-amber-600 bg-amber-50 dark:bg-amber-950/45 border-amber-200 dark:border-amber-900/60 hover:bg-amber-100 dark:hover:bg-amber-900/50 cursor-pointer rounded-lg shadow-2xs transition"
            title="Edit Campaign"
          >
            <Edit2 className="w-4 h-4" />
          </Badge>

          <Badge
            variant="outline"
            onClick={() => setDeleteItem(row.original)}
            className="h-9 w-9 p-0 flex items-center justify-center text-rose-600 bg-rose-50 dark:bg-rose-950/45 border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/50 cursor-pointer rounded-lg shadow-2xs transition"
            title="Hapus Campaign"
          >
            <Trash2 className="w-4 h-4" />
          </Badge>
        </div>
      ),
      label: 'Aksi'
    }
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-6 relative z-10 overflow-x-hidden text-sm">
      {/* KONTINER UTAMA */}
      <div className={`w-full rounded-t-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${
        isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* MENGGUNAKAN PAGE HEADER MODULAR */}
        <PageHeader 
          icon={<Megaphone className="w-5 h-5" />}
          title="Master Campaign"
          isDarkMode={isDarkMode}
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative w-full sm:w-72">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Cari campaign..."
                className={`w-full py-2.5 pl-10 pr-12 text-sm rounded-full border outline-none transition ${
                  isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-2xs'
                }`}
              />

              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                title="Filter Campaign"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white shadow-sm cursor-pointer transition"
              >
                <Filter className="w-4 h-4" />
              </button>

              {statusFilter && statusFilter !== 'Semua Status' && (
                <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#16171d] pointer-events-none z-20" />
              )}

              {/* Wrapper dropdown filter dengan posisi letak yang rapi */}
              <div className="absolute right-0 top-full mt-2 z-50">
                <FilterDropdown
                  isOpen={isFilterOpen}
                  onClose={() => setIsFilterOpen(false)}
                  onApplyFilter={(filters) => {
                    setStatusFilter(filters.status);
                  }}
                  isDarkMode={isDarkMode}
                  title="Filter Status Campaign"
                  showDateFilter={false}
                  statusOptions={[
                    { label: 'Semua Status', value: 'Semua Status' },
                    { label: 'Active', value: 'Active' },
                    { label: 'Non Active', value: 'Non Active' },
                  ]}
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                setSelectedCampaignToEdit(null);
                setIsModalOpen(true);
              }}
              className="hidden md:flex shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm h-10 px-4 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Tambah</span>
            </Button>
          </div>
        </PageHeader>

        {/* Tabel Data */}
        <div className="w-full">
          <ReusableTable
            data={filteredCampaigns}
            columns={columns}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 md:hidden pointer-events-auto">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSelectedCampaignToEdit(null);
            setIsModalOpen(true);
          }}
          title="Tambah Campaign"
          className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl active:scale-95 transition cursor-pointer hover:bg-emerald-700"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Render Modal Terpisah (Create / Edit) */}
      {selectedCampaignToEdit ? (
        <CampaignEditModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCampaignToEdit(null);
          }}
          onSubmitSuccess={handleInitialFormSubmit}
          initialData={selectedCampaignToEdit}
          isDarkMode={isDarkMode}
        />
      ) : (
        <CampaignCreateModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCampaignToEdit(null);
          }}
          onSubmitSuccess={handleInitialFormSubmit}
          isDarkMode={isDarkMode}
        />
      )}

      {/* --- MENGGUNAKAN CONFIRM DIALOG MODULAR --- */}

      {/* Dialog Konfirmasi Simpan Campaign */}
      <ConfirmDialog
        isOpen={Boolean(pendingFormData)}
        onOpenChange={(open) => !open && setPendingFormData(null)}
        title={selectedCampaignToEdit ? 'Konfirmasi Perubahan?' : 'Simpan Campaign Baru?'}
        description={
          <>
            Apakah Anda yakin ingin {selectedCampaignToEdit ? 'memperbarui' : 'menambahkan'} campaign{' '}
            <span className="font-semibold text-emerald-600">{pendingFormData?.campaign_name}</span>?
          </>
        }
        confirmText="Ya, Simpan"
        onConfirm={handleConfirmSave}
        onCancel={() => setSelectedCampaignToEdit(null)}
        icon={<Save className="w-6 h-6" />}
        variant="success"
        isDarkMode={isDarkMode}
      />

      {/* Dialog Konfirmasi Ubah Status Campaign */}
      <ConfirmDialog
        isOpen={Boolean(statusItem)}
        onOpenChange={(open) => !open && setStatusItem(null)}
        title="Ubah Status Campaign?"
        description={
          <>
            Apakah Anda yakin ingin mengubah status campaign{' '}
            <span className={`font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{statusItem?.campaign_name}</span>?
          </>
        }
        confirmText="Ya, Ubah"
        onConfirm={handleConfirmToggleStatus}
        icon={<Megaphone className="w-6 h-6" />}
        variant="success"
        isDarkMode={isDarkMode}
      />

      {/* Dialog Konfirmasi Hapus Campaign */}
      <ConfirmDialog
        isOpen={Boolean(deleteItem)}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        title="Hapus Campaign Ini?"
        description={
          <>
            Tindakan ini bersifat permanen. Data Campaign{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{deleteItem?.campaign_name}</span> akan dihapus.
          </>
        }
        confirmText="Ya, Hapus"
        onConfirm={handleConfirmDelete}
        icon={<Trash2 className="w-6 h-6" />}
        variant="danger"
        isDarkMode={isDarkMode}
      />
    </div>
  );
}