import { useState, useEffect } from 'react';
import { FileSpreadsheet, Filter, Search, CalendarCheck } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

import ReusableTable from '@/components/ReusableTable';
import FilterDropdown from '@/components/FilterDropdown';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useReservasi } from '@/features/reservasi/hooks/useReservasi';
import type { Reservasi } from '@/features/reservasi/types/reservasi.type';

interface ReservasiPageProps {
  isDarkMode?: boolean;
}

export default function ReservasiPage({ isDarkMode = false }: ReservasiPageProps) {
  const { reservasis, refetch } = useReservasi();

  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(inputValue), 400);
    return () => clearTimeout(handler);
  }, [inputValue]);

  useEffect(() => {
    refetch({ 
      search: debouncedSearch, 
      status: statusFilter === 'Semua' ? undefined : statusFilter, 
      startDate: startDateFilter, 
      endDate: endDateFilter 
    });
  }, [debouncedSearch, statusFilter, startDateFilter, endDateFilter, refetch]);

  const filteredData = reservasis;

  const handleExportExcel = () => {
    try {
      const worksheetData = filteredData.map((item: Reservasi, index: number) => ({
        No: index + 1,
        'ID Order': item.id_order,
        'Kode Booking': item.kode_booking,
        Nama: item.nama,
        Email: item.email,
        'Nama KOL': item.nama_kol,
        'Type KOL': item.type_kol,
        'Total Bayar': item.total_bayar,
        Qty: item.qty,
        Kedatangan: item.kedatangan,
        Status: item.status,
      }));
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Reservasi');
      XLSX.writeFile(workbook, `Data_Reservasi_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('Berhasil!', { description: 'File Excel reservasi berhasil didownload.' });
    } catch (error) {
      toast.error('Gagal!', { description: 'Terjadi kesalahan saat mengeksport data.' });
    }
  };

  const columns = [
    { accessorKey: 'id', header: () => <div className="text-center">ID</div>, cell: ({ row }: any) => <div className="text-center font-normal text-slate-700 dark:text-slate-300">{row.index + 1}</div>, label: 'ID' },
    { accessorKey: 'id_order', header: () => <div className="text-center">ID Order</div>, cell: ({ row }: any) => <div className="text-center font-mono text-xs font-semibold text-slate-800 dark:text-white">{row.original.id_order}</div>, label: 'ID Order' },
    { accessorKey: 'kode_booking', header: () => <div className="text-center">Kode Booking</div>, cell: ({ row }: any) => <div className="text-center"><span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-900">{row.original.kode_booking}</span></div>, label: 'Kode Booking' },
    { accessorKey: 'nama', header: () => <div className="text-left -ml-2">Nama</div>, cell: ({ row }: any) => <div className="text-left -ml-2 font-medium text-slate-800 dark:text-white">{row.original.nama}</div>, label: 'Nama' },
    { accessorKey: 'email', header: () => <div className="text-left -ml-2">Email</div>, cell: ({ row }: any) => <div className="text-left -ml-2 text-slate-600 dark:text-slate-400">{row.original.email}</div>, label: 'Email' },
    { accessorKey: 'nama_kol', header: () => <div className="text-left -ml-2">Nama KOL</div>, cell: ({ row }: any) => <div className="text-left -ml-2 font-medium text-slate-700 dark:text-slate-300">{row.original.nama_kol}</div>, label: 'Nama KOL' },
    { accessorKey: 'type_kol', header: () => <div className="text-center">Type KOL</div>, cell: ({ row }: any) => <div className="text-center"><Badge variant="outline" className="text-[11px]">{row.original.type_kol}</Badge></div>, label: 'Type KOL' },
    { accessorKey: 'total_bayar', header: () => <div className="text-right">Total Bayar</div>, cell: ({ row }: any) => <div className="text-right font-mono text-slate-800 dark:text-white">Rp {Number(row.original.total_bayar || 0).toLocaleString('id-ID')}</div>, label: 'Total Bayar' },
    { accessorKey: 'qty', header: () => <div className="text-center">Qty</div>, cell: ({ row }: any) => <div className="text-center font-semibold">{row.original.qty}</div>, label: 'Qty' },
    { accessorKey: 'kedatangan', header: () => <div className="text-center">Kedatangan</div>, cell: ({ row }: any) => <div className="text-center font-mono text-xs">{row.original.kedatangan}</div>, label: 'Kedatangan' },
    { 
      accessorKey: 'status', 
      header: () => <div className="text-center">Status</div>, 
      cell: ({ row }: any) => {
        const st = String(row.original.status || '').toLowerCase();
        const isSuccess = st === 'success' || st === '1' || st === 'active';
        return (
          <div className="flex items-center justify-center">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
              isSuccess ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400'
            }`}>
              {row.original.status}
            </span>
          </div>
        );
      },
      label: 'Status' 
    }
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-6 relative z-10 overflow-x-hidden text-sm">
      <div className={`w-full rounded-t-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
        
        <PageHeader 
          icon={<CalendarCheck className="w-5 h-5" />}
          title="Data Reservasi"
          isDarkMode={isDarkMode}
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
                placeholder="Cari booking/nama..."
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
                  { label: 'Success', value: 'Success' },
                  { label: 'Pending', value: 'Pending' },
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
          </div>
        </PageHeader>

        <div className="w-full">
          <ReusableTable
            data={filteredData}
            columns={columns}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
}