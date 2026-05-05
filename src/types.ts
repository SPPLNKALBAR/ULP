import type { ReactNode } from 'react';

export interface TechnicalMetric {
  id: string;
  date: string;
  saidi: number; // System Average Interruption Duration Index
  saifi: number; // System Average Interruption Frequency Index
  ens: number;   // Energy Not Served (kWh)
  losses: number; // Percentage
  rpt: number;    // Realisasi Pencapaian Target or similar
}

export interface FeederStatus {
  id: string;
  name: string;
  status: 'normal' | 'gangguan' | 'pemeliharaan';
  load: number; // Ampere
  voltage: number; // kV
}

export interface GangguanKeypoint {
  id: string;
  tanggalTrip: string;
  namaKeypoint: string;
  jamTrip: string;
  jamPenormalan: string;
  sectionGangguan: string;
  arusGangguan: string;
  kelompokGangguan: string;
}

export interface TotalGardu {
  total: number;
  kapasitas: {
    [key: string]: number;
  };
}

export interface KondisiTrafo {
  condition: {
    [key: string]: number;
  };
  pembebanan: {
    [key: string]: number;
  };
}

export interface MonitoringBulan {
  bulan: string;
  pSungaiBaru: string;
  recloserPerigiParit: string;
  recloserSekumbak: string;
  recloserTanahHitam: string;
  recloserSasak: string;
  total: string;
  kumulatifTrip: string;
  fgtm: string;
  targetKpi: string;
  persenKumulatifTrip: string;
}

export interface SummaryData {
  totalGardu: string;
  kapasitas: { kva: string; jumlah: string }[];
  kondisiTrafo: { kondisi: string; jumlah: string }[];
  pembebananTrafo: { kondisi: string; jumlah: string }[];
}

export interface DataGarduItem {
  no: string;
  maximoGardu: string;
  nomorGardu: string;
  lokasi: string;
  feeder: string;
  latitude: string;
  longitude: string;
  nomorSeri: string;
  kapasitas: string;
  losses?: string;
  konstruksi: string;
  jurusan: string;
  tanggal: string;
  ir: string;
  is: string;
  it: string;
  in: string;
  vrs: string;
  vrt: string;
  vst: string;
  keseimbanganTrafo: string;
  totalPembebanan: string;
  status: string;
}

export interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  icon: ReactNode;
}

export interface PltdTemajukItem {
  mesin: string;
  dayaTerpasang: string;
  dayaMampu: string;
}

export interface FgtmRow {
  [key: string]: string;
}

export interface FgtmCategoryData {
  monthly: FgtmRow[];
  summary: FgtmRow[];
}

export interface FgtmReportData {
  lessThan5Min: FgtmCategoryData;
  moreThan5Min: FgtmCategoryData;
  zona1and2: FgtmCategoryData;
}
