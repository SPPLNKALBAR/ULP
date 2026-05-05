import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Card } from './UI';
import { Loader2, AlertCircle, RefreshCw, Activity } from 'lucide-react';
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

interface SaidiData {
  tahun: string;
  bulan: string;
  target: string;
  unitTerencana: string;
  unitTidakTerencana: string;
  kontribusiUnit: string;
  tetanggaTerencana: string;
  tetanggaTidakTerencana: string;
  kontribusiUnitTetangga: string;
  realisasiBulanan: string;
  persenTetangga: string;
  realisasiKumulatif: string;
  pencapaian: string;
  toleransiBulanan: string;
}

export function LaporanSaidi() {
  const [data, setData] = useState<SaidiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://docs.google.com/spreadsheets/d/1IfBQSLlqnJsf2DulM0kw-yTA6zr6Sum75mQOZpGUAJM/export?format=csv&gid=1606832216');
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        complete: (results) => {
          const rows = results.data as string[][];
          
          const yearRow = rows[5] || [];
          const tahun = yearRow[2] || '2026';
          
          const parsedData: SaidiData[] = [];
          
          for (let i = 9; i <= 20; i++) {
            const row = rows[i];
            if (!row || row.length < 16) continue;
            
            const bulan = row[2];
            if (!bulan) continue;
            
            parsedData.push({
              tahun,
              bulan,
              target: row[3] || '0',
              unitTerencana: row[4] || '0',
              unitTidakTerencana: row[5] || '0',
              kontribusiUnit: row[6] || '0',
              tetanggaTerencana: row[7] || '0',
              tetanggaTidakTerencana: row[8] || '0',
              kontribusiUnitTetangga: row[9] || '0',
              realisasiBulanan: row[10] || '0',
              persenTetangga: row[11] || '0',
              realisasiKumulatif: row[12] || '0',
              pencapaian: row[13] || '0',
              toleransiBulanan: row[15] || '0',
            });
          }
          
          setData(parsedData);
          setLastUpdated(new Date());
          setLoading(false);
        },
        error: (err: any) => {
          setError(err.message);
          setLoading(false);
        }
      });
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const parseNumber = (val: string) => {
    if (!val || val === '-' || val === '') return 0;
    return parseFloat(val.replace(',', '.'));
  };

  const chartData = data.filter(d => d.target && d.target !== '-' && d.target !== '').map(d => ({
    name: d.bulan.substring(0, 3),
    fullName: d.bulan,
    target: parseNumber(d.target),
    realisasiKumulatif: parseNumber(d.realisasiKumulatif),
  }));

  if (loading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400">Memuat data SAIDI...</p>
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

  const renderChart = () => (
    <Card title="Grafik SAIDI 2026">
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
              <Line type="monotone" dataKey="target" name="Target" stroke="#bfdbfe" strokeWidth={2} activeDot={{ r: 6 }}>
                <LabelList dataKey="target" position="top" fill="#1e3a8a" fontSize={11} offset={10} formatter={(val: number) => val > 0 ? val.toLocaleString('id-ID') : ''} />
              </Line>
              <Line type="monotone" dataKey="realisasiKumulatif" name="Realisasi Kumulatif" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 6 }}>
                <LabelList dataKey="realisasiKumulatif" position="top" fill="#3b82f6" fontSize={11} offset={10} formatter={(val: number) => val > 0 ? val.toLocaleString('id-ID') : ''} />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );

  const renderTable = () => (
    <Card 
      title="Detail Data SAIDI"
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
              <th rowSpan={2} className="px-4 py-3 font-medium border-b border-r dark:border-zinc-700">Bulan</th>
              <th rowSpan={2} className="px-4 py-3 font-medium text-right border-b border-r dark:border-zinc-700">Target</th>
              <th colSpan={2} className="px-4 py-2 font-medium text-center border-b border-r dark:border-zinc-700">Unit</th>
              <th rowSpan={2} className="px-4 py-3 font-medium text-center border-b border-r dark:border-zinc-700">Kontribusi Unit</th>
              <th colSpan={2} className="px-4 py-2 font-medium text-center border-b border-r dark:border-zinc-700">Tetangga</th>
              <th rowSpan={2} className="px-4 py-3 font-medium text-center border-b border-r dark:border-zinc-700">Kontribusi Unit Tetangga</th>
              <th rowSpan={2} className="px-4 py-3 font-medium text-right border-b border-r dark:border-zinc-700">Realisasi Bulanan</th>
              <th rowSpan={2} className="px-4 py-3 font-medium text-right border-b border-r dark:border-zinc-700">% Tetangga Terhadap Realisasi</th>
              <th rowSpan={2} className="px-4 py-3 font-medium text-right border-b border-r dark:border-zinc-700">Realisasi Kumulatif</th>
              <th rowSpan={2} className="px-4 py-3 font-medium text-right border-b border-r dark:border-zinc-700">Pencapaian</th>
              <th rowSpan={2} className="px-4 py-3 font-medium text-right border-b dark:border-zinc-700">Toleransi Bulanan</th>
            </tr>
            <tr>
              <th className="px-4 py-2 font-medium text-right border-b border-r dark:border-zinc-700">Terencana</th>
              <th className="px-4 py-2 font-medium text-right border-b border-r dark:border-zinc-700">Tidak Terencana</th>
              <th className="px-4 py-2 font-medium text-right border-b border-r dark:border-zinc-700">Terencana</th>
              <th className="px-4 py-2 font-medium text-right border-b border-r dark:border-zinc-700">Tidak Terencana</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white border-r dark:border-zinc-800">{row.bulan}</td>
                <td className="px-4 py-3 text-right border-r dark:border-zinc-800">{row.target}</td>
                <td className="px-4 py-3 text-right border-r dark:border-zinc-800">{row.unitTerencana}</td>
                <td className="px-4 py-3 text-right border-r dark:border-zinc-800">{row.unitTidakTerencana}</td>
                <td className="px-4 py-3 text-center font-medium bg-zinc-50/50 dark:bg-zinc-800/20 border-r dark:border-zinc-800">{row.kontribusiUnit}</td>
                <td className="px-4 py-3 text-right border-r dark:border-zinc-800">{row.tetanggaTerencana}</td>
                <td className="px-4 py-3 text-right border-r dark:border-zinc-800">{row.tetanggaTidakTerencana}</td>
                <td className="px-4 py-3 text-center font-medium bg-zinc-50/50 dark:bg-zinc-800/20 border-r dark:border-zinc-800">{row.kontribusiUnitTetangga}</td>
                <td className="px-4 py-3 text-right font-bold text-amber-600 dark:text-amber-500 border-r dark:border-zinc-800">{row.realisasiBulanan}</td>
                <td className="px-4 py-3 text-right border-r dark:border-zinc-800">
                  {row.persenTetangga && row.persenTetangga !== '-' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                      {row.persenTetangga}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-500 border-r dark:border-zinc-800">{row.realisasiKumulatif}</td>
                <td className="px-4 py-3 text-right border-r dark:border-zinc-800">
                  {row.pencapaian && row.pencapaian !== '-' && (
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                      parseNumber(row.pencapaian) >= 100
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                    )}>
                      {row.pencapaian}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-medium text-rose-600 dark:text-rose-400">{row.toleransiBulanan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-500" />
            Laporan SAIDI
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            System Average Interruption Duration Index
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Chart */}
      {renderChart()}

      {/* Data Table */}
      {renderTable()}
    </div>
  );
}
