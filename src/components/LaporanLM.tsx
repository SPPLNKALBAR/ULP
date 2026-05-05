import React, { useState, useEffect } from 'react';
import { Card } from './UI';
import { Activity, TrendingUp, AlertCircle, CheckCircle2, Calendar, BarChart3, RefreshCw, ChevronDown } from 'lucide-react';
import Papa from 'papaparse';
import { cn } from '../utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  LabelList
} from 'recharts';

export interface MonthData {
  total: string;
  persen: string;
}

export interface LMData {
  no: string;
  rencana: string;
  targetUp3: string;
  targetUlp: string;
  targetBulanan: string;
  realisasiKumulatif: string;
  persenPelaksanaan: string;
  months: Record<string, MonthData>;
}

export const LaporanLM: React.FC = () => {
  const [data, setData] = useState<LMData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const allMonths = [
    'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 
    'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
  ];
  
  const [activeMonth, setActiveMonth] = useState<string>(allMonths[new Date().getMonth()]);

  const fetchData = async (isBackground = false) => {
    try {
      if (isBackground) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      const response = await fetch('https://docs.google.com/spreadsheets/d/1IfBQSLlqnJsf2DulM0kw-yTA6zr6Sum75mQOZpGUAJM/export?format=csv&gid=1151541226');
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data');
      }
      
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        complete: (results) => {
          const rows = results.data as string[][];
          
          let headerRowIdx = -1;
          for (let i = 0; i < rows.length; i++) {
            if (rows[i][0] === 'NO' && rows[i][1] === 'RENCANA KEHANDALAN MINGGUAN') {
              headerRowIdx = i;
              break;
            }
          }
          
          if (headerRowIdx === -1) {
            throw new Error('Format data tidak sesuai');
          }
          
          const monthRow = rows[headerRowIdx - 1];
          const headerRow = rows[headerRowIdx];
          
          // Find indices for all months
          const monthIndices: Record<string, { total: number; persen: number }> = {};
          
          allMonths.forEach(m => {
            const mIdx = monthRow.findIndex(cell => cell && cell.toUpperCase() === m);
            if (mIdx !== -1) {
              const totalIdx = headerRow.indexOf('TOTAL', mIdx);
              const pctIdx = headerRow.indexOf('%', totalIdx);
              if (totalIdx !== -1 && pctIdx !== -1) {
                monthIndices[m] = { total: totalIdx, persen: pctIdx };
              }
            }
          });
          
          const parsedData: LMData[] = [];
          
          for (let i = headerRowIdx + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row[0] || !row[1] || row[0].trim() === '' || row[1].toUpperCase().includes('TOTAL')) continue;
            
            const itemMonths: Record<string, MonthData> = {};
            Object.keys(monthIndices).forEach(m => {
              const idxs = monthIndices[m];
              itemMonths[m] = {
                total: row[idxs.total] || '0',
                persen: row[idxs.persen] || '0%'
              };
            });
            
            parsedData.push({
              no: row[0],
              rencana: row[1],
              targetUp3: row[2] || '0',
              targetUlp: row[3] || '0',
              targetBulanan: row[4] || '0',
              realisasiKumulatif: row[5] || '0%',
              persenPelaksanaan: row[6] || '0%',
              months: itemMonths
            });
          }
          
          setData(parsedData);
          
          // If active month is not in the data, set to first available month
          const availableMonths = Object.keys(monthIndices);
          if (availableMonths.length > 0 && !availableMonths.includes(activeMonth)) {
            setActiveMonth(availableMonths[0]);
          }
          
          setLastUpdated(new Date());
          setIsLoading(false);
          setIsRefreshing(false);
        },
        error: (err) => {
          console.error(err);
          setError('Gagal memproses data CSV');
          setIsLoading(false);
          setIsRefreshing(false);
        }
      });
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil data dari Spreadsheet');
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 15000); // Refresh every 15 seconds
    
    return () => clearInterval(interval);
  }, []);

  const parseNumber = (val: string) => {
    if (!val) return 0;
    return parseFloat(val.replace(/\./g, '').replace(/,/g, '.')) || 0;
  };

  const parsePercent = (val: string) => {
    if (!val) return 0;
    return parseFloat(val.replace(/%/g, '').replace(/,/g, '.')) || 0;
  };

  const getActiveMonthData = (item: LMData) => {
    return item.months[activeMonth] || { total: '0', persen: '0%' };
  };

  // Calculate summaries
  const totalTarget = data.reduce((sum, item) => sum + parseNumber(item.targetBulanan), 0);
  const totalRealisasi = data.reduce((sum, item) => sum + parseNumber(getActiveMonthData(item).total), 0);
  const avgPencapaian = data.length > 0 
    ? data.reduce((sum, item) => sum + parsePercent(getActiveMonthData(item).persen), 0) / data.length 
    : 0;

  // Prepare chart data (top 5 by target)
  const chartData = [...data]
    .sort((a, b) => parseNumber(b.targetBulanan) - parseNumber(a.targetBulanan))
    .slice(0, 5)
    .map(item => ({
      name: item.rencana.length > 20 ? item.rencana.substring(0, 20) + '...' : item.rencana,
      fullName: item.rencana,
      target: parseNumber(item.targetBulanan),
      realisasi: parseNumber(getActiveMonthData(item).total),
      persen: parsePercent(getActiveMonthData(item).persen)
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-500" />
              Lead Measure (LM)
            </h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live
              {isRefreshing && <RefreshCw className="w-3 h-3 ml-1 animate-spin" />}
            </div>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Pantauan Rencana Kehandalan Mingguan & Realisasi
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={activeMonth}
              onChange={(e) => setActiveMonth(e.target.value)}
              className="appearance-none bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 pr-10 text-xs font-bold text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all cursor-pointer"
            >
              {allMonths.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          
          <button 
            onClick={() => fetchData(false)}
            disabled={isLoading || isRefreshing}
            className="p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={cn("w-4 h-4", (isLoading || isRefreshing) && "animate-spin")} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-red-800 dark:text-red-200">Gagal Memuat Data</h3>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {!error && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/50 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="flex-1 text-center">
                  <p className="text-sm font-medium text-blue-600/80 dark:text-blue-400/80">Total Target {activeMonth}</p>
                  <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {isLoading ? '-' : totalTarget.toLocaleString('id-ID')}
                  </h3>
                </div>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-100 dark:border-emerald-800/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800/50 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex-1 text-center">
                  <p className="text-sm font-medium text-emerald-600/80 dark:text-emerald-400/80">Total Realisasi {activeMonth}</p>
                  <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                    {isLoading ? '-' : totalRealisasi.toLocaleString('id-ID')}
                  </h3>
                </div>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-100 dark:border-amber-800/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-800/50 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="flex-1 text-center">
                  <p className="text-sm font-medium text-amber-600/80 dark:text-amber-400/80">Rata-rata Pencapaian</p>
                  <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {isLoading ? '-' : `${avgPencapaian.toFixed(1)}%`}
                  </h3>
                </div>
              </div>
            </Card>
          </div>

          {/* Chart Section */}
          <Card title={`Top 5 Target vs Realisasi (${activeMonth})`}>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 30, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#6b7280', dy: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                    />
                    <Tooltip 
                      cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 2 }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      formatter={(value: number, name: string) => [value.toLocaleString('id-ID'), name === 'target' ? 'Target' : 'Realisasi']}
                      labelFormatter={(_, payload) => payload.length > 0 ? payload[0].payload.fullName : ''}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="target" name="Target" stroke="#93c5fd" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }}>
                      <LabelList dataKey="target" position="top" fill="#1e3a8a" fontSize={11} offset={10} formatter={(val: number) => val > 0 ? val.toLocaleString('id-ID') : ''} />
                    </Line>
                    <Line type="monotone" dataKey="realisasi" name="Realisasi" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }}>
                      <LabelList dataKey="realisasi" position="bottom" fill="#1e3a8a" fontSize={11} offset={10} formatter={(val: number) => val > 0 ? val.toLocaleString('id-ID') : ''} />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Data Table */}
          <Card 
            title="Detail Lead Measure" 
            extra={
              lastUpdated && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Update: {lastUpdated.toLocaleTimeString('id-ID')}
                </span>
              )
            }
          >
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-y border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold w-12 text-center">No</th>
                    <th className="px-4 py-3 font-semibold">Rencana Kehandalan</th>
                    <th className="px-4 py-3 font-semibold text-center">Target Bulanan</th>
                    <th className="px-4 py-3 font-semibold text-center">Realisasi {activeMonth}</th>
                    <th className="px-4 py-3 font-semibold text-center">% {activeMonth}</th>
                    <th className="px-4 py-3 font-semibold text-center">Realisasi Kumulatif</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="px-4 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div></td>
                        <td className="px-4 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-3/4"></div></td>
                        <td className="px-4 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-1/2 mx-auto"></div></td>
                        <td className="px-4 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-1/2 mx-auto"></div></td>
                        <td className="px-4 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-1/2 mx-auto"></div></td>
                        <td className="px-4 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-1/2 mx-auto"></div></td>
                      </tr>
                    ))
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400">
                        Tidak ada data ditemukan
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => {
                      const activeData = getActiveMonthData(item);
                      const pct = parsePercent(activeData.persen);
                      
                      return (
                        <tr 
                          key={index} 
                          className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-center text-zinc-500 dark:text-zinc-400">{item.no}</td>
                          <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{item.rencana}</td>
                          <td className="px-4 py-3 text-center tabular-nums">{item.targetBulanan}</td>
                          <td className="px-4 py-3 text-center tabular-nums font-medium text-blue-600 dark:text-blue-400">
                            {activeData.total}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                              pct >= 100 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" :
                              pct >= 50 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                              "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            )}>
                              {activeData.persen}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center tabular-nums text-zinc-500 dark:text-zinc-400">
                            {item.realisasiKumulatif}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
