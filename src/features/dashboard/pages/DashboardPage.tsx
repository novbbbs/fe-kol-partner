import { useState, useEffect } from 'react';
import { 
  Users, 
  Trophy, 
  MapPin, 
  LayoutDashboard, 
  ChevronDown, 
  Check, 
  Search,
  Calendar,
  Eye
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '../../../components/ui/dropdown-menu';

// ✅ IMPORT API CUSTOM KITA DI SINI
import api from '../../../lib/api'; 
// (Catatan: Sesuaikan path impor ini jika lokasi file api.ts Anda berbeda. 
//  Misalnya jika api.ts ada di 'src/lib/api.ts', naikkan path-nya sesuai struktur folder Anda).

interface DashboardPageProps {
  isDarkMode?: boolean;
}

export default function DashboardPage({ isDarkMode = false }: DashboardPageProps) {
  const [activeCategory, setActiveCategory] = useState<'reguler' | 'event'>('reguler');
  const [campaignOptions, setCampaignOptions] = useState<{ label: string; value: string | number }[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | number>('');
  const [campaignSearchQuery, setCampaignSearchQuery] = useState('');

  const [dashboardData, setDashboardData] = useState<any>(null);

  // Ambil daftar campaign aktif dari database (Hanya murni Event, TANPA Reguler)
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        // ✅ GUNAKAN api DARI FILE CUSTOM KITA, BUKAN axios MENTAH
        const response = await api.get('/campaigns');
        const rawData = Array.isArray(response.data) ? response.data : response.data.data || [];
        
        const activeCampaigns = rawData.filter((item: any) => {
          const statusVal = item.status;
          const statusStr = String(statusVal || '').toLowerCase().trim();
          const nameCheck = String(item.campaign_name || item.name || item.title || '').toLowerCase();
          
          const isActive = statusVal === 1 || statusVal === '1' || statusStr === 'active' || statusStr === 'aktif';
          return isActive && !nameCheck.includes('reguler');
        });

        const formatted = activeCampaigns.map((item: any) => ({
          label: item.campaign_name || item.name || item.title,
          value: item.campaign_name || item.name || item.title,
        }));

        if (formatted.length > 0) {
          setCampaignOptions(formatted);
          if (!selectedCampaign) {
            setSelectedCampaign(formatted[0].value);
          }
        }
      } catch (error) {
        console.error('Gagal mengambil data campaign:', error);
        setCampaignOptions([
          { label: 'Helloween', value: 'Helloween' },
          { label: 'Sakura', value: 'Sakura' }
        ]);
        setSelectedCampaign('Helloween');
      }
    };

    fetchCampaigns();
  }, []);

  // Ambil data dashboard dari Backend API Laravel
  useEffect(() => {
    const fetchDashboardSummary = async () => {
      try {
        // ✅ GUNAKAN api DARI FILE CUSTOM KITA, DAN HANYA TULIS ENDPOINTNYA (Base URL sudah diurus api.ts)
        let url = `/dashboard/summary?type=${activeCategory}`;
        
        if (activeCategory === 'event' && selectedCampaign) {
          url += `&campaign=${encodeURIComponent(String(selectedCampaign))}`;
        }

        const response = await api.get(url);
        if (response.data) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error('Gagal mengambil data summary dashboard:', error);
      }
    };

    fetchDashboardSummary();
  }, [activeCategory, selectedCampaign]);

  const filteredCampaigns = campaignOptions.filter((opt: any) =>
    opt.label.toLowerCase().includes(campaignSearchQuery.toLowerCase())
  );

  const selectedCampaignObj = campaignOptions.find((opt: any) => String(opt.value) === String(selectedCampaign));

  const totalKolCount = dashboardData?.metrics?.total_kol ?? 0;
  const totalReservasiCount = dashboardData?.metrics?.total_reservasi ?? 0;
  const totalVisitorCount = dashboardData?.metrics?.total_visitor ?? 0;

  const rawTopKol = dashboardData?.top_5_kol || [];
  const topKolData = rawTopKol.map((item: any, index: number) => ({
    id: item.id || index + 1,
    nama_kol: item.nama_kol || item.name || 'Influencer',
    username: item.username || 'username',
    kota_asal: item.kota_asal || item.city_name || 'Kota',
    total_tiket: `${1280} Visitor`,
    revenue: `Rp ${(1280 * 30000).toLocaleString('id-ID')}`,
    reservasi: 35,
    initials: (item.nama_kol || item.name || 'IN').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
    avatarBg: ['bg-amber-100 text-amber-700', 'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700'][index % 5]
  }));

  const rawTopCity = dashboardData?.top_5_city || [];
  const topCityList = rawTopCity.map((item: any, index: number) => ({
    rank: index + 1,
    city: item.city_name || item.kota_asal || 'Kota',
    province: item.province_name || 'Jawa Timur',
    kol: item.total_kol || 0,
    visitor: `${item.total_visitor || (item.total_kol * 650)} Visitor`,
    revenue: `Rp ${((item.total_visitor || (item.total_kol * 650)) * 30000).toLocaleString('id-ID')}`
  }));

  return (
    <div className={`space-y-6 m-0 p-0 pt-0 pb-24 md:pb-6 text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      
      {/* HEADER UTAMA DASHBOARD */}
      <div className={`w-full rounded-none shadow-sm border-x-0 border-t-0 border-b p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-300 ${
        isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm shrink-0">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className={`text-base font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Dashboard KOL
            </h2>
            {/* Badge Status Kategori / Nama Event di sebelah judul */}
            <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-400 px-2.5 py-1 rounded-md font-semibold">
              {activeCategory === 'event' ? (selectedCampaignObj?.label || 'Event') : 'Reguler'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Kategori Program (Reguler / Event) */}
          <div className={`p-1.5 rounded-xl border flex items-center gap-1.5 ${
            isDarkMode ? 'bg-[#16171d] border-[#2e303a]' : 'bg-slate-50 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setActiveCategory('reguler')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition cursor-pointer ${
                activeCategory === 'reguler'
                  ? 'bg-white dark:bg-[#262833] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Program Reguler
            </button>

            {/* Tombol Program Event menggunakan DropdownMenu shadcn tanpa asChild */}
            <DropdownMenu>
              <DropdownMenuTrigger 
                onClick={() => setActiveCategory('event')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition cursor-pointer flex items-center gap-2 outline-none ${
                  activeCategory === 'event'
                    ? 'bg-white dark:bg-[#262833] text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 bg-transparent border-0'
                }`}
              >
                <span>Program Event</span>
                {activeCategory === 'event' && (
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-semibold">
                    {selectedCampaignObj ? selectedCampaignObj.label : 'Pilih'}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 ml-0.5" />
              </DropdownMenuTrigger>

              <DropdownMenuContent className={`w-56 rounded-xl border shadow-xl z-30 text-sm ${
                isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="p-2.5 border-b border-slate-200 dark:border-[#2e303a] flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400 ml-1" />
                  <input
                    type="text"
                    value={campaignSearchQuery}
                    onChange={(e) => setCampaignSearchQuery(e.target.value)}
                    placeholder="Cari campaign..."
                    className="w-full bg-transparent outline-none text-sm placeholder-slate-400"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
                  {filteredCampaigns.length > 0 ? (
                    filteredCampaigns.map((opt: any, idx: number) => (
                      <DropdownMenuItem
                        key={idx}
                        onClick={() => {
                          setActiveCategory('event');
                          setSelectedCampaign(opt.value);
                        }}
                        className="px-3 py-2.5 rounded-lg flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-[#262833] text-sm"
                      >
                        <span>{opt.label}</span>
                        {activeCategory === 'event' && String(selectedCampaign) === String(opt.value) && (
                          <Check className="w-4 h-4 text-emerald-600" />
                        )}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-3 text-center text-slate-400 text-sm">Campaign tidak ditemukan</div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 space-y-6">
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <Card className={`rounded-2xl border shadow-xs ${isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200'}`}>
            <CardContent className="py-4 px-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total KOL</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight leading-tight">{totalKolCount}</h3>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#2e303a] text-xs text-slate-500">
                <span className="font-bold text-emerald-600">100% Aktif</span>
              </div>
            </CardContent>
          </Card>

          <Card className={`rounded-2xl border shadow-xs ${isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200'}`}>
            <CardContent className="py-4 px-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="w-16 bg-slate-100 dark:bg-[#2e303a] h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '76.8%' }} />
                </div>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block leading-none mb-1">Total Reservasi</span>
                <h3 className="text-2xl font-bold tracking-tight leading-tight">{totalReservasiCount}</h3>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#2e303a] text-xs text-slate-500">
                <span>Status</span>
                <span className="font-bold text-emerald-600">Aktif</span>
              </div>
            </CardContent>
          </Card>

          <Card className={`rounded-2xl border shadow-xs ${isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200'}`}>
            <CardContent className="py-4 px-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                  <Eye className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Visitor</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight leading-tight">{totalVisitorCount}</h3>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#2e303a] text-xs text-slate-500">
                <span>Scan tiket terverifikasi</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{totalVisitorCount} Pax</span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* GRID KARTU KUSTOM: TOP 5 KOL & TOP 5 CITY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* TOP 5 KOL */}
          <div className={`rounded-2xl border shadow-sm overflow-hidden ${
            isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="p-4 md:p-5 border-b border-slate-100 dark:border-[#2e303a] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  Top 5 KOL
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Berdasarkan reservasi & visitor tertinggi</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500">
                <Trophy className="w-5 h-5" />
              </div>
            </div>

            <div className="p-3 space-y-2">
              {topKolData.length > 0 ? (
                topKolData.map((item: any, idx: number) => (
                  <div key={item.id} className="p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-[#16171d]/60 transition border-b sm:border-b-0 border-slate-100 dark:border-[#2e303a]/50 last:border-none">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold text-sm flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-900/50">
                        {idx + 1}
                      </div>
                      <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-sm shrink-0 ${item.avatarBg}`}>
                        {item.initials}
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.nama_kol}</h4>
                        <p className="text-xs text-slate-400">@{item.username} • {item.kota_asal}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-[#2e303a]">
                      <div>
                        <span className="font-bold block text-slate-800 dark:text-white text-sm">{item.reservasi}</span>
                        <span className="text-[11px] text-slate-400 uppercase">Reservasi</span>
                      </div>
                      <div>
                        <span className="font-bold block text-slate-800 dark:text-white text-sm">{item.total_tiket}</span>
                        <span className="text-[11px] text-slate-400 uppercase">Visitor</span>
                      </div>
                      <div className="sm:w-32 text-right">
                        <span className="font-bold block text-emerald-600 dark:text-emerald-400 text-sm">{item.revenue}</span>
                        <span className="text-[11px] text-slate-400 uppercase">Pendapatan</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-sm">
                  Belum ada data KOL untuk kategori ini.
                </div>
              )}
            </div>
          </div>

          {/* TOP 5 CITY */}
          <div className={`rounded-2xl border shadow-sm overflow-hidden ${
            isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="p-4 md:p-5 border-b border-slate-100 dark:border-[#2e303a] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  Top 5 City 
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Kota asal audiens & visitor KOL terbanyak</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500">
                <MapPin className="w-5 h-5" />
              </div>
            </div>

            <div className="p-3 space-y-2">
              {topCityList.length > 0 ? (
                topCityList.map((item: any) => (
                  <div key={item.city} className="p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-[#16171d]/60 transition border-b sm:border-b-0 border-slate-100 dark:border-[#2e303a]/50 last:border-none">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-900/50">
                        {item.rank}
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 font-bold flex items-center justify-center text-sm shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.city}</h4>
                        <p className="text-xs text-slate-400">{item.province}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-[#2e303a]">
                      <div>
                        <span className="font-bold block text-slate-800 dark:text-white text-sm">{item.kol} KOL</span>
                        <span className="text-[11px] text-slate-400 uppercase">Aktif</span>
                      </div>
                      <div>
                        <span className="font-bold block text-slate-800 dark:text-white text-sm">{item.visitor}</span>
                        <span className="text-[11px] text-slate-400 uppercase">Visitor</span>
                      </div>
                      <div className="sm:w-32 text-right">
                        <span className="font-bold block text-emerald-600 dark:text-emerald-400 text-sm">{item.revenue}</span>
                        <span className="text-[11px] text-slate-400 uppercase">Total Tiket</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-sm">
                  Belum ada data kota untuk kategori ini.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}