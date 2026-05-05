import React, { useState, useEffect } from 'react';
import { TrendingUp, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './UI';
import { cn } from '../utils';

interface CurrencyData {
  code: string;
  name: string;
  rate: number;
  flag: string;
}

export const CurrencyWidget: React.FC = () => {
  const [rates, setRates] = useState<CurrencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      // Using a free API for currency rates
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (!response.ok) throw new Error('Gagal mengambil data kurs');
      
      const data = await response.json();
      const idrRate = data.rates.IDR;
      
      const currencies = [
        { code: 'USD', name: 'US Dollar', rate: idrRate, flag: '🇺🇸' },
        { code: 'MYR', name: 'Ringgit Malaysia', rate: idrRate / data.rates.MYR, flag: '🇲🇾' },
        { code: 'SGD', name: 'Singapore Dollar', rate: idrRate / data.rates.SGD, flag: '🇸🇬' },
        { code: 'EUR', name: 'Euro', rate: idrRate / data.rates.EUR, flag: '🇪🇺' },
      ];
      
      // Artificial delay to show animation if it's too fast
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setRates(currencies);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Currency fetch error:', err);
      setError('Gagal memuat data kurs real-time');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    // Refresh every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Card 
      title="Kurs Mata Uang (Real-time)" 
      extra={
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {loading && rates.length > 0 && (
              <motion.span 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="text-[9px] font-black text-amber-500 uppercase tracking-widest"
              >
                Refreshing...
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      }
    >
      <div className="space-y-3 relative">
        {loading && rates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full"
            />
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Memuat Kurs Terbaru...</p>
          </div>
        ) : error && rates.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-rose-500 font-bold">{error}</p>
            <button onClick={fetchRates} className="text-[10px] underline mt-2 text-zinc-500">Coba Lagi</button>
          </div>
        ) : (
          <>
            <div className={cn("grid grid-cols-1 gap-2 transition-opacity duration-300", loading ? "opacity-60" : "opacity-100")}>
              {rates.map((currency, index) => (
                <motion.div 
                  key={currency.code}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-2.5 bg-white/30 dark:bg-white/5 rounded-xl border border-white/20 dark:border-white/5 group hover:bg-white/50 dark:hover:bg-white/10 transition-all relative overflow-hidden"
                >
                  {loading && (
                    <motion.div 
                      className="absolute inset-0 bg-amber-500/5"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    />
                  )}
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="text-xl drop-shadow-sm">{currency.flag}</div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider leading-none">{currency.name}</p>
                      <p className="text-xs font-black text-zinc-900 dark:text-white mt-1">1 {currency.code}</p>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <p className="text-sm font-black text-zinc-900 dark:text-white tabular-nums drop-shadow-sm">
                      {formatCurrency(currency.rate)}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Real-time</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                <Coins className="w-3 h-3" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Sumber: ExchangeRate-API</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Update: {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                {loading && (
                  <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter animate-pulse">
                    Syncing...
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
