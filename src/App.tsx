import { useState } from 'react';
import { Moon, Sun, Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import DashboardKolPage from './features/kol/pages/DashboardKolPage';
import KolPage from './features/kol/pages/KolPage';
import CampaignPage from './features/campaign/pages/CampaignPage';
import { TooltipProvider } from './components/ui/tooltip';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'kol' | 'campaign'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? 'dark bg-[#121318] text-white' : 'bg-slate-50 text-slate-800'}`}>
        
        {/* Sidebar Drawer Component */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDarkMode={isDarkMode}
          isSidebarOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* Konten Utama & Header */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ml-0 ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-20'
        }`}>
          
          {/* Header Atas */}
          <header className={`sticky top-0 z-50 border-b px-6 py-4 flex items-center justify-between backdrop-blur-md ${
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

            <div>
              <h2 className={`text-sm font-bold tracking-widest uppercase transition-colors ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {activeTab === 'dashboard' ? 'Dashboard' : 
                 activeTab === 'kol' ? 'Master KOL & Partner' : 'Campaign'}
              </h2>
            </div>
          </header>

          {/* Area Halaman Konten */}
          <main className="p-6 md:p-8 flex-1">
            {activeTab === 'dashboard' && <DashboardKolPage isDarkMode={isDarkMode} />}
            {activeTab === 'kol' && <KolPage isDarkMode={isDarkMode} />}
            {activeTab === 'campaign' && <CampaignPage isDarkMode={isDarkMode} />}
          </main>
        </div>

      </div>
    </TooltipProvider>
  );
}