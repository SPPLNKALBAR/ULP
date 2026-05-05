import React, { useEffect, useState } from 'react';
import { Card } from './UI';
import { Loader2, AlertCircle, RefreshCw, Wrench, Calendar, BarChart3, Table as TableIcon } from 'lucide-react';
import { cn } from '../utils';
import { fetchPemeliharaanRowData, fetchOldPemeliharaanRowData } from '../services/sheetService';
import { FgtmRow } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Helper to get a descriptive label for a row
const getRowLabel = (row: FgtmRow) => {
  if (!row) return '';
  const keys = Object.keys(row);
  const monthNames = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 
                      'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
  
  const metadataParts = keys
    .filter(key => 
      !monthNames.includes(key.toUpperCase()) && 
      !['TOTAL', 'JUMLAH', 'NO', 'NO.'].includes(key.toUpperCase()) &&
      !key.startsWith('Col_')
    )
    .map(key => row[key])
    .filter(val => val && val.trim() !== '' && !val.toUpperCase().includes('TOTAL'));
    
  return metadataParts.join(' - ') || row[keys[0]] || 'Unknown';
};

export function PemeliharaanROW() {
  const [newData, setNewData] = useState<FgtmRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // State for new data dropdown
  const [selectedNewMonth, setSelectedNewMonth] = useState<string>('');
  const [displayColumns, setDisplayColumns] = useState<string[]>([]);
  const [metadataColumns, setMetadataColumns] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const newResult = await fetchPemeliharaanRowData();
      
      setNewData(newResult);
      
      // Handle new data columns
      if (newResult.length > 0) {
        const keys = Object.keys(newResult[0]);
        const monthNames = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 
                            'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
        
        const dataCols = keys.filter(key => 
          monthNames.includes(key.toUpperCase()) || 
          ['TOTAL', 'JUMLAH', 'TARGET', 'PENCAPAIAN', '%', 'KUMULATIF'].some(k => key.toUpperCase().includes(k))
        );
        
        const metaCols = keys.filter(key => !dataCols.includes(key) && !['NO', 'NO.'].includes(key.toUpperCase()));
        
        setDisplayColumns(dataCols);
        setMetadataColumns(metaCols);
        
        // Fix: Always ensure a valid month is selected if available
        const currentMonthName = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date()).toUpperCase();
        const foundCurrentMonth = dataCols.find(m => m.toUpperCase() === currentMonthName);
        
        if (!selectedNewMonth || !dataCols.includes(selectedNewMonth)) {
          setSelectedNewMonth(foundCurrentMonth || dataCols.find(c => monthNames.includes(c.toUpperCase())) || dataCols[0] || '');
        }

        // Set default section
        if (!selectedSection && newResult.length > 0) {
          const firstValidRow = newResult.find(r => {
            const label = getRowLabel(r);
            return label && !label.toUpperCase().includes('TOTAL');
          });
          if (firstValidRow) setSelectedSection(getRowLabel(firstValidRow));
        }
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      if (!silent) setError('Gagal memuat data Pemeliharaan ROW.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && newData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-amber-500">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Memuat data ROW...</p>
      </div>
    );
  }

  if (error && newData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-rose-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="font-medium mb-4">{error}</p>
        <button 
          onClick={() => loadData()}
          className="px-4 py-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const labelKey = newData.length > 0 ? Object.keys(newData[0])[0] : '';
  
  // Calculate Top 10 Sections
  const sectionsWithTotals = newData
    .filter(row => {
      const label = getRowLabel(row);
      return label && !label.toUpperCase().includes('TOTAL');
    })
    .map(row => {
      const total = displayColumns.reduce((sum, col) => {
        if (!['TOTAL', 'JUMLAH'].some(k => col.toUpperCase().includes(k))) {
           const valStr = row[col] || '0';
           const val = parseFloat(valStr.replace(/\./g, '').replace(',', '.')) || 0;
           return sum + val;
        }
        return sum;
      }, 0);
      return { label: getRowLabel(row), total, row, id: row[labelKey] + Math.random() };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const selectedSectionData = newData.find(r => getRowLabel(r) === selectedSection);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
            <Wrench className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Pemeliharaan ROW</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Monitoring Pemangkasan Pohon & Pemeliharaan Jaringan</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                Update: {lastUpdated.toLocaleTimeString('id-ID')}
              </span>
            </div>
          )}
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-5 h-5 text-zinc-500", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* NEW DATA SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Top 10 Ranking */}
        <Card 
          title="Top 10 Section Terbanyak" 
          extra={<BarChart3 className="w-4 h-4 text-amber-600" />}
          className="lg:col-span-2 p-0"
          bodyClassName="p-0"
        >
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
            {sectionsWithTotals.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-black shrink-0",
                    idx === 0 ? "bg-amber-500 text-white" : 
                    idx === 1 ? "bg-zinc-400 text-white" :
                    idx === 2 ? "bg-amber-700 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                  )}>
                    {idx + 1}
                  </span>
                  <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">{item.label}</span>
                </div>
                <span className="text-[11px] font-black text-amber-600 dark:text-amber-500 ml-4 shrink-0 text-center min-w-[60px]">{item.total.toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Section Detail with Dropdown */}
        <Card 
          title="Detail Monitoring Section" 
          extra={
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Section:</span>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md px-2 py-0.5 text-[10px] font-bold text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-32 sm:w-40"
              >
                {newData
                  .filter(r => {
                    const label = getRowLabel(r);
                    return label && !label.toUpperCase().includes('TOTAL');
                  })
                  .map((row, idx) => {
                    const label = getRowLabel(row);
                    return <option key={idx} value={label}>{label}</option>;
                  })}
              </select>
            </div>
          }
          className="lg:col-span-3 p-0"
          bodyClassName="p-4"
        >
          {selectedSectionData ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {displayColumns.map(col => (
                <div key={col} className="p-2.5 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-lg border border-zinc-100 dark:border-zinc-800 group hover:border-emerald-500/30 transition-colors">
                  <span className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5 text-center">{col}</span>
                  <span className="text-base font-black text-zinc-900 dark:text-white group-hover:text-emerald-500 transition-colors block text-center">
                    {selectedSectionData[col] || '0'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500 text-xs">Pilih section untuk melihat detail</div>
          )}
        </Card>
      </div>

      <Card title="FREKUENSI ROW PERSECTION TIAP BULAN" className="p-0" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-3 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap sticky left-0 bg-zinc-50 dark:bg-zinc-900/80 z-10">
                  URAIAN / SECTION
                </th>
                {displayColumns.map((col, idx) => (
                  <th key={idx} className="px-3 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap text-center">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {newData.map((row, idx) => {
                const label = getRowLabel(row);
                return (
                  <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-3 py-1.5 text-[10px] font-medium text-zinc-900 dark:text-white whitespace-nowrap sticky left-0 bg-white dark:bg-zinc-950 z-10 border-r border-zinc-100 dark:border-zinc-800/50">
                      {label}
                    </td>
                    {displayColumns.map((col, mIdx) => {
                      const val = row[col] || '0';
                      const isZero = val === '0' || val === 0 || val === '0,00';
                      return (
                        <td 
                          key={mIdx} 
                          className={cn(
                            "px-3 py-1.5 text-[10px] whitespace-nowrap text-center",
                            isZero ? "text-rose-500 font-bold" : "text-zinc-600 dark:text-zinc-400"
                          )}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
