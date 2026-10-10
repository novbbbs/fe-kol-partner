import { useState, useEffect, useRef } from 'react';
import { BarChart3, Megaphone, ChevronDown, FolderKanban, LogOut } from 'lucide-react';
import { PiUsers } from 'react-icons/pi';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from './ui/collapsible';

interface SidebarProps {
  activeTab: 'dashboard' | 'kol' | 'campaign';
  setActiveTab: (tab: 'dashboard' | 'kol' | 'campaign') => void;
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  onCloseMobile?: () => void;
  // Tambahan Props untuk Profil dan Logout
  user?: any;
  onLogout?: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isDarkMode, 
  isSidebarOpen, 
  onCloseMobile,
  user,
  onLogout
}: SidebarProps) {
  const [isMasterOpen, setIsMasterOpen] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 80 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'kol' || activeTab === 'campaign') {
      setIsMasterOpen(true);
    }
  }, [activeTab]);

  // Menutup popup saat klik di luar area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMasterClickCollapsed = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPopupPos({
        top: rect.top,
        left: rect.right + 8
      });
    }
    setShowPopup((prev) => !prev);
  };

  const handleMenuClick = (tab: 'dashboard' | 'kol' | 'campaign') => {
    setActiveTab(tab);
    setShowPopup(false);
    if (window.innerWidth < 768 && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Backdrop Overlay khusus Mobile dengan z-980 */}
      {isSidebarOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-980 md:hidden transition-all"
        />
      )}

      {/* Sidebar Drawer dengan z-999 */}
      <aside className={`fixed inset-y-0 left-0 z-999 flex flex-col transition-all duration-300 border-r transform ${
        isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'
      } ${
        isDarkMode ? 'bg-[#1f2028] border-[#2e303a]' : 'bg-white border-slate-200'
      }`}>
        {/* Logo Saloka */}
        <div className="p-4 flex items-center justify-center border-b border-slate-100 dark:border-[#2e303a] shrink-0">
          <img 
            src="/image/saloka.png" 
            alt="Saloka Logo" 
            className={`transition-all duration-300 object-contain ${
              isSidebarOpen ? 'h-8 w-32' : 'h-6 w-8'
            }`} 
          />
        </div>

        {/* Menu Navigasi Sidebar */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          
          {/* Menu Dashboard */}
          <div className="w-full">
            <button
              type="button"
              onClick={() => handleMenuClick('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 font-semibold text-xs transition cursor-pointer justify-start ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-l-4 border-amber-500'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#262833]'
              }`}
              title="Dashboard"
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              {isSidebarOpen && <span className="truncate text-left">Dashboard</span>}
            </button>
          </div>

          {/* KONDISI 1: SIDEBAR TERBUKA (Expanded) -> Collapsible Normal */}
          {isSidebarOpen ? (
            <Collapsible
              open={isMasterOpen}
              onOpenChange={setIsMasterOpen}
              className="w-full"
            >
              <CollapsibleTrigger className="w-full block text-left outline-none border-none p-0 m-0 cursor-pointer">
                <div
                  className={`w-full flex items-center justify-between px-4 py-3 font-semibold text-xs transition cursor-pointer ${
                    activeTab === 'kol' || activeTab === 'campaign'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-l-4 border-amber-500'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#262833]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FolderKanban className="w-4 h-4 shrink-0" />
                    <span className="truncate text-left">Master Data</span>
                  </div>

                  <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                    isMasterOpen ? 'rotate-180 text-amber-500' : ''
                  }`} />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent className="w-full space-y-1 bg-slate-50/50 dark:bg-[#16171d]/30 py-1 transition-all">
                <button
                  type="button"
                  onClick={() => handleMenuClick('kol')}
                  className={`w-full flex items-center gap-3 pl-8 pr-4 py-2.5 font-medium text-xs transition cursor-pointer justify-start ${
                    activeTab === 'kol'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-l-4 border-amber-500 font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#262833]'
                  }`}
                >
                  <PiUsers className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span className="truncate text-left">KOL</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('campaign')}
                  className={`w-full flex items-center gap-3 pl-8 pr-4 py-2.5 font-medium text-xs transition cursor-pointer justify-start ${
                    activeTab === 'campaign'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-l-4 border-amber-500 font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#262833]'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span className="truncate text-left">Campaign</span>
                </button>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            
            /* KONDISI 2: SIDEBAR TERTUTUP (Collapsed) -> Tombol pemicu Pop-up */
            <div className="w-full">
              <button
                ref={buttonRef}
                type="button"
                onClick={handleMasterClickCollapsed}
                className={`w-full flex items-center justify-center py-3 px-4 font-semibold text-xs transition cursor-pointer outline-none ${
                  activeTab === 'kol' || activeTab === 'campaign'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-l-4 border-amber-500'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#262833]'
                }`}
                title="Master Data"
              >
                <FolderKanban className="w-4 h-4 shrink-0" />
              </button>
            </div>
          )}
        </nav>

        {/* --- BAGIAN BAWAH: Profil Admin & Tombol Logout --- */}
        <div className={`mt-auto border-t transition-all duration-300 ${isDarkMode ? 'border-[#2e303a]' : 'border-slate-200'} ${isSidebarOpen ? 'p-4' : 'p-3 flex flex-col items-center'}`}>
          {isSidebarOpen ? (
            <div className="flex flex-col gap-3">
              {/* Info Admin */}
              <div className="flex flex-col">
                <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  {user?.name || 'Admin Saloka'}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  ID: {user?.username || '1234'}
                </p>
              </div>
              
              {/* Tombol Logout */}
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            /* Tampilan Logout saat Sidebar Mengecil (Collapsed) */
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center justify-center w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-sm transition cursor-pointer"
              title="Keluar Akun"
            >
              <LogOut className="w-4 h-4 shrink-0" />
            </button>
          )}
        </div>

      </aside>

      {/* Pop-up Menu Melayang DI LUAR SIDEBAR dengan z-1000 */}
      {!isSidebarOpen && showPopup && (
        <div 
          ref={popupRef}
          style={{ 
            top: `${popupPos.top}px`, 
            left: `${popupPos.left}px` 
          }}
          className={`fixed w-48 p-2 rounded-2xl shadow-2xl border z-1000 space-y-1 ${
            isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-[#2e303a]">
            Master Data
          </div>

          <button
            type="button"
            onClick={() => handleMenuClick('kol')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer transition justify-start ${
              activeTab === 'kol'
                ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                : 'hover:bg-slate-100 dark:hover:bg-[#262833]'
            }`}
          >
            <PiUsers className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-left">KOL</span>
          </button>

          <button
            type="button"
            onClick={() => handleMenuClick('campaign')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer transition justify-start ${
              activeTab === 'campaign'
                ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                : 'hover:bg-slate-100 dark:hover:bg-[#262833]'
            }`}
          >
            <Megaphone className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-left">Campaign</span>
          </button>
        </div>
      )}
    </>
  );
}