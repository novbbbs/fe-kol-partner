import { useState, useMemo, useEffect } from 'react';
import { Plus, FileSpreadsheet, Filter, Search, Edit2, Trash2, Ticket } from 'lucide-react';
import { PiUsers } from 'react-icons/pi';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

import ReusableTable from '../../../components/ReusableTable';
import FilterDropdown from '../../../components/FilterDropdown';
import { kolApi, campaignApi } from '../../../components/apiService';
import { Switch } from '../../../components/ui/switch';
import { 
  Card, 
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
} from '../../../components/ui/alert-dialog';
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
  const { kols, refetch, addKol } = useKol();

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
        const response = await campaignApi.getAll();
        const rawData = Array.isArray(response) ? response : response.data || [];
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

  const generateReferralCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 3; i++) result += letters.charAt(Math.floor(Math.random() * letters.length));
    return `${result}${Math.floor(10000 + Math.random() * 90000)}`;
  };

  const handleToggleStatusKol = (item: Kol) => setStatusItem(item);

  const handleConfirmToggleStatus = async () => {
    if (!statusItem) return;
    const targetId = statusItem.id || statusItem.uid;
    if (!targetId) return;

    const rawStatus = statusItem.status;
    const isCurrentlyActive = rawStatus === 1 || rawStatus === '1' || String(rawStatus).toLowerCase() === 'active' || String(rawStatus).toLowerCase() === 'aktif';
    const newStatusValue = isCurrentlyActive ? 0 : 1;
    const kolName = statusItem.name || statusItem.nama_kol;

    try {
      const payload = {
        name: kolName,
        nama_kol: kolName,
        username: statusItem.username || '',
        whatsapp: String(statusItem.whatsapp || '').replace(/\D/g, ''),
        province_name: statusItem.province_name || statusItem.provinsi || '',
        provinsi: statusItem.province_name || statusItem.provinsi || '',
        city_name: statusItem.city_name || statusItem.kota_asal || '',
        kota_asal: statusItem.city_name || statusItem.kota_asal || '',
        type: statusItem.type || statusItem.tipe_kol || 'Reguler',
        campaign_start_date: statusItem.campaign_start_date ? String(statusItem.campaign_start_date).split('T')[0] : null,
        campaign_end_date: statusItem.campaign_end_date ? String(statusItem.campaign_end_date).split('T')[0] : null,
        referral_code: statusItem.referral_code || statusItem.kode_referral,
        status: newStatusValue
      };

      await kolApi.update(targetId, payload);
      await refetch({ search: debouncedSearch, status: statusFilter, startDate: startDateFilter, endDate: endDateFilter });
      setStatusItem(null);
      
      Swal.fire({
        title: 'Berhasil!',
        text: `Status KOL "${kolName}" berhasil diubah.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error: any) {
      console.error('Gagal mengubah status KOL:', error);
      setStatusItem(null);
      Swal.fire('Gagal!', error.response?.data?.message || 'Terjadi kesalahan saat mengubah status.', 'error');
    }
  };

  const handleInitialFormSubmit = async (formData: Record<string, any>) => {
    const resolvedName = formData.name || formData.nama_kol || formData.nama || '';
    const resolvedUsername = formData.username || '';
    const rawWhatsapp = String(formData.whatsapp || '').replace(/\D/g, '');
    const resolvedProvince = String(formData.province_name || formData.provinsi || selectedProvinceName || '').trim();
    const resolvedCity = String(formData.city_name || formData.kota_asal || '').trim();

    if (!resolvedName || !resolvedUsername || !rawWhatsapp || !resolvedProvince || !resolvedCity) {
      toast.error('KOL gagal dibuat', { description: 'Semua field formulir wajib diisi dengan lengkap.' });
      return; 
    }

    if (rawWhatsapp.length < 11 || rawWhatsapp.length > 14) {
      toast.error('Nomor WhatsApp Tidak Valid', { description: 'Nomor WhatsApp harus di antara 11 hingga 14 digit.' });
      return; 
    }

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

      const payload = {
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
        referral_code: selectedKolToEdit ? (selectedKolToEdit.referral_code || selectedKolToEdit.kode_referral) : generateReferralCode(),
        status: selectedKolToEdit ? (selectedKolToEdit.status ?? 1) : 1 
      };

      if (selectedKolToEdit) {
        const targetId = selectedKolToEdit.id || selectedKolToEdit.uid;
        if (!targetId) {
          Swal.fire('Gagal!', 'ID data KOL tidak valid.', 'error');
          return;
        }
        await kolApi.update(targetId, payload);
        
        Swal.fire({
          title: 'Berhasil!',
          text: `Data KOL "${resolvedName}" berhasil diperbarui.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await addKol(payload);
        
        Swal.fire({
          title: 'Berhasil!',
          text: `KOL "${resolvedName}" berhasil ditambahkan.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }

      await refetch({ search: debouncedSearch, status: statusFilter, startDate: startDateFilter, endDate: endDateFilter });
    } catch (error: any) {
      console.error('Gagal menyimpan data:', error);
      Swal.fire('Gagal Menyimpan', error.response?.data?.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setSelectedKolToEdit(null);
      setPendingFormData(null);
      setSelectedProvinceName('');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    const targetId = deleteItem.id || deleteItem.uid;
    if (!targetId) return;
    const kolName = deleteItem.name || deleteItem.nama_kol;

    try {
      await kolApi.delete(targetId);
      await refetch({ search: debouncedSearch, status: statusFilter, startDate: startDateFilter, endDate: endDateFilter });
      setDeleteItem(null);
      
      Swal.fire({
        title: 'Terhapus!',
        text: `Data KOL "${kolName}" berhasil dihapus.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error: any) {
      setDeleteItem(null);
      Swal.fire('Gagal!', error.response?.data?.message || 'Terjadi kesalahan saat menghapus data.', 'error');
    }
  };

  const handleExportExcel = () => {
    try {
      const worksheetData = filteredData.map((item, index) => ({
        No: index + 1,
        'Nama KOL': item.name || item.nama_kol || '',
        Username: item.username || '',
        'Kode Referral': item.referral_code || item.kode_referral || '',
        'No. WhatsApp': item.whatsapp || '',
        'Kota Asal': item.city_name || item.kota_asal || '',
        Provinsi: item.province_name || item.provinsi || '',
        'Tipe Campaign': item.type || item.tipe_kol || '',
        'Campaign Start Date': item.campaign_start_date ? String(item.campaign_start_date).split('T')[0] : '-',
        'Campaign End Date': item.campaign_end_date ? String(item.campaign_end_date).split('T')[0] : '-',
        Status: item.status,
      }));
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Master KOL');
      XLSX.writeFile(workbook, `Master_KOL_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('Berhasil!', { description: 'File Excel berhasil didownload.' });
    } catch (error) {
      toast.error('Gagal!', { description: 'Terjadi kesalahan saat mengeksport data.' });
    }
  };

  // Header kolom direvisi dari huruf kapital semua menjadi Title Case (Huruf biasa)
  const columns = [
    { accessorKey: 'id', header: () => <div className="text-center">ID</div>, cell: ({ row }: any) => <div className="text-center font-normal text-slate-700 dark:text-slate-300">{row.index + 1}</div> },
    { accessorKey: 'referral_code', header: () => <div className="text-center">Kode Referral</div>, cell: ({ row }: any) => <div className="text-center"><span className="font-mono text-sm font-bold text-slate-800 dark:text-white">{row.original.referral_code || row.original.kode_referral || '-'}</span></div> },
    { accessorKey: 'name', header: () => <div className="text-center">Nama</div>, cell: ({ row }: any) => <div className="text-left"><span className="font-normal text-slate-700 dark:text-slate-300">{row.original.name || row.original.nama_kol}</span></div> },
    { accessorKey: 'username', header: () => <div className="text-center">Username</div>, cell: ({ row }: any) => <div className="text-center">{row.original.username || '-'}</div> },
    { accessorKey: 'whatsapp', header: () => <div className="text-center">WhatsApp</div>, cell: ({ row }: any) => <div className="text-center">{row.original.whatsapp || '-'}</div> },
    { accessorKey: 'city_name', header: () => <div className="text-center">Kota Asal</div>, cell: ({ row }: any) => <div className="text-center">{row.original.city_name || row.original.kota_asal || '-'}</div> },
    { accessorKey: 'province_name', header: () => <div className="text-center">Provinsi</div>, cell: ({ row }: any) => <div className="text-center">{row.original.province_name || row.original.provinsi || '-'}</div> },
    { accessorKey: 'type', header: () => <div className="text-center">Tipe</div>, cell: ({ row }: any) => <div className="text-center">{row.original.type || row.original.tipe_kol || '-'}</div> },
    { 
      accessorKey: 'campaign_start_date', 
      header: () => <div className="text-center">Mulai Campaign</div>, 
      cell: ({ row }: any) => <div className="text-center"><span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#16171d] px-2.5 py-1 rounded-md border border-slate-200 dark:border-[#2e303a] inline-block whitespace-nowrap">{row.original.campaign_start_date ? String(row.original.campaign_start_date).split('T')[0] : '-'}</span></div> 
    },
    { 
      accessorKey: 'campaign_end_date', 
      header: () => <div className="text-center">Selesai Campaign</div>, 
      cell: ({ row }: any) => <div className="text-center"><span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#16171d] px-2.5 py-1 rounded-md border border-slate-200 dark:border-[#2e303a] inline-block whitespace-nowrap">{row.original.campaign_end_date ? String(row.original.campaign_end_date).split('T')[0] : '-'}</span></div> 
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
      } 
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
      )
    }
  ];

  return (
    <div className={`space-y-6 pb-24 md:pb-6 relative z-10 overflow-x-hidden text-sm transition-all duration-300 ${isModalOpen ? 'blur-sm brightness-90 pointer-events-none' : ''}`}>
      <div className={`w-full rounded-none shadow-sm border overflow-visible transition-colors duration-300 ${isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
        
        {/* HEADER PANEL */}
        <div className="p-4 md:p-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2e303a] overflow-visible">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 border border-emerald-100 dark:border-emerald-900/50 shadow-2xs">
              <PiUsers className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Master KOL
              </h2>
            </div>
          </div>

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
                title="Filter Lanjutan KOL"
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
              onClick={handleExportExcel}
              className="hidden md:flex shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm h-10 px-4 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5" />
              <span>Export</span>
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
        </div>

        {/* Tabel Data (Card Mobile khusus block md:hidden & Tabel untuk desktop) */}
        <div className="w-full [&_div]:border-none [&_table]:mb-0">
          <ReusableTable
            data={filteredData}
            columns={columns}
            isDarkMode={isDarkMode}
            renderCardMobile={(item, absoluteIndex) => {
              const statusVal = item.status;
              const isActive = statusVal === 1 || statusVal === '1' || String(statusVal).toLowerCase() === 'active' || String(statusVal).toLowerCase() === 'aktif';
              const provName = item.province_name || item.provinsi || '-';

              return (
                <div key={item.id || item.uid || absoluteIndex} className="block md:hidden mb-3">
                  <Card className={`overflow-hidden rounded-2xl border shadow-sm ${isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                    
                    {/* Header Card: ID & Switch Status */}
                    <div className="p-3 pb-2.5 flex items-center justify-between border-b border-slate-100 dark:border-[#2e303a]">
                      <span className="text-xs font-bold text-slate-800 dark:text-white">ID: #{absoluteIndex}</span>
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => handleToggleStatusKol(item)}
                        style={{ backgroundColor: isActive ? '#0d8a6a' : '#e11d48' }}
                        className="cursor-pointer shadow-2xs transition-colors scale-90"
                      />
                    </div>
                    
                    {/* Konten Utama (Posisi rata kiri semua) */}
                    <CardContent className="p-3 space-y-3 text-xs">
                      
                      {/* Nama & Username di Atas Kiri */}
                      <div className="text-left py-0.5">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.name || item.nama_kol}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">@{item.username || '-'}</p>
                      </div>

                      {/* Kotak Khusus Kode Referral (Gaya seperti Kode Booking) */}
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

                      {/* Grid Informasi (WhatsApp di kiri, rata kiri semua) */}
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

                    {/* Footer Tombol Aksi (Edit & Hapus) */}
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
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleExportExcel(); }}
          className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition cursor-pointer hover:bg-blue-700"
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

      {/* Render Modal Berdasarkan Kondisi (Create / Edit Terpisah) */}
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

      {/* Dialog Konfirmasi Simpan */}
      <AlertDialog open={Boolean(pendingFormData)} onOpenChange={() => setPendingFormData(null)}>
        <AlertDialogContent className={`rounded-3xl border p-6 shadow-2xl max-w-md ${isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
          <AlertDialogHeader className="space-y-3 text-center sm:text-left">
            <div className="mx-auto sm:mx-0 w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 border border-emerald-100 dark:border-emerald-900/50">
              <Plus className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className={`text-base font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {selectedKolToEdit ? 'Konfirmasi Perubahan?' : 'Simpan KOL Baru?'}
              </div>
              <AlertDialogDescription className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Apakah Anda yakin ingin {selectedKolToEdit ? 'memperbarui' : 'menambahkan'} data KOL <span className="font-semibold text-emerald-600">{pendingFormData?.name || pendingFormData?.nama_kol || pendingFormData?.nama}</span>?
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 bg-transparent border-0">
            <AlertDialogCancel 
              onClick={() => { setPendingFormData(null); setSelectedKolToEdit(null); }} 
              className={`w-full sm:w-1/2 rounded-xl h-10 text-sm font-semibold transition-all ${isDarkMode ? 'bg-rose-600/20 text-rose-400 border border-rose-900/50 hover:bg-rose-600/30' : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'}`}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave} className="w-full sm:w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 text-sm font-semibold shadow-lg">
              Ya, Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Konfirmasi Ubah Status */}
      <AlertDialog open={Boolean(statusItem)} onOpenChange={() => setStatusItem(null)}>
        <AlertDialogContent className={`rounded-3xl border p-6 shadow-2xl max-w-md ${isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
          <AlertDialogHeader className="space-y-3 text-center sm:text-left">
            <div className={`mx-auto sm:mx-0 w-12 h-12 rounded-2xl flex items-center justify-center border ${isDarkMode ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/50' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              <Plus className="w-6 h-6 rotate-45" />
            </div>
            <div className="space-y-1">
              <div className={`text-base font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Ubah Status KOL?
              </div>
              <AlertDialogDescription className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Apakah Anda yakin ingin mengubah status KOL <span className={`font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{statusItem?.name || statusItem?.nama_kol}</span>?
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 bg-transparent border-0">
            <AlertDialogCancel onClick={() => setStatusItem(null)} className={`w-full sm:w-1/2 rounded-xl h-10 text-sm font-semibold transition-all ${isDarkMode ? 'bg-rose-600/20 text-rose-400 border border-rose-900/50' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmToggleStatus} className="w-full sm:w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 text-sm font-semibold shadow-lg">
              Ya, Ubah
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={Boolean(deleteItem)} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent className={`rounded-3xl border p-6 shadow-2xl max-w-md ${isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
          <AlertDialogHeader className="space-y-3 text-center sm:text-left">
            <div className="mx-auto sm:mx-0 w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-500 border border-rose-100 dark:border-rose-900/50">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className={`text-base font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Hapus Data KOL Ini?
              </div>
              <AlertDialogDescription className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Tindakan ini bersifat permanen. Data KOL <span className="font-semibold text-slate-700 dark:text-slate-200">{deleteItem?.name || deleteItem?.nama_kol}</span> akan dihapus dari sistem.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 bg-transparent border-0">
            <AlertDialogCancel onClick={() => setDeleteItem(null)} className={`w-full sm:w-1/2 rounded-xl h-10 text-sm font-semibold transition-all ${isDarkMode ? 'bg-rose-600/20 text-rose-400 border border-rose-900/50' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="w-full sm:w-1/2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-10 text-sm font-semibold shadow-lg">
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}