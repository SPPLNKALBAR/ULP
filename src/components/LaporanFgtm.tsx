import React, { useEffect, useState } from 'react';
import { Card } from './UI';
import { AlertCircle, RefreshCw, Activity, PieChart as PieChartIcon } from 'lucide-react';
import { cn } from '../utils';
import { fetchFgtmReportData } from '../services/sheetService';
import { FgtmReportData, FgtmCategoryData } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'
];

export function LaporanFgtm() {
  const [data, setData] = useState<FgtmReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'lessThan5' | 'moreThan5' | 'zona'>('lessThan5');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFgtmReportData();
      setData(result);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400">Memuat data FGTM...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p>{error}</p>
        <button 
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const activeData: FgtmCategoryData | undefined = data ? (
    activeTab === 'lessThan5' ? data.lessThan5Min :
    activeTab === 'moreThan5' ? data.moreThan5Min :
    data.zona1and2
  ) : undefined;

  const getPieData = (rows: any[]) => {
    if (!rows || rows.length === 0) return [];
    
    const headers = Object.keys(rows[0]);
    
    // Find the label key (Penyebab/Gangguan)
    // 1. Check headers
    let labelKey = headers.find(h => 
      h.toUpperCase().includes('PENYEBAB') || 
      h.toUpperCase().includes('GANGGUAN') ||
      h.toUpperCase().includes('KETERANGAN')
    );

    // 2. Check first row of data if header didn't match
    if (!labelKey && rows.length > 0) {
      labelKey = headers.find(h => {
        const val = String(rows[0][h] || '').toUpperCase();
        return val.includes('PENYEBAB') || val.includes('GANGGUAN') || val.includes('KETERANGAN');
      });
    }

    if (!labelKey) labelKey = headers[0];

    // Find the value key (Total/Jumlah/Kumulatif)
    // 1. Check headers
    let valueKey = headers.find(h => 
      h.toUpperCase() === 'TOTAL' || 
      h.toUpperCase() === 'JUMLAH' ||
      (h.toUpperCase().includes('TOTAL') && !h.toUpperCase().includes('%')) ||
      (h.toUpperCase().includes('JUMLAH') && !h.toUpperCase().includes('%')) ||
      h.toUpperCase().includes('KUMULATIF')
    );

    // 2. Check first row of data if header didn't match
    if (!valueKey && rows.length > 0) {
      valueKey = headers.find(h => {
        const val = String(rows[0][h] || '').toUpperCase();
        return val === 'TOTAL' || val === 'JUMLAH' || val.includes('TOTAL') || val.includes('KUMULATIF');
      });
    }

    // 3. Fallback to last column
    if (!valueKey) valueKey = headers[headers.length - 1];

    return rows
      .map(row => {
        const valStr = String(row[valueKey] || '0').replace(',', '.').replace(/[^0-9.]/g, '');
        const val = parseFloat(valStr);
        return {
          name: row[labelKey],
          value: isNaN(val) ? 0 : val
        };
      })
      .filter(item => 
        item.value > 0 && 
        item.name && 
        !item.name.toUpperCase().includes('TOTAL') &&
        !item.name.toUpperCase().includes('JUMLAH') &&
        !item.name.toUpperCase().includes('PENYEBAB') &&
        !item.name.toUpperCase().includes('GANGGUAN')
      );
  };

  const pieData = activeData ? getPieData(activeData.summary) : [];

  const renderPieChart = () => (
    <Card title="Grafik Penyebab Trip Komulatif" icon={<PieChartIcon className="w-4 h-4 text-emerald-500" />}>
      {pieData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
          <Activity className="w-12 h-12 mb-4 opacity-20" />
          <p>Belum ada data penyebab trip untuk ditampilkan</p>
        </div>
      ) : (
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );

  const renderTable = (rows: any[], title: string) => {
    if (!rows || rows.length === 0) return null;
    const headers = Object.keys(rows[0]);

    return (
      <Card title={title} bodyClassName="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-left border-collapse">
            <thead className="text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                {headers.map(h => (
                  <th key={h} className="px-4 py-3 font-black border-r border-zinc-200 dark:border-zinc-800 last:border-r-0 whitespace-nowrap tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors group">
                  {headers.map(h => (
                    <td key={h} className="px-4 py-3 border-r border-zinc-100 dark:border-zinc-800 last:border-r-0 whitespace-nowrap font-bold text-zinc-700 dark:text-zinc-300">
                      {row[h]}
                    </td>
                  ))}
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
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
            <Activity className="w-6 h-6 text-emerald-500" />
            Laporan FGTM
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Frekuensi Gangguan Tiap Menit/Penyulang
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
              Update: {lastUpdated.toLocaleTimeString('id-ID')}
            </span>
          )}
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
        <button
          onClick={() => setActiveTab('lessThan5')}
          className={cn(
            "flex-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
            activeTab === 'lessThan5' 
              ? "bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm" 
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          )}
        >
          Gangguan &lt; 5 Menit
        </button>
        <button
          onClick={() => setActiveTab('moreThan5')}
          className={cn(
            "flex-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
            activeTab === 'moreThan5' 
              ? "bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm" 
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          )}
        >
          Gangguan &gt; 5 Menit
        </button>
        <button
          onClick={() => setActiveTab('zona')}
          className={cn(
            "flex-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
            activeTab === 'zona' 
              ? "bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm" 
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          )}
        >
          FGTM Zona 1 & 2
        </button>
      </div>

      {activeData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {renderTable(activeData.monthly, "Data Bulanan")}
            {renderTable(activeData.summary, "Ringkasan Data")}
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              {renderPieChart()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
