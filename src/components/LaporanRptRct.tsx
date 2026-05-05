import React, { useState, useEffect } from 'react';
import { Card } from './UI';
import { TrendingDown, Activity, AlertCircle, RefreshCw, Calendar, CheckCircle2 } from 'lucide-react';
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
  LabelList
} from 'recharts';

interface RPTData {
  bulan: string;
  target: string;
  denganCT: string;
  diluarCT: string;
  persenDenganCT: string;
  realisasiTanpaCT: string;
  pencapaian: string;
  woMasuk: string;
  woTanpaCT: string;
}

interface RCTData {
  bulan: string;
  target: string;
  denganCT: string;
  diluarCT: string;
  persenDenganCT: string;
  realisasiDiluarCT: string;
  pencapaian: string;
}

export const LaporanRptRct: React.FC = () => {
  const [rptData, setRptData] = useState<RPTData[]>([]);
  const [rctData, setRctData] = useState<RCTData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'RPT' | 'RCT'>('RPT');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://docs.google.com/spreadsheets/d/1IfBQSLlqnJsf2DulM0kw-yTA6zr6Sum75mQOZpGUAJM/export?format=csv&gid=1606832216');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        complete: (results) => {
          const rows = results.data as string[][];
          
          // Find RPT section
          const rptIndex = rows.findIndex(row => row[2] === 'RPT' && row[3] === 'TARGET');
          const parsedRpt: RPTData[] = [];
          
          if (rptIndex !== -1) {
            // Read next 12 rows for months
            for (let i = rptIndex + 2; i < rptIndex + 14; i++) {
              if (rows[i] && rows[i][2]) {
                parsedRpt.push({
                  bulan: rows[i][2],
                  target: rows[i][3] || '-',
                  denganCT: rows[i][4] || '-',
                  diluarCT: rows[i][5] || '-',
                  persenDenganCT: rows[i][6] || '-',
                  realisasiTanpaCT: rows[i][7] || '-',
                  pencapaian: rows[i][8] || '-',
                  woMasuk: rows[i][9] || '-',
                  woTanpaCT: rows[i][10] || '-'
                });
              }
            }
          }

          // Find RCT section
          const rctIndex = rows.findIndex(row => row[2] === 'RCT' && row[3] === 'TARGET');
          const parsedRct: RCTData[] = [];
          
          if (rctIndex !== -1) {
            // Read next 12 rows for months
            for (let i = rctIndex + 2; i < rctIndex + 14; i++) {
              if (rows[i] && rows[i][2]) {
                parsedRct.push({
                  bulan: rows[i][2],
                  target: rows[i][3] || '-',
                  denganCT: rows[i][4] || '-',
                  diluarCT: rows[i][5] || '-',
                  persenDenganCT: rows[i][6] || '-',
                  realisasiDiluarCT: rows[i][7] || '-',
                  pencapaian: rows[i][8] || '-'
                });
              }
            }
          }

          setRptData(parsedRpt);
          setRctData(parsedRct);
          setLastUpdated(new Date());
          setIsLoading(false);
        },
        error: (err: any) => {
          setError('Gagal memproses data CSV: ' + err.message);
          setIsLoading(false);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const parseNumber = (val: string) => {
    if (!val || val === '-') return 0;
    return parseFloat(val.replace(',', '.'));
  };

  const getChartData = (tab: 'RPT' | 'RCT' = activeTab) => {
    const data = tab === 'RPT' ? rptData : rctData;
    return data.map(d => ({
      name: d.bulan.substring(0, 3),
      fullName: d.bulan,
      target: d.target === '-' ? null : parseNumber(d.target),
      denganCT: d.denganCT === '-' ? null : parseNumber(d.denganCT),
      diluarCT: d.diluarCT === '-' ? null : parseNumber(d.diluarCT),
      realisasi: tab === 'RPT' 
        ? ((d as RPTData).realisasiTanpaCT === '-' ? null : parseNumber((d as RPTData).realisasiTanpaCT)) 
        : ((d as RCTData).realisasiDiluarCT === '-' ? null : parseNumber((d as RCTData).realisasiDiluarCT))
    }));
  };

  const chartData = getChartData();

  if (isLoading && rptData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400">Memuat data RPT & RCT...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p>{error}</p>
        <button 
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const renderChart = (tab: 'RPT' | 'RCT') => {
    const data = getChartData(tab);
    return (
      <Card title={`Grafik ${tab} 2026`}>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
            <Activity className="w-12 h-12 mb-4 opacity-20" />
            <p>Belum ada data untuk ditampilkan</p>
          </div>
        ) : (
          <div className="h-[400px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280', dy: 10 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip 
                  cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  labelFormatter={(_, payload) => payload.length > 0 ? payload[0].payload.fullName : ''}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="target" name="Target" stroke="#fecdd3" strokeWidth={2} activeDot={{ r: 6 }}>
                  <LabelList dataKey="target" position="top" fill="#be123c" fontSize={11} offset={10} />
                </Line>
                <Line type="monotone" dataKey="denganCT" name="Dengan CT" stroke="#f43f5e" strokeWidth={2} activeDot={{ r: 6 }}>
                  <LabelList dataKey="denganCT" position="top" fill="#f43f5e" fontSize={11} offset={10} />
                </Line>
                <Line type="monotone" dataKey="diluarCT" name="Diluar CT" stroke="#9f1239" strokeWidth={2} activeDot={{ r: 6 }}>
                  <LabelList dataKey="diluarCT" position="top" fill="#9f1239" fontSize={11} offset={10} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    );
  };

  const renderTable = (tab: 'RPT' | 'RCT') => {
    const data = tab === 'RPT' ? rptData : rctData;
    return (
      <Card 
        title={`Detail Data ${tab}`}
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
                <th className="px-4 py-3 font-medium">Bulan</th>
                <th className="px-4 py-3 font-medium text-right">Target</th>
                <th className="px-4 py-3 font-medium text-right">Dengan CT</th>
                <th className="px-4 py-3 font-medium text-right">Diluar CT</th>
                <th className="px-4 py-3 font-medium text-right">% Dengan CT</th>
                <th className="px-4 py-3 font-medium text-right">Realisasi {tab === 'RPT' ? 'Tanpa' : 'Diluar'} CT</th>
                <th className="px-4 py-3 font-medium text-right">Pencapaian</th>
                {tab === 'RPT' && (
                  <>
                    <th className="px-4 py-3 font-medium text-right">WO Masuk</th>
                    <th className="px-4 py-3 font-medium text-right">WO Tanpa CT</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.map((row, index) => (
                <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{row.bulan}</td>
                  <td className="px-4 py-3 text-right">{row.target}</td>
                  <td className="px-4 py-3 text-right">{row.denganCT}</td>
                  <td className="px-4 py-3 text-right">{row.diluarCT}</td>
                  <td className="px-4 py-3 text-right">{row.persenDenganCT}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {tab === 'RPT' ? (row as RPTData).realisasiTanpaCT : (row as RCTData).realisasiDiluarCT}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-rose-600 dark:text-rose-500">{row.pencapaian}</td>
                  {tab === 'RPT' && (
                    <>
                      <td className="px-4 py-3 text-right">{(row as RPTData).woMasuk}</td>
                      <td className="px-4 py-3 text-right">{(row as RPTData).woTanpaCT}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-rose-500" />
            Laporan RPT & RCT
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Rekap Pemadaman Terencana (RPT) dan Rekap Cepat Tanggap (RCT)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 w-fit">
        <button
          onClick={() => setActiveTab('RPT')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'RPT'
              ? "bg-rose-500 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          )}
        >
          RPT
        </button>
        <button
          onClick={() => setActiveTab('RCT')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'RCT'
              ? "bg-rose-500 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          )}
        >
          RCT
        </button>
      </div>

      {/* Chart */}
      <Card title={`Grafik ${activeTab} 2026`}>
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
            <Activity className="w-12 h-12 mb-4 opacity-20" />
            <p>Belum ada data untuk ditampilkan</p>
          </div>
        ) : (
          <div className="h-[400px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280', dy: 10 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip 
                  cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  labelFormatter={(_, payload) => payload.length > 0 ? payload[0].payload.fullName : ''}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="target" name="Target" stroke="#fecdd3" strokeWidth={2} activeDot={{ r: 6 }}>
                  <LabelList dataKey="target" position="top" fill="#be123c" fontSize={11} offset={10} />
                </Line>
                <Line type="monotone" dataKey="denganCT" name="Dengan CT" stroke="#f43f5e" strokeWidth={2} activeDot={{ r: 6 }}>
                  <LabelList dataKey="denganCT" position="top" fill="#f43f5e" fontSize={11} offset={10} />
                </Line>
                <Line type="monotone" dataKey="diluarCT" name="Diluar CT" stroke="#9f1239" strokeWidth={2} activeDot={{ r: 6 }}>
                  <LabelList dataKey="diluarCT" position="top" fill="#9f1239" fontSize={11} offset={10} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Data Table */}
      <Card 
        title={`Detail Data ${activeTab}`}
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
                <th className="px-4 py-3 font-medium">Bulan</th>
                <th className="px-4 py-3 font-medium text-right">Target</th>
                <th className="px-4 py-3 font-medium text-right">Dengan CT</th>
                <th className="px-4 py-3 font-medium text-right">Diluar CT</th>
                <th className="px-4 py-3 font-medium text-right">% Dengan CT</th>
                <th className="px-4 py-3 font-medium text-right">Realisasi {activeTab === 'RPT' ? 'Tanpa' : 'Diluar'} CT</th>
                <th className="px-4 py-3 font-medium text-right">Pencapaian</th>
                {activeTab === 'RPT' && (
                  <>
                    <th className="px-4 py-3 font-medium text-right">WO Masuk</th>
                    <th className="px-4 py-3 font-medium text-right">WO Tanpa CT</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {(activeTab === 'RPT' ? rptData : rctData).map((row, idx) => (
                <tr 
                  key={idx}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">
                    {row.bulan}
                  </td>
                  <td className="px-4 py-3 text-right">{row.target}</td>
                  <td className="px-4 py-3 text-right">{row.denganCT}</td>
                  <td className="px-4 py-3 text-right">{row.diluarCT}</td>
                  <td className="px-4 py-3 text-right">
                    {row.persenDenganCT !== '-' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                        {row.persenDenganCT}
                      </span>
                    )}
                    {row.persenDenganCT === '-' && '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-rose-600 dark:text-rose-400">
                    {activeTab === 'RPT' ? (row as RPTData).realisasiTanpaCT : (row as RCTData).realisasiDiluarCT}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.pencapaian !== '-' && (
                      <span className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        parseNumber(row.pencapaian) >= 100
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                      )}>
                        {row.pencapaian}
                      </span>
                    )}
                    {row.pencapaian === '-' && '-'}
                  </td>
                  {activeTab === 'RPT' && (
                    <>
                      <td className="px-4 py-3 text-right">{(row as RPTData).woMasuk}</td>
                      <td className="px-4 py-3 text-right">{(row as RPTData).woTanpaCT}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
