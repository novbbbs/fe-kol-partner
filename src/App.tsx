import { useState, useEffect } from 'react';
import { Moon, Sun, Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import KolPage from './features/kol/pages/KolPage';
import CampaignPage from './features/campaign/pages/CampaignPage';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/sonner';

// Import disesuaikan ke folder features/Login (huruf L besar)
import LoginPage from './features/Login/pages/LoginPage';
import { authService } from './features/Login/services/authService';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'kol' | 'campaign'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);

  // Status global untuk mendeteksi apakah modal form sedang terbuka
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Periksa sesi user saat aplikasi pertama kali dimuat
  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        const localUser = authService.getUser();
        if (localUser) {
          setUser(localUser);
        }
        
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  // Konfigurasi style toast agar menyerupai desain contoh kustom
  const customToastOptions = {
    position: 'top-right' as const,
    richColors: true,
    closeButton: true,
    toastOptions: {
      classNames: {
        toast: 'bg-white dark:bg-[#1f2028] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2e303a] shadow-2xl rounded-2xl p-4 overflow-hidden',
        title: 'font-bold text-sm text-slate-900 dark:text-white',
        description: 'text-xs text-slate-500 dark:text-slate-400 mt-0.5',
        closeButton: 'text-slate-400 hover:text-slate-700 dark:hover:text-white border-0 bg-transparent',
      },
    },
  };

  // Tampilkan loading sebentar saat memeriksa sesi
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121318] text-white">
        <p className="text-sm font-medium animate-pulse">Memuat Saloka Partner...</p>
      </div>
    );
  }

  // JIKA BELUM LOGIN, TAMPILKAN HALAMAN LOGIN
  if (!user) {
    return (
      <>
        <Toaster {...customToastOptions} />
        <LoginPage />
      </>
    );
  }

  return (
    <TooltipProvider>
      {/* Pasang Toaster di root aplikasi */}
      <Toaster {...customToastOptions} />

      <div className={`min-h-screen flex overflow-x-hidden transition-colors duration-300 ${isDarkMode ? 'dark bg-[#121318] text-white' : 'bg-slate-50 text-slate-800'}`}>
        
        {/* SIDEBAR */}
        <div className="fixed inset-y-0 left-0 z-40 flex">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isDarkMode={isDarkMode}
            isSidebarOpen={isSidebarOpen}
            onCloseMobile={() => setIsSidebarOpen(false)}
            user={user}
            onLogout={handleLogout}
            isModalOpen={isModalOpen} 
          />
        </div>

        {/* Konten Utama: Margin kiri disesuaikan dengan w-60 sidebar */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ml-0 ${
          isSidebarOpen ? 'md:ml-60' : 'md:ml-20'
        }`}>
          
          <header className={`sticky top-0 z-30 border-b px-6 py-4 flex items-center justify-between backdrop-blur-md ${
            isDarkMode ? 'bg-[#1f2028]/90 border-[#2e303a]' : 'bg-white/90 border-slate-200'
          }`}>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#262833] cursor-pointer"
                title="Toggle Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-full bg-amber-500 text-white shadow-md hover:bg-amber-600 transition cursor-pointer"
                title="Ubah Tema"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-6">
              <h2 className={`text-sm font-bold tracking-widest uppercase transition-colors ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {activeTab === 'dashboard' ? 'Dashboard' : 
                 activeTab === 'kol' ? 'KOL' : 'Campaign'}
              </h2>
            </div>
          </header>

          <main className={`flex-1 ${activeTab === 'dashboard' ? 'p-0' : 'pt-3 px-6 pb-6 md:px-8 md:pb-8'}`}>
            {activeTab === 'dashboard' && <DashboardPage isDarkMode={isDarkMode} />}
            {activeTab === 'kol' && <KolPage isDarkMode={isDarkMode} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />}
            {activeTab === 'campaign' && <CampaignPage isDarkMode={isDarkMode} />}
          </main>
        </div>

      </div>
    </TooltipProvider>
  );
}