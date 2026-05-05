import React, { useState, useEffect } from 'react';
import { Card } from './UI';
import { Server, Search, RefreshCw, AlertCircle, Filter, Zap, Activity, Battery } from 'lucide-react';
import { fetchDataGardu, fetchSummaryData } from '../services/sheetService';
import { DataGarduItem, SummaryData } from '../types';
import { cn } from '../utils';

export const DataGardu: React.FC = () => {
  const [data, setData] = useState<DataGarduItem[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadData = async (isBackground = false) => {
    if (!isBackground) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);
    try {
      const [garduResult, summaryResult] = await Promise.all([
        fetchDataGardu(),
        fetchSummaryData()
      ]);
      setData(garduResult);
      setSummary(summaryResult);
    } catch (err) {
      console.error(err);
      if (!isBackground) setError('Gagal memuat data gardu dari spreadsheet.');
    } finally {
      if (!isBackground) {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    loadData();

    // Set up polling for realtime updates every 15 seconds
    const intervalId = setInterval(() => {
      loadData(true);
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  // Get unique statuses for the filter dropdown
  const uniqueStatuses = Array.from(new Set(data.map(item => item.status).filter(Boolean)));

  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.nomorGardu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.maximoGardu.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {isLoading ? (
        <Card className="p-0 overflow-hidden">
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400">Memuat data gardu...</p>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-0 overflow-hidden">
          <div className="flex flex-col items-center justify-center py-20 text-red-500">
            <AlertCircle className="w-12 h-12 mb-4" />
            <p>{error}</p>
            <button 
              onClick={() => loadData(false)}
              className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </Card>
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="p-5 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Server className="w-24 h-24 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <Server className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">Total Gardu</h3>
                  </div>
                  <div className="text-4xl font-bold text-zinc-900 dark:text-white mb-1">
                    {summary.totalGardu}
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Gardu Terdata</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Kapasitas (kVA)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {summary.kapasitas.map((k, idx) => (
                      <div key={idx} className="flex flex-col">
                        <span className="text-xs text-zinc-500">{k.kva}</span>
                        <span className="font-medium text-zinc-900 dark:text-white">{k.jumlah}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-5 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Activity className="w-24 h-24 text-emerald-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">Kondisi Trafo</h3>
                  </div>
                  <div className="text-4xl font-bold text-zinc-900 dark:text-white mb-1">
                    {summary.kondisiTrafo.find(k => k.kondisi.toUpperCase().includes('NORMAL'))?.jumlah || '0'}
                  </div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Trafo Normal</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Status Lainnya</h4>
                  <div className="space-y-2">
                    {summary.kondisiTrafo.filter(k => !k.kondisi.toUpperCase().includes('NORMAL')).map((k, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">{k.kondisi}</span>
                        <span className={cn(
                          "text-sm font-medium px-2 py-0.5 rounded-full",
                          k.kondisi.toUpperCase().includes('WARNING') ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          k.kondisi.toUpperCase().includes('OVERLOAD') ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" :
                          "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        )}>
                          {k.jumlah}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-5 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap className="w-24 h-24 text-blue-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">Pembebanan Trafo</h3>
                  </div>
                  <div className="text-4xl font-bold text-zinc-900 dark:text-white mb-1">
                    {summary.pembebananTrafo.find(k => k.kondisi.toUpperCase().includes('NORMAL'))?.jumlah || '0'}
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Beban Normal</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Status Pembebanan</h4>
                  <div className="space-y-2">
                    {summary.pembebananTrafo.filter(k => !k.kondisi.toUpperCase().includes('NORMAL')).map((k, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">{k.kondisi}</span>
                        <span className={cn(
                          "text-sm font-medium px-2 py-0.5 rounded-full",
                          k.kondisi.toUpperCase().includes('WARNING') ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          k.kondisi.toUpperCase().includes('UNBALANCED') ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                          "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        )}>
                          {k.jumlah}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">List Gardu</h3>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Live
                  {isRefreshing && <RefreshCw className="w-3 h-3 ml-1 animate-spin" />}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari No/Maximo Gardu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md leading-5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-colors"
                  />
                </div>
                <div className="relative w-full sm:w-48">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-zinc-400" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full pl-10 pr-8 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md leading-5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-colors appearance-none"
                  >
                    <option value="ALL">Semua Status</option>
                    {uniqueStatuses.map((status, idx) => (
                      <option key={idx} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <Server className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                  Tidak ada data gardu
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
                  {searchTerm || statusFilter !== 'ALL' 
                    ? 'Tidak ditemukan gardu yang sesuai dengan pencarian/filter.' 
                    : 'Data gardu kosong.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[600px]">
                <table className="min-w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
                      <th className="px-4 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap">No</th>
                      <th className="px-4 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap">Maximo</th>
                      <th className="px-4 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap">Gardu</th>
                      <th className="px-4 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap">Lokasi</th>
                      <th className="px-4 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap">Feeder</th>
                      <th className="px-4 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap">Kapasitas</th>
                      <th className="px-4 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap">Losses</th>
                      <th className="px-4 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap">Keseimbangan</th>
                      <th className="px-4 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap">Pembebanan</th>
                      <th className="px-4 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr key={index} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{item.no}</td>
                        <td className="px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white whitespace-nowrap">{item.maximoGardu}</td>
                        <td className="px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white whitespace-nowrap">{item.nomorGardu}</td>
                        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{item.lokasi}</td>
                        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{item.feeder}</td>
                        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{item.kapasitas}</td>
                        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{item.losses}</td>
                        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{item.keseimbanganTrafo}</td>
                        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{item.totalPembebanan}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={cn(
                            "px-2 py-1 text-xs font-bold rounded-full tracking-wider",
                            item.status.toUpperCase() === 'NORMAL' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                            item.status.toUpperCase() === 'WARNING' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                            item.status.toUpperCase() === 'OVERLOAD' ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" :
                            "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                          )}>
                            {item.status || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
