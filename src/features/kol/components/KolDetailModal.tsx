import { useState, useEffect } from 'react';
import { kolService } from '../services/kol.service';
import { Eye, X } from 'lucide-react';

interface KolHistoryItem {
  id: number;
  name: string;
  username: string;
  kode_referral: string;
  whatsapp: string;
  city_name: string;
  province_name: string;
  type: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  isDarkMode?: boolean;
}

export default function KolDetailModal({ isOpen, onClose, username, isDarkMode = false }: Props) {
  const [histories, setHistories] = useState<KolHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && username) {
      setLoading(true);
      kolService.getKolHistory(username)
        .then((data) => {
          setHistories(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Gagal mengambil log history:', err);
          setLoading(false);
        });
    }
  }, [isOpen, username]);

  if (!isOpen) return null;

  const profile = histories.length > 0 ? histories[0] : null;

  return (
    /* Tambahkan kelas 'dark' secara eksplisit di sini agar seluruh sub-elemen yang menggunakan dark: berfungsi */
    <div className={`fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto ${isDarkMode ? 'dark' : ''}`}>
      
      {/* Container Modal Utama */}
      <div className="rounded-3xl p-6 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border transition-colors duration-300 relative bg-white dark:bg-[#1f2028] text-slate-900 dark:text-white border-slate-200 dark:border-[#2e303a]">
        
        {/* Header Modal */}
        <div className="pb-4 mb-4 border-b flex items-center justify-between border-slate-100 dark:border-[#2e303a]">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Eye className="w-5 h-5" />
          </div>

          <div className="flex-1 text-center px-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Detail & Log History KOL
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Informasi detail dan riwayat kampanye KOL {profile?.name || username}.
            </p>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition cursor-pointer hover:bg-slate-100 text-slate-500 hover:text-slate-800 dark:hover:bg-[#2e303a] dark:text-slate-400 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Konten Scrollable */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          
          {/* Informasi Profil Utama */}
          {profile && (
            <div className="grid grid-cols-2 gap-3 text-xs p-4 rounded-2xl border bg-slate-50 dark:bg-[#16171d] border-slate-200 dark:border-[#2e303a]">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Nama</p>
                <p className="font-bold text-sm mt-0.5 text-slate-800 dark:text-white">{profile.name || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Username</p>
                <p className="font-bold text-sm mt-0.5 text-slate-800 dark:text-white">@{profile.username || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">WhatsApp</p>
                <p className="font-bold text-sm mt-0.5 text-slate-800 dark:text-white">{profile.whatsapp || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Wilayah</p>
                <p className="font-bold text-sm mt-0.5 text-slate-800 dark:text-white">{profile.city_name || '-' }, {profile.province_name || '-'}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-[#2e303a]">
                <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Kode Referral Utama</p>
                <p className="font-bold font-mono text-sm mt-0.5 text-emerald-700 dark:text-emerald-400">{profile.kode_referral || '-'}</p>
              </div>
            </div>
          )}

          {/* Bagian Log History Kampanye */}
          <div>
            {/* Judul Log History dengan warna putih terang menggunakan kelas dark: */}
            <h4 className="text-xs font-bold uppercase mb-2.5 flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
              <span>📜</span> Log History Kampanye & Tipe KOL:
            </h4>

            {loading ? (
              <p className="text-xs text-center py-6 text-slate-500 dark:text-slate-400">Memuat riwayat log...</p>
            ) : histories.length > 0 ? (
              <div className="space-y-2.5">
                {histories.map((item, index) => {
                  const isItemActive = String(item.status).toUpperCase() === 'ACTIVE' || String(item.status) === '1';
                  return (
                    <div 
                      key={index} 
                      className="p-3.5 rounded-2xl border shadow-2xs text-xs space-y-2 bg-white dark:bg-[#16171d] border-slate-200 dark:border-[#2e303a]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-emerald-800 dark:text-emerald-400">
                          Tipe / Campaign: {item.type}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isItemActive 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border dark:border-emerald-800' 
                            : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400 dark:border dark:border-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="text-[11px] flex justify-between items-center pt-2 border-t border-slate-100 dark:border-[#2e303a]">
                        {/* Label periode disetel terang menggunakan dark:text-slate-300 & white */}
                        <span className="text-slate-600 dark:text-slate-300">
                          📅 Periode: <strong className="text-slate-800 dark:text-white">{item.start_date || '-'}</strong> s/d <strong className="text-slate-800 dark:text-white">{item.end_date || '-'}</strong>
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">Ref: {item.kode_referral}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-center py-6 italic text-slate-500 dark:text-slate-400">Tidak ada riwayat log history ditemukan.</p>
            )}
          </div>

        </div>

        {/* Footer Tombol Tutup */}
        <div className="mt-5 pt-4 border-t flex justify-end gap-3 border-slate-200 dark:border-[#2e303a]">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}