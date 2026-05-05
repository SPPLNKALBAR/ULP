import React, { useState, useEffect } from 'react';
import { Card } from './UI';
import { Zap, RefreshCw, AlertCircle, Cpu, Activity, Gauge } from 'lucide-react';
import { fetchPltdTemajukData } from '../services/sheetService';
import { PltdTemajukItem } from '../types';
import { cn } from '../utils';

export const PltdTemajuk: React.FC = () => {
  const [data, setData] = useState<PltdTemajukItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const result = await fetchPltdTemajukData();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      if (!silent) setError('Gagal memuat data PLTD Temajuk.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 30 seconds for "real-time" feel
    const interval = setInterval(() => {
      loadData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
            <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">PLTD TEMAJUK</h2>
              {lastUpdated && (
                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400 font-bold uppercase tracking-wider h-fit">
                  Update: {lastUpdated.toLocaleTimeString('id-ID')}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Real-time</span>
          </div>
          <button 
            onClick={() => loadData()}
            disabled={isLoading}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-5 h-5 text-zinc-500", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <Card className="p-12 flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">Memuat data...</p>
        </Card>
      ) : error ? (
        <Card className="p-12 flex flex-col items-center justify-center text-red-500">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p>{error}</p>
          <button 
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"
          >
            Coba Lagi
          </button>
        </Card>
      ) : (
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl p-0 overflow-hidden" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-6 py-4 text-xs font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-widest text-center">MESIN</th>
                    <th className="px-6 py-4 text-xs font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-widest text-center">DAYA TERPASANG (kW)</th>
                    <th className="px-6 py-4 text-xs font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-widest text-center">DAYA MAMPU (kW)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {data.map((item, index) => (
                    <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-tight">{item.mesin || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">{item.dayaTerpasang ? `${item.dayaTerpasang} kW` : '-'}</span>
                      </td>
                      <td className="px-6 py-4 bg-amber-50/30 dark:bg-amber-900/10">
                        <span className="text-sm font-black text-amber-600 dark:text-amber-500">{item.dayaMampu ? `${item.dayaMampu} kW` : '-'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {!isLoading && data.length === 0 && (
        <Card className="p-12 text-center text-zinc-500">
          Tidak ada data yang ditemukan dalam rentang yang ditentukan.
        </Card>
      )}
    </div>
  );
};
