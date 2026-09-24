import { useState } from 'react';
import { BarChart3, Megaphone, ChevronDown, FolderKanban } from 'lucide-react';
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
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isDarkMode, 
  isSidebarOpen, 
  onCloseMobile 
}: SidebarProps) {
  const [isMasterOpen, setIsMasterOpen] = useState(true);

  const handleMenuClick = (tab: 'dashboard' | 'kol' | 'campaign') => {
    setActiveTab(tab);
    if (window.innerWidth < 768 && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Backdrop Overlay khusus Mobile */}
      {isSidebarOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-all"
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 border-r transform ${
        isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'
      } ${
        isDarkMode ? 'bg-[#1f2028] border-[#2e303a]' : 'bg-white border-slate-200'
      }`}>
        {/* Logo Saloka - Dipanggil langsung dari folder public */}
        <div className="p-4 flex items-center justify-center border-b border-slate-100 dark:border-[#2e303a] shrink-0">
          <img 
            src="/image/saloka.png" 
            alt="Saloka Logo" 
            className={`transition-all duration-300 object-contain ${
              isSidebarOpen ? 'h-8 max-w-35' : 'h-6 max-w-8'
            }`} 
          />
        </div>

        {/* Menu Navigasi Sidebar */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          
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

          {/* Menu Master Data (Mepet di Pojok Kiri) */}
          <Collapsible
            open={isSidebarOpen ? isMasterOpen : false}
            onOpenChange={(open: boolean) => {
              if (isSidebarOpen) {
                setIsMasterOpen(open);
              } else {
                handleMenuClick('kol');
              }
            }}
            className="w-full"
          >
            <CollapsibleTrigger className="w-full block text-left outline-none border-none p-0 m-0">
              <div
                className={`w-full flex items-center justify-between px-4 py-3 font-semibold text-xs transition cursor-pointer ${
                  activeTab === 'kol' || activeTab === 'campaign'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-l-4 border-amber-500'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#262833]'
                }`}
                title="Master Data"
              >
                <div className="flex items-center gap-3">
                  <FolderKanban className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span className="truncate text-left">Master Data</span>}
                </div>

                {isSidebarOpen && (
                  <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                    isMasterOpen ? 'rotate-180 text-amber-500' : ''
                  }`} />
                )}
              </div>
            </CollapsibleTrigger>

            {/* Sub Menu */}
            {isSidebarOpen && (
              <CollapsibleContent className="w-full space-y-1 bg-slate-50/50 dark:bg-[#16171d]/30 py-1 transition-all">
                
                {/* Sub Menu KOL */}
                <button
                  type="button"
                  onClick={() => handleMenuClick('kol')}
                  className={`w-full flex items-center gap-3 pl-8 pr-4 py-2.5 font-medium text-xs transition cursor-pointer justify-start ${
                    activeTab === 'kol'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-l-4 border-amber-500 font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#262833]'
                  }`}
                >
                  <PiUsers className="w-4 h-4 shrink-0" />
                  <span className="truncate text-left">KOL</span>
                </button>

                {/* Sub Menu Campaign */}
                <button
                  type="button"
                  onClick={() => handleMenuClick('campaign')}
                  className={`w-full flex items-center gap-3 pl-8 pr-4 py-2.5 font-medium text-xs transition cursor-pointer justify-start ${
                    activeTab === 'campaign'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-l-4 border-amber-500 font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#262833]'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate text-left">Campaign</span>
                </button>

              </CollapsibleContent>
            )}
          </Collapsible>

        </nav>
      </aside>
    </>
  );
}