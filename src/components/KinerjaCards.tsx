import React, { useState, useEffect } from 'react';
import { Card } from './UI';
import { Activity, Zap, AlertTriangle } from 'lucide-react';

interface KinerjaData {
  saidi: string;
  saifi: string;
  ens: string;
}

export const KinerjaCards: React.FC = () => {
  const [data, setData] = useState<KinerjaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://docs.google.com/spreadsheets/d/1IfBQSLlqnJsf2DulM0kw-yTA6zr6Sum75mQOZpGUAJM/export?format=csv&gid=1606832216');
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const text = await response.text();
      
      // Basic CSV parsing
      const rows: string[][] = [];
      const lines = text.split('\n');
      
      for (const line of lines) {
        const cols = [];
        let inQuote = false;
        let currentCol = '';
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuote = !inQuote;
          } else if (char === ',' && !inQuote) {
            cols.push(currentCol);
            currentCol = '';
          } else {
            currentCol += char;
          }
        }
        cols.push(currentCol);
        rows.push(cols.map(c => c.trim().replace(/^"|"$/g, '')));
      }

      // Helper to get value from column N (index 13) for a specific row (0-indexed)
      const getValue = (rowIndex: number) => {
        return rows[rowIndex] && rows[rowIndex][13] ? rows[rowIndex][13].trim() : '-';
      };

      // SAIDI: N22 -> row index 21
      const saidi = getValue(21);
      
      // SAIFI: N38 -> row index 37
      const saifi = getValue(37);
      
      // ENS: N54 -> row index 53
      const ens = getValue(53);

      setData({ saidi, saifi, ens });
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data kinerja');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getColorClass = (value: string) => {
    if (value.includes('-')) return 'text-rose-600 dark:text-rose-400 drop-shadow-md';
    if (value !== '-') return 'text-emerald-600 dark:text-emerald-400 drop-shadow-md';
    return 'text-zinc-900 dark:text-white drop-shadow-md';
  };

  if (isLoading && !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i}>
            <Card className="animate-pulse h-28 flex items-center justify-center">
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="flex flex-col justify-center items-center p-6 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Activity className="w-24 h-24" />
        </div>
        <h3 className="text-sm font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2 drop-shadow-sm">SAIDI</h3>
        <p className={`text-3xl font-black ${getColorClass(data?.saidi || '-')}`}>
          {data?.saidi || '-'}
        </p>
      </Card>
      
      <Card className="flex flex-col justify-center items-center p-6 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Zap className="w-24 h-24" />
        </div>
        <h3 className="text-sm font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2 drop-shadow-sm">SAIFI</h3>
        <p className={`text-3xl font-black ${getColorClass(data?.saifi || '-')}`}>
          {data?.saifi || '-'}
        </p>
      </Card>
      
      <Card className="flex flex-col justify-center items-center p-6 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <AlertTriangle className="w-24 h-24" />
        </div>
        <h3 className="text-sm font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2 drop-shadow-sm">ENS</h3>
        <p className={`text-3xl font-black ${getColorClass(data?.ens || '-')}`}>
          {data?.ens || '-'}
        </p>
      </Card>
    </div>
  );
};
