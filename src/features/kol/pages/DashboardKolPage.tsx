import { Award } from 'lucide-react';
import ReusableTable from '../../../components/ReusableTable';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { useKol } from '../hooks/useKol';

interface DashboardKolPageProps {
  isDarkMode?: boolean;
}

export default function DashboardKolPage({ isDarkMode = false }: DashboardKolPageProps) {
  const { kols } = useKol();

  // Data Mockup / Fallback jika kols dari API masih kosong
  const dummyTopKols = [
    { id: 1, nama_kol: 'Anggita Aulia', username: 'anggita78', kode_referral: 'SB527766', kota_asal: 'Yogyakarta', total_tiket: '480 Tiket', revenue: 'Rp 36.000.000' },
    { id: 2, nama_kol: 'Raffi Ahmad', username: 'rayyan', kode_referral: 'RKR44947', kota_asal: 'Yogyakarta', total_tiket: '390 Tiket', revenue: 'Rp 29.250.000' },
    { id: 3, nama_kol: 'Nova Hendri', username: 'noypr', kode_referral: 'UOJ42387', kota_asal: 'Sidoarjo', total_tiket: '280 Tiket', revenue: 'Rp 21.000.000' },
    { id: 4, nama_kol: 'Dewi Lestari', username: 'dewiles', kode_referral: 'DWL98211', kota_asal: 'Semarang', total_tiket: '175 Tiket', revenue: 'Rp 13.125.000' },
    { id: 5, nama_kol: 'Budi Santoso', username: 'budisan', kode_referral: 'BDS11293', kota_asal: 'Solo', total_tiket: '150 Tiket', revenue: 'Rp 11.250.000' },
  ];

  const sourceData = kols && kols.length > 0 ? kols : dummyTopKols;

  const topKolData = sourceData.slice(0, 5).map((item: any, index: number) => ({
    id: index + 1,
    nama_kol: item.nama_kol,
    username: item.username || '-',
    kode_referral: item.kode_referral || '-',
    kota_asal: item.kota_asal || '-',
    total_tiket: item.total_tiket || '320 Tiket',
    revenue: item.revenue || 'Rp 24.000.000',
  }));

  return (
    <div className="space-y-6 pb-24 md:pb-6 relative z-10 text-xs">
      
      {/* 1. BANNER KAMPANYE DI POJOK KIRI ATAS HALAMAN DASHBOARD */}
      <div className={`p-6 rounded-2xl shadow-sm border transition-colors duration-300 ${
        isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <h2 className="text-sm font-bold">Employee Campaign</h2>
          </div>
        </div>
      </div>

      {/* 2. BAGIAN TABEL TENGAH: TOP 5 KOL */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${
        isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="p-4 border-b border-slate-200 dark:border-[#2e303a] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xs flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              Top 5 KOL
            </h3>
          </div>
          <Award className="w-4 h-4 text-emerald-500" />
        </div>

        <div className="p-4">
          <ReusableTable
            data={topKolData}
            columns={[
              { 
                accessorKey: 'id', 
                header: 'Rank', 
                cell: ({ row }: any) => <span className="font-bold text-emerald-600">#{row.index + 1}</span> 
              },
              { 
                accessorKey: 'nama_kol', 
                header: 'Nama KOL', 
                cell: ({ row }: any) => <span className="font-semibold">{row.original.nama_kol}</span> 
              },
              { accessorKey: 'username', header: 'Username' },
              { accessorKey: 'kode_referral', header: 'Referral' },
              { accessorKey: 'kota_asal', header: 'Kota Asal' },
              { accessorKey: 'total_tiket', header: 'Tiket Terjual' },
              { 
                accessorKey: 'revenue', 
                header: 'Revenue', 
                cell: ({ row }: any) => <span className="font-bold text-emerald-600">{row.original.revenue}</span> 
              }
            ]}
            isDarkMode={isDarkMode}
            // Menambahkan renderCardHero/Mobile agar tampil di layar HP
            renderCardMobile={(item: any, absoluteIndex: number) => (
              <Card key={item.id} className={isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'}>
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-bold text-emerald-600">Rank #{absoluteIndex}</CardTitle>
                  <span className="text-[10px] font-semibold text-slate-400">{item.kota_asal}</span>
                </CardHeader>
                
                <CardContent className="p-4 pt-1 space-y-1 text-xs">
                  <p className="font-semibold text-sm">{item.nama_kol}</p>
                  <p className="text-slate-400 text-[11px]">@{item.username || '-'}</p>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-[#2e303a] mt-2">
                    <span className="text-slate-500">{item.total_tiket}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.revenue}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          />
        </div>
      </div>

    </div>
  );
}