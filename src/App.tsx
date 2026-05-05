import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Zap, 
  AlertTriangle, 
  Settings, 
  BarChart3, 
  Menu, 
  X,
  Gamepad2,
  TrendingDown,
  TrendingUp,
  Clock,
  Database,
  FileText,
  ExternalLink,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
  Monitor,
  Wrench,
  RefreshCw,
  Lock,
  Save,
  Server
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  ReferenceLine,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './utils';
import { Card, KpiCard } from './components/UI';
import { Login } from './components/Login';
import { MOCK_METRICS, GANGGUAN_KEYPOINT_DATA } from './constants';
import { fetchSheetData, fetchGangguanData, SheetData } from './services/sheetService';
import { GangguanKeypoint } from './types';

import { LaporanSaidi } from './components/LaporanSaidi';
import { LaporanSaifi } from './components/LaporanSaifi';
import { LaporanEns } from './components/LaporanEns';
import { LaporanLM } from './components/LaporanLM';
import { PltdTemajuk } from './components/PltdTemajuk';
import { LaporanRptRct } from './components/LaporanRptRct';
import { LaporanFgtm } from './components/LaporanFgtm';
import { DataGardu } from './components/DataGardu';
import { PemeliharaanROW } from './components/PemeliharaanROW';
import { RealisasiROW } from './components/RealisasiROW';
import { BeritaTerkini } from './components/BeritaTerkini';
import { KinerjaCards } from './components/KinerjaCards';
import { KalenderNasional } from './components/KalenderNasional';
import { CurrencyWidget } from './components/CurrencyWidget';
import { CuacaWidget } from './components/CuacaWidget';
import { MotivasiBanner } from './components/MotivasiBanner';
import { KuisGames } from './components/KuisGames';

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPemeliharaanOpen, setIsPemeliharaanOpen] = useState(false);
  const [isLaporanOpen, setIsLaporanOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [gangguanData, setGangguanData] = useState<GangguanKeypoint[]>(GANGGUAN_KEYPOINT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Landing page timer
    const landingTimer = setTimeout(() => {
      setShowLanding(false);
    }, 2500);
    
    // Apply theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => {
      clearInterval(timer);
      clearTimeout(landingTimer);
    };
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, gData] = await Promise.all([
        fetchSheetData(),
        fetchGangguanData()
      ]);
      setSheetData(data);
      if (gData && gData.length > 0) {
        setGangguanData(gData);
      }
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil data dari Spreadsheet. Pastikan Spreadsheet dapat diakses publik.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kuis-games', label: 'KUIS GAMES', icon: Gamepad2 },
    { id: 'data-gardu', label: 'Data Gardu', icon: Server },
    { id: 'lm', label: 'LM (Lead Measure)', icon: Activity },
    { 
      id: 'reports', 
      label: 'Laporan', 
      icon: Database,
      subItems: [
        { id: 'laporan-saidi', label: 'Saidi' },
        { id: 'laporan-saifi', label: 'Saifi' },
        { id: 'laporan-ens', label: 'ENS' },
        { id: 'laporan-rpt-rct', label: 'RPT RCT' },
        { id: 'laporan-fgtm', label: 'FGTM' }
      ]
    },
    { 
      id: 'pemeliharaan', 
      label: 'Pemeliharaan', 
      icon: Wrench,
      subItems: [
        { id: 'pemeliharaan-row', label: 'ROW' },
        { id: 'pemeliharaan-realisasi-row', label: 'Realisasi ROW' },
        { id: 'pemeliharaan-gardu', label: 'Gardu' }
      ]
    },
    { id: 'pltd-temajuk', label: 'PLTD Temajuk', icon: Zap },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setUser(username);
    setShowWelcomePopup(true);
    setTimeout(() => {
      setShowWelcomePopup(false);
    }, 3000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleClearCache = () => {
    setIsClearingCache(true);
    
    // Simulate clearing process for animation effect
    setTimeout(() => {
      const currentUser = user;
      const currentPassword = currentUser ? localStorage.getItem(`password_${currentUser}`) : null;
      
      localStorage.clear();
      
      if (currentUser && currentPassword) {
        localStorage.setItem(`password_${currentUser}`, currentPassword);
      }
      
      setIsClearingCache(false);
      setCacheMessage('Cache berhasil dibersihkan!');
      setTimeout(() => setCacheMessage(null), 3000);
    }, 1500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const storedPassword = localStorage.getItem(`password_${user}`) || 'sekura123';
    
    if (passwordForm.current !== storedPassword) {
      setPasswordMessage({ type: 'error', text: 'Password saat ini salah' });
      return;
    }
    
    if (passwordForm.new.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password baru minimal 6 karakter' });
      return;
    }
    
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordMessage({ type: 'error', text: 'Konfirmasi password tidak cocok' });
      return;
    }

    localStorage.setItem(`password_${user}`, passwordForm.new);
    setPasswordMessage({ type: 'success', text: 'Password berhasil diubah' });
    setPasswordForm({ current: '', new: '', confirm: '' });
    
    setTimeout(() => {
      setPasswordMessage(null);
    }, 3000);
  };

  if (showLanding) {
    return (
      <div 
        className="flex flex-col items-center justify-center h-screen bg-cover bg-center bg-no-repeat transition-colors duration-300 relative"
      >
        <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-0"></div>
        <div className="relative z-10 w-48 h-48 mb-6 animate-pulse">
          <img 
            src="https://lh3.googleusercontent.com/d/17BnbLgrF0_nttIg_Ey2huvRSiFVIHAQS" 
            alt="Logo ULP Sekura"
            className="w-full h-full object-contain drop-shadow-lg"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest animate-pulse">Loading</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div 
      className="flex h-screen bg-cover bg-center bg-no-repeat transition-colors duration-300 overflow-hidden"
    >
      {/* Welcome Popup */}
      {showWelcomePopup && user && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300 max-w-sm w-full mx-4">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mb-4">
              <Zap className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Selamat Datang</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-300">
              Bapak <span className="font-semibold text-amber-600 dark:text-amber-500 uppercase">{user}</span>
            </p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-white/20 dark:bg-black/60 backdrop-blur-2xl text-white transition-all duration-300 flex flex-col border-r border-white/20 dark:border-white/10",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center shrink-0">
            <img 
              src="https://lh3.googleusercontent.com/d/17BnbLgrF0_nttIg_Ey2huvRSiFVIHAQS" 
              alt="Logo ULP Sekura"
              className="w-full h-full object-contain drop-shadow-sm"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://picsum.photos/seed/pln-logo/100/100";
              }}
            />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="font-black text-sm tracking-tight uppercase leading-tight text-white drop-shadow-md">ULP SEKURA</h1>
              <p className="text-[10px] text-zinc-200 uppercase tracking-widest leading-tight mt-0.5 font-bold drop-shadow-sm">Kinerja Teknik</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.subItems) {
                    if (item.id === 'pemeliharaan') setIsPemeliharaanOpen(!isPemeliharaanOpen);
                    if (item.id === 'reports') setIsLaporanOpen(!isLaporanOpen);
                    if (!isSidebarOpen) setIsSidebarOpen(true);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group shadow-sm",
                  (activeTab === item.id || (item.subItems && item.subItems.some(sub => sub.id === activeTab)))
                    ? "bg-amber-500 text-zinc-950 font-black shadow-amber-500/20" 
                    : "text-zinc-100 hover:bg-white/10 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 shrink-0" />
                  {isSidebarOpen && <span className="text-sm font-bold drop-shadow-sm">{item.label}</span>}
                </div>
                {item.subItems && isSidebarOpen && (
                  <ChevronDown className={cn("w-4 h-4 transition-transform text-zinc-300 group-hover:text-white", (activeTab === item.id || (item.subItems && item.subItems.some(sub => sub.id === activeTab))) && "text-zinc-950 group-hover:text-zinc-950", (item.id === 'pemeliharaan' ? isPemeliharaanOpen : isLaporanOpen) && "rotate-180")} />
                )}
              </button>
              
              {item.subItems && (item.id === 'pemeliharaan' ? isPemeliharaanOpen : isLaporanOpen) && isSidebarOpen && (
                <div className="mt-1 ml-4 pl-4 border-l-2 border-white/10 space-y-1">
                  {item.subItems.map(subItem => (
                    <button
                      key={subItem.id}
                      onClick={() => setActiveTab(subItem.id)}
                      className={cn(
                        "w-full flex items-center px-3 py-2 rounded-lg transition-all text-sm font-bold drop-shadow-sm",
                        activeTab === subItem.id
                          ? "bg-amber-500 text-zinc-950"
                          : "text-zinc-200 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-100 hover:text-white hover:bg-white/5 rounded-xl transition-all font-bold drop-shadow-sm"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            {isSidebarOpen && <span className="text-sm">Tutup Menu</span>}
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 rounded-xl transition-all font-bold drop-shadow-sm"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="text-sm">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-transparent relative">
        <header className="h-16 bg-white/10 dark:bg-black/20 backdrop-blur-md border-b border-white/10 dark:border-white/5 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white drop-shadow-sm">
              {navItems.find(i => i.id === activeTab)?.label || 
               navItems.flatMap(i => i.subItems || []).find(sub => sub.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-black text-zinc-900 dark:text-white tabular-nums drop-shadow-sm">
                  {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
                <p className="text-[10px] text-zinc-800 dark:text-zinc-200 uppercase tracking-wider font-black drop-shadow-sm">
                  {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <button 
                onClick={loadData}
                disabled={isLoading}
                className="flex flex-col items-center justify-center gap-0.5 px-2 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-amber-500 dark:text-zinc-400 dark:hover:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh Data"
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 drop-shadow-sm">Refresh</span>
              </button>
            </div>
            
            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />

            <CuacaWidget />

            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />

            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 p-1.5 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-xs border border-amber-200 dark:border-amber-800 uppercase group-hover:bg-amber-200 dark:group-hover:bg-amber-800 transition-colors">
                    {user?.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-[10px] text-zinc-700 dark:text-zinc-300 font-black uppercase tracking-wider leading-none drop-shadow-sm">Petugas</p>
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-black text-zinc-900 dark:text-white leading-tight drop-shadow-sm">{user}</p>
                      <ChevronDown className={cn("w-3 h-3 text-zinc-700 dark:text-zinc-300 transition-transform", isProfileOpen && "rotate-180")} />
                    </div>
                  </div>
                </div>
              </button>

              {isProfileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsProfileOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white/90 dark:bg-black/80 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 dark:border-white/10 py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-black/5 dark:border-white/5">
                      <p className="text-[10px] text-zinc-700 dark:text-zinc-300 font-black uppercase tracking-wider drop-shadow-sm">Sesi Aktif</p>
                      <p className="text-xs font-black text-zinc-900 dark:text-white drop-shadow-sm">{user}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-black text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors text-left drop-shadow-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
              <button onClick={loadData} className="ml-auto text-xs underline font-bold">Coba Lagi</button>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <>
              <MotivasiBanner />
              <KinerjaCards />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* News Section */}
                <div className="lg:col-span-1 flex flex-col min-h-0">
                  <BeritaTerkini />
                </div>

                {/* Activities / Reports from Sheet */}
                <div className="lg:col-span-1 flex flex-col gap-6 min-h-0">
                  <KalenderNasional />
                  <CurrencyWidget />
                  <Card title="Lokasi ULP Sekura (Satelit)" bodyClassName="flex flex-col gap-3">
                    <div className="h-[300px] w-full rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800">
                      <iframe 
                        src="https://maps.google.com/maps?q=1.4687355,109.2220727&z=17&t=k&output=embed"
                        className="w-full h-full border-0"
                        title="Google Maps ULP Sekura Satellite"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
                        <span>Koordinat</span>
                        <span className="text-zinc-600 dark:text-zinc-400">1.4687° N, 109.2221° E</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}

          {activeTab === 'kuis-games' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <KuisGames userName={user || 'Petugas'} />
            </div>
          )}

          {activeTab === 'data-gardu' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <DataGardu />
            </div>
          )}

          {activeTab === 'lm' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <LaporanLM />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <Card title="Preferensi Tampilan">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-700">
                        {theme === 'dark' ? <Moon className="w-5 h-5 text-amber-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-800 dark:text-white">Tema Aplikasi</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Pilih antara mode terang atau gelap</p>
                      </div>
                    </div>
                    <div className="flex bg-white dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <button 
                        onClick={() => setTheme('light')}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2",
                          theme === 'light' ? "bg-white text-black shadow-md border border-zinc-200" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                        )}
                      >
                        <Sun className="w-3.5 h-3.5" />
                        Terang
                      </button>
                      <button 
                        onClick={() => setTheme('dark')}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2",
                          theme === 'dark' ? "bg-black text-white shadow-md border border-zinc-700" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                        )}
                      >
                        <Moon className="w-3.5 h-3.5" />
                        Gelap
                      </button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Keamanan Akun">
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {passwordMessage && (
                    <div className={cn(
                      "p-3 rounded-lg text-sm font-medium border",
                      passwordMessage.type === 'success' 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-400" 
                        : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800/30 dark:text-rose-400"
                    )}>
                      {passwordMessage.text}
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                        Password Saat Ini
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-zinc-400" />
                        </div>
                        <input
                          type="password"
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all dark:text-white"
                          placeholder="Masukkan password saat ini"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                        Password Baru
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-zinc-400" />
                        </div>
                        <input
                          type="password"
                          value={passwordForm.new}
                          onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all dark:text-white"
                          placeholder="Minimal 6 karakter"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                        Konfirmasi Password Baru
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-zinc-400" />
                        </div>
                        <input
                          type="password"
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all dark:text-white"
                          placeholder="Ulangi password baru"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-amber-500/20"
                    >
                      <Save className="w-4 h-4" />
                      Simpan Password Baru
                    </button>
                  </div>
                </form>
              </Card>

              <Card title="Informasi Aplikasi">
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-zinc-50 dark:border-zinc-800">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Versi</span>
                    <span className="text-sm font-bold text-zinc-800 dark:text-white">1.2.0-stable</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-50 dark:border-zinc-800">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Unit</span>
                    <span className="text-sm font-bold text-zinc-800 dark:text-white">ULP Sekura</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-50 dark:border-zinc-800">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Terakhir Diperbarui</span>
                    <span className="text-sm font-bold text-zinc-800 dark:text-white">28 Februari 2026</span>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      onClick={handleClearCache}
                      disabled={isClearingCache}
                      className="w-full flex items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 relative overflow-hidden"
                    >
                      <RefreshCw className={cn("w-4 h-4 transition-transform duration-500", isClearingCache && "animate-spin")} />
                      {isClearingCache ? 'Sedang Membersihkan...' : 'Bersihkan Cache Sampah'}
                      
                      {isClearingCache && (
                        <motion.div 
                          className="absolute inset-0 bg-amber-500/10"
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {cacheMessage && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-center text-xs text-emerald-500 mt-2 font-medium"
                        >
                          {cacheMessage}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'pemeliharaan-row' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <PemeliharaanROW />
            </div>
          )}

          {activeTab === 'pemeliharaan-realisasi-row' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <RealisasiROW />
            </div>
          )}

          {activeTab === 'pemeliharaan-gardu' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card title="Pemeliharaan Gardu Distribusi">
                <div className="p-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Modul Pemeliharaan Gardu</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
                    Halaman ini akan menampilkan data inspeksi, jadwal pemeliharaan, dan riwayat perbaikan gardu distribusi.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'laporan-saidi' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <LaporanSaidi />
            </div>
          )}

          {activeTab === 'laporan-saifi' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <LaporanSaifi />
            </div>
          )}

          {activeTab === 'laporan-ens' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <LaporanEns />
            </div>
          )}

          {activeTab === 'laporan-rpt-rct' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <LaporanRptRct />
            </div>
          )}

          {activeTab === 'laporan-fgtm' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <LaporanFgtm />
            </div>
          )}

          {activeTab === 'pltd-temajuk' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <PltdTemajuk />
            </div>
          )}

          {activeTab !== 'dashboard' && activeTab !== 'settings' && activeTab !== 'data-gardu' && activeTab !== 'lm' && activeTab !== 'pltd-temajuk' && activeTab !== 'kuis-games' && !activeTab.startsWith('pemeliharaan') && !activeTab.startsWith('laporan') && (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <Database className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="text-lg font-medium">Modul Sedang Dikembangkan</h3>
              <p className="text-sm">Halaman {navItems.find(i => i.id === activeTab)?.label} akan segera tersedia.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
