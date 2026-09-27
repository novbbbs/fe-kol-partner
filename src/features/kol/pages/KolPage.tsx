import { useState, useMemo, useEffect } from 'react';
import { Plus, FileSpreadsheet, Filter, Search, Edit2, Trash2, Save } from 'lucide-react';
import { PiUsers } from 'react-icons/pi';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

import ReusableTable from '../../../components/ReusableTable';
import FormModal from '../../../components/FormModal';
import { Badge } from '../../../components/ui/badge';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
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
import KolFilterDropdown from '../components/KolFilterDropdown';
import { Button } from '../../../components/ui/button';
import { useKol } from '../hooks/useKol';
import type { Kol } from '../types/kol.type';

interface KolPageProps {
  isDarkMode?: boolean;
}

export default function KolPage({ isDarkMode = false }: KolPageProps) {
  const { kols, refetch } = useKol();

  const [inputValue, setInputValue] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Semua');
  
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // State Dialog Konfirmasi
  const [deleteItem, setDeleteItem] = useState<Kol | null>(null);
  const [pendingFormData, setPendingFormData] = useState<Record<string, any> | null>(null);

  const [provinceOptions, setProvinceOptions] = useState<{ label: string; value: string | number }[]>([
    { label: 'Memuat provinsi...', value: '' }
  ]);

  const [campaignOptions, setCampaignOptions] = useState<{ label: string; value: number | string }[]>([
    { label: 'Memuat tipe campaign...', value: '' }
  ]);

  const [selectedKolToEdit, setSelectedKolToEdit] = useState<Kol | null>(null);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const axios = (await import('axios')).default;
        const response = await axios.get('https://stagingcrm.salokapark.app/api/get_provinces');
        const rawData = response.data?.data || [];
        
        const formattedProv = rawData.map((item: any) => ({
          label: item.prov_name,
          value: item.prov_name,
        }));

        if (formattedProv.length > 0) {
          setProvinceOptions(formattedProv);
        }
      } catch (error) {
        console.error('Gagal mengambil data provinsi:', error);
        setProvinceOptions([
          { label: 'JAWA TENGAH', value: 'JAWA TENGAH' },
          { label: 'DI YOGYAKARTA', value: 'DI YOGYAKARTA' },
          { label: 'JAWA TIMUR', value: 'JAWA TIMUR' }
        ]);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const axios = (await import('axios')).default;
        const response = await axios.get('http://127.0.0.1:8000/api/campaigns');
        const rawData = Array.isArray(response.data) ? response.data : response.data.data || [];
        
        const formatted = rawData.map((item: any) => ({
          label: item.campaign_name || item.name || item.title,
          value: item.campaign_name || item.name || item.title,
        }));

        if (formatted.length > 0) {
          setCampaignOptions(formatted);
        }
      } catch (error) {
        console.error('Gagal mengambil data campaign:', error);
        setCampaignOptions([
          { label: 'Nataru', value: 'Nataru' },
          { label: 'Dance', value: 'Dance' },
          { label: 'Hollyween', value: 'Hollyween' }
        ]);
      }
    };

    fetchCampaigns();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilter(inputValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const filteredData = useMemo(() => {
    return kols.filter((item) => {
      const query = debouncedFilter.trim().toLowerCase();
      const matchSearch =
        !query ||
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.username && item.username.toLowerCase().includes(query)) ||
        (item.city_name && item.city_name.toLowerCase().includes(query)) ||
        (item.referral_code && item.referral_code.toLowerCase().includes(query)) ||
        (item.whatsapp && item.whatsapp.toLowerCase().includes(query));

      const matchStatus = statusFilter === 'Semua' || item.status === statusFilter;

      let matchDate = true;
      const itemDate = item.campaign_start_date ? String(item.campaign_start_date).split('T')[0] : '';

      if (startDateFilter && endDateFilter && itemDate) {
        matchDate = itemDate >= startDateFilter && itemDate <= endDateFilter;
      } else if (startDateFilter && itemDate) {
        matchDate = itemDate >= startDateFilter;
      } else if (endDateFilter && itemDate) {
        matchDate = itemDate <= endDateFilter;
      }

      return matchSearch && matchStatus && matchDate;
    });
  }, [kols, debouncedFilter, statusFilter, startDateFilter, endDateFilter]);

  const generateReferralCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 3; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    const numbers = Math.floor(10000 + Math.random() * 90000);
    return `${result}${numbers}`;
  };

  const handleInitialFormSubmit = async (formData: Record<string, any>) => {
    setPendingFormData(formData);
    setIsModalOpen(false);
  };

  const handleConfirmSave = async () => {
    if (!pendingFormData) return;

    try {
      const axios = (await import('axios')).default;
      
      const formatDate = (val: any) => {
        if (!val) return null;
        const str = String(val);
        return str.includes('T') ? str.split('T')[0] : str.slice(0, 10);
      };

      const rawWhatsapp = String(pendingFormData.whatsapp || '').replace(/\D/g, '');

      const resolvedName = pendingFormData.name || pendingFormData.nama_kol || pendingFormData.nama || '';
      const resolvedUsername = pendingFormData.username || '';
      const resolvedProvince = pendingFormData.province_name || pendingFormData.provinsi || '';
      const resolvedCity = pendingFormData.city_name || pendingFormData.kota_asal || '';
      const resolvedType = pendingFormData.type || pendingFormData.tipe_kol || '';

      const payload = {
        name: resolvedName,
        nama_kol: resolvedName,
        username: resolvedUsername,
        whatsapp: rawWhatsapp,
        province_name: resolvedProvince,
        city_name: resolvedCity,
        type: resolvedType,
        campaign_start_date: formatDate(pendingFormData.campaign_start_date),
        campaign_end_date: formatDate(pendingFormData.campaign_end_date),
        referral_code: selectedKolToEdit ? (selectedKolToEdit.referral_code || selectedKolToEdit.kode_referral) : generateReferralCode(),
        status: 1 
      };

      const activeEditTarget = selectedKolToEdit;

      if (activeEditTarget) {
        const targetId = activeEditTarget.id || activeEditTarget.uid;
        await axios.put(`http://127.0.0.1:8000/api/kols/${targetId}`, payload);
        if (typeof refetch === 'function') await refetch();
        
        Swal.fire({
          title: 'Berhasil!',
          text: 'Data KOL berhasil diperbarui.',
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
      } else {
        await axios.post('http://127.0.0.1:8000/api/kols', payload);
        if (typeof refetch === 'function') await refetch();

        Swal.fire({
          title: 'Berhasil!',
          text: `Data KOL baru berhasil ditambahkan dengan Referral: ${payload.referral_code}`,
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
      }
    } catch (error: any) {
      console.error('Gagal menyimpan data:', error.response?.data || error);
      
      const errorData = error.response?.data;
      let errorMsg = 'Terjadi kesalahan saat menyimpan data KOL.';
      
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMsg = errorData;
        } else if (errorData.message) {
          errorMsg = errorData.message;
        } else if (errorData.errors) {
          errorMsg = Object.values(errorData.errors).flat().join('\n');
        }
      }

      Swal.fire('Gagal!', errorMsg, 'error');
    } finally {
      setSelectedKolToEdit(null);
      setPendingFormData(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    const targetId = deleteItem.id || deleteItem.uid;

    if (!targetId) {
      Swal.fire('Gagal!', 'ID data KOL tidak valid.', 'error');
      return;
    }

    try {
      const axios = (await import('axios')).default;
      const response = await axios.delete(`http://127.0.0.1:8000/api/kols/${targetId}`);
      
      if (response.status === 200 || response.data?.success) {
        if (typeof refetch === 'function') {
          await refetch();
        }
        
        setDeleteItem(null);
        
        Swal.fire({
          title: 'Terhapus!',
          text: 'Data KOL berhasil dihapus dari database.',
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
      } else {
        throw new Error(response.data?.message || 'Gagal menghapus data.');
      }
    } catch (error: any) {
      console.error('Gagal menghapus data:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Terjadi kesalahan saat menghapus data.';
      setDeleteItem(null);
      Swal.fire('Gagal!', errorMsg, 'error');
    }
  };

  const handleExportExcel = () => {
    const worksheetData = filteredData.map((item, index) => ({
      No: index + 1,
      'Nama KOL': item.name,
      Username: item.username,
      'Kode Referral': item.referral_code || item.kode_referral,
      'No. WhatsApp': item.whatsapp,
      'Kota Asal': item.city_name,
      Provinsi: (String(item.province_name || item.provinsi) === '13') ? 'JAWA TENGAH' : (item.province_name || item.provinsi),
      'Tipe Campaign': item.type,
      'Campaign Start Date': item.campaign_start_date ? String(item.campaign_start_date).split('T')[0] : '-',
      'Campaign End Date': item.campaign_end_date ? String(item.campaign_end_date).split('T')[0] : '-',
      Status: item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Master KOL');
    XLSX.writeFile(workbook, `Master_KOL_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const kolFields = useMemo(() => {
    const baseFields = [
      { name: 'name', label: 'Name', placeholder: 'Masukkan Name', required: true },
      { name: 'username', label: 'Username', placeholder: 'Masukkan Username', required: true },
      { 
        name: 'whatsapp', 
        label: 'Whatsapp', 
        placeholder: 'Masukkan Whatsapp', 
        type: 'number-only' as const,
        required: true 
      },
      { 
        name: 'province_name', 
        label: 'Provinsi', 
        type: 'select' as const, 
        options: provinceOptions,
        required: true 
      },
      { 
        name: 'city_name', 
        label: 'Kota Asal', 
        type: 'text' as const,
        placeholder: 'Masukkan Kota Asal',
        required: true 
      },
      { 
        name: 'type', 
        label: 'Type (Campaign)', 
        type: 'select' as const, 
        options: campaignOptions,
        required: true 
      }
    ];

    if (!selectedKolToEdit) {
      return [
        ...baseFields,
        { name: 'campaign_start_date', label: 'Campaign Start Date', type: 'date' as const, required: true },
        { name: 'campaign_end_date', label: 'Campaign End Date', type: 'date' as const, required: true }
      ];
    }

    return baseFields;
  }, [selectedKolToEdit, provinceOptions, campaignOptions]);

  const columns = [
    { 
      accessorKey: 'id', 
      header: () => <div className="text-center">ID</div>, 
      cell: ({ row }: any) => <div className="text-center font-medium text-emerald-600">{row.index + 1}</div> 
    },
    { 
      accessorKey: 'referral_code', 
      header: () => <div className="text-center">KODE REFERRAL</div>, 
      cell: ({ row }: any) => (
        <div className="text-center">
          <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 inline-block">
            {row.original.referral_code || row.original.kode_referral || '-'}
          </span>
        </div>
      ) 
    },
    { 
      accessorKey: 'name', 
      header: () => <div className="text-center">NAME</div>, 
      cell: ({ row }: any) => <div className="text-center font-semibold">{row.original.name || row.original.nama_kol}</div> 
    },
    { 
      accessorKey: 'username', 
      header: () => <div className="text-center">USERNAME</div>,
      cell: ({ row }: any) => <div className="text-center">{row.original.username || '-'}</div>
    },
    { 
      accessorKey: 'whatsapp', 
      header: () => <div className="text-center">WHATSAPP</div>,
      cell: ({ row }: any) => <div className="text-center">{row.original.whatsapp || '-'}</div>
    },
    { 
      accessorKey: 'city_name', 
      header: () => <div className="text-center">KOTA ASAL</div>, 
      cell: ({ row }: any) => <div className="text-center">{row.original.city_name || row.original.kota_asal || '-'}</div> 
    },
    { 
      accessorKey: 'province_name', 
      header: () => <div className="text-center">PROVINSI</div>, 
      cell: ({ row }: any) => {
        const prov = row.original.province_name || row.original.provinsi;
        const formattedProv = (String(prov) === '13') ? 'JAWA TENGAH' : (prov || '-');
        return <div className="text-center">{formattedProv}</div>;
      } 
    },
    { 
      accessorKey: 'type', 
      header: () => <div className="text-center">TYPE</div>, 
      cell: ({ row }: any) => <div className="text-center">{row.original.type || row.original.tipe_kol || '-'}</div> 
    },
    { 
      accessorKey: 'campaign_start_date', 
      header: () => <div className="text-center">CAMPAIGN START DATE</div>, 
      cell: ({ row }: any) => {
        const dateVal = row.original.campaign_start_date;
        const formattedDate = dateVal ? String(dateVal).split('T')[0] : '-';
        return (
          <div className="text-center">
            <span className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#16171d] px-2.5 py-1 rounded-md border border-slate-200 dark:border-[#2e303a] inline-block whitespace-nowrap">
              {formattedDate}
            </span>
          </div>
        );
      } 
    },
    { 
      accessorKey: 'campaign_end_date', 
      header: () => <div className="text-center">CAMPAIGN END DATE</div>, 
      cell: ({ row }: any) => {
        const dateVal = row.original.campaign_end_date;
        const formattedDate = dateVal ? String(dateVal).split('T')[0] : '-';
        return (
          <div className="text-center">
            <span className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#16171d] px-2.5 py-1 rounded-md border border-slate-200 dark:border-[#2e303a] inline-block whitespace-nowrap">
              {formattedDate}
            </span>
          </div>
        );
      } 
    },
    { 
      accessorKey: 'status', 
      header: () => <div className="text-center">STATUS</div>, 
      cell: ({ row }: any) => {
        const status = row.original.status;
        const endDate = row.original.campaign_end_date ? String(row.original.campaign_end_date).split('T')[0] : '';
        const today = new Date().toISOString().split('T')[0];
        
        const isExpired = endDate && today > endDate;
        const isActive = !isExpired && (status === 'ACTIVE' || status === 1 || status === '1' || String(status).toLowerCase() === 'aktif');

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
      header: () => <div className="text-center">ACTION</div>,
      cell: ({ row }: any) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Edit Data KOL"
            onClick={() => {
              setSelectedKolToEdit(row.original);
              setIsModalOpen(true);
            }}
            className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Hapus Data KOL"
            onClick={() => setDeleteItem(row.original)}
            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-6 relative z-10 overflow-x-hidden">
      <div className={`w-full rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${
        isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* HEADER PANEL */}
        <div className="p-4 md:p-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2e303a]">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 border border-emerald-100 dark:border-emerald-900/50 shadow-2xs">
              <PiUsers className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Master KOL
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Total: {kols.length} KOL terdaftar</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            
            <div className="relative w-full sm:w-72">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Cari data disini..."
                className={`w-full py-2.5 pl-10 pr-12 text-xs rounded-full border outline-none transition ${
                  isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-2xs'
                }`}
              />

              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                title="Filter Lanjutan"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm cursor-pointer hover:bg-emerald-600 transition"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>

              <KolFilterDropdown
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onApplyFilter={(filters: { startDate: string; endDate: string; status: string }) => {
                  setStatusFilter(filters.status);
                  setStartDateFilter(filters.startDate);
                  setEndDateFilter(filters.endDate);
                }}
                isDarkMode={isDarkMode}
              />
            </div>

            <Button
              type="button"
              onClick={handleExportExcel}
              className="hidden md:flex shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs h-10 px-4 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5" />
              <span>Export</span>
            </Button>

            <Button
              type="button"
              onClick={() => {
                setSelectedKolToEdit(null);
                setIsModalOpen(true);
              }}
              className="hidden md:flex shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-10 px-4 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Tambah</span>
            </Button>

          </div>
        </div>

        {/* Tabel Data */}
        <div className="w-full [&_div]:border-none [&_table]:mb-0">
          <ReusableTable
            data={filteredData}
            columns={columns}
            isDarkMode={isDarkMode}
            renderCardMobile={(item, absoluteIndex) => {
              const endDate = item.campaign_end_date ? String(item.campaign_end_date).split('T')[0] : '';
              const today = new Date().toISOString().split('T')[0];
              const isExpired = endDate && today > endDate;
              const isActive = !isExpired && (item.status === 'ACTIVE' || item.status === 1 || item.status === '1' || String(item.status).toLowerCase() === 'aktif');
              const provName = (String(item.province_name || item.provinsi) === '13') ? 'JAWA TENGAH' : (item.province_name || item.provinsi || '-');

              return (
                <Card key={item.id || item.uid || absoluteIndex} className={isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white shadow-md' : 'bg-white border-slate-200 text-slate-800 shadow-sm'}>
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0 border-b border-slate-100 dark:border-[#2e303a]">
                    <div>
                      <CardTitle className="text-xs font-bold text-slate-800 dark:text-white">
                        ID: #{absoluteIndex}
                      </CardTitle>
                      <CardDescription className="text-[11px] text-slate-400 mt-0.5">
                        Referral: <span className="font-mono font-bold text-emerald-600">{item.referral_code || item.kode_referral || '-'}</span>
                      </CardDescription>
                    </div>
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
                  
                  <CardContent className="p-4 space-y-2 text-xs">
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-white">{item.name || item.nama_kol}</p>
                      <p className="text-slate-400 text-[11px]">@{item.username || '-'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-[#2e303a]/60 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Whatsapp</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{item.whatsapp || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Type</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{item.type || item.tipe_kol || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Kota Asal</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{item.city_name || item.kota_asal || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Provinsi</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{provName}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-[#2e303a]/60 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Start Date</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#1f2028] px-2 py-0.5 rounded border border-slate-200 dark:border-[#2e303a] inline-block mt-0.5">
                          {item.campaign_start_date ? String(item.campaign_start_date).split('T')[0] : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">End Date</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#1f2028] px-2 py-0.5 rounded border border-slate-200 dark:border-[#2e303a] inline-block mt-0.5">
                          {item.campaign_end_date ? String(item.campaign_end_date).split('T')[0] : '-'}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-3 bg-slate-50/50 dark:bg-[#1f2028]/50 flex justify-end gap-2 border-t border-slate-100 dark:border-[#2e303a]">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedKolToEdit(item);
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
                      onClick={() => setDeleteItem(item)}
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

      </div>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2.5 md:hidden">
        <button
          type="button"
          onClick={handleExportExcel}
          title="Export Excel"
          className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition cursor-pointer hover:bg-blue-700"
        >
          <FileSpreadsheet className="w-5 h-5" />
        </button>

        <Button
          type="button"
          onClick={() => {
            setSelectedKolToEdit(null);
            setIsModalOpen(true);
          }}
          title="Tambah KOL"
          className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl active:scale-95 transition cursor-pointer hover:bg-emerald-700"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* FormModal Universal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedKolToEdit(null);
        }}
        onSubmitSuccess={handleInitialFormSubmit}
        initialData={selectedKolToEdit}
        titleCreate="Tambah KOL Baru"
        titleEdit="Edit Data KOL"
        fields={kolFields}
        isDarkMode={isDarkMode}
      />

      {/* Dialog Konfirmasi Simpan Data KOL */}
      <AlertDialog open={Boolean(pendingFormData)} onOpenChange={() => setPendingFormData(null)}>
        <AlertDialogContent className={`rounded-3xl border p-6 shadow-2xl max-w-md ${
          isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <AlertDialogHeader className="space-y-3 text-center sm:text-left">
            <div className="mx-auto sm:mx-0 w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 border border-emerald-100 dark:border-emerald-900/50">
              <Save className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle className="text-base font-bold tracking-tight">
                {selectedKolToEdit ? 'Konfirmasi Perubahan?' : 'Simpan KOL Baru?'}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Apakah Anda yakin ingin {selectedKolToEdit ? 'memperbarui' : 'menambahkan'} data KOL <span className="font-semibold text-emerald-600">{pendingFormData?.name || pendingFormData?.nama_kol || pendingFormData?.nama}</span>?
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel 
              onClick={() => { setPendingFormData(null); setSelectedKolToEdit(null); }} 
              className="w-full sm:w-1/2 rounded-xl h-10 text-xs font-semibold"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmSave} 
              className="w-full sm:w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 text-xs font-semibold shadow-lg"
            >
              Ya, Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Konfirmasi Hapus */}
      <AlertDialog open={Boolean(deleteItem)} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent className={`rounded-3xl border p-6 shadow-2xl max-w-md ${
          isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <AlertDialogHeader className="space-y-3 text-center sm:text-left">
            <div className="mx-auto sm:mx-0 w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-500 border border-rose-100 dark:border-rose-900/50">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <AlertDialogTitle className="text-base font-bold tracking-tight">
                Hapus Data KOL Ini?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tindakan ini bersifat permanen. Data KOL <span className="font-semibold text-slate-700 dark:text-slate-200">{deleteItem?.name || deleteItem?.nama_kol}</span> akan dihapus dari sistem.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel 
              onClick={() => setDeleteItem(null)}
              className="w-full sm:w-1/2 rounded-xl h-10 text-xs font-semibold border-slate-200 dark:border-[#2e303a] hover:bg-slate-100 dark:hover:bg-[#16171d]"
            >
              Batal
            </AlertDialogCancel>
            
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="w-full sm:w-1/2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-10 text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}