import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Megaphone, Save, Filter } from 'lucide-react';
import Swal from 'sweetalert2';

import ReusableTable from '../../../components/ReusableTable';
import FilterDropdown from '../../../components/FilterDropdown';
import { campaignApi } from '../../../components/apiService'; 
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';

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

  // Fungsi Fetch Data Campaign Menggunakan campaignApi Terpusat
  const fetchCampaigns = async (params?: { search?: string; status?: string }) => {
    try {
      const response = await campaignApi.getAll(params);
      const rawData = Array.isArray(response) ? response : response.data || [];
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

  // Saat Switch diklik, buka dialog konfirmasi status terlebih dahulu
  const handleToggleStatus = (item: Campaign) => {
    setStatusItem(item);
  };

  // Eksekusi perubahan status setelah tombol "Ya, Ubah" ditekan pada dialog
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
      await campaignApi.update(targetId, {
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
        await campaignApi.update(activeEditTarget.id, payload);
      } else {
        await campaignApi.create(payload);
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
        confirmButtonColor: '#10b981'
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
      await campaignApi.delete(deleteItem.id);
      await fetchCampaigns({
        search: debouncedSearch,
        status: statusFilter,
      });
      setDeleteItem(null);

      Swal.fire({
        title: 'Terhapus!',
        text: 'Data Campaign berhasil dihapus.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      });
    } catch (error: any) {
      setDeleteItem(null);
      const errorMsg = error.response?.data?.message || 'Terjadi kesalahan saat menghapus data.';
      Swal.fire('Gagal!', errorMsg, 'error');
    }
  };

  // Header kolom diubah menjadi huruf biasa (Title Case)
  const columns = [
    {
      accessorKey: 'id',
      header: () => <div className="text-center">ID</div>,
      cell: ({ row }: any) => <div className="text-center font-normal text-slate-800 dark:text-white">{row.index + 1}</div>
    },
    {
      accessorKey: 'campaign_name',
      header: () => <div className="text-center justify-center flex w-full">Nama Campaign</div>,
      cell: ({ row }: any) => (
        <div className="text-center justify-center flex w-full">
          <span className="font-normal text-center block text-slate-800 dark:text-white">{row.original?.campaign_name || '-'}</span>
        </div>
      )
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
      }
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
      )
    }
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-6 relative z-10 overflow-x-hidden text-sm">
      <div className={`w-full rounded-none shadow-sm border overflow-visible transition-colors duration-300 ${
        isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="p-4 md:p-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2e303a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 border border-emerald-100 dark:border-emerald-900/50 shadow-2xs">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Master Campaign
              </h2>
            </div>
          </div>

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
        </div>

        {/* Tabel Data */}
        <div className="w-full [&_div]:border-none [&_table]:mb-0">
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

      {/* Dialog Konfirmasi Simpan Campaign */}
      <AlertDialog open={Boolean(pendingFormData)} onOpenChange={() => setPendingFormData(null)}>
        <AlertDialogContent className={`rounded-3xl border p-6 shadow-2xl max-w-md ${
          isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <AlertDialogHeader className="space-y-3 text-center sm:text-left">
            <div className="mx-auto sm:mx-0 w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 border border-emerald-100 dark:border-emerald-900/50">
              <Save className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle 
                style={{ color: isDarkMode ? '#ffffff' : undefined }}
                className="text-base font-bold tracking-tight text-slate-900 dark:text-white"
              >
                {selectedCampaignToEdit ? 'Konfirmasi Perubahan?' : 'Simpan Campaign Baru?'}
              </AlertDialogTitle>
              <AlertDialogDescription 
                style={{ color: isDarkMode ? '#f3f4f6' : undefined }}
                className="text-sm text-slate-500 dark:text-slate-100 leading-relaxed font-normal"
              >
                Apakah Anda yakin ingin {selectedCampaignToEdit ? 'memperbarui' : 'menambahkan'} campaign <span className="font-semibold text-emerald-600">{pendingFormData?.campaign_name}</span>?
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 bg-transparent border-0">
            <AlertDialogCancel 
              onClick={() => { setPendingFormData(null); setSelectedCampaignToEdit(null); }} 
              className={`w-full sm:w-1/2 rounded-xl h-10 text-sm font-semibold transition-all ${
                isDarkMode 
                  ? 'bg-rose-600/20 text-rose-400 border border-rose-900/50 hover:bg-rose-600/30 hover:text-rose-300' 
                  : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmSave} 
              className="w-full sm:w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 text-sm font-semibold shadow-lg"
            >
              Ya, Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Konfirmasi Ubah Status Campaign */}
      <AlertDialog open={Boolean(statusItem)} onOpenChange={() => setStatusItem(null)}>
        <AlertDialogContent className={`rounded-3xl border p-6 shadow-2xl max-w-md ${
          isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <AlertDialogHeader className="space-y-3 text-center sm:text-left">
            <div className={`mx-auto sm:mx-0 w-12 h-12 rounded-2xl flex items-center justify-center border ${
              isDarkMode 
                ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/50' 
                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}>
              <Megaphone className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <AlertDialogTitle 
                style={{ color: isDarkMode ? '#ffffff' : undefined }}
                className="text-base font-bold tracking-tight text-slate-900 dark:text-white"
              >
                Ubah Status Campaign?
              </AlertDialogTitle>
              
              <AlertDialogDescription 
                style={{ color: isDarkMode ? '#f3f4f6' : undefined }}
                className="text-sm text-slate-500 dark:text-slate-100 leading-relaxed font-normal"
              >
                Apakah Anda yakin ingin mengubah status campaign <span className={`font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{statusItem?.campaign_name}</span>?
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 bg-transparent border-0">
            <AlertDialogCancel 
              onClick={() => setStatusItem(null)}
              className={`w-full sm:w-1/2 rounded-xl h-10 text-sm font-semibold transition-all ${
                isDarkMode 
                  ? 'bg-rose-600/20 text-rose-400 border border-rose-900/50 hover:bg-rose-600/30 hover:text-rose-300' 
                  : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              Batal
            </AlertDialogCancel>
            
            <AlertDialogAction
              onClick={handleConfirmToggleStatus}
              className="w-full sm:w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 text-sm font-semibold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              Ya, Ubah
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Konfirmasi Hapus Campaign */}
      <AlertDialog open={Boolean(deleteItem)} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent className={`rounded-3xl border p-6 shadow-2xl max-w-md ${
          isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <AlertDialogHeader className="space-y-3 text-center sm:text-left">
            <div className="mx-auto sm:mx-0 w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-500 border border-rose-100 dark:border-rose-900/50">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle 
                style={{ color: isDarkMode ? '#ffffff' : undefined }}
                className="text-base font-bold tracking-tight text-slate-900 dark:text-white"
              >
                Hapus Campaign Ini?
              </AlertDialogTitle>
              <AlertDialogDescription 
                style={{ color: isDarkMode ? '#f3f4f6' : undefined }}
                className="text-sm text-slate-500 dark:text-slate-100 leading-relaxed font-normal"
              >
                Tindakan ini bersifat permanen. Data Campaign <span className="font-semibold text-slate-700 dark:text-slate-200">{deleteItem?.campaign_name}</span> akan dihapus.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 bg-transparent border-0">
            <AlertDialogCancel 
              onClick={() => setDeleteItem(null)} 
              className={`w-full sm:w-1/2 rounded-xl h-10 text-sm font-semibold transition-all ${
                isDarkMode 
                  ? 'bg-rose-600/20 text-rose-400 border border-rose-900/50 hover:bg-rose-600/30 hover:text-rose-300' 
                  : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="w-full sm:w-1/2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-10 text-sm font-semibold shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}