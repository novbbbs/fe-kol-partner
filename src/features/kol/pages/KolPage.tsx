import { useState, useMemo, useEffect } from 'react';
import { Plus, FileSpreadsheet, Filter, Search, Edit2, Trash2, Ticket } from 'lucide-react';
import { PiUsers } from 'react-icons/pi';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

import ReusableTable from '../../../components/ReusableTable';
import FilterDropdown from '../../../components/FilterDropdown';
import { PageHeader } from '../../../components/ui/PageHeader'; 
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'; 
import { kolService } from '../services/kol.service';
import { campaignService } from '../../campaign/services/campaign.service';
import { Switch } from '../../../components/ui/switch';
import { 
  Card, 
  CardContent, 
  CardFooter 
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { useKol } from '../hooks/useKol';
import type { Kol } from '../types/kol.type';

// Import komponen modal terpisah
import KolCreateModal from '../components/KolCreateModal';
import KolEditModal from '../components/KolEditModal';

interface KolPageProps {
  isDarkMode?: boolean;
  isModalOpen?: boolean;                     
  setIsModalOpen?: (open: boolean) => void;  
}

export default function KolPage({ 
  isDarkMode = false, 
  isModalOpen: externalIsModalOpen, 
  setIsModalOpen: externalSetIsModalOpen 
}: KolPageProps) {
  const { kols, refetch } = useKol();

  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [internalIsModalOpen, setInternalIsModalOpen] = useState(false);
  const isModalOpen = externalIsModalOpen !== undefined ? externalIsModalOpen : internalIsModalOpen;
  const setIsModalOpen = externalSetIsModalOpen || setInternalIsModalOpen;

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const [deleteItem, setDeleteItem] = useState<Kol | null>(null);
  const [statusItem, setStatusItem] = useState<Kol | null>(null);
  const [pendingFormData, setPendingFormData] = useState<Record<string, any> | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportConfirmOpen, setIsExportConfirmOpen] = useState(false); 

  // State untuk melacak kolom mana saja yang aktif/dicentang (sinkron dengan ReusableTable)
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    referral_code: true,
    name: true,
    username: true,
    whatsapp: true,
    city_name: true,
    province_name: true,
    type: true,
    campaign_start_date: true,
    campaign_end_date: true,
    status: true,
  });

  const [provinceOptions, setProvinceOptions] = useState<{ label: string; value: string | number }[]>([
    { label: 'Memuat provinsi...', value: '' }
  ]);
  const [cityOptions, setCityOptions] = useState<{ label: string; value: string }[]>([
    { label: 'Pilih Provinsi terlebih dahulu', value: '' }
  ]);
  const [campaignOptions, setCampaignOptions] = useState<{ label: string; value: string }[]>([
    { label: 'Memuat tipe campaign...', value: '' }
  ]);

  const [selectedKolToEdit, setSelectedKolToEdit] = useState<Kol | null>(null);
  const [rawProvincesData, setRawProvincesData] = useState<any[]>([]);
  const [selectedProvinceName, setSelectedProvinceName] = useState('');

  const getFormattedDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const defaultStartDate = useMemo(() => getFormattedDate(new Date()), []);
  const defaultEndDate = useMemo(() => {
    const d = new Date();
    const targetMonth = d.getMonth() + 1;
    d.setMonth(targetMonth);
    if (d.getMonth() !== targetMonth % 12) {
      d.setDate(0); 
    }
    return getFormattedDate(d);
  }, []);

  // Fetch Provinsi
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const axios = (await import('axios')).default;
        const response = await axios.get('https://serviceevent.salokapark.app/api/get-provinces');
        const rawData = response.data?.data || [];
        setRawProvincesData(rawData);
        const formattedProv = rawData.map((item: any) => ({ label: item.name, value: item.name }));
        if (formattedProv.length > 0) {
          setProvinceOptions([{ label: 'Pilih Provinsi', value: '' }, ...formattedProv]);
        }
      } catch (error) {
        console.error('Gagal mengambil data provinsi:', error);
        setProvinceOptions([{ label: 'Pilih Provinsi', value: '' }]);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch Kota Berdasarkan Provinsi
  const fetchCitiesByProvinceName = async (provinceName: string) => {
    try {
      if (!provinceName) {
        setCityOptions([{ label: 'Pilih Provinsi terlebih dahulu', value: '' }]);
        return;
      }
      const axios = (await import('axios')).default;
      let provs = rawProvincesData;
      if (provs.length === 0) {
        const res = await axios.get('https://serviceevent.salokapark.app/api/get-provinces');
        provs = res.data?.data || [];
        setRawProvincesData(provs);
      }
      const matched = provs.find((p: any) => String(p.name).trim().toLowerCase() === String(provinceName).trim().toLowerCase());
      if (!matched) {
        setCityOptions([{ label: 'Pilih Kota/Kabupaten', value: '' }]);
        return;
      }
      const regRes = await axios.get(`https://serviceevent.salokapark.app/api/get-regencies?province_id=${matched.id}`);
      const rawReg = regRes.data?.data || [];
      const formattedCities = rawReg.map((reg: any) => ({ label: reg.name || reg.reg_name, value: reg.name || reg.reg_name }));
      setCityOptions(formattedCities.length > 0 ? [{ label: 'Pilih Kota Asal', value: '' }, ...formattedCities] : [{ label: 'Tidak ada kota tersedia', value: '' }]);
    } catch (error) {
      console.error('Gagal mengambil data kota:', error);
      setCityOptions([{ label: 'Gagal memuat kota', value: '' }]);
    }
  };

  // Fetch Campaign Options
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await campaignService.getAllCampaigns();
        const rawData = Array.isArray(response) ? response : (response as any)?.data || [];
        const activeCampaigns = rawData.filter((item: any) => {
          const statusStr = String(item.status || '').toLowerCase().trim();
          return item.status === 1 || item.status === '1' || statusStr === 'active' || statusStr === 'aktif';
        });
        const formatted = activeCampaigns.map((item: any) => ({
          label: item.campaign_name || item.name || item.title,
          value: item.campaign_name || item.name || item.title,
        }));
        const uniqueCampaigns = Array.from(new Map([{ label: 'Reguler', value: 'Reguler' }, ...formatted].map(item => [item.value.toLowerCase(), item])).values());
        if (uniqueCampaigns.length > 0) setCampaignOptions(uniqueCampaigns);
      } catch (error) {
        console.error('Gagal mengambil data campaign:', error);
        setCampaignOptions([{ label: 'Reguler', value: 'Reguler' }]);
      }
    };
    fetchCampaigns();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(inputValue), 400);
    return () => clearTimeout(handler);
  }, [inputValue]);

  useEffect(() => {
    refetch({ search: debouncedSearch, status: statusFilter, startDate: startDateFilter, endDate: endDateFilter });
  }, [debouncedSearch, statusFilter, startDateFilter, endDateFilter, refetch]);

  const filteredData = kols;

  const handleToggleStatusKol = (item: Kol) => setStatusItem(item);

  const handleConfirmToggleStatus = async () => {
    if (!statusItem) return;
    const targetId = statusItem.id || statusItem.uid;
    if (!targetId) return;

    const rawStatus = statusItem.status;
    const isCurrentlyActive = rawStatus === 1 || rawStatus === '1' || String(rawStatus).toLowerCase() === 'active' || String(rawStatus).toLowerCase() === 'aktif';
    const newStatusValue = isCurrentlyActive ? 0 : 1;

    try {
      const response = await kolService.updateKol(targetId as string | number, { status: newStatusValue });
      await refetch({ search: debouncedSearch, status: statusFilter, startDate: startDateFilter, endDate: endDateFilter });
      setStatusItem(null);
      
      const successMessage = (response as any)?.message || 'Status berhasil diubah.';

      Swal.fire({
        title: 'Berhasil!',
        text: successMessage,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error: any) {
      console.error('Gagal mengubah status KOL:', error);
      setStatusItem(null);

      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat mengubah status.';

      Swal.fire({
        title: 'Gagal!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleInitialFormSubmit = async (formData: Record<string, any>) => {
    setPendingFormData(formData);
    setIsModalOpen(false);
  };

  const handleConfirmSave = async () => {
    if (!pendingFormData) return;
    try {
      const formatDate = (val: any) => val ? (String(val).includes('T') ? String(val).split('T')[0] : String(val).slice(0, 10)) : null;

      const rawWhatsapp = String(pendingFormData.whatsapp || '').replace(/\D/g, '');
      const resolvedName = pendingFormData.name || pendingFormData.nama_kol || pendingFormData.nama || '';
      const resolvedUsername = pendingFormData.username || '';
      const resolvedProvince = String(pendingFormData.province_name || pendingFormData.provinsi || selectedProvinceName || '').trim();
      const resolvedCity = String(pendingFormData.city_name || pendingFormData.kota_asal || '').trim();
      const rawType = pendingFormData.type || pendingFormData.tipe_kol || 'Reguler';
      const resolvedType = typeof rawType === 'object' && rawType !== null ? (rawType.value || rawType.label || 'Reguler') : String(rawType);

      const payload: any = {
        name: resolvedName,
        nama_kol: resolvedName,
        username: resolvedUsername,
        whatsapp: rawWhatsapp,
        province_name: resolvedProvince,
        provinsi: resolvedProvince,
        city_name: resolvedCity,
        kota_asal: resolvedCity,
        type: resolvedType,
        campaign_start_date: formatDate(pendingFormData.campaign_start_date),
        campaign_end_date: formatDate(pendingFormData.campaign_end_date),
        status: selectedKolToEdit ? (selectedKolToEdit.status ?? 1) : 1 
      };

      let response;
      if (selectedKolToEdit) {
        const targetId = selectedKolToEdit.id || selectedKolToEdit.uid;
        payload.referral_code = selectedKolToEdit.referral_code || selectedKolToEdit.kode_referral;

        response = await kolService.updateKol(targetId as string | number, payload);
      } else {
        response = await kolService.createKol(payload);
      }

      const successMessage = (response as any)?.message || 'Data berhasil disimpan.';

      Swal.fire({
        title: 'Berhasil!',
        text: successMessage,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      await refetch({ search: debouncedSearch, status: statusFilter, startDate: startDateFilter, endDate: endDateFilter });
      
      setSelectedKolToEdit(null);
      setPendingFormData(null);
      setSelectedProvinceName('');
    } catch (error: any) {
      console.error('Gagal menyimpan data:', error);
      
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan pada server.';

      toast.error('KOL gagal dibuat', { 
        description: errorMessage 
      });

      setIsModalOpen(true);
      setPendingFormData(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    const targetId = deleteItem.id || deleteItem.uid;
    if (!targetId) return;

    try {
      await kolService.deleteKol(targetId as string | number);
      await refetch({ search: debouncedSearch, status: statusFilter, startDate: startDateFilter, endDate: endDateFilter });
      setDeleteItem(null);

      Swal.fire({
        title: 'Terhapus!',
        text: 'Data KOL berhasil dihapus.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error: any) {
      setDeleteItem(null);

      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat menghapus data.';

      Swal.fire({
        title: 'Gagal!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleExportClick = () => {
    setIsExportConfirmOpen(true);
  };

  const handleConfirmExport = async () => {
    setIsExportConfirmOpen(false);
    setIsExporting(true);
    try {
      const activeColumnsList = Object.keys(columnVisibility).filter(key => columnVisibility[key]);

      const checkRes = await kolService.checkExportData({
        search: debouncedSearch,
        status: statusFilter,
        startDate: startDateFilter,
        endDate: endDateFilter,
        columns: activeColumnsList,
      } as any);

      if (checkRes && checkRes.success) {
        const worksheetData = filteredData.map((item, index) => {
          const rowObj: Record<string, any> = { No: index + 1 };

          // Hanya masukkan ke rowObj jika kolom tersebut dicentang (aktif) di UI
          if (columnVisibility['referral_code']) rowObj['Kode Referral'] = item.referral_code || item.kode_referral || '';
          if (columnVisibility['name']) rowObj['Nama KOL'] = item.name || item.nama_kol || '';
          if (columnVisibility['username']) rowObj['Username'] = item.username || '';
          if (columnVisibility['whatsapp']) rowObj['No. WhatsApp'] = item.whatsapp || '';
          if (columnVisibility['city_name']) rowObj['Kota Asal'] = item.city_name || item.kota_asal || '';
          if (columnVisibility['province_name']) rowObj['Provinsi'] = item.province_name || item.provinsi || '';
          if (columnVisibility['type']) rowObj['Tipe Campaign'] = item.type || item.tipe_kol || '';
          if (columnVisibility['campaign_start_date']) rowObj['Campaign Start Date'] = item.campaign_start_date ? String(item.campaign_start_date).split('T')[0] : '-';
          if (columnVisibility['campaign_end_date']) rowObj['Campaign End Date'] = item.campaign_end_date ? String(item.campaign_end_date).split('T')[0] : '-';
          if (columnVisibility['status']) rowObj['Status'] = item.status;

          return rowObj;
        });

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Master KOL');
        XLSX.writeFile(workbook, `Master_KOL_${new Date().toISOString().slice(0, 10)}.xlsx`);
        toast.success('Berhasil!', { description: 'File Excel berhasil didownload.' });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Tidak ada data KOL yang tersedia untuk diexport.';
      toast.error('Gagal Export!', { description: errorMsg });
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    { 
      accessorKey: 'id', 
      header: () => <div className="text-center">ID</div>, 
      cell: ({ row }: any) => <div className="text-center font-normal text-slate-700 dark:text-slate-300">{row.index + 1}</div>, 
      label: 'ID'
    },
    { 
      accessorKey: 'referral_code', 
      header: () => <div className="text-center">Kode Referral</div>, 
      cell: ({ row }: any) => <div className="text-center"><span className="font-mono text-sm font-bold text-slate-800 dark:text-white">{row.original.referral_code || row.original.kode_referral || '-'}</span></div>, 
      label: 'Kode Referral'
    },
    { 
      accessorKey: 'name', 
      header: () => <div className="text-left -ml-2">Nama</div>, 
      cell: ({ row }: any) => <div className="text-left -ml-2"><span className="font-normal text-slate-700 dark:text-slate-300">{row.original.name || row.original.nama_kol}</span></div>, 
      label: 'Nama'
    },
    { 
      accessorKey: 'username', 
      header: () => <div className="text-left -ml-2">Username</div>, 
      cell: ({ row }: any) => <div className="text-left -ml-2">{row.original.username || '-'}</div>, 
      label: 'Username'
    },
    { 
      accessorKey: 'whatsapp', 
      header: () => <div className="text-left -ml-2">WhatsApp</div>, 
      cell: ({ row }: any) => <div className="text-left -ml-2">{row.original.whatsapp || '-'}</div>, 
      label: 'WhatsApp'
    },
    { 
      accessorKey: 'city_name', 
      header: () => <div className="text-left -ml-2">Kota Asal</div>, 
      cell: ({ row }: any) => <div className="text-left -ml-2">{row.original.city_name || row.original.kota_asal || '-'}</div>, 
      label: 'Kota Asal'
    },
    { 
      accessorKey: 'province_name', 
      header: () => <div className="text-left -ml-2">Provinsi</div>, 
      cell: ({ row }: any) => <div className="text-left -ml-2">{row.original.province_name || row.original.provinsi || '-'}</div>, 
      label: 'Provinsi'
    },
    { 
      accessorKey: 'type', 
      header: () => <div className="text-center">Type</div>, 
      cell: ({ row }: any) => <div className="text-center">{row.original.type || row.original.tipe_kol || '-'}</div>, 
      label: 'Type'
    },
    { 
      accessorKey: 'campaign_start_date', 
      header: () => <div className="text-center">Mulai Campaign</div>, 
      cell: ({ row }: any) => <div className="text-center"><span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#16171d] px-2.5 py-1 rounded-md border border-slate-200 dark:border-[#2e303a] inline-block whitespace-nowrap">{row.original.campaign_start_date ? String(row.original.campaign_start_date).split('T')[0] : '-'}</span></div>,
      label: 'Mulai Campaign'
    },
    { 
      accessorKey: 'campaign_end_date', 
      header: () => <div className="text-center">Selesai Campaign</div>, 
      cell: ({ row }: any) => <div className="text-center"><span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#16171d] px-2.5 py-1 rounded-md border border-slate-200 dark:border-[#2e303a] inline-block whitespace-nowrap">{row.original.campaign_end_date ? String(row.original.campaign_end_date).split('T')[0] : '-'}</span></div>,
      label: 'Selesai Campaign'
    },
    { 
      accessorKey: 'status', 
      header: () => <div className="text-center">Status</div>, 
      cell: ({ row }: any) => {
        const status = row.original.status;
        const isActive = status === 1 || status === '1' || String(status).toLowerCase() === 'active' || String(status).toLowerCase() === 'aktif';
        return (
          <div className="flex items-center justify-center">
            <Switch
              checked={isActive}
              onCheckedChange={() => handleToggleStatusKol(row.original)}
              style={{ backgroundColor: isActive ? '#0d8a6a' : '#e11d48' }}
              className="cursor-pointer shadow-2xs transition-colors"
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Edit Data KOL"
            onClick={() => {
              setSelectedKolToEdit(row.original);
              if (row.original.province_name || row.original.provinsi) {
                fetchCitiesByProvinceName(row.original.province_name || row.original.provinsi);
              }
              setIsModalOpen(true);
            }}
            className="h-9 w-9 text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 hover:bg-amber-100 dark:hover:bg-amber-950/70 rounded-lg shadow-2xs"
          >
            <Edit2 className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Hapus Data KOL"
            onClick={() => setDeleteItem(row.original)}
            className="h-9 w-9 text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-amber-950/70 rounded-lg shadow-2xs"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
      label: 'Aksi'
    }
  ];

  return (
    <div className={`space-y-6 pb-24 md:pb-6 relative z-10 overflow-x-hidden text-sm transition-all duration-300 ${isModalOpen ? 'blur-sm brightness-90 pointer-events-none' : ''}`}>
      <div className={`w-full rounded-t-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
        
        <PageHeader 
          icon={<PiUsers className="w-5 h-5" />}
          title="Master KOL"
          isDarkMode={isDarkMode}
          className="[&_h2]:text-xs [&_h2]:font-semibold"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 overflow-visible">
            <div className="relative w-full sm:w-72 overflow-visible">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Cari data disini..."
                className={`w-full py-2.5 pl-10 pr-12 text-sm rounded-full border outline-none transition ${isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-2xs'}`}
              />

              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                title="Filter Lanjutan"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-sm cursor-pointer hover:bg-emerald-700 transition"
              >
                <Filter className="w-4 h-4" />
              </button>

              {((statusFilter && statusFilter !== 'Semua') || startDateFilter || endDateFilter) && (
                <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#16171d] pointer-events-none z-20" />
              )}

              <FilterDropdown
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onApplyFilter={(filters) => {
                  setStatusFilter(filters.status);
                  setStartDateFilter(filters.startDate || '');
                  setEndDateFilter(filters.endDate || '');
                }}
                isDarkMode={isDarkMode}
                showDateFilter={true}
                statusOptions={[
                  { label: 'Semua Status', value: 'Semua' },
                  { label: 'ACTIVE', value: 'ACTIVE' },
                  { label: 'NON-ACTIVE', value: 'NON-ACTIVE' },
                ]}
              />
            </div>

            <Button
              type="button"
              onClick={handleExportClick}
              disabled={isExporting}
              className="hidden md:flex shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm h-10 px-4 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5" />
              <span>{isExporting ? 'Memeriksa...' : 'Export'}</span>
            </Button>

            <Button
              type="button"
              onClick={() => {
                setSelectedKolToEdit(null);
                setCityOptions([{ label: 'Pilih Provinsi terlebih dahulu', value: '' }]);
                setIsModalOpen(true);
              }}
              className="hidden md:flex shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm h-10 px-4 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Tambah</span>
            </Button>
          </div>
        </PageHeader>

        {/* Tabel Data (ReusableTable) - Disinkronkan dengan columnVisibility */}
        <div className="w-full">
          <ReusableTable
            data={filteredData}
            columns={columns}
            isDarkMode={isDarkMode}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
            renderCardMobile={(item, absoluteIndex) => {
              const statusVal = item.status;
              const isActive = statusVal === 1 || statusVal === '1' || String(statusVal).toLowerCase() === 'active' || String(statusVal).toLowerCase() === 'aktif';
              const provName = item.province_name || item.provinsi || '-';

              return (
                <div key={item.id || item.uid || absoluteIndex} className="block md:hidden mb-3">
                  <Card className={`overflow-hidden rounded-2xl border shadow-sm ${isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                    
                    <div className="p-3 pb-2.5 flex items-center justify-between border-b border-slate-100 dark:border-[#2e303a]">
                      <span className="text-xs font-bold text-slate-800 dark:text-white">ID: #{absoluteIndex}</span>
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => handleToggleStatusKol(item)}
                        style={{ backgroundColor: isActive ? '#0d8a6a' : '#e11d48' }}
                        className="cursor-pointer shadow-2xs transition-colors scale-90"
                      />
                    </div>
                    
                    <CardContent className="p-3 space-y-3 text-xs">
                      
                      <div className="text-left py-0.5">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.name || item.nama_kol}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">@{item.username || '-'}</p>
                      </div>

                      <div className={`p-2.5 rounded-xl border flex items-center gap-3 ${isDarkMode ? 'bg-[#1f2028] border-[#2e303a]' : 'bg-slate-50/80 border-slate-100'}`}>
                        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                          <Ticket className="w-4 h-4" />
                        </div>
                        <div className="text-left min-w-0">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">KODE REFERRAL</span>
                          <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 tracking-wide block truncate">
                            {item.referral_code || item.kode_referral || '-'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs text-left">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">WhatsApp</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200 truncate block mt-0.5">{item.whatsapp || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Type</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200 truncate block mt-0.5">{item.type || item.tipe_kol || 'Reguler'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Kota Asal</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200 truncate block mt-0.5">{item.city_name || item.kota_asal || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Provinsi</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200 truncate block mt-0.5">{provName}</span>
                        </div>
                      </div>

                    </CardContent>

                    <CardFooter className={`p-2.5 flex justify-end gap-2 border-t ${isDarkMode ? 'bg-[#1f2028]/50 border-[#2e303a]' : 'bg-slate-50/80 border-slate-100'}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedKolToEdit(item);
                          if (item.province_name || item.provinsi) fetchCitiesByProvinceName(item.province_name || item.provinsi);
                          setIsModalOpen(true);
                        }}
                        className="h-7 text-xs px-3 text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-900 dark:hover:bg-amber-950/30"
                      >
                        <Edit2 className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteItem(item)}
                        className="h-7 text-xs px-3"
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Hapus
                      </Button>
                    </CardFooter>

                  </Card>
                </div>
              );
            }}
          />
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 md:hidden pointer-events-auto">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleExportClick(); }}
          disabled={isExporting}
          className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition cursor-pointer hover:bg-blue-700 disabled:opacity-50"
        >
          <FileSpreadsheet className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedKolToEdit(null); setCityOptions([{ label: 'Pilih Provinsi terlebih dahulu', value: '' }]); setIsModalOpen(true); }}
          className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl active:scale-95 transition cursor-pointer hover:bg-emerald-700"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Render Modal Berdasarkan Kondisi */}
      {selectedKolToEdit ? (
        <KolEditModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedKolToEdit(null); }}
          onSubmitSuccess={handleInitialFormSubmit}
          initialData={selectedKolToEdit}
          isDarkMode={isDarkMode}
          provinceOptions={provinceOptions}
          cityOptions={cityOptions}
          campaignOptions={campaignOptions}
          onProvinceChange={(provName, updateFormValue) => {
            setSelectedProvinceName(provName);
            if (provName.trim() !== '') {
              fetchCitiesByProvinceName(provName);
              if (updateFormValue) {
                updateFormValue('province_name', provName);
                updateFormValue('provinsi', provName);
                updateFormValue('city_name', '');
                updateFormValue('kota_asal', '');
              }
            }
          }}
        />
      ) : (
        <KolCreateModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedKolToEdit(null); }}
          onSubmitSuccess={handleInitialFormSubmit}
          isDarkMode={isDarkMode}
          provinceOptions={provinceOptions}
          cityOptions={cityOptions}
          campaignOptions={campaignOptions}
          defaultStartDate={defaultStartDate}
          defaultEndDate={defaultEndDate}
          onProvinceChange={(provName, updateFormValue) => {
            setSelectedProvinceName(provName);
            if (provName.trim() !== '') {
              fetchCitiesByProvinceName(provName);
              if (updateFormValue) {
                updateFormValue('province_name', provName);
                updateFormValue('provinsi', provName);
                updateFormValue('city_name', '');
                updateFormValue('kota_asal', '');
              }
            }
          }}
        />
      )}

      {/* Dialog Konfirmasi Export */}
      <ConfirmDialog
        isOpen={isExportConfirmOpen}
        onOpenChange={setIsExportConfirmOpen}
        title="Export Data Master KOL?"
        description="Apakah Anda yakin ingin meng-export data Master KOL ini ke file Excel?"
        confirmText="Ya, Export"
        onConfirm={handleConfirmExport}
        icon={<FileSpreadsheet className="w-6 h-6" />}
        variant="success"
        isDarkMode={isDarkMode}
      />

      {/* Dialog Konfirmasi Simpan */}
      <ConfirmDialog
        isOpen={Boolean(pendingFormData)}
        onOpenChange={(open) => !open && setPendingFormData(null)}
        title={selectedKolToEdit ? 'Konfirmasi Perubahan?' : 'Simpan KOL Baru?'}
        description={
          <>
            Apakah Anda yakin ingin {selectedKolToEdit ? 'memperbarui' : 'menambahkan'} data KOL{' '}
            <span className="font-semibold text-emerald-600">
              {pendingFormData?.name || pendingFormData?.nama_kol || pendingFormData?.nama}
            </span>
            ?
          </>
        }
        confirmText="Ya, Simpan"
        onConfirm={handleConfirmSave}
        onCancel={() => setSelectedKolToEdit(null)}
        icon={<Plus className="w-6 h-6" />}
        variant="success"
        isDarkMode={isDarkMode}
      />

      {/* Dialog Konfirmasi Ubah Status */}
      <ConfirmDialog
        isOpen={Boolean(statusItem)}
        onOpenChange={(open) => !open && setStatusItem(null)}
        title="Ubah Status KOL?"
        description={
          <>
            Apakah Anda yakin ingin mengubah status KOL{' '}
            <span className={`font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {statusItem?.name || statusItem?.nama_kol}
            </span>
            ?
          </>
        }
        confirmText="Ya, Ubah"
        onConfirm={handleConfirmToggleStatus}
        icon={<Plus className="w-6 h-6 rotate-45" />}
        variant="success"
        isDarkMode={isDarkMode}
      />

      {/* Dialog Konfirmasi Hapus */}
      <ConfirmDialog
        isOpen={Boolean(deleteItem)}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        title="Hapus Data KOL Ini?"
        description={
          <>
            Tindakan ini bersifat permanen. Data KOL{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {deleteItem?.name || deleteItem?.nama_kol}
            </span>{' '}
            akan dihapus dari sistem.
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