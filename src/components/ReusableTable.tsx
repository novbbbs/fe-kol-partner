import { useState, useRef, useEffect, type ReactNode } from 'react';
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from './ui/table';
import { Button } from './ui/button';

interface ReusableTableProps {
  data: any[];
  columns: {
    accessorKey: string;
    header: any;
    cell?: (info: any) => ReactNode;
  }[];
  isDarkMode?: boolean;
  renderCardMobile?: (item: any, index: number) => ReactNode;
}

export default function ReusableTable({
  data,
  columns,
  isDarkMode = false,
  renderCardMobile,
}: ReusableTableProps) {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsColumnDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleColumn = (key: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false,
    }));
  };

  const renderHeader = (header: any) => {
    if (typeof header === 'function') {
      return header();
    }
    return header;
  };

  return (
    <div className="w-full space-y-4 overflow-x-hidden relative">
      {/* 
        Style ini menargetkan SEMUA elemen turunan di dalam container (.hide-table-scroll), 
        termasuk div internal bawaan shadcn/ui yang menyebabkan scrollbar hitam muncul. 
      */}
      <style>{`
        .hide-table-scroll *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .hide-table-scroll * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>

      {/* Toolbar Tabel */}
      <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 dark:border-[#2e303a]">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Dropdown Sembunyikan/Tampilkan Kolom */}
          <div className="relative" ref={dropdownRef}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsColumnDropdownOpen((prev) => !prev)}
              className="gap-1.5 h-9"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Kolom</span>
            </Button>

            {isColumnDropdownOpen && (
              <div className={`absolute left-0 mt-2 w-48 p-3 rounded-xl shadow-xl border z-50 space-y-2 ${
                isDarkMode ? 'bg-[#1f2028] border-[#2e303a] text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <p className="text-[11px] font-semibold text-slate-400 mb-1">Tampilkan Kolom:</p>
                {columns.map((col) => {
                  const colKey = col.accessorKey;
                  if (colKey === 'id' || colKey === 'actions') return null;
                  const isVisible = columnVisibility[colKey] !== false;
                  return (
                    <label key={colKey} className="flex items-center gap-2 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => toggleColumn(colKey)}
                        className="rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="capitalize">{colKey.replace('_', ' ')}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rows per page selector */}
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg border text-xs outline-none cursor-pointer ${
                isDarkMode ? 'bg-[#16171d] border-[#2e303a] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Kontrol Navigasi Halaman */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 w-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* TAMPILAN DESKTOP: Menambahkan hide-table-scroll untuk menembus komponen internal Table */}
      <div className="hidden md:block w-full border rounded-lg border-slate-200 dark:border-[#2e303a] hide-table-scroll">
        <Table className={isDarkMode ? 'text-slate-200' : 'text-slate-900'}>
          <TableHeader>
            <TableRow className={isDarkMode ? 'border-b border-[#2e303a] bg-[#16171d]/80 text-white font-bold' : 'border-b border-slate-200 bg-slate-50 text-slate-900 font-bold'}>
              {columns.map((col) => {
                const colKey = col.accessorKey;
                if (colKey !== 'id' && colKey !== 'actions' && columnVisibility[colKey] === false) return null;
                return (
                  <TableHead 
                    key={colKey} 
                    className={`h-11 px-6 align-middle font-bold uppercase tracking-wider text-[11px] border-r last:border-r-0 ${
                      isDarkMode ? 'border-[#2e303a] text-white' : 'border-slate-200 text-slate-900'
                    }`}
                  >
                    {renderHeader(col.header)}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody className={isDarkMode ? 'divide-y divide-[#2e303a]' : 'divide-y divide-slate-100'}>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-10 text-slate-400">
                  Tidak ada data ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, rowIndex) => {
                const absoluteIndex = (currentPage - 1) * pageSize + rowIndex;
                return (
                  <TableRow 
                    key={item.id || rowIndex} 
                    className={`transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-[#262833]/40 border-[#2e303a]' 
                        : 'hover:bg-slate-50/80 border-slate-100'
                    }`}
                  >
                    {columns.map((col) => {
                      const colKey = col.accessorKey;
                      if (colKey !== 'id' && colKey !== 'actions' && columnVisibility[colKey] === false) return null;

                      const cellContext = {
                        row: { index: absoluteIndex, original: item },
                        getValue: () => item[col.accessorKey],
                      };

                      return (
                        <TableCell 
                          key={colKey} 
                          className={`px-6 py-4 align-middle text-xs border-r last:border-r-0 ${
                            isDarkMode ? 'border-[#2e303a]' : 'border-slate-100'
                          }`}
                        >
                          {col.cell ? col.cell(cellContext) : item[col.accessorKey]}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* TAMPILAN MOBILE (CARD VIEW) */}
      <div className="block md:hidden space-y-3 px-4 pb-2">
        {paginatedData.length === 0 ? (
          <div className="text-center py-8 text-slate-400">Tidak ada data ditemukan.</div>
        ) : (
          paginatedData.map((item, index) => {
            const absoluteIndex = (currentPage - 1) * pageSize + index + 1;
            return renderCardMobile ? renderCardMobile(item, absoluteIndex) : null;
          })
        )}
      </div>
    </div>
  );
}