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
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '../../../components/ui/dropdown-menu';

import StatsCard from '../../../components/StatsCard'; 
import { campaignApi, dashboardApi } from '../../../components/apiService'; 

interface DashboardPageProps {
  isDarkMode?: boolean;
}

export default function DashboardPage({ isDarkMode = false }: DashboardPageProps) {
  const [activeCategory, setActiveCategory] = useState<'reguler' | 'event'>('reguler');
  const [campaignOptions, setCampaignOptions] = useState<{ label: string; value: string | number }[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | number>('');
  const [campaignSearchQuery, setCampaignSearchQuery] = useState('');

  const [dashboardData, setDashboardData] = useState<any>(null);

  // 1. Fetch Campaign Menggunakan campaignApi Terpusat
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await campaignApi.getAll();
        const rawData = Array.isArray(response) ? response : response.data || [];
        
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

  // 2. Fetch Dashboard Summary Menggunakan dashboardApi Terpusat
  useEffect(() => {
    const fetchDashboardSummary = async () => {
      try {
        const campaignName = activeCategory === 'event' && selectedCampaign ? String(selectedCampaign) : undefined;
        const response = await dashboardApi.getSummary(activeCategory, campaignName);
        
        if (response) {
          setDashboardData(response);
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

  // --- FILTER TOP 5 KOL ---
  const rawTopKol = dashboardData?.top_5_kol || [];
  const activeTopKol = rawTopKol.filter((item: any) => {
    if (item.status === undefined || item.status === null) return true;
    const statusVal = item.status;
    const statusStr = String(statusVal || '').toLowerCase().trim();
    const isExplicitlyInactive = 
      statusVal === 0 || 
      statusVal === '0' || 
      statusVal === false || 
      statusStr === 'non-active' || 
      statusStr === 'nonaktif' || 
      statusStr === 'inactive';
    return !isExplicitlyInactive;
  });

  const topKolData = activeTopKol.map((item: any, index: number) => ({
    id: item.id || index + 1,
    nama_kol: item.nama_kol || item.name || 'Influencer',
    username: item.username || 'username',
    kota_asal: item.kota_asal || item.city_name || 'Kota',
    total_tiket: `${item.total_visitor || 1280} Visitor`,
    revenue: `Rp ${((item.total_visitor || 1280) * 30000).toLocaleString('id-ID')}`,
    reservasi: item.total_reservasi || 35,
    initials: (item.nama_kol || item.name || 'IN').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
    avatarBg: ['bg-amber-100 text-amber-700', 'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700'][index % 5]
  }));

  // --- FILTER TOP 5 CITY ---
  const rawTopCity = dashboardData?.top_5_city || [];
  const topCityList = rawTopCity.map((item: any, index: number) => {
    const visitorVal = item.total_visitor || (item.total_kol * 650);
    return {
      rank: index + 1,
      city: item.city_name || item.kota_asal || 'Kota',
      province: item.province_name || 'Jawa Timur',
      kol: item.total_kol || 0,
      visitor: `${visitorVal} Visitor`,
      revenue: `Rp ${(visitorVal * 30000).toLocaleString('id-ID')}`
    };
  });

  return (
    <div className={`space-y-3 m-0 p-0 pt-0 pb-24 md:pb-6 text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      
      {/* HEADER UTAMA DASHBOARD - Padding diperkecil di mobile */}
      <div className={`w-full rounded-none shadow-sm border-x-0 border-t-0 border-b py-2.5 px-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-2.5 transition-colors duration-300 ${
        isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-sm shrink-0">
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className={`text-sm md:text-base font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Dashboard KOL
            </h2>
            {/* Kembali tebal (font-semibold) */}
            <span className="text-[11px] bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded-md font-semibold">
              {activeCategory === 'event' ? (selectedCampaignObj?.label || 'Event') : 'Reguler'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <div className={`p-0.5 rounded-xl border flex items-center gap-1 ${
            isDarkMode ? 'bg-[#16171d] border-[#2e303a]' : 'bg-slate-50 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setActiveCategory('reguler')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeCategory === 'reguler'
                  ? 'bg-white dark:bg-[#262833] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Program Reguler
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger 
                onClick={() => setActiveCategory('event')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 outline-none ${
                  activeCategory === 'event'
                    ? 'bg-white dark:bg-[#262833] text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 bg-transparent border-0'
                }`}
              >
                <span>Program Event</span>
                {activeCategory === 'event' && (
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1 py-0.5 rounded font-semibold">
                    {selectedCampaignObj ? selectedCampaignObj.label : 'Pilih'}
                  </span>
                )}
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </DropdownMenuTrigger>

              <DropdownMenuContent className={`w-56 rounded-xl border shadow-xl z-30 text-sm ${
                isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div 
                  className="p-2 border-b border-slate-200 dark:border-[#2e303a] flex items-center gap-2"
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <Search className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
                  <input
                    type="text"
                    value={campaignSearchQuery}
                    onChange={(e) => setCampaignSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    placeholder="Cari campaign..."
                    className="w-full bg-transparent outline-none text-sm placeholder-slate-400"
                    autoFocus
                  />
                </div>
                <div 
                  className="max-h-48 overflow-y-auto p-1 space-y-0.5"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {filteredCampaigns.length > 0 ? (
                    filteredCampaigns.map((opt: any, idx: number) => (
                      <DropdownMenuItem
                        key={idx}
                        onClick={() => {
                          setActiveCategory('event');
                          setSelectedCampaign(opt.value);
                        }}
                        className="px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-[#262833] text-sm font-semibold"
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

      <div className="px-3 md:px-6 space-y-3">
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <StatsCard
            title="Total KOL"
            value={totalKolCount}
            icon={<Users className="w-3.5 h-3.5" />}
            iconBgColor="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600"
            footerText="Influencer aktif"
            footerValue="100% Aktif"
            isDarkMode={isDarkMode}
          />

          <StatsCard
            title="Total Reservasi"
            value={totalReservasiCount}
            icon={<Calendar className="w-3.5 h-3.5" />}
            iconBgColor="bg-amber-50 dark:bg-amber-950/50 text-amber-600"
            footerText="Aktual / Target"
            footerValue="1,850"
            isDarkMode={isDarkMode}
            extraContent={
              <div className="flex items-baseline gap-1">
                <span className="text-[11px] text-slate-400 font-medium">/ 1,850</span>
              </div>
            }
          />

          <StatsCard
            title="Total Visitor"
            value={totalVisitorCount}
            icon={<Eye className="w-3.5 h-3.5" />}
            iconBgColor="bg-blue-50 dark:bg-blue-950/50 text-blue-600"
            footerText="Scan tiket terverifikasi"
            footerValue={`${totalVisitorCount} Pax`}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* GRID KARTU KUSTOM: TOP 5 KOL & TOP 5 CITY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          
          {/* TOP 5 KOL */}
          <div className={`rounded-xl border shadow-sm overflow-hidden ${
            isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="p-3 border-b border-slate-100 dark:border-[#2e303a] flex items-center justify-between">
              <div>
                <h3 className="text-xs md:text-base font-bold flex items-center gap-2">
                  Top 5 KOL
                </h3>
                <p className="text-[10px] md:text-[11px] text-slate-400 mt-0.5">Berdasarkan reservasi & visitor tertinggi</p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 shrink-0">
                <Trophy className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="p-1.5 space-y-1">
              {topKolData.length > 0 ? (
                topKolData.map((item: any, idx: number) => (
                  <div key={item.id} className="p-2 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 hover:bg-slate-50/60 dark:hover:bg-[#16171d]/60 transition border-b sm:border-b-0 border-slate-100 dark:border-[#2e303a]/50 last:border-none">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Nomor peringkat kembali tebal (font-bold) */}
                      <div className="w-5 h-5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-900/50">
                        {idx + 1}
                      </div>
                      <div className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 ${item.avatarBg}`}>
                        {item.initials}
                      </div>
                      <div className="text-left min-w-0">
                        {/* Nama KOL kembali tebal (font-bold) */}
                        <h4 className="font-bold text-slate-800 dark:text-white text-xs truncate">{item.nama_kol}</h4>
                        <p className="text-[10px] text-slate-400 truncate">@{item.username}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 sm:flex sm:items-center sm:justify-end gap-1.5 text-center sm:text-right pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-[#2e303a]">
                      <div className="bg-slate-50 dark:bg-[#16171d] sm:bg-transparent p-0.5 sm:p-0 rounded">
                        {/* Angka reservasi kembali tebal */}
                        <span className="font-bold block text-slate-800 dark:text-white text-xs">{item.reservasi}</span>
                        <span className="text-[9px] text-slate-400 uppercase">Reservasi</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#16171d] sm:bg-transparent p-0.5 sm:p-0 rounded">
                        {/* Angka visitor kembali tebal */}
                        <span className="font-bold block text-slate-800 dark:text-white text-xs">{item.total_tiket}</span>
                        <span className="text-[9px] text-slate-400 uppercase">Visitor</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#16171d] sm:bg-transparent p-0.5 sm:p-0 rounded col-span-3 sm:col-span-1 sm:w-24">
                        {/* Pendapatan kembali tebal */}
                        <span className="font-bold block text-emerald-600 dark:text-emerald-400 text-xs truncate">{item.revenue}</span>
                        <span className="text-[9px] text-slate-400 uppercase">Pendapatan</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-slate-400 text-xs">
                  Belum ada data KOL untuk kategori ini.
                </div>
              )}
            </div>
          </div>

          {/* TOP 5 CITY */}
          <div className={`rounded-xl border shadow-sm overflow-hidden ${
            isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="p-3 border-b border-slate-100 dark:border-[#2e303a] flex items-center justify-between">
              <div>
                <h3 className="text-xs md:text-base font-bold flex items-center gap-2">
                  Top 5 City 
                </h3>
                <p className="text-[10px] md:text-[11px] text-slate-400 mt-0.5">Kota asal audiens & visitor KOL terbanyak</p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500 shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="p-1.5 space-y-1">
              {topCityList.length > 0 ? (
                topCityList.map((item: any) => (
                  <div key={item.city} className="p-2 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 hover:bg-slate-50/60 dark:hover:bg-[#16171d]/60 transition border-b sm:border-b-0 border-slate-100 dark:border-[#2e303a]/50 last:border-none">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Peringkat kota kembali tebal */}
                      <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-900/50">
                        {item.rank}
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 font-bold flex items-center justify-center text-xs shrink-0">
                        <MapPin className="w-3 h-3" />
                      </div>
                      <div className="text-left min-w-0">
                        {/* Nama kota kembali tebal */}
                        <h4 className="font-bold text-slate-800 dark:text-white text-xs truncate">{item.city}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{item.province}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 sm:flex sm:items-center sm:justify-end gap-1.5 text-center sm:text-right pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-[#2e303a]">
                      <div className="bg-slate-50 dark:bg-[#16171d] sm:bg-transparent p-0.5 sm:p-0 rounded">
                        <span className="font-bold block text-slate-800 dark:text-white text-xs">{item.kol} KOL</span>
                        <span className="text-[9px] text-slate-400 uppercase">Aktif</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#16171d] sm:bg-transparent p-0.5 sm:p-0 rounded">
                        <span className="font-bold block text-slate-800 dark:text-white text-xs">{item.visitor}</span>
                        <span className="text-[9px] text-slate-400 uppercase">Visitor</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#16171d] sm:bg-transparent p-0.5 sm:p-0 rounded col-span-3 sm:col-span-1 sm:w-24">
                        <span className="font-bold block text-emerald-600 dark:text-emerald-400 text-xs truncate">{item.revenue}</span>
                        <span className="text-[9px] text-slate-400 uppercase">Total Tiket</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-slate-400 text-xs">
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