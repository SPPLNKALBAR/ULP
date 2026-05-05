import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './UI';
import { Trophy, HelpCircle, ArrowRight, RotateCcw, CheckCircle2, XCircle, BrainCircuit, Flame, Medal, User, ChevronRight, Star } from 'lucide-react';
import { cn } from '../utils';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const ALL_QUESTIONS: Record<number, Question[]> = {
  1: [
    { question: "Apa kepanjangan dari PLN?", options: ["Perusahaan Listrik Negara", "Pusat Listrik Nasional", "Pembangkit Listrik Negara", "Pengelola Listrik Nasional"], correctAnswer: 0 },
    { question: "Satuan tegangan listrik adalah?", options: ["Ampere", "Watt", "Volt", "Ohm"], correctAnswer: 2 },
    { question: "Alat pengukur energi listrik di rumah pelanggan adalah?", options: ["Volt Meter", "Ampere Meter", "KWH Meter", "Ohm Meter"], correctAnswer: 2 },
    { question: "Warna kabel Netral menurut PUIL adalah?", options: ["Hitam", "Merah", "Kuning", "Biru"], correctAnswer: 3 },
    { question: "Kepanjangan dari K3 adalah?", options: ["Keselamatan dan Kesehatan Kerja", "Keamanan dan Kesehatan Kerja", "Keselamatan, Kesehatan, Keamanan", "Kesehatan Kerja Karyawan"], correctAnswer: 0 },
    { question: "Siapa pendiri PLN?", options: ["Pemerintah Indonesia", "Soekarno", "Hatta", "Belanda"], correctAnswer: 0 },
    { question: "Apa warna helm untuk petugas K3?", options: ["Merah", "Kuning", "Putih", "Biru"], correctAnswer: 0 },
    { question: "Satuan arus listrik adalah?", options: ["Volt", "Ampere", "Watt", "Ohm"], correctAnswer: 1 },
    { question: "Bahan penghantar listrik yang paling baik adalah?", options: ["Besi", "Tembaga", "Aluminium", "Perak"], correctAnswer: 3 },
    { question: "Apa fungsi saklar?", options: ["Memutus dan menghubungkan arus", "Menambah daya", "Menurunkan tegangan", "Mengukur arus"], correctAnswer: 0 },
  ],
  2: [
    { question: "Berapa frekuensi standar listrik di Indonesia?", options: ["40 Hz", "50 Hz", "60 Hz", "100 Hz"], correctAnswer: 1 },
    { question: "Tegangan rendah standar di Indonesia adalah?", options: ["110 V", "220 V", "380 V", "500 V"], correctAnswer: 1 },
    { question: "Kepanjangan dari MCB adalah?", options: ["Main Circuit Breaker", "Miniature Circuit Breaker", "Manual Circuit Breaker", "Master Circuit Breaker"], correctAnswer: 1 },
    { question: "Fungsi utama Arrester adalah?", options: ["Mengukur arus", "Memutus beban", "Melindungi dari petir", "Menurunkan tegangan"], correctAnswer: 2 },
    { question: "Satuan daya listrik adalah?", options: ["Volt", "Ampere", "Watt", "Ohm"], correctAnswer: 2 },
    { question: "Hukum yang menyatakan V = I x R adalah?", options: ["Hukum Newton", "Hukum Ohm", "Hukum Kirchoff", "Hukum Faraday"], correctAnswer: 1 },
    { question: "Alat untuk mengukur tegangan adalah?", options: ["Amperemeter", "Voltmeter", "Ohmmeter", "Wattmeter"], correctAnswer: 1 },
    { question: "Rangkaian yang arusnya sama di setiap titik adalah?", options: ["Seri", "Paralel", "Campuran", "Terbuka"], correctAnswer: 0 },
    { question: "Rangkaian yang tegangannya sama di setiap cabang adalah?", options: ["Seri", "Paralel", "Campuran", "Tertutup"], correctAnswer: 1 },
    { question: "Satuan hambatan listrik adalah?", options: ["Volt", "Ampere", "Watt", "Ohm"], correctAnswer: 3 },
  ],
  3: [
    { question: "Berapa tegangan Jaringan Tegangan Menengah (JTM) PLN?", options: ["6 kV", "12 kV", "20 kV", "70 kV"], correctAnswer: 2 },
    { question: "Kepanjangan dari SAIDI adalah?", options: ["System Average Interruption Duration Index", "System Annual Interruption Duration Index", "Service Average Interruption Duration Index", "System Average Interruption Data Index"], correctAnswer: 0 },
    { question: "Kepanjangan dari SAIFI adalah?", options: ["System Average Interruption Frequency Index", "System Annual Interruption Frequency Index", "Service Average Interruption Frequency Index", "System Average Interruption Failure Index"], correctAnswer: 0 },
    { question: "Alat untuk menurunkan tegangan JTM ke JTR adalah?", options: ["Kapasitor", "Isolator", "Transformator Distribusi", "Recloser"], correctAnswer: 2 },
    { question: "Kepanjangan dari APP adalah?", options: ["Alat Pembatas dan Pengukur", "Alat Pemutus dan Pengukur", "Alat Penghitung dan Pembatas", "Alat Pengaman dan Pengukur"], correctAnswer: 0 },
    { question: "Berapa tegangan Jaringan Tegangan Rendah (JTR) fasa ke fasa?", options: ["110 V", "220 V", "380 V", "20 kV"], correctAnswer: 2 },
    { question: "Jenis tiang yang paling banyak digunakan PLN saat ini adalah?", options: ["Kayu", "Besi", "Beton", "Baja"], correctAnswer: 2 },
    { question: "Apa fungsi isolator?", options: ["Menghantar listrik", "Menyekat listrik", "Menambah tegangan", "Mengukur arus"], correctAnswer: 1 },
    { question: "Kabel yang digunakan untuk JTR udara biasanya adalah?", options: ["NYA", "NYM", "Twisted Cable (TIC)", "NYY"], correctAnswer: 2 },
    { question: "Berapa standar tegangan fasa ke netral di JTR?", options: ["110 V", "220 V", "380 V", "20 kV"], correctAnswer: 1 },
  ],
  4: [
    { question: "Apa fungsi dari FCO (Fused Cut Out)?", options: ["Penyambung kabel", "Pengaman lebur JTM", "Pengukur arus", "Penurun tegangan"], correctAnswer: 1 },
    { question: "Jarak aman (ROW) minimal JTM terhadap pohon adalah?", options: ["1 meter", "2,5 meter", "5 meter", "10 meter"], correctAnswer: 1 },
    { question: "Kepanjangan dari ENS adalah?", options: ["Energy Not Served", "Energy New System", "Electric Network System", "Energy National Service"], correctAnswer: 0 },
    { question: "Warna kabel fasa R menurut PUIL 2011 adalah?", options: ["Merah", "Hitam", "Cokelat", "Abu-abu"], correctAnswer: 1 },
    { question: "Warna kabel fasa S menurut PUIL 2011 adalah?", options: ["Kuning", "Hitam", "Cokelat", "Abu-abu"], correctAnswer: 2 },
    { question: "Apa fungsi Recloser?", options: ["Mengukur arus", "Memutus dan menyambung otomatis", "Menurunkan tegangan", "Membatasi daya"], correctAnswer: 1 },
    { question: "Apa itu LBS (Load Break Switch)?", options: ["Saklar pemutus beban", "Saklar pemutus arus hubung singkat", "Saklar penurun tegangan", "Saklar pengukur daya"], correctAnswer: 0 },
    { question: "Berapa kapasitas standar trafo distribusi PLN?", options: ["25 kVA", "50 kVA", "100 kVA", "Semua benar"], correctAnswer: 3 },
    { question: "Apa fungsi Lightning Arrester?", options: ["Menangkap petir", "Membuang tegangan lebih petir ke bumi", "Menambah tegangan", "Mengukur sambaran petir"], correctAnswer: 1 },
    { question: "Apa itu Sectionalizer?", options: ["Alat pemutus otomatis", "Alat pelokalisir gangguan", "Alat pengukur tegangan", "Alat penurun arus"], correctAnswer: 1 },
  ],
  5: [
    { question: "Warna kabel fasa T menurut PUIL 2011 adalah?", options: ["Hitam", "Cokelat", "Abu-abu", "Biru"], correctAnswer: 2 },
    { question: "Apa kepanjangan dari ULP?", options: ["Unit Layanan Pelanggan", "Unit Layanan Pusat", "Unit Listrik Pelanggan", "Unit Layanan Pembangkit"], correctAnswer: 0 },
    { question: "Apa yang dimaksud dengan susut teknis?", options: ["Energi hilang karena pencurian", "Energi hilang karena sifat fisik penghantar", "Energi tidak terbayar", "Energi untuk kantor"], correctAnswer: 1 },
    { question: "Fungsi utama Recloser adalah?", options: ["Mengukur daya", "Memutus gangguan sementara secara otomatis", "Membatasi arus", "Menurunkan tegangan"], correctAnswer: 1 },
    { question: "Kepanjangan dari SLO adalah?", options: ["Sertifikat Layak Operasi", "Surat Layak Operasi", "Sertifikat Lulus Operasi", "Sertifikat Layanan Operasi"], correctAnswer: 0 },
    { question: "Apa itu KWH Meter Prabayar?", options: ["Meteran pascabayar", "Meteran menggunakan token", "Meteran tanpa pulsa", "Meteran analog"], correctAnswer: 1 },
    { question: "Berapa digit nomor token PLN?", options: ["12 digit", "16 digit", "20 digit", "24 digit"], correctAnswer: 2 },
    { question: "Apa fungsi MCB pada APP?", options: ["Pengukur energi", "Pembatas daya dan pengaman", "Penurun tegangan", "Peningkat arus"], correctAnswer: 1 },
    { question: "Apa itu Segel PLN?", options: ["Hiasan meteran", "Tanda pengaman agar tidak dibuka ilegal", "Tanda lunas", "Tanda rusak"], correctAnswer: 1 },
    { question: "Apa itu NDI?", options: ["Nilai Daya Interupsi", "Nilai Durasi Interupsi", "Network Delivery Index", "National Data Index"], correctAnswer: 0 },
  ],
  6: [
    { question: "Apa fungsi dari Grounding?", options: ["Menambah daya", "Mengalirkan arus bocor ke bumi", "Menghemat listrik", "Menstabilkan lampu"], correctAnswer: 1 },
    { question: "Berapa tegangan transmisi SUTET di Indonesia?", options: ["70 kV", "150 kV", "275 kV", "500 kV"], correctAnswer: 3 },
    { question: "Kepanjangan dari P2TL adalah?", options: ["Penertiban Pemakaian Tenaga Listrik", "Pemutusan Pemakaian Tenaga Listrik", "Pemeriksaan Pemakaian Tenaga Listrik", "Pengawasan Pemakaian Tenaga Listrik"], correctAnswer: 0 },
    { question: "Fungsi isolator pada tiang adalah?", options: ["Menghantarkan arus", "Menyekat penghantar dengan tiang", "Menyambung kabel", "Memperkuat tiang"], correctAnswer: 1 },
    { question: "Apa itu gangguan permanen?", options: ["Hilang sendiri", "Butuh perbaikan manual petugas", "Karena petir", "Sentuhan dahan sementara"], correctAnswer: 1 },
    { question: "Apa APD wajib untuk memanjat tiang?", options: ["Helm dan sepatu", "Sabuk pengaman/harness", "Sarung tangan", "Semua benar"], correctAnswer: 3 },
    { question: "Apa fungsi sepatu safety?", options: ["Gaya", "Melindungi kaki dari benturan dan arus", "Agar tidak licin", "Menambah tinggi"], correctAnswer: 1 },
    { question: "Apa itu SOP?", options: ["Standar Operasional Prosedur", "Sistem Operasional Petugas", "Standar Output Perusahaan", "Sistem Operasi Pusat"], correctAnswer: 0 },
    { question: "Apa fungsi rompi reflektor?", options: ["Menghangatkan tubuh", "Agar terlihat di tempat gelap/malam", "Identitas perusahaan", "Pelindung hujan"], correctAnswer: 1 },
    { question: "Apa itu JSA (Job Safety Analysis)?", options: ["Analisis risiko pekerjaan", "Analisis biaya pekerjaan", "Analisis waktu pekerjaan", "Analisis jumlah petugas"], correctAnswer: 0 },
  ],
  7: [
    { question: "Kepanjangan dari SR adalah?", options: ["Sambungan Rumah", "Saluran Rumah", "Sistem Rumah", "Sentral Rumah"], correctAnswer: 0 },
    { question: "Aplikasi resmi layanan pelanggan PLN adalah?", options: ["PLN Mobile", "Halo PLN", "PLN Kita", "PLN Online"], correctAnswer: 0 },
    { question: "Fungsi Trafo Arus (CT) adalah?", options: ["Menurunkan tegangan", "Menurunkan arus untuk pengukuran", "Menaikkan daya", "Menyearahkan arus"], correctAnswer: 1 },
    { question: "Apa itu Cos Phi?", options: ["Faktor Daya", "Faktor Tegangan", "Faktor Arus", "Faktor Hambatan"], correctAnswer: 0 },
    { question: "Sistem pendingin trafo ONAN artinya?", options: ["Oil Natural Air Natural", "Oil Natural Air Forced", "Oil Forced Air Natural", "Oil Forced Air Forced"], correctAnswer: 0 },
    { question: "Apa itu Daya Reaktif?", options: ["Daya yang melakukan kerja nyata", "Daya yang terserap beban induktif/kapasitif", "Daya total", "Daya cadangan"], correctAnswer: 1 },
    { question: "Apa itu Daya Aktif?", options: ["Daya yang melakukan kerja nyata (Watt)", "Daya semu", "Daya reaktif", "Daya cadangan"], correctAnswer: 0 },
    { question: "Apa itu Daya Semu?", options: ["Daya dalam VA", "Daya dalam Watt", "Daya dalam VAR", "Daya cadangan"], correctAnswer: 0 },
    { question: "Apa fungsi Kapasitor Bank?", options: ["Menaikkan tegangan", "Memperbaiki faktor daya", "Menyimpan energi", "Menyearahkan arus"], correctAnswer: 1 },
    { question: "Apa itu Rugi-rugi Tembaga pada trafo?", options: ["Rugi karena panas pada lilitan", "Rugi karena arus eddy", "Rugi karena histeresis", "Rugi karena kebocoran oli"], correctAnswer: 0 },
  ],
  8: [
    { question: "Jenis gas yang digunakan pada PMT tegangan tinggi adalah?", options: ["Oksigen", "Nitrogen", "SF6", "Argon"], correctAnswer: 2 },
    { question: "Kepanjangan dari SCADA adalah?", options: ["Supervisory Control and Data Acquisition", "System Control and Data Acquisition", "Supervisory Central and Data Acquisition", "System Central and Data Analysis"], correctAnswer: 0 },
    { question: "Alat untuk mengukur tahanan isolasi adalah?", options: ["Multimeter", "Megger", "Tang Ampere", "Earth Tester"], correctAnswer: 1 },
    { question: "Apa itu UFR (Under Frequency Relay)?", options: ["Relay pelepasan beban saat frekuensi turun", "Relay pengaman tegangan", "Relay pengaman arus", "Relay pengaman suhu"], correctAnswer: 0 },
    { question: "Kepanjangan dari LBS adalah?", options: ["Load Break Switch", "Line Break Switch", "Load Block Switch", "Line Block Switch"], correctAnswer: 0 },
    { question: "Apa itu RTU (Remote Terminal Unit)?", options: ["Unit kontrol di lapangan", "Unit kontrol di pusat", "Unit pengukur arus", "Unit pengirim pesan"], correctAnswer: 0 },
    { question: "Apa itu Master Station?", options: ["Pusat kontrol SCADA", "Pembangkit utama", "Gardu induk utama", "Kantor pusat"], correctAnswer: 0 },
    { question: "Apa fungsi Telemetri?", options: ["Pengukuran jarak jauh", "Pemutusan jarak jauh", "Pemberitahuan jarak jauh", "Penyimpanan jarak jauh"], correctAnswer: 0 },
    { question: "Apa itu Telesignaling?", options: ["Sinyal status peralatan jarak jauh", "Sinyal suara", "Sinyal bahaya", "Sinyal perbaikan"], correctAnswer: 0 },
    { question: "Apa itu Telecontrol?", options: ["Perintah operasi jarak jauh", "Kontrol suara", "Kontrol suhu", "Kontrol biaya"], correctAnswer: 0 },
  ],
  9: [
    { question: "Apa itu Smart Meter AMI?", options: ["Advanced Metering Infrastructure", "Automatic Metering Index", "Advanced Metering Index", "Automatic Metering Infrastructure"], correctAnswer: 0 },
    { question: "Berapa standar tahanan pentanahan (grounding) maksimal?", options: ["1 Ohm", "5 Ohm", "10 Ohm", "50 Ohm"], correctAnswer: 1 },
    { question: "Apa fungsi dari Relay Buchholz pada trafo?", options: ["Pengaman gangguan internal trafo", "Pengaman beban lebih", "Pengaman tegangan lebih", "Pengaman suhu"], correctAnswer: 0 },
    { question: "Kepanjangan dari NDI adalah?", options: ["Nilai Daya Interupsi", "Network Delivery Index", "National Delivery Index", "Net Duration Index"], correctAnswer: 0 },
    { question: "Apa itu PLTS?", options: ["Pembangkit Listrik Tenaga Surya", "Pembangkit Listrik Tenaga Sampah", "Pembangkit Listrik Tenaga Surut", "Pembangkit Listrik Tenaga Suara"], correctAnswer: 0 },
    { question: "Apa itu Harmonisa?", options: ["Gangguan bentuk gelombang listrik", "Kestabilan tegangan", "Kestabilan frekuensi", "Keseimbangan beban"], correctAnswer: 0 },
    { question: "Apa itu Total Harmonic Distortion (THD)?", options: ["Persentase gangguan harmonisa", "Total daya hilang", "Total arus bocor", "Total tegangan jatuh"], correctAnswer: 0 },
    { question: "Apa itu Flicker?", options: ["Kedipan tegangan", "Lonjakan arus", "Penurunan frekuensi", "Gangguan harmonisa"], correctAnswer: 0 },
    { question: "Apa itu Voltage Sag?", options: ["Penurunan tegangan sesaat", "Kenaikan tegangan sesaat", "Tegangan hilang total", "Tegangan tidak stabil"], correctAnswer: 0 },
    { question: "Apa itu Voltage Swell?", options: ["Kenaikan tegangan sesaat", "Penurunan tegangan sesaat", "Tegangan stabil", "Tegangan jatuh"], correctAnswer: 0 },
  ],
  10: [
    { question: "Apa itu Black Start pada sistem kelistrikan?", options: ["Proses pemulihan pembangkit tanpa bantuan luar", "Proses pemadaman total", "Proses pemeliharaan rutin", "Proses sinkronisasi"], correctAnswer: 0 },
    { question: "Apa fungsi dari Kapasitor Bank?", options: ["Memperbaiki faktor daya", "Menurunkan tegangan", "Menaikkan arus", "Menyimpan daya aktif"], correctAnswer: 0 },
    { question: "Apa itu Harmonis pada kualitas daya?", options: ["Gangguan bentuk gelombang sinus", "Kestabilan tegangan", "Kestabilan frekuensi", "Keseimbangan beban"], correctAnswer: 0 },
    { question: "Kepanjangan dari UP3 adalah?", options: ["Unit Pelaksana Pelayanan Pelanggan", "Unit Pelaksana Pembangkit Listrik", "Unit Pengelola Pelayanan Pelanggan", "Unit Pengelola Pembangkit Listrik"], correctAnswer: 0 },
    { question: "Apa itu Island Operation?", options: ["Sistem beroperasi terpisah dari grid utama", "Sistem mati total", "Sistem sinkron dengan grid", "Sistem pemeliharaan pulau"], correctAnswer: 0 },
    { question: "Apa itu Load Shedding?", options: ["Pelepasan beban otomatis", "Penambahan beban", "Pemeliharaan beban", "Pengukuran beban"], correctAnswer: 0 },
    { question: "Apa itu Spinning Reserve?", options: ["Cadangan daya yang sudah sinkron", "Cadangan daya mati", "Cadangan bahan bakar", "Cadangan peralatan"], correctAnswer: 0 },
    { question: "Apa itu AGC (Automatic Generation Control)?", options: ["Kontrol pembangkitan otomatis", "Kontrol beban otomatis", "Kontrol tegangan otomatis", "Kontrol arus otomatis"], correctAnswer: 0 },
    { question: "Apa itu Stability Limit?", options: ["Batas kestabilan sistem", "Batas daya trafo", "Batas arus kabel", "Batas tegangan pelanggan"], correctAnswer: 0 },
    { question: "Apa itu Transient Stability?", options: ["Kestabilan sistem saat gangguan sesaat", "Kestabilan jangka panjang", "Kestabilan tegangan statis", "Kestabilan frekuensi rendah"], correctAnswer: 0 },
  ]
};

