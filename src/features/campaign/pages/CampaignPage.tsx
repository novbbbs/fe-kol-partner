import { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Megaphone } from 'lucide-react';
import Swal from 'sweetalert2';
import ReusableTable from '../../../components/ReusableTable';
import FormModal from '../../../components/FormModal';
import CampaignFilterDropdown from '../components/CampaignFilterDropdown';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '../../../components/ui/card';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../../components/ui/tooltip';
import { useCampaign } from '../hooks/useCampaign';
import type { CampaignItem } from '../types/campaign.type';

interface CampaignPageProps {
  isDarkMode?: boolean;
}

export default function CampaignPage({ isDarkMode = false }: CampaignPageProps) {
  const { campaignList, refetch, addCampaign, updateCampaign } = useCampaign();
  
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const filterRef = useRef<HTMLDivElement>(null);

  // State untuk konfirmasi hapus data campaign dengan AlertDialog Shadcn
  const [deleteCampaignItem, setDeleteCampaignItem] = useState<CampaignItem | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(inputValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [inputValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (
        target &&
        (target.closest('[data-[#2e303a]]') ||
          target.closest('[data-radix-popper-content-wrapper]') ||
          target.closest('[role="dialog"]') ||
          target.closest('[role="listbox"]') ||
          target.closest('[data-radix-select-viewport]'))
      ) {
        return;
      }

      if (filterRef.current && !filterRef.current.contains(target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredData = useMemo(() => {
    return campaignList.filter((c: CampaignItem) => {
      const query = debouncedSearchQuery.trim().toLowerCase();
      const statusStr = String(c.status ?? '');
      
      const matchSearch =
        !query ||
        c.campaign_name.toLowerCase().includes(query) ||
        statusStr.toLowerCase().includes(query);

      const isActiveStatus = statusFilter === 'Active' || statusFilter === 'Aktif' || statusFilter === '1';
      const isNonActiveStatus = statusFilter === 'Non Active' || statusFilter === 'Non Aktif' || statusFilter === '0';

      let matchStatus = true;
      if (statusFilter !== 'Semua Status' && statusFilter !== 'Semua') {
        if (isActiveStatus) {
          matchStatus = statusStr === '1' || statusStr.toLowerCase() === 'aktif' || statusStr.toLowerCase() === 'active';
        } else if (isNonActiveStatus) {
          matchStatus = statusStr === '0' || statusStr.toLowerCase() === 'non aktif' || statusStr.toLowerCase() === 'non-active' || statusStr.toLowerCase() === 'non active';
        }
      }

      return matchSearch && matchStatus;
    });
  }, [campaignList, debouncedSearchQuery, statusFilter]);

  const handleFormSubmit = async (formData: Record<string, any>) => {
    try {
      const statusValue = formData.status !== undefined && formData.status !== '' ? Number(formData.status) : 1;

      const payload = {
        campaign_name: formData.campaign_name,
        status: statusValue,
      };

      if (selectedCampaign) {
        await updateCampaign(selectedCampaign.id, payload);
        refetch();
        setIsModalOpen(false);
        setSelectedCampaign(null);
        Swal.fire('Berhasil!', 'Data campaign berhasil diperbarui.', 'success');
      } else {
        await addCampaign(payload as any);
        refetch();
        setIsModalOpen(false);
        setSelectedCampaign(null);
        Swal.fire('Berhasil!', 'Campaign baru berhasil ditambahkan ke database.', 'success');
      }
    } catch (error: any) {
      console.error('Gagal menyimpan campaign:', error.response?.data || error);
      const errorMsg = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan campaign.';
      Swal.fire('Gagal!', errorMsg, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCampaignItem) return;
    try {
      const axios = (await import('axios')).default;
      await axios.delete(`http://127.0.0.1:8000/api/campaigns/${deleteCampaignItem.id}`);
      refetch();
      setDeleteCampaignItem(null);
      Swal.fire('Terhapus!', 'Campaign berhasil dihapus dari database.', 'success');
    } catch (error: any) {
      console.error('Gagal menghapus campaign:', error);
      const errorMsg = error.response?.data?.message || 'Terjadi kesalahan saat menghapus campaign.';
      setDeleteCampaignItem(null);
      Swal.fire('Gagal!', errorMsg, 'error');
    }
  };

  const campaignFields = [
    { 
      name: 'campaign_name', 
      label: 'Campaign Name (Nama Campaign)', 
      placeholder: 'cth: Nataru 2026', 
      required: true 
    },
    { 
      name: 'status', 
      label: 'Status Campaign', 
      type: 'select' as const, 
      options: [
        { label: 'Active', value: 1 },      
        { label: 'Non Active', value: 0 }    
      ] 
    }
  ];

  const columns = [
    { 
      accessorKey: 'id', 
      header: 'ID', 
      cell: ({ row }: { row: { index: number } }) => (
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          {row.index + 1}
        </span>
      ) 
    },
    { 
      accessorKey: 'campaign_name', 
      header: 'CAMPAIGN NAME', 
      cell: ({ row }: { row: { original: CampaignItem } }) => (
        <div className="text-center">
          <span className="font-semibold">{row.original.campaign_name}</span>
        </div>
      ) 
    },
    { 
      accessorKey: 'status', 
      header: 'STATUS', 
      cell: ({ row }: { row: { original: CampaignItem } }) => {
        const status = row.original.status;
        const isActive = status === 1 || status === '1' || String(status).toLowerCase() === 'aktif' || String(status).toLowerCase() === 'active';
        return (
          <div className="text-center">
            <Badge 
              variant={isActive ? 'default' : 'destructive'}
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium border ${
                isActive 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400' 
                  : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-400'
              }`}
            >
              {isActive ? 'Active' : 'Non Active'}
            </Badge>
          </div>
        );
      } 
    },
    {
      accessorKey: 'actions',
      header: 'ACTION',
      cell: ({ row }: { row: { original: CampaignItem } }) => (
        <div className="text-right flex items-center justify-end gap-1">
          {/* Tooltip Edit */}
          <Tooltip>
            <TooltipTrigger>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedCampaign(row.original);
                  setIsModalOpen(true);
                }}
                className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[11px] py-1 px-2.5">
              <p>Edit Campaign</p>
            </TooltipContent>
          </Tooltip>

          {/* Tooltip Hapus */}
          <Tooltip>
            <TooltipTrigger>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setDeleteCampaignItem(row.original)}
                className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[11px] py-1 px-2.5 bg-rose-600 text-white border-rose-600">
              <p>Hapus Campaign</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-6 relative z-10 text-xs">
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${
        isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        <div className="p-6 border-b border-slate-200 dark:border-[#2e303a] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-emerald-500" />
              Master Campaign
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative w-full sm:w-72" ref={filterRef}>
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={`w-full pl-10 pr-12 py-2.5 rounded-full border text-xs outline-none transition ${
                  isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-xs'
                }`}
              />
              
              {/* Tooltip Filter */}
              <Tooltip>
                <TooltipTrigger>
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm cursor-pointer hover:bg-emerald-600 transition"
                  >
                    <Filter className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[11px] py-1 px-2.5">
                  <p>Filter Status</p>
                </TooltipContent>
              </Tooltip>

              <CampaignFilterDropdown
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onApplyFilter={(filters) => setStatusFilter(filters.status)}
                isDarkMode={isDarkMode}
              />
            </div>

            <Button
              type="button"
              onClick={() => {
                setSelectedCampaign(null);
                setIsModalOpen(true);
              }}
              className="hidden md:flex shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </Button>
          </div>
        </div>

        <div className="p-3 px-6 border-b border-slate-200 dark:border-[#2e303a] flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-[#16171d]/30 text-slate-400">
          <span className="font-semibold">Total: {filteredData.length} Campaign</span>
        </div>

        <ReusableTable
          data={filteredData}
          columns={columns}
          isDarkMode={isDarkMode}
          renderCardMobile={(item: CampaignItem, absoluteIndex: number) => {
            const isActive = item.status === 1 || item.status === '1' || String(item.status).toLowerCase() === 'aktif' || String(item.status).toLowerCase() === 'active';
            return (
              <Card key={item.id || absoluteIndex} className={isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white shadow-md' : 'bg-white border-slate-200 text-slate-800 shadow-sm'}>
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0 border-b border-slate-100 dark:border-[#2e303a]">
                  <CardTitle className="text-xs font-bold text-emerald-600">
                    ID: #{absoluteIndex}
                  </CardTitle>
                  <Badge 
                    variant={isActive ? 'default' : 'destructive'}
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium border ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400' 
                        : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-400'
                    }`}
                  >
                    {isActive ? 'Active' : 'Non Active'}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="font-semibold text-sm text-center text-slate-800 dark:text-white">
                    {item.campaign_name}
                  </p>
                </CardContent>
                <CardFooter className="p-3 bg-slate-50/50 dark:bg-[#1f2028]/50 flex justify-end gap-2 border-t border-slate-100 dark:border-[#2e303a]">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCampaign(item);
                      setIsModalOpen(true);
                    }}
                    className="h-8 text-xs text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-900 dark:hover:bg-amber-950/30"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteCampaignItem(item)}
                    className="h-8 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Hapus
                  </Button>
                </CardFooter>
              </Card>
            );
          }}
        />
      </div>

      {/* FLOATING ACTION BUTTON (FAB) MOBILE */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <button
          type="button"
          onClick={() => {
            setSelectedCampaign(null);
            setIsModalOpen(true);
          }}
          title="Tambah"
          className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl active:scale-95 transition cursor-pointer hover:bg-emerald-700"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* UNIVERSAL FORM MODAL (UNTUK DESKTOP & MOBILE) */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCampaign(null);
        }}
        onSubmitSuccess={handleFormSubmit}
        initialData={selectedCampaign} 
        titleCreate="Tambah Campaign Baru"
        titleEdit="Edit Campaign"
        fields={campaignFields}
        isDarkMode={isDarkMode}
      />

      {/* Modal Konfirmasi Hapus dengan AlertDialog */}
      <AlertDialog open={Boolean(deleteCampaignItem)} onOpenChange={() => setDeleteCampaignItem(null)}>
        <AlertDialogContent className={`rounded-2xl border ${
          isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Apakah Anda yakin ingin menghapus campaign ini?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-400">
              Tindakan ini tidak dapat dibatalkan. Campaign <span className="font-semibold text-slate-600 dark:text-slate-200">{deleteCampaignItem?.campaign_name}</span> akan dihapus secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel 
              onClick={() => setDeleteCampaignItem(null)}
              className="rounded-xl h-9 text-xs border-slate-200 dark:border-[#2e303a]"
            >
              Batal
            </AlertDialogCancel>
            
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-9 text-xs font-semibold cursor-pointer transition"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}