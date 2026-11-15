import { useState, useEffect } from 'react';
import { kolService } from '../services/kol.service'; // Menyesuaikan dengan kol.service.ts Anda

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
}

export default function KolDetailModal({ isOpen, onClose, username }: Props) {
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

  // Ambil profil dari data terbaru (baris pertama)
  const profile = histories.length > 0 ? histories[0] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="pb-3 border-b border-slate-200">
          <h3 className="text-base font-black text-slate-800 uppercase">
            Detail & Log History KOL: {profile?.name || username}
          </h3>
        </div>

        {/* Informasi Profil Utama */}
        {profile && (
          <div className="py-3 grid grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-200 my-2">
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase">Username</p>
              <p className="font-extrabold">@{profile.username}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase">WhatsApp</p>
              <p className="font-extrabold">{profile.whatsapp}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase">Kode Referral</p>
              <p className="font-extrabold font-mono text-emerald-700">{profile.kode_referral}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase">Wilayah</p>
              <p className="font-extrabold">{profile.city_name}, {profile.province_name}</p>
            </div>
          </div>
        )}

        {/* Bagian Log History Berkelanjutan */}
        <div className="mt-2 flex-1 overflow-y-auto pr-1">
          <h4 className="text-xs font-black uppercase text-slate-800 mb-2 flex items-center gap-1.5">
            <span>📜</span> Log History Kampanye & Tipe KOL:
          </h4>

          {loading ? (
            <p className="text-xs text-slate-500 text-center py-6">Memuat riwayat log...</p>
          ) : histories.length > 0 ? (
            <div className="space-y-2">
              {histories.map((item, index) => (
                <div key={index} className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-800 text-xs">
                      Tipe / Campaign: {item.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      item.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-600 flex justify-between items-center pt-1 border-t border-slate-100">
                    <span>📅 Periode: <strong>{item.start_date || '-'}</strong> s/d <strong>{item.end_date || '-'}</strong></span>
                    <span className="font-mono text-slate-400">Ref: {item.kode_referral}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-6 italic">Tidak ada riwayat log history ditemukan.</p>
          )}
        </div>

        {/* Tombol Tutup */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}