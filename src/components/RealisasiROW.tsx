import React, { useEffect, useState } from 'react';
import { Card } from './UI';
import { Loader2, AlertCircle, RefreshCw, ClipboardCheck, Calendar, BarChart3, Table as TableIcon, ChevronDown, ListFilter, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { cn } from '../utils';
import { fetchRealisasiRowData, fetchRealisasiRowDetailData, fetchRealisasiRow2026Data } from '../services/sheetService';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Legend } from 'recharts';

export function RealisasiROW() {
  const [data, setData] = useState<any[]>([]);
  const [detailData, setDetailData] = useState<any[]>([]);
  const [data2026, setData2026] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDetailMonth, setSelectedDetailMonth] = useState<string>('');
  const [selectedMonth2026, setSelectedMonth2026] = useState<string>('');
  
  const months = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 
                  'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [result, detailResult, result2026] = await Promise.all([
        fetchRealisasiRowData(),
        fetchRealisasiRowDetailData(),
        fetchRealisasiRow2026Data()
      ]);
      
      setData(result);
      setDetailData(detailResult);
      setData2026(result2026);
      
      // Set default month to current month
      const currentMonthIndex = new Date().getMonth();
      if (!selectedMonth) {
        setSelectedMonth(months[currentMonthIndex]);
      }
      if (!selectedDetailMonth) {
        setSelectedDetailMonth(months[currentMonthIndex]);
      }
      if (!selectedMonth2026) {
        setSelectedMonth2026(months[currentMonthIndex]);
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      if (!silent) setError('Gagal memuat data Realisasi ROW.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-amber-500">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Memuat data Realisasi...</p>
      </div>
    );
  }

  if (error && data.length === 0) {
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

  // Find the "Realisasi" row for the chart
  const realisasiRow = data.find(r => r.uraian.toUpperCase().includes('REALISASI')) || data[0];
  
  const chartData = months.map(m => {
    const valStr = realisasiRow ? realisasiRow[m] : '0';
    const val = parseFloat(valStr.replace(/\./g, '').replace(',', '.')) || 0;
    return {
      month: m.substring(0, 3),
      realisasi: val,
      targetRkm: 55.0,
      targetSla: 62.0
    };
  });

  // Filter detail data by selected month
  const filteredDetailData = detailData.filter(row => {
    if (selectedDetailMonth === 'SEMUA') return true;
    return row.month === selectedDetailMonth;
  });

  const displayDetailData = filteredDetailData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
            <ClipboardCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Realisasi ROW</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Monitoring Capaian Realisasi Pemeliharaan ROW (B12:N23 & B25:E122)</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Section */}
        <Card title="Grafik Realisasi vs Target" className="p-0 lg:col-span-2" bodyClassName="p-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fontWeight: 'bold' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fontWeight: 'bold' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Line name="Realisasi Bulanan" type="monotone" dataKey="realisasi" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line name="Target RKM UP3 (55.0)" type="monotone" dataKey="targetRkm" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                <Line name="Target SLA (62.0)" type="monotone" dataKey="targetSla" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Table Section 1 (B12:N23) */}
        <Card 
          title="Rekapitulasi Realisasi" 
          extra={
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Bulan:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded px-1.5 py-0.5 text-[9px] font-bold text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500 w-28"
              >
                {months.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          }
          className="p-0 flex flex-col h-full" 
          bodyClassName="p-0 flex flex-col flex-1 min-h-0"
        >
          <div className="overflow-x-auto flex-1 overflow-y-auto max-h-[300px]">
            <table className="min-w-full text-left border-collapse table-fixed">
              <thead className="sticky top-0 z-10">
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
                  <th className="w-[60%] px-3 py-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                    URAIAN POINT
                  </th>
                  <th className="w-[40%] px-3 py-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">
                    NILAI ({selectedMonth})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {data.slice(1).map((row, idx) => {
                  const valRaw = row[selectedMonth] || '0';
                  const isZero = valRaw === '0' || valRaw === 0 || valRaw === '0,00';
                  
                  const formatVal = (val: any, uraian: string) => {
                    if (!val || val === '') return val;
                    const cleanVal = String(val).replace(/\./g, '').replace(',', '.');
                    const num = parseFloat(cleanVal);
                    if (isNaN(num)) return val;
                    
                    const formatted = num.toLocaleString('id-ID', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    });

                    const upperUraian = uraian.toUpperCase();
                    if (upperUraian.includes('%')) return `${formatted}%`;
                    
                    return formatted;
                  };

                  return (
                    <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-3 py-1.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                        {(() => {
                          const label = row.uraian || '';
                          const upperLabel = label.toUpperCase();
                          const targets = [
                            'KINERJA PERBULAN - RKM UP3',
                            'KINERJA PERBULAN - SLA',
                            'KINERJA TERHADAP TARGET RKM UP3',
                            'KINERJA TERHADAP TARGET SLA'
                          ];
                          if (targets.some(t => upperLabel.includes(t))) {
                            return `${label} (%)`;
                          }
                          return label;
                        })()}
                      </td>
                      <td className={cn(
                        "px-3 py-1.5 text-xs font-black text-center tabular-nums",
                        isZero ? "text-rose-500" : "text-zinc-900 dark:text-white"
                      )}>
                        {formatVal(valRaw, (() => {
                          const label = row.uraian || '';
                          const upperLabel = label.toUpperCase();
                          const targets = [
                            'KINERJA PERBULAN - RKM UP3',
                            'KINERJA PERBULAN - SLA',
                            'KINERJA TERHADAP TARGET RKM UP3',
                            'KINERJA TERHADAP TARGET SLA'
                          ];
                          if (targets.some(t => upperLabel.includes(t))) {
                            return `${label} (%)`;
                          }
                          return label;
                        })())}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Table Section 2 (B25:E122) */}
        <Card 
          title="Detail Realisasi ROW" 
          extra={
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Bulan:</span>
              <select
                value={selectedDetailMonth}
                onChange={(e) => setSelectedDetailMonth(e.target.value)}
                className="bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded px-1.5 py-0.5 text-[9px] font-bold text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500 w-28"
              >
                <option value="SEMUA">SEMUA BULAN</option>
                {months.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          }
          className="p-0 flex flex-col h-full" 
          bodyClassName="p-0 flex flex-col flex-1 min-h-0"
        >
          <div className="overflow-x-auto flex-1 overflow-y-auto max-h-[300px]">
            <table className="min-w-full text-left border-collapse table-fixed">
              <thead className="sticky top-0 z-10">
                <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
                  <th className="w-[40%] px-3 py-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                    TIM
                  </th>
                  <th className="w-[20%] px-3 py-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">
                    FOTO
                  </th>
                  <th className="w-[20%] px-3 py-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">
                    KMS
                  </th>
                  <th className="w-[20%] px-3 py-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">
                    TOTAL KMS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {displayDetailData.map((row, idx) => {
                  const formatVal = (val: any) => {
                    if (!val || val === '' || isNaN(parseFloat(String(val).replace(',', '.')))) return val;
                    const num = parseFloat(String(val).replace(',', '.'));
                    return num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  };

                  return (
                    <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-3 py-1.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 truncate">
                        {row.uraian}
                        {selectedDetailMonth === 'SEMUA' && row.month && (
                          <span className="ml-2 px-1 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[8px] text-zinc-500 uppercase">
                            {row.month}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-[10px] font-black text-center text-zinc-900 dark:text-white tabular-nums">
                        {formatVal(row.col2)}
                      </td>
                      <td className="px-3 py-1.5 text-[10px] font-black text-center text-zinc-900 dark:text-white tabular-nums">
                        {formatVal(row.col3)}
                      </td>
                      {/* Merge TOTAL KMS for row 1 and 2 */}
                      {idx === 0 ? (
                        <td rowSpan={2} className="px-3 py-1.5 text-[10px] font-black text-center text-zinc-900 dark:text-white tabular-nums border-l border-zinc-100 dark:border-zinc-800/50 align-middle bg-zinc-50/30 dark:bg-zinc-900/30">
                          {formatVal(row.col4)}
                        </td>
                      ) : idx === 1 ? null : (
                        <td className="px-3 py-1.5 text-[10px] font-black text-center text-zinc-900 dark:text-white tabular-nums">
                          {formatVal(row.col4)}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {displayDetailData.length === 0 && (
            <div className="p-8 text-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              Tidak ada data untuk bulan {selectedDetailMonth}
            </div>
          )}
        </Card>
      </div>

      {/* Card: REALISASI ROW (2026) */}
      <Card 
        title="REALISASI ROW" 
        extra={
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Bulan 2026:</span>
            <select
              value={selectedMonth2026}
              onChange={(e) => setSelectedMonth2026(e.target.value)}
              className="bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded px-1.5 py-0.5 text-[9px] font-bold text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500 w-28"
            >
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        }
        className="p-0" 
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto max-h-[400px] relative">
          <table className="min-w-full text-left border-collapse">
            {data2026.length > 0 && (
              <thead className="sticky top-0 z-10 bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  {Array.isArray(data2026[0]) && data2026[0].slice(0, 8).map((header: any, hIdx: number) => (
                    <th key={hIdx} className="px-3 py-2 text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest border-r border-zinc-200/50 dark:border-zinc-800/50">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-zinc-100/30 dark:divide-zinc-800/30">
              {data2026.slice(1, 142).map((row, idx) => {
                // Highlight rows that contain the selected month
                // idx starts from 0 for the 2nd row of original data
                const isSubHeader = idx < 4; // Assuming original rows 2-5 were sub-headers
                const containsMonth = Array.isArray(row) && row.some((cell: any) => String(cell).toUpperCase().includes(selectedMonth2026));
                
                return (
                  <tr 
                    key={idx} 
                    className={cn(
                      "transition-colors backdrop-blur-sm",
                      isSubHeader 
                        ? "bg-zinc-100/40 dark:bg-zinc-800/40 font-black" 
                        : "bg-white/10 dark:bg-zinc-900/10",
                      "hover:bg-amber-50/40 dark:hover:bg-amber-900/40",
                      containsMonth && !isSubHeader && "bg-amber-100/30 dark:bg-amber-900/30"
                    )}
                  >
                    {Array.isArray(row) && row.slice(0, 8).map((cell: any, cIdx: number) => (
                      <td key={cIdx} className={cn(
                        "px-3 py-1.5 text-[10px] border-r border-zinc-100/30 dark:border-zinc-800/30",
                        isSubHeader ? "text-zinc-900 dark:text-white uppercase tracking-wider" : "text-zinc-600 dark:text-zinc-400 font-medium"
                      )}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Sumber: Spreadsheet Range A1:H142</span>
          </div>
          <a 
            href="https://docs.google.com/spreadsheets/d/1nAFEkg1KZ4SU4o0pk7KqMHH2Lz4QA_lqj8IBWCZdyGQ/edit?pli=1&gid=1451420501#gid=1451420501&range=A1:H142" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[9px] font-bold text-amber-600 hover:text-amber-700 uppercase tracking-widest flex items-center gap-1"
          >
            Buka Spreadsheet <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </Card>
    </div>
  );
}
