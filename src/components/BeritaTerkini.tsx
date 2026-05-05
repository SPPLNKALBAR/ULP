import React, { useState, useEffect } from 'react';
import { Card } from './UI';
import { Globe, RefreshCw, ExternalLink, Clock } from 'lucide-react';
import { cn } from '../utils';

interface NewsItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
  enclosure: any;
  categories: string[];
}

export const BeritaTerkini: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'nasional' | 'internasional'>('nasional');

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchNews = async (isBackground = false) => {
    try {
      if (isBackground) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const timestamp = new Date().getTime();
      const rssUrl = activeTab === 'nasional' 
        ? `https://news.google.com/rss?hl=id&gl=ID&ceid=ID:id&t=${timestamp}`
        : `https://news.google.com/rss/headlines/section/topic/WORLD?hl=id&gl=ID&ceid=ID:id&t=${timestamp}`;
      
      // Tambahkan cache buster ke API rss2json juga
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&api_key=&_=${timestamp}`);
      
      if (!response.ok) {
        throw new Error('Gagal mengambil berita');
      }
      
      const data = await response.json();
      
      if (data.status === 'ok') {
        setNews(data.items || []);
        setLastUpdated(new Date());
      } else {
        throw new Error('Format data berita tidak valid');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat berita terkini. Silakan coba lagi nanti.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
    
    // Refresh news every 3 minutes for more "real-time" feel
    const interval = setInterval(() => {
      fetchNews(true);
    }, 3 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [activeTab]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} detik yang lalu`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} hari yang lalu`;
  };

  const extractImage = (item: NewsItem) => {
    if (item.thumbnail) return item.thumbnail;
    if (item.enclosure?.link) return item.enclosure.link;
    
    const html = item.content || item.description || '';
    const imgRegex = /<img[^>]+src="([^">]+)"/i;
    const match = html.match(imgRegex);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  };

  return (
    <Card className="h-full flex flex-col relative" bodyClassName="flex-1 flex flex-col min-h-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              Berita Terkini
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              {isRefreshing && <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Sumber: Google News</p>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">•</span>
              <p className="text-[10px] text-blue-500 dark:text-blue-400 font-bold">
                Update: {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 dark:bg-black/20 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setActiveTab('nasional')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                activeTab === 'nasional' 
                  ? "bg-white/20 dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              Nasional
            </button>
            <button
              onClick={() => setActiveTab('internasional')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                activeTab === 'internasional' 
                  ? "bg-white/20 dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              Internasional
            </button>
          </div>
          <button 
            onClick={() => fetchNews(false)}
            disabled={isLoading || isRefreshing}
            className="p-1.5 text-zinc-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <RefreshCw className={cn("w-4 h-4", (isLoading || isRefreshing) && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse flex flex-col gap-2 p-2.5 bg-zinc-50 dark:bg-zinc-800/20 rounded-lg">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
                <div className="flex justify-between mt-1">
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-20"></div>
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-sm text-rose-500 dark:text-rose-400 mb-2">{error}</p>
            <button 
              onClick={() => fetchNews(false)}
              className="text-xs font-bold text-blue-500 hover:underline"
            >
              Coba Lagi
            </button>
          </div>
        ) : news.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-zinc-500 dark:text-zinc-400 text-sm">
            Tidak ada berita saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {news.map((item, index) => {
              return (
                <a 
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-1.5 p-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700/50 transition-all"
                >
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug drop-shadow-sm">
                    {item.title}
                  </h4>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-blue-800 dark:text-blue-200 bg-blue-200/60 dark:bg-blue-800/60 px-2 py-0.5 rounded-full truncate max-w-[150px] border border-blue-300/40">
                        {item.author || item.title.split(' - ').pop() || 'Google News'}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-zinc-700 dark:text-zinc-200 font-bold whitespace-nowrap drop-shadow-sm">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(item.pubDate)}
                      </span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-zinc-300 dark:text-zinc-600 group-hover:text-blue-500 transition-colors shrink-0" />
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};