interface KuisGamesProps {
  userName: string;
}

export const KuisGames: React.FC<KuisGamesProps> = ({ userName }) => {
  const [level, setLevel] = useState(1);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  // Initialize user max level from local storage
  const [userMaxLevel, setUserMaxLevel] = useState<number>(() => {
    const saved = localStorage.getItem(`kuis_max_level_${userName}`);
    if (saved) {
      try {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse user max level from local storage", e);
      }
    }
    return 1;
  });

  useEffect(() => {
    localStorage.setItem(`kuis_max_level_${userName}`, userMaxLevel.toString());
  }, [userMaxLevel, userName]);

  const [streak, setStreak] = useState(0);

  const initializeQuiz = (selectedLevel: number) => {
    const rawQuestions = ALL_QUESTIONS[selectedLevel] || ALL_QUESTIONS[1];
    
    // Shuffle questions within the level
    const shuffledQuestions = [...rawQuestions].sort(() => 0.5 - Math.random());
    
    // Shuffle options for each question and update correctAnswer index
    const processedQuestions = shuffledQuestions.map(q => {
      const optionsWithFlags = q.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === q.correctAnswer
      }));
      
      // Shuffle options
      for (let i = optionsWithFlags.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsWithFlags[i], optionsWithFlags[j]] = [optionsWithFlags[j], optionsWithFlags[i]];
      }
      
      return {
        question: q.question,
        options: optionsWithFlags.map(o => o.text),
        correctAnswer: optionsWithFlags.findIndex(o => o.isCorrect)
      };
    });

    setQuizQuestions(processedQuestions);
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedOption(null);
    setIsAnswered(false);
    setLevel(selectedLevel);
  };

  useEffect(() => {
    initializeQuiz(1);
  }, []);

  const handleAnswerClick = (index: number) => {
    if (isAnswered || quizQuestions.length === 0) return;
    setSelectedOption(index);
    setIsAnswered(true);
    
    if (index === quizQuestions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < quizQuestions.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowScore(true);
      // Update max level for the current user if they got a perfect score
      const isPerfect = score === quizQuestions.length;
      if (isPerfect) {
        setUserMaxLevel(prev => Math.max(prev, level + 1));
      }
    }
  };

  if (quizQuestions.length === 0) return null;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Level Selection Sidebar */}
        <div className="w-full md:w-48 shrink-0 space-y-2">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Pilih Level</p>
          <div className="grid grid-cols-5 md:grid-cols-1 gap-2">
            {Array.from({ length: 10 }).map((_, i) => {
              const lvl = i + 1;
              const isUnlocked = lvl <= userMaxLevel;
              return (
                <button
                  key={lvl}
                  disabled={!isUnlocked}
                  onClick={() => initializeQuiz(lvl)}
                  className={cn(
                    "p-3 rounded-xl font-black text-sm transition-all flex items-center justify-between group",
                    level === lvl 
                      ? "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20" 
                      : isUnlocked 
                        ? "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-amber-500/50"
                        : "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
                  )}
                >
                  <span>Lvl {lvl}</span>
                  {isUnlocked && level !== lvl && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  {!isUnlocked && <Star className="w-3 h-3 fill-current" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quiz Area */}
        <div className="flex-1">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight drop-shadow-sm flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-amber-500" />
              Kuis Games Teknik
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs">
                Level {level} • Pengetahuan Ketenagalistrikan
              </p>
              {streak > 2 && (
                <div className="flex items-center gap-1 bg-orange-500/10 px-2 py-0.5 rounded-full">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase">{streak} Streak!</span>
                </div>
              )}
            </div>
          </div>

          {showScore ? (
            <Card className="text-center p-12 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-12 h-12 text-amber-600 dark:text-amber-500" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Level {level} Selesai!</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-2 font-bold">
                Skor: <span className="text-4xl text-amber-500">{score}</span> / {quizQuestions.length}
              </p>
              
              {score < quizQuestions.length ? (
                <p className="text-rose-500 font-black text-xs uppercase tracking-widest mb-6">
                  Butuh 100% Benar untuk Lanjut ke Level Berikutnya!
                </p>
              ) : (
                <p className="text-emerald-500 font-black text-xs uppercase tracking-widest mb-6">
                  Sempurna! Level Berikutnya Terbuka.
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => initializeQuiz(level)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-black rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                  Ulangi Level
                </button>
                {score === quizQuestions.length && level < 10 && (
                  <button
                    onClick={() => initializeQuiz(level + 1)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-zinc-950 font-black rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                  >
                    Lanjut Level {level + 1}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                  Pertanyaan {currentQuestion + 1} dari {quizQuestions.length}
                </span>
                <div className="w-32 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <Card className="p-8 border-l-4 border-amber-500">
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">
                    {quizQuestions[currentQuestion].question}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {quizQuestions[currentQuestion].options.map((option, index) => {
                    const isCorrect = index === quizQuestions[currentQuestion].correctAnswer;
                    const isSelected = index === selectedOption;
                    const label = String.fromCharCode(65 + index); // A, B, C, D
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerClick(index)}
                        disabled={isAnswered}
                        className={cn(
                          "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group relative overflow-hidden",
                          !isAnswered && "border-zinc-100 dark:border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/5 dark:hover:bg-amber-500/5",
                          isAnswered && isCorrect && "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                          isAnswered && isSelected && !isCorrect && "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400",
                          isAnswered && !isCorrect && !isSelected && "border-zinc-100 dark:border-zinc-800 opacity-50"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 transition-colors",
                            !isAnswered ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-amber-500 group-hover:text-zinc-950" : 
                            isCorrect ? "bg-emerald-500 text-white" : 
                            isSelected ? "bg-rose-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                          )}>
                            {label}
                          </span>
                          <span className="font-bold">{option}</span>
                        </div>
                        {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500" />}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-xl hover:opacity-90 transition-all shadow-lg"
                    >
                      {currentQuestion === quizQuestions.length - 1 ? "Lihat Hasil" : "Pertanyaan Selanjutnya"}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
