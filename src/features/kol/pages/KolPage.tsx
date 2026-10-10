import { useState, useMemo, useEffect, } from 'react';
import { Plus, FileSpreadsheet, Filter, Search, Edit2, Trash2 } from 'lucide-react';
import { PiUsers } from 'react-icons/pi';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

import ReusableTable from '../../../components/ReusableTable';
import FormModal from '../../../components/FormModal';
import FilterDropdown from '../../../components/FilterDropdown';
import { Switch } from '../../../components/ui/switch';
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
import { Button } from '../../../components/ui/button';
import { useKol } from '../hooks/useKol';
import type { Kol } from '../types/kol.type';

interface KolPageProps {
  isDarkMode?: boolean;
}

export default function KolPage({ isDarkMode = false }: KolPageProps) {
  const { kols, refetch, addKol } = useKol();

  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Semua');
  
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const [deleteItem, setDeleteItem] = useState<Kol | null>(null);
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

  const [, setMasterCampaignsMap] = useState<Record<string, boolean>>({});

  const [selectedKolToEdit, setSelectedKolToEdit] = useState<Kol | null>(null);
  const [rawProvincesData, setRawProvincesData] = useState<any[]>([]);
  const [selectedProvinceName, setSelectedProvinceName] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        Accept: 'application/json'
      }
    };
  };

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

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const axios = (await import('axios')).default;
        const response = await axios.get('https://serviceevent.salokapark.app/api/get-provinces');
        const rawData = response.data?.data || [];
        
        setRawProvincesData(rawData);

        const formattedProv = rawData.map((item: any) => ({
          label: item.name,
          value: item.name, 
        }));

        if (formattedProv.length > 0) {
          setProvinceOptions([
            { label: 'Pilih Provinsi', value: '' },
            ...formattedProv
          ]);
        }
      } catch (error) {
        console.error('Gagal mengambil data provinsi:', error);
        setProvinceOptions([
          { label: 'Pilih Provinsi', value: '' }
        ]);
      }
    };

    fetchProvinces();
  }, []);

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

      const formattedCities = rawReg.map((reg: any) => ({
        label: reg.name || reg.reg_name,
        value: reg.name || reg.reg_name,
      }));

      if (formattedCities.length > 0) {
        setCityOptions([
          { label: 'Pilih Kota Asal', value: '' },
          ...formattedCities
        ]);
      } else {
        setCityOptions([{ label: 'Tidak ada kota tersedia', value: '' }]);
      }
    } catch (error) {
      console.error('Gagal mengambil data kota:', error);
      setCityOptions([{ label: 'Gagal memuat kota', value: '' }]);
    }
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const axios = (await import('axios')).default;
        const response = await axios.get('http://127.0.0.1:8000/api/campaigns', getAuthHeaders());
        const rawData = Array.isArray(response.data) ? response.data : response.data.data || [];
        
        const statusMap: Record<string, boolean> = {};
        rawData.forEach((item: any) => {
          const name = item.campaign_name || item.name || item.title;
          if (name) {
            const statusVal = item.status;
            const statusStr = String(statusVal || '').toLowerCase().trim();
            const isActive = statusVal === 1 || statusVal === '1' || statusStr === 'active' || statusStr === 'aktif';
            statusMap[name.toLowerCase()] = isActive;
          }
        });
        statusMap['reguler'] = true;
        setMasterCampaignsMap(statusMap);

        const activeCampaigns = rawData.filter((item: any) => {
          const statusStr = String(item.status || '').toLowerCase().trim();
          return item.status === 1 || item.status === '1' || statusStr === 'active' || statusStr === 'aktif';
        });

        const formatted = activeCampaigns.map((item: any) => {
          const campaignName = item.campaign_name || item.name || item.title;
          return {
            label: campaignName,
            value: campaignName,
          };
        });

        const uniqueCampaigns = Array.from(
          new Map(
            [
              { label: 'Reguler', value: 'Reguler' },
              ...formatted
            ].map(item => [item.value.toLowerCase(), item])
          ).values()
        );

        if (uniqueCampaigns.length > 0) {
          setCampaignOptions(uniqueCampaigns);
        }
      } catch (error) {
        console.error('Gagal mengambil data campaign:', error);
        setCampaignOptions([
          { label: 'Reguler', value: 'Reguler' }
        ]);
      }
    };

    fetchCampaigns();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(inputValue);
    }, 400);
    return () => clearTimeout(handler);
  }, [inputValue]);

  useEffect(() => {
    refetch({
      search: debouncedSearch,
      status: statusFilter,
      startDate: startDateFilter,
      endDate: endDateFilter
    });
  }, [debouncedSearch, statusFilter, startDateFilter, endDateFilter, refetch]);

  const filteredData = kols;

  const generateReferralCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 3; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    const numbers = Math.floor(10000 + Math.random() * 90000);
    return `${result}${numbers}`;
  };

  const handleToggleStatusKol = async (item: Kol) => {
    const targetId = item.id || item.uid;
    if (!targetId) return;

    const rawStatus = item.status;
    const isCurrentlyActive = 
      rawStatus === 1 || 
      rawStatus === '1' || 
      String(rawStatus).toLowerCase() === 'active' || 
      String(rawStatus).toLowerCase() === 'aktif';

    const newStatusValue = isCurrentlyActive ? 0 : 1;

    try {
      const axios = (await import('axios')).default;
      
      const payload = {
        name: item.name || item.nama_kol,
        nama_kol: item.name || item.nama_kol,
        username: item.username || '',
        whatsapp: String(item.whatsapp || '').replace(/\D/g, ''),
        province_name: item.province_name || item.provinsi || '',
        provinsi: item.province_name || item.provinsi || '',
        city_name: item.city_name || item.kota_asal || '',
        kota_asal: item.city_name || item.kota_asal || '',
        type: item.type || item.tipe_kol || 'Reguler',
        campaign_start_date: item.campaign_start_date ? String(item.campaign_start_date).split('T')[0] : null,
        campaign_end_date: item.campaign_end_date ? String(item.campaign_end_date).split('T')[0] : null,
        referral_code: item.referral_code || item.kode_referral,
        status: newStatusValue
      };

      await axios.put(`http://127.0.0.1:8000/api/kols/${targetId}`, payload, getAuthHeaders());
      
      await refetch({
        search: debouncedSearch,
        status: statusFilter,
        startDate: startDateFilter,
        endDate: endDateFilter
      });

      Swal.fire({
        title: 'Berhasil!',
        text: `Status KOL "${item.name || item.nama_kol}" diubah menjadi ${newStatusValue === 1 ? 'Active' : 'Non Active'}.`,
        icon: 'success',
        timer: 1200,
        showConfirmButton: false
      });
    } catch (error: any) {
      console.error('Gagal mengubah status KOL:', error);
      const errMsg = error.response?.data?.message || 'Terjadi kesalahan saat memperbarui status KOL.';
      Swal.fire('Gagal!', errMsg, 'error');
    }
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

      if (rawWhatsapp.length < 11 || rawWhatsapp.length > 14) {
        Swal.fire('Peringatan!', 'Nomor WhatsApp harus di antara 11 hingga 14 digit.', 'warning');
        return;
      }

      const resolvedName = pendingFormData.name || pendingFormData.nama_kol || pendingFormData.nama || '';
      const resolvedUsername = pendingFormData.username || '';
      
      const resolvedProvince = String(
        pendingFormData.province_name || 
        pendingFormData.provinsi || 
        selectedProvinceName || ''
      ).trim();
      
      const resolvedCity = String(
        pendingFormData.city_name || 
        pendingFormData.kota_asal || ''
      ).trim();
      
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

      const activeEditTarget = selectedKolToEdit;

      if (activeEditTarget) {
        const targetId = activeEditTarget.id || activeEditTarget.uid;
        await axios.put(`http://127.0.0.1:8000/api/kols/${targetId}`, payload, getAuthHeaders());
        
        await refetch({
          search: debouncedSearch,
          status: statusFilter,
          startDate: startDateFilter,
          endDate: endDateFilter
        });
        
        Swal.fire({
          title: 'Berhasil!',
          text: 'Data KOL berhasil diperbarui.',
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
      } else {
        await addKol(payload);
        
        await refetch({
          search: debouncedSearch,
          status: statusFilter,
          startDate: startDateFilter,
          endDate: endDateFilter
        });

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
      setSelectedProvinceName('');
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
      const response = await axios.delete(`http://127.0.0.1:8000/api/kols/${targetId}`, getAuthHeaders());
      
      if (response.status === 200 || response.data?.success) {
        await refetch({
          search: debouncedSearch,
          status: statusFilter,
          startDate: startDateFilter,
          endDate: endDateFilter
        });
        
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

      const fileName = `Master_KOL_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      Swal.fire({
        title: 'Berhasil!',
        text: 'File berhasil didownload',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Gagal mengeksport fail excel:', error);
      Swal.fire('Gagal!', 'Terjadi kesalahan saat mengeksport data ke Excel.', 'error');
    }
  };

  const kolFields = useMemo(() => {
    const defaultCampaignValue = campaignOptions.length > 0 ? campaignOptions[0].value : 'Reguler';

    const baseFields = [
      { name: 'name', label: 'Name', placeholder: 'Masukkan Name', required: true },
      { name: 'username', label: 'Username', placeholder: 'Masukkan Username', required: true },
      { 
        name: 'whatsapp', 
        label: 'Whatsapp', 
        placeholder: 'Masukkan Whatsapp (11-14 digit)', 
        type: 'number-only' as const,
        minLength: 11,
        maxLength: 14,
        required: true 
      },
      { 
        name: 'province_name', 
        label: 'Provinsi', 
        type: 'select' as const, 
        options: provinceOptions,
        required: true,
        onChange: (selectedVal: any, updateFormValue?: (field: string, val: any) => void) => {
          let provName = '';
          if (typeof selectedVal === 'object' && selectedVal !== null) {
            provName = String(selectedVal.value || selectedVal.label || '');
          } else {
            provName = String(selectedVal || '');
          }

          setSelectedProvinceName(provName);

          if (provName.trim() !== '') {
            fetchCitiesByProvinceName(provName);
            if (typeof updateFormValue === 'function') {
              updateFormValue('province_name', provName); 
              updateFormValue('provinsi', provName); 
              updateFormValue('city_name', ''); 
              updateFormValue('kota_asal', ''); 
            }
          } else {
            setCityOptions([{ label: 'Pilih Provinsi terlebih dahulu', value: '' }]);
            if (typeof updateFormValue === 'function') {
              updateFormValue('province_name', '');
              updateFormValue('provinsi', '');
              updateFormValue('city_name', '');
              updateFormValue('kota_asal', '');
            }
          }
        }
      },
      { 
        name: 'city_name', 
        label: 'Kota Asal', 
        type: 'select' as const, 
        options: cityOptions,
        required: true,
        onChange: (selectedVal: any, updateFormValue?: (field: string, val: any) => void) => {
          let cityName = '';
          if (typeof selectedVal === 'object' && selectedVal !== null) {
            cityName = String(selectedVal.value || selectedVal.label || '');
          } else {
            cityName = String(selectedVal || '');
          }

          if (typeof updateFormValue === 'function') {
            updateFormValue('city_name', cityName);
            updateFormValue('kota_asal', cityName);
            if (selectedProvinceName) {
              updateFormValue('province_name', selectedProvinceName);
              updateFormValue('provinsi', selectedProvinceName);
            }
          }
        }
      },
      { 
        name: 'type', 
        label: 'Type (Campaign)', 
        type: 'select' as const, 
        options: campaignOptions,
        defaultValue: defaultCampaignValue, 
        required: true 
      }
    ];

    if (!selectedKolToEdit) {
      return [
        ...baseFields,
        { 
          name: 'campaign_start_date', 
          label: 'Campaign Start Date', 
          type: 'date' as const, 
          defaultValue: defaultStartDate, 
          required: true 
        },
        { 
          name: 'campaign_end_date', 
          label: 'Campaign End Date', 
          type: 'date' as const, 
          defaultValue: defaultEndDate, 
          required: true 
        }
      ];
    }

    return baseFields;
  }, [selectedKolToEdit, provinceOptions, cityOptions, campaignOptions, defaultStartDate, defaultEndDate, selectedProvinceName]);

  const columns = [
    { 
      accessorKey: 'id', 
      header: () => <div className="text-center">ID</div>, 
      cell: ({ row }: any) => <div className="text-center font-medium text-slate-800 dark:text-white">{row.index + 1}</div> 
    },
    { 
      accessorKey: 'referral_code', 
      header: () => <div className="text-center">Kode Referral</div>, 
      cell: ({ row }: any) => (
        <div className="text-center">
          <span className="font-mono text-sm font-bold text-slate-800 dark:text-white">
            {row.original.referral_code || row.original.kode_referral || '-'}
          </span>
        </div>
      ) 
    },
    { 
      accessorKey: 'name', 
      header: () => <div className="text-left pl-3">Name</div>, 
      cell: ({ row }: any) => (
        <div className="text-left pl-3">
          <span className="font-semibold whitespace-nowrap block">{row.original.name || row.original.nama_kol}</span>
        </div>
      ) 
    },
    { 
      accessorKey: 'username', 
      header: () => <div className="text-center">Username</div>,
      cell: ({ row }: any) => <div className="text-center">{row.original.username || '-'}</div>
    },
    { 
      accessorKey: 'whatsapp', 
      header: () => <div className="text-center">Whatsapp</div>,
      cell: ({ row }: any) => <div className="text-center">{row.original.whatsapp || '-'}</div>
    },
    { 
      accessorKey: 'city_name', 
      header: () => <div className="text-center">Kota Asal</div>, 
      cell: ({ row }: any) => <div className="text-center">{row.original.city_name || row.original.kota_asal || '-'}</div> 
    },
    { 
      accessorKey: 'province_name', 
      header: () => <div className="text-center">Provinsi</div>, 
      cell: ({ row }: any) => {
        const prov = row.original.province_name || row.original.provinsi;
        return <div className="text-center">{prov || '-'}</div>;
      } 
    },
    { 
      accessorKey: 'type', 
      header: () => <div className="text-center">Type</div>, 
      cell: ({ row }: any) => <div className="text-center">{row.original.type || row.original.tipe_kol || '-'}</div> 
    },
    { 
      accessorKey: 'campaign_start_date', 
      header: () => <div className="text-center">Campaign Start Date</div>, 
      cell: ({ row }: any) => {
        const dateVal = row.original.campaign_start_date;
        const formattedDate = dateVal ? String(dateVal).split('T')[0] : '-';
        return (
          <div className="text-center">
            <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#16171d] px-2.5 py-1 rounded-md border border-slate-200 dark:border-[#2e303a] inline-block whitespace-nowrap">
              {formattedDate}
            </span>
          </div>
        );
      } 
    },
    { 
      accessorKey: 'campaign_end_date', 
      header: () => <div className="text-center">Campaign End Date</div>, 
      cell: ({ row }: any) => {
        const dateVal = row.original.campaign_end_date;
        const formattedDate = dateVal ? String(dateVal).split('T')[0] : '-';
        return (
          <div className="text-center">
            <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#16171d] px-2.5 py-1 rounded-md border border-slate-200 dark:border-[#2e303a] inline-block whitespace-nowrap">
              {formattedDate}
            </span>
          </div>
        );
      } 
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
              style={{
                backgroundColor: isActive ? '#0d8a6a' : '#e11d48'
              }}
              className="cursor-pointer shadow-2xs transition-colors"
              title={isActive ? 'Nonaktifkan KOL' : 'Aktifkan KOL'}
            />
          </div>
        );
      } 
    },
    {
      accessorKey: 'actions',
      header: () => <div className="text-center">Action</div>,
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
    <div className="space-y-6 pb-24 md:pb-6 relative z-10 overflow-x-hidden text-sm">
      <div className={`w-full rounded-none shadow-sm border overflow-visible transition-colors duration-300 ${
        isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
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
                className={`w-full py-2.5 pl-10 pr-12 text-sm rounded-full border outline-none transition ${
                  isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-2xs'
                }`}
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

        {/* Tabel Data */}
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
                <Card key={item.id || item.uid || absoluteIndex} className={isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white shadow-md' : 'bg-white border-slate-200 text-slate-800 shadow-sm'}>
                  <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between space-y-0 border-b border-slate-100 dark:border-[#2e303a]">
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-800 dark:text-white">
                        ID: #{absoluteIndex}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400 mt-0.5">
                        Referral: <span className="font-mono font-bold text-slate-800 dark:text-white">{item.referral_code || item.kode_referral || '-'}</span>
                      </CardDescription>
                    </div>
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => handleToggleStatusKol(item)}
                      style={{
                        backgroundColor: isActive ? '#0d8a6a' : '#e11d48'
                      }}
                      className="cursor-pointer shadow-2xs transition-colors"
                    />
                  </CardHeader>
                  
                  <CardContent className="p-4 space-y-2.5 text-sm">
                    <div>
                      <p className="font-bold text-base text-slate-800 dark:text-white">{item.name || item.nama_kol}</p>
                      <p className="text-slate-400 text-xs">@{item.username || '-'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-[#2e303a]/60 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px] uppercase font-semibold">Whatsapp</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{item.whatsapp || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px] uppercase font-semibold">Type</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{item.type || item.tipe_kol || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px] uppercase font-semibold">Kota Asal</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{item.city_name || item.kota_asal || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px] uppercase font-semibold">Provinsi</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{provName}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-[#2e303a]/60 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px] uppercase font-semibold">Start Date</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#1f2028] px-2 py-0.5 rounded border border-slate-200 dark:border-[#2e303a] inline-block mt-0.5">
                          {item.campaign_start_date ? String(item.campaign_start_date).split('T')[0] : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px] uppercase font-semibold">End Date</span>
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
                        if (item.province_name || item.provinsi) {
                          fetchCitiesByProvinceName(item.province_name || item.provinsi);
                        }
                        setIsModalOpen(true);
                      }}
                      className="h-9 text-sm text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-900 dark:hover:bg-amber-950/30"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteItem(item)}
                      className="h-9 text-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
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
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 md:hidden pointer-events-auto">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleExportExcel();
          }}
          title="Export Excel"
          className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition cursor-pointer hover:bg-blue-700"
        >
          <FileSpreadsheet className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSelectedKolToEdit(null);
            setCityOptions([{ label: 'Pilih Provinsi terlebih dahulu', value: '' }]);
            setIsModalOpen(true);
          }}
          title="Tambah KOL"
          className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl active:scale-95 transition cursor-pointer hover:bg-emerald-700"
        >
          <Plus className="w-7 h-7" />
        </button>
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
              <Plus className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle className="text-base font-bold tracking-tight">
                {selectedKolToEdit ? 'Konfirmasi Perubahan?' : 'Simpan KOL Baru?'}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Apakah Anda yakin ingin {selectedKolToEdit ? 'memperbarui' : 'menambahkan'} data KOL <span className="font-semibold text-emerald-600">{pendingFormData?.name || pendingFormData?.nama_kol || pendingFormData?.nama}</span>?
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel 
              onClick={() => { setPendingFormData(null); setSelectedKolToEdit(null); }} 
              className="w-full sm:w-1/2 rounded-xl h-10 text-sm font-semibold"
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
              <AlertDialogDescription className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Tindakan ini bersifat permanen. Data KOL <span className="font-semibold text-slate-700 dark:text-slate-200">{deleteItem?.name || deleteItem?.nama_kol}</span> akan dihapus dari sistem.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel 
              onClick={() => setDeleteItem(null)}
              className="w-full sm:w-1/2 rounded-xl h-10 text-sm font-semibold border-slate-200 dark:border-[#2e303a] hover:bg-slate-100 dark:hover:bg-[#16171d]"
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