import { TechnicalMetric, FeederStatus, GangguanKeypoint } from './types';

export const MOCK_METRICS: TechnicalMetric[] = [
  { id: '1', date: '2024-01', saidi: 12.5, saifi: 1.2, ens: 4500, losses: 8.2, rpt: 85 },
  { id: '2', date: '2024-02', saidi: 10.2, saifi: 0.9, ens: 3800, losses: 7.9, rpt: 92 },
  { id: '3', date: '2024-03', saidi: 15.8, saifi: 1.5, ens: 5200, losses: 8.5, rpt: 78 },
  { id: '4', date: '2024-04', saidi: 8.4, saifi: 0.7, ens: 2900, losses: 7.6, rpt: 95 },
  { id: '5', date: '2024-05', saidi: 11.1, saifi: 1.1, ens: 4100, losses: 8.0, rpt: 88 },
  { id: '6', date: '2024-06', saidi: 9.5, saifi: 0.8, ens: 3400, losses: 7.8, rpt: 90 },
];

export const FEEDER_DATA: FeederStatus[] = [
  { id: 'F1', name: 'Penyulang Sekura', status: 'normal', load: 120, voltage: 20.1 },
  { id: 'F2', name: 'Penyulang Paloh', status: 'normal', load: 85, voltage: 19.8 },
  { id: 'F3', name: 'Penyulang Teluk Keramat', status: 'gangguan', load: 0, voltage: 0 },
  { id: 'F4', name: 'Penyulang Galing', status: 'pemeliharaan', load: 45, voltage: 20.0 },
];

export const GANGGUAN_KEYPOINT_DATA: GangguanKeypoint[] = [
  { 
    id: '1', 
    tanggalTrip: '27/02/2026', 
    namaKeypoint: 'LBS Sekura', 
    jamTrip: '10:15', 
    jamPenormalan: '11:30', 
    sectionGangguan: 'Sekura - Paloh', 
    arusGangguan: '150A', 
    kelompokGangguan: 'Pohon' 
  },
  { 
    id: '2', 
    tanggalTrip: '26/02/2026', 
    namaKeypoint: 'REC Galing', 
    jamTrip: '08:45', 
    jamPenormalan: '09:15', 
    sectionGangguan: 'Galing - Teluk', 
    arusGangguan: '80A', 
    kelompokGangguan: 'Binatang' 
  },
  { 
    id: '3', 
    tanggalTrip: '25/02/2026', 
    namaKeypoint: 'LBS Paloh', 
    jamTrip: '14:20', 
    jamPenormalan: '15:00', 
    sectionGangguan: 'Paloh - Pantai', 
    arusGangguan: '120A', 
    kelompokGangguan: 'Cuaca' 
  },
];
