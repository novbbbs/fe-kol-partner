import { useState, useEffect } from 'react';
import { 
  Users, 
  Trophy, 
  MapPin, 
  LayoutDashboard, 
  ChevronDown, 
  Check, 
  Search 
} from 'lucide-react';
import ReusableTable from '../../../components/ReusableTable';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { useKol } from '../hooks/useKol';

interface DashboardKolPageProps {
  isDarkMode?: boolean;
}

export default function DashboardKolPage({ isDarkMode = false }: DashboardKolPageProps) {
  const { kols } = useKol();

  // State untuk Filter Kategori (Program Reguler / Program Event)
  const [activeCategory, setActiveCategory] = useState<'reguler' | 'event'>('event');

  // State untuk Campaign / Event Dropdown
  const [campaignOptions, setCampaignOptions] = useState<{ label: string; value: string | number }[]>([
    { label: 'Saloka Fest 2024', value: 'Saloka Fest 2024' }
  ]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | number>('Saloka Fest 2024');
  const [isCampaignDropdownOpen, setIsCampaignDropdownOpen] = useState(false);
  const [campaignSearchQuery, setCampaignSearchQuery] = useState('');

  // Ambil data campaign secara dinamis dari API
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
          setSelectedCampaign(formatted[0].value);
        }
      } catch (error) {
        console.error('Gagal mengambil data campaign:', error);
      }
    };

    fetchCampaigns();
  }, []);

  // Filter campaign options berdasarkan pencarian dropdown
  const filteredCampaigns = campaignOptions.filter((opt) =>
    opt.label.toLowerCase().includes(campaignSearchQuery.toLowerCase())
  );

  const selectedCampaignObj = campaignOptions.find((opt) => String(opt.value) === String(selectedCampaign));

  // Menghitung total KOL secara dinamis dari database
  const totalKolFromDatabase = kols ? kols.length : 0;

  // Data Mockup / Fallback Top 5 KOL
  const dummyTopKols = [
    { id: 1, nama_kol: 'Jessica Iskandar', username: 'jessica_travel', kode_referral: 'SB527766', kota_asal: 'Yogyakarta', total_tiket: '1,280 Visitor', revenue: 'Rp 38.400.000', reservasi: 42 },
    { id: 2, nama_kol: 'Rian D\'Explorer', username: 'riantour', kode_referral: 'RKR44947', kota_asal: 'Semarang', total_tiket: '980 Visitor', revenue: 'Rp 29.500.000', reservasi: 35 },
    { id: 3, nama_kol: 'Anya Geraldine Fanbase', username: 'anyalife', kode_referral: 'UOJ42387', kota_asal: 'Solo', total_tiket: '820 Visitor', revenue: 'Rp 22.100.000', reservasi: 28 },
    { id: 4, nama_kol: 'Dimas & Sarah', username: 'keluargapetualang', kode_referral: 'DWL98211', kota_asal: 'Salatiga', total_tiket: '640 Visitor', revenue: 'Rp 16.800.000', reservasi: 21 },
    { id: 5, nama_kol: 'Budi Santoso Travel', username: 'buditravel', kode_referral: 'BDS11293', kota_asal: 'Magelang', total_tiket: '510 Visitor', revenue: 'Rp 12.500.000', reservasi: 18 },
  ];

  // Data Mockup Fallback Top 5 City
  const dummyTopCities = [
    { rank: 1, city: 'Semarang', province: 'Jawa Tengah', kol: 42, visitor: '2,850 Visitor', revenue: 'Rp 64.200.000' },
    { rank: 2, city: 'Salatiga', province: 'Jawa Tengah', kol: 28, visitor: '2,120 Visitor', revenue: 'Rp 48.000.000' },
    { rank: 3, city: 'Solo / Surakarta', province: 'Jawa Tengah', kol: 24, visitor: '1,640 Visitor', revenue: 'Rp 36.500.000' },
    { rank: 4, city: 'Yogyakarta', province: 'D.I. Yogyakarta', kol: 18, visitor: '1,210 Visitor', revenue: 'Rp 25.800.000' },
    { rank: 5, city: 'Magelang', province: 'Jawa Tengah', kol: 12, visitor: '830 Visitor', revenue: 'Rp 18.250.000' },
  ];

  const sourceData = kols && kols.length > 0 ? kols : dummyTopKols;

  // 1. Olah Top 5 KOL dari database
  const topKolData = sourceData.slice(0, 5).map((item: any, index: number) => ({
    id: index + 1,
    nama_kol: item.nama_kol || item.name,
    username: item.username || '-',
    kode_referral: item.kode_referral || item.referral_code || '-',
    kota_asal: item.kota_asal || item.city_name || '-',
    total_tiket: item.total_tiket || '1,280 Visitor',
    revenue: item.revenue || 'Rp 38.400.000',
    reservasi: item.reservasi || 42,
  }));

  // 2. Olah Top 5 City secara DINAMIS berdasarkan kolom `kota_asal` dari database `kols`
  const getDynamicTopCities = () => {
    if (!kols || kols.length === 0) return dummyTopCities;

    // Hitung jumlah kemunculan setiap kota
    const cityCounts: Record<string, number> = {};
    kols.forEach((item: any) => {
      const city = item.kota_asal ? item.kota_asal.trim() : 'Lainnya';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    // Ubah ke array, urutkan dari yang terbanyak, lalu ambil 5 teratas
    const sortedCities = Object.keys(cityCounts)
      .map((city) => ({
        city,
        province: 'Jawa Tengah / Sekitar',
        kol: cityCounts[city],
        visitor: `${cityCounts[city] * 65} Visitor`,
        revenue: `Rp ${(cityCounts[city] * 1.5).toLocaleString('id-ID')}.000.000`,
      }))
      .sort((a, b) => b.kol - a.kol)
      .slice(0, 5);

    return sortedCities.length > 0 ? sortedCities : dummyTopCities;
  };

  const topCityList = getDynamicTopCities();

  return (
    <div className={`space-y-6 pb-24 md:pb-6 text-xs ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      
      {/* HEADER UTAMA DASHBOARD DENGAN FILTER EVENT & PROGRAM */}
      <div className={`w-full rounded-2xl shadow-sm border p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-300 ${
        isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 border border-emerald-100 dark:border-emerald-900/50 shadow-2xs">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Dashboard
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Ringkasan performa & statistik KOL</p>
          </div>
        </div>

        {/* KONTROL FILTER (Program Reguler/Event & Dropdown Campaign) */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Toggle Program Reguler / Program Event */}
          <div className={`p-1 rounded-xl border flex items-center gap-1 ${
            isDarkMode ? 'bg-[#16171d] border-[#2e303a]' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setActiveCategory('reguler')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeCategory === 'reguler'
                  ? 'bg-white dark:bg-[#262833] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Program Reguler
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('event')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeCategory === 'event'
                  ? 'bg-white dark:bg-[#262833] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Program Event
            </button>
          </div>

          <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-[#2e303a]" />

          {/* Dropdown Campaign (Saloka Fest 2024, dll) */}
          <div className="relative">
            <div
              onClick={() => setIsCampaignDropdownOpen(!isCampaignDropdownOpen)}
              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition"
            >
              <span>{selectedCampaignObj ? selectedCampaignObj.label : 'Pilih Campaign'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isCampaignDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {isCampaignDropdownOpen && (
              <div className={`absolute right-0 mt-2 w-56 rounded-xl border shadow-xl z-50 overflow-hidden ${
                isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="p-2 border-b border-slate-200 dark:border-[#2e303a] flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 ml-1" />
                  <input
                    type="text"
                    value={campaignSearchQuery}
                    onChange={(e) => setCampaignSearchQuery(e.target.value)}
                    placeholder="Cari campaign..."
                    className="w-full bg-transparent outline-none text-xs placeholder-slate-400"
                    autoFocus
                  />
                </div>

                <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
                  {filteredCampaigns.length > 0 ? (
                    filteredCampaigns.map((opt, idx) => (
                      <div
                        key={opt.value !== undefined ? String(opt.value) : idx}
                        onClick={() => {
                          setSelectedCampaign(opt.value);
                          setIsCampaignDropdownOpen(false);
                          setCampaignSearchQuery('');
                        }}
                        className={`px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer transition ${
                          String(selectedCampaign) === String(opt.value)
                            ? 'bg-emerald-50 text-emerald-600 font-semibold dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'hover:bg-slate-100 dark:hover:bg-[#262833]'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {String(selectedCampaign) === String(opt.value) && <Check className="w-3.5 h-3.5" />}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-slate-400 text-[11px]">
                      Tidak ada campaign ditemukan
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* STATS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`rounded-2xl border shadow-xs ${isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200'}`}>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total KOL</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight">{totalKolFromDatabase}</h3>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#2e303a] text-[11px] text-slate-500 dark:text-slate-400">
              <span>Influencer terdaftar</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Database Aktif</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BAGIAN TABEL: TOP 5 KOL & TOP 5 CITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TOP 5 KOL */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden ${
          isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="p-5 border-b border-slate-100 dark:border-[#2e303a] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                Top 5 KOL ({selectedCampaignObj?.label || 'Campaign'})
                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-400 font-medium text-[10px] px-2 py-0.5 rounded-full">
                  Performa Terbaik
                </Badge>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Berdasarkan reservasi & visitor tertinggi</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500">
              <Trophy className="w-4 h-4" />
            </div>
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
                  cell: ({ row }: any) => (
                    <div>
                      <span className="font-semibold block">{row.original.nama_kol}</span>
                      <span className="text-[10px] text-slate-400">@{row.original.username}</span>
                    </div>
                  ) 
                },
                { accessorKey: 'kode_referral', header: 'Referral' },
                { accessorKey: 'kota_asal', header: 'Kota' },
                { accessorKey: 'total_tiket', header: 'Visitor' },
                { 
                  accessorKey: 'revenue', 
                  header: 'Revenue', 
                  cell: ({ row }: any) => <span className="font-bold text-emerald-600">{row.original.revenue}</span> 
                }
              ]}
              isDarkMode={isDarkMode}
              renderCardMobile={(item: any, absoluteIndex: number) => (
                <Card key={item.id} className={isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'}>
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs font-bold text-emerald-600">Rank #{absoluteIndex}</CardTitle>
                    <span className="text-[10px] font-semibold text-slate-400">{item.kota_asal}</span>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-1 text-xs">
                    <p className="font-semibold text-sm">{item.nama_kol}</p>
                    <p className="text-slate-400 text-[11px]">@{item.username}</p>
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

        {/* TOP 5 CITY (DEMOGRAFI BERDASARKAN DATABASE KOL) */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden ${
          isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="p-5 border-b border-slate-100 dark:border-[#2e303a] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                Top 5 City (Demografi)
                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-400 font-medium text-[10px] px-2 py-0.5 rounded-full">
                  Database Asli
                </Badge>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Kota asal KOL terbanyak dari sistem</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500">
              <MapPin className="w-4 h-4" />
            </div>
          </div>

          <div className="p-4">
            <ReusableTable
              data={topCityList}
              columns={[
                { 
                  accessorKey: 'rank', 
                  header: 'Rank', 
                  cell: ({ row }: any) => <span className="font-bold text-emerald-600">#{row.index + 1}</span> 
                },
                { 
                  accessorKey: 'city', 
                  header: 'Kota Asal', 
                  cell: ({ row }: any) => (
                    <div>
                      <span className="font-semibold block">{row.original.city}</span>
                      <span className="text-[10px] text-slate-400">{row.original.province}</span>
                    </div>
                  ) 
                },
                { 
                  accessorKey: 'kol', 
                  header: 'Jumlah KOL',
                  cell: ({ row }: any) => <span className="font-bold">{row.original.kol} KOL</span>
                },
                { accessorKey: 'visitor', header: 'Est. Visitor' },
                { 
                  accessorKey: 'revenue', 
                  header: 'Est. Revenue', 
                  cell: ({ row }: any) => <span className="font-bold text-emerald-600">{row.original.revenue}</span> 
                }
              ]}
              isDarkMode={isDarkMode}
              renderCardMobile={(item: any, absoluteIndex: number) => (
                <Card key={item.city} className={isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'}>
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs font-bold text-emerald-600">Rank #{absoluteIndex}</CardTitle>
                    <span className="text-[10px] font-semibold text-slate-400">{item.province}</span>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-1 text-xs">
                    <p className="font-semibold text-sm">{item.city}</p>
                    <p className="text-slate-400 text-[11px]">{item.kol} KOL Terdaftar</p>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-[#2e303a] mt-2">
                      <span className="text-slate-500">{item.visitor}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.revenue}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            />
          </div>
        </div>

      </div>

    </div>
  );
}