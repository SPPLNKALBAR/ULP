import Papa from 'papaparse';
import { GangguanKeypoint, TotalGardu, KondisiTrafo, MonitoringBulan, DataGarduItem, SummaryData, PltdTemajukItem, FgtmReportData, FgtmRow } from '../types';

export interface SheetData {
  saidi: string;
  saifi: string;
  ens: string;
  rpt: string;
  lastUpdate: string;
  activities: { title: string; file?: string }[];
}

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1IfBQSLlqnJsf2DulM0kw-yTA6zr6Sum75mQOZpGUAJM/export?format=csv&gid=1606832216';
const GANGGUAN_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1IfBQSLlqnJsf2DulM0kw-yTA6zr6Sum75mQOZpGUAJM/export?format=csv&gid=1134830115';
const TOTAL_GARDU_URL = 'https://docs.google.com/spreadsheets/d/1IfBQSLlqnJsf2DulM0kw-yTA6zr6Sum75mQOZpGUAJM/export?format=csv&gid=1613566233';
const KONDISI_TRAFO_URL = 'https://docs.google.com/spreadsheets/d/1IfBQSLlqnJsf2DulM0kw-yTA6zr6Sum75mQOZpGUAJM/export?format=csv&gid=1613566233';
const MONITORING_BULAN_URL = 'https://docs.google.com/spreadsheets/d/1IfBQSLlqnJsf2DulM0kw-yTA6zr6Sum75mQOZpGUAJM/export?format=csv&gid=1356967275';

const DATA_GARDU_URL = 'https://docs.google.com/spreadsheets/d/1IfBQSLlqnJsf2DulM0kw-yTA6zr6Sum75mQOZpGUAJM/export?format=csv&gid=1613566233';
const PLTD_TEMAJUK_URL = 'https://docs.google.com/spreadsheets/d/1IfBQSLlqnJsf2DulM0kw-yTA6zr6Sum75mQOZpGUAJM/export?format=csv&gid=794679260';
const PEMELIHARAAN_ROW_URL = 'https://docs.google.com/spreadsheets/d/1IfBQSLlqnJsf2DulM0kw-yTA6zr6Sum75mQOZpGUAJM/export?format=csv&gid=148485072&range=A:Q';
const OLD_PEMELIHARAAN_ROW_URL = 'https://docs.google.com/spreadsheets/d/1nAFEkg1KZ4SU4o0pk7KqMHH2Lz4QA_lqj8IBWCZdyGQ/export?format=csv&gid=277536493';
const REALISASI_ROW_2026_URL = 'https://docs.google.com/spreadsheets/d/1nAFEkg1KZ4SU4o0pk7KqMHH2Lz4QA_lqj8IBWCZdyGQ/export?format=csv&gid=1451420501';

export async function fetchRealisasiRow2026Data(): Promise<any[]> {
  try {
    const response = await fetch(`${REALISASI_ROW_2026_URL}&t=${Date.now()}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        complete: (results) => {
          resolve(results.data as any[]);
        },
        error: (error: any) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error fetching Realisasi ROW 2026 Data:', error);
    return [];
  }
}

export async function fetchPemeliharaanRowData(): Promise<FgtmRow[]> {
  try {
    const response = await fetch(`${PEMELIHARAAN_ROW_URL}&t=${Date.now()}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        complete: (results) => {
          const rows = results.data as string[][];
          
          const extractRange = (startRow: number, endRow: number, startCol: number, endCol: number): FgtmRow[] => {
            const data: FgtmRow[] = [];
            
            // Find the first row that looks like a header (multiple columns filled)
            let headerRowIndex = startRow;
            while (headerRowIndex < rows.length && headerRowIndex <= endRow) {
              const row = rows[headerRowIndex];
              if (row) {
                const filledCells = row.slice(startCol, endCol + 1).filter(cell => cell && cell.trim() !== '');
                if (filledCells.length > 1) {
                  break; // Found the header row
                }
              }
              headerRowIndex++;
            }
            
            if (headerRowIndex >= rows.length) return [];
            
            const headers = rows[headerRowIndex];
            const actualEndRow = Math.max(endRow, rows.length - 1);
            
            for (let i = headerRowIndex + 1; i <= actualEndRow; i++) {
              const row = rows[i];
              if (row) {
                // Check if the row has any data in the specified range
                const hasData = row.slice(startCol, endCol + 1).some(cell => cell && cell.trim() !== '');
                if (hasData) {
                  const item: FgtmRow = {};
                  for (let j = startCol; j <= endCol; j++) {
                    let header = (headers[j] || '').trim();
                    if (!header) {
                      const colLetter = String.fromCharCode(65 + j);
                      header = `Col_${colLetter}`;
                    }
                    item[header] = (row[j] || '').trim();
                  }
                  data.push(item);
                }
              }
            }
            return data;
          };

          const data = extractRange(0, 1000, 0, 16); // A:Q
          resolve(data);
        },
        error: (error: any) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error fetching Pemeliharaan ROW Data:', error);
    return [];
  }
}

export async function fetchRealisasiRowData(): Promise<any[]> {
  try {
    const response = await fetch(`${OLD_PEMELIHARAAN_ROW_URL}&t=${Date.now()}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        complete: (results) => {
          const rows = results.data as string[][];
          const data: any[] = [];
          
          // Range B12:N23 -> Rows 11 to 22, Columns B (1) to N (13)
          const months = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 
                          'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
          
          for (let i = 11; i <= 22; i++) {
            const row = rows[i];
            if (row && row[1]) {
              const item: any = {
                uraian: row[1].trim()
              };
              for (let j = 0; j < 12; j++) {
                item[months[j]] = row[j + 2] || '0';
              }
              data.push(item);
            }
          }
          resolve(data);
        },
        error: (error: any) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error fetching Realisasi ROW Data:', error);
    return [];
  }
}

export async function fetchRealisasiRowDetailData(): Promise<any[]> {
  try {
    const response = await fetch(`${OLD_PEMELIHARAAN_ROW_URL}&t=${Date.now()}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        complete: (results) => {
          const rows = results.data as string[][];
          const data: any[] = [];
          
          // Range B25:E122 -> Rows 24 to 121, Columns B (1) to E (4)
          let currentMonth = '';
          const months = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 
                          'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
          
          for (let i = 24; i <= 121; i++) {
            const row = rows[i];
            if (!row) continue;

            const colB = (row[1] || '').trim().toUpperCase();
            
            // Heuristic to find month headers
            const foundMonth = months.find(m => colB === m || colB.includes(m));
            if (foundMonth) {
              currentMonth = foundMonth;
              // We might want to skip the header row itself or include it
              continue; 
            }

            if (row[1] && row[1].trim() !== '') {
              data.push({
                uraian: row[1].trim(),
                col2: row[2] || '',
                col3: row[3] || '',
                col4: row[4] || '',
                month: currentMonth
              });
            }
          }
          resolve(data);
        },
        error: (error: any) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error fetching Realisasi ROW Detail Data:', error);
    return [];
  }
}

export async function fetchOldPemeliharaanRowData(): Promise<any> {
  try {
    const response = await fetch(`${OLD_PEMELIHARAAN_ROW_URL}&t=${Date.now()}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        complete: (results) => {
          const rows = results.data as string[][];
          
          // Chart Data (Rows 4-15, Cols B-C -> 1-2)
          const chartData = [];
          const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
          for (let i = 3; i <= 14; i++) {
            if (rows[i]) {
              chartData.push({
                month: months[i-3],
                value: parseFloat(rows[i][2]) || 0
              });
            }
          }

          // Table Data (Rows 4-15, Cols B-C -> 1-2)
          const tableData = [];
          for (let i = 3; i <= 14; i++) {
            if (rows[i]) {
              tableData.push({
                uraian: rows[i][1] || '',
                jumlah: rows[i][2] || '0'
              });
            }
          }

          // Monthly Data (Rows 21-32, Cols B-N -> 1-13)
          const monthlyData: any = {};
          const fullMonths = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
          
          for (let j = 2; j <= 13; j++) {
            const monthName = fullMonths[j-2];
            monthlyData[monthName] = {
              varRow: rows[23]?.[j] || '0',
              piket: rows[25]?.[j] || '0'
            };
          }

          resolve({ chartData, tableData, monthlyData });
        },
        error: (error: any) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error fetching Old Pemeliharaan ROW Data:', error);
    return null;
  }
}

export async function fetchSummaryData(): Promise<SummaryData | null> {
  try {
    const response = await fetch(DATA_GARDU_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        complete: (results) => {
          const rows = results.data as string[][];
          
          const summary: SummaryData = {
            totalGardu: rows[20]?.[4] || rows[19]?.[4] || '0', // Try Row 21 or 20, Col E
            kapasitas: [],
            kondisiTrafo: [],
            pembebananTrafo: []
          };
          
          // Parse Kapasitas (Rows 21-27, Cols D-E -> 3-4)
          for (let i = 19; i <= 26; i++) {
            const kva = rows[i]?.[3];
            const jumlah = rows[i]?.[4];
            if (kva && jumlah && kva.trim() !== '' && !kva.includes('KAPASITAS')) {
              summary.kapasitas.push({ kva: kva.trim(), jumlah: jumlah.trim() });
            }
          }
          
          // Parse Kondisi Trafo (Rows 21-27, Cols I-J -> 8-9)
          for (let i = 19; i <= 26; i++) {
            const kondisi = rows[i]?.[8];
            const jumlah = rows[i]?.[9];
            if (kondisi && jumlah && kondisi.trim() !== '' && !kondisi.includes('KONDISI')) {
              summary.kondisiTrafo.push({ kondisi: kondisi.trim(), jumlah: jumlah.trim() });
            }
          }
          
          // Parse Pembebanan Trafo (Rows 21-24, Cols M-O -> 12-14)
          for (let i = 20; i <= 23; i++) {
            const kondisi = rows[i]?.[12]; // M
            const jumlah = rows[i]?.[14]; // O
            if (kondisi && jumlah && kondisi.trim() !== '') {
              summary.pembebananTrafo.push({ kondisi: kondisi.trim(), jumlah: jumlah.trim() });
            }
          }
          
          resolve(summary);
        },
        error: (error: Error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching Summary Data:', error);
    return null;
  }
}

export async function fetchDataGardu(): Promise<DataGarduItem[]> {
  try {
    const response = await fetch(DATA_GARDU_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        complete: (results) => {
          const rows = results.data as string[][];
          const data: DataGarduItem[] = [];
          
          // Data starts at row 30 (index 29) to skip the header row
          for (let i = 29; i < rows.length; i++) {
            const row = rows[i];
            if (!row[3] || row[3].trim() === '') continue; // Skip if Nomor Gardu is empty
            
            data.push({
              no: row[1] || '',
              maximoGardu: row[2] || '',
              nomorGardu: row[3] || '',
              lokasi: row[4] || '',
              feeder: row[5] || '',
              latitude: '',
              longitude: '',
              nomorSeri: '',
              kapasitas: row[9] || '',
              losses: row[63] || '', // Column BL
              konstruksi: '',
              jurusan: '',
              tanggal: '',
              ir: '',
              is: '',
              it: '',
              in: '',
              vrs: '',
              vrt: '',
              vst: '',
              totalPembebanan: row[72] || '', // Column BU
              keseimbanganTrafo: row[71] || '', // Column BT
              status: row[103] || '' // Column CZ
            });
          }
          
          resolve(data);
        },
        error: (error: Error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching Data Gardu:', error);
    return [];
  }
}

export async function fetchFgtmReportData(): Promise<FgtmReportData | null> {
  try {
    const response = await fetch(`${MONITORING_BULAN_URL}&t=${Date.now()}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        complete: (results) => {
          const rows = results.data as string[][];
          
          const extractRange = (startRow: number, endRow: number, startCol: number, endCol: number): FgtmRow[] => {
            const data: FgtmRow[] = [];
            
            // Find the first row that looks like a header (multiple columns filled)
            let headerRowIndex = startRow;
            while (headerRowIndex <= endRow) {
              const row = rows[headerRowIndex];
              if (row) {
                const filledCells = row.slice(startCol, endCol + 1).filter(cell => cell && cell.trim() !== '');
                if (filledCells.length > 1) {
                  break; // Found the header row
                }
              }
              headerRowIndex++;
            }
            
            if (headerRowIndex > endRow) return [];
            
            const headers = rows[headerRowIndex];
            
            for (let i = headerRowIndex + 1; i <= endRow; i++) {
              const row = rows[i];
              if (row && row[startCol] && row[startCol].trim() !== '') {
                const item: FgtmRow = {};
                for (let j = startCol; j <= endCol; j++) {
                  let header = (headers[j] || '').trim();
                  if (!header) {
                    // Fallback to column letter if header is empty
                    const colLetter = String.fromCharCode(65 + j);
                    header = `Col_${colLetter}`;
                  }
                  item[header] = (row[j] || '').trim();
                }
                data.push(item);
              }
            }
            return data;
          };

          const report: FgtmReportData = {
            lessThan5Min: {
              monthly: extractRange(2, 18, 1, 13), // B3:N19
              summary: extractRange(43, 54, 1, 7)  // B44:H55
            },
            moreThan5Min: {
              monthly: extractRange(2, 18, 18, 30), // S3:AE19
              summary: extractRange(136, 146, 18, 24) // S137:Y147
            },
            zona1and2: {
              monthly: extractRange(2, 16, 36, 48), // AK3:AW17
              summary: extractRange(135, 145, 36, 42) // AK136:AQ146
            }
          };
          
          resolve(report);
        },
        error: (error: any) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error fetching FGTM Report Data:', error);
    return null;
  }
}

export async function fetchMonitoringBulan(): Promise<MonitoringBulan[]> {
  try {
    const response = await fetch(MONITORING_BULAN_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        complete: (results) => {
          const rows = results.data as string[][];
          const data: MonitoringBulan[] = [];
          
          // The months are in row 3 (index 3), columns 37 to 48 (index 37 to 48)
          // Wait, in my test script, AK is index 36.
          // Let's check the test script output.
          // Row 4 (index 3): KEYPOINT | JANUARI | FEBRUARI | MARET | APRIL | MEI | JUNI | JULI | AGUSTUS | SEPTEMBER | OKTOBER | NOVEMBER | DESEMBER | 
          // So index 36 is KEYPOINT, 37 is JANUARI, ..., 48 is DESEMBER.
          
          const months = [
            'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 
            'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
          ];
          
          for (let m = 0; m < 12; m++) {
            const colIndex = 37 + m;
            
            // Extract data for this month
            // Row 6 (index 5): P. SUNGAI BARU
            // Row 7 (index 6): RECLOSER PERIGI PARIT
            // Row 8 (index 7): RECLOSER SEKUMBAK
            // Row 9 (index 8): RECLOSER TANAH HITAM
            // Row 10 (index 9): RECLOSER SASAK (TMJ)
            // Row 11 (index 10): TOTAL
            // Row 12 (index 11): KUMULATIF TRIP
            // Row 14 (index 13): FGTM
            // Row 16 (index 15): TARGET KPI
            // Row 17 (index 16): % KUMULATIF TRIP TERHADAP TARGET KPI
            
            if (rows[3] && rows[3][colIndex]) {
              data.push({
                bulan: months[m],
                pSungaiBaru: rows[5]?.[colIndex] || '0',
                recloserPerigiParit: rows[6]?.[colIndex] || '0',
                recloserSekumbak: rows[7]?.[colIndex] || '0',
                recloserTanahHitam: rows[8]?.[colIndex] || '0',
                recloserSasak: rows[9]?.[colIndex] || '0',
                total: rows[10]?.[colIndex] || '0',
                kumulatifTrip: rows[11]?.[colIndex] || '0',
                fgtm: rows[13]?.[colIndex] || '0',
                targetKpi: rows[15]?.[colIndex] || '0',
                persenKumulatifTrip: rows[16]?.[colIndex] || '0',
              });
            }
          }
          
          resolve(data);
        },
        error: (error: any) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error fetching monitoring bulan data:', error);
    return [];
  }
}

export async function fetchTotalGardu(): Promise<TotalGardu | null> {
  try {
    const response = await fetch(TOTAL_GARDU_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        complete: (results) => {
          const rows = results.data as string[][];
          const data: TotalGardu = {
            total: 0,
            kapasitas: {}
          };

          if (rows.length > 20) {
            data.total = parseInt(rows[20][4], 10) || 0; // E21
            
            for (let i = 21; i <= 26; i++) {
              if (rows[i]) {
                const kapasitas = rows[i][3]; // D22:D27
                const jumlah = parseInt(rows[i][4], 10); // E22:E27
                if (kapasitas && !isNaN(jumlah)) {
                  data.kapasitas[kapasitas] = jumlah;
                }
              }
            }
          }
          resolve(data);
        },
        error: (error: any) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error fetching total gardu data:', error);
    return null;
  }
}

export async function fetchKondisiTrafo(): Promise<KondisiTrafo | null> {
  try {
    const response = await fetch(KONDISI_TRAFO_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        complete: (results) => {
          const rows = results.data as string[][];
          const data: KondisiTrafo = {
            condition: {},
            pembebanan: {}
          };

          for (let i = 20; i <= 25; i++) {
            if (rows[i]) {
              // Condition Trafo
              const conditionName = rows[i][8]; // I21:I26
              const conditionValue = parseInt(rows[i][9], 10); // J21:J26
              if (conditionName && !isNaN(conditionValue)) {
                data.condition[conditionName] = conditionValue;
              }

              // Pembebanan Trafo (Rows 21-24, Cols M-O -> 12-14)
              if (i >= 20 && i <= 23) {
                const pembebananName = rows[i][12]; // M
                const pembebananValue = parseInt(rows[i][14], 10); // O
                if (pembebananName && !isNaN(pembebananValue)) {
                  data.pembebanan[pembebananName] = pembebananValue;
                }
              }
            }
          }
          resolve(data);
        },
        error: (error: any) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error fetching kondisi trafo data:', error);
    return null;
  }
}

export async function fetchSheetData(): Promise<SheetData> {
  try {
    const response = await fetch(SHEET_URL);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        complete: (results) => {
          const rows = results.data as string[][];
          const data: SheetData = {
            saidi: rows[21]?.[13] || '0', // N22
            saifi: rows[37]?.[13] || '0', // N38
            ens: rows[53]?.[13] || '0',   // N54
            rpt: '0',
            lastUpdate: '',
            activities: []
          };

          rows.forEach((row, index) => {
            // Extract Last Update (usually near the top or specific markers)
            if (row.some(c => c.includes('Jumat') || c.includes('/2026'))) {
              const dateCell = row.find(c => c.includes('/2026'));
              if (dateCell) data.lastUpdate = dateCell.trim();
            }

            // Extract RPT (if still needed, keep old logic or update if known)
            const rowString = row.join(' ');
            if (rowString.includes('RPT')) {
              const val = row.find((c, i) => i > 5 && c.trim() !== '' && c !== 'RPT');
              if (val) data.rpt = val.trim();
            }

            // Extract Activities
            if (index > 100) {
              if (rowString.includes('TMP') || rowString.includes('BO TEMAJUK') || rowString.includes('KRONOLOGIS')) {
                const title = row.find(c => c.trim().length > 10);
                const file = row.find(c => c.includes('.docx') || c.includes('.pdf'));
                if (title) {
                  data.activities.push({ title: title.trim(), file: file?.trim() });
                }
              }
            }
          });

          resolve(data);
        },
        error: (error: any) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
}

export async function fetchGangguanData(): Promise<GangguanKeypoint[]> {
  try {
    const response = await fetch(GANGGUAN_SHEET_URL);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        complete: (results) => {
          const rows = results.data as string[][];
          // Start from row 2 (index 1)
          const data = rows.slice(1)
            .filter(row => row[1] && row[1].trim() !== '') 
            .map((row, index) => ({
              id: String(index + 1),
              tanggalTrip: row[1]?.trim() || '',
              namaKeypoint: row[2]?.trim() || '',
              jamTrip: row[3]?.trim() || '',
              jamPenormalan: row[4]?.trim() || '',
              sectionGangguan: row[5]?.trim() || '',
              arusGangguan: row[8]?.trim() || '',
              kelompokGangguan: row[10]?.trim() || '',
            }));
          resolve(data);
        },
        error: (error: any) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error fetching gangguan data:', error);
    return [];
  }
}

export async function fetchPltdTemajukData(): Promise<PltdTemajukItem[]> {
  try {
    // Add timestamp to bypass cache for real-time data
    const urlWithCacheBuster = `${PLTD_TEMAJUK_URL}&t=${Date.now()}`;
    const response = await fetch(urlWithCacheBuster);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        complete: (results) => {
          const rows = results.data as string[][];
          // Range B5:D12 -> Index 4 to 11, Columns B (1), C (2), D (3)
          const data: PltdTemajukItem[] = [];
          
          // Row 5 (index 4) is usually the header, skip it if it contains "MESIN"
          const startRow = (rows[4]?.[1] || '').toUpperCase().includes('MESIN') ? 5 : 4;
          
          for (let i = startRow; i < 12; i++) {
            if (rows[i] && rows[i][1]) {
              data.push({
                mesin: rows[i][1] || '',
                dayaTerpasang: rows[i][2] || '',
                dayaMampu: rows[i][3] || ''
              });
            }
          }
          resolve(data);
        },
        error: (error: any) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error fetching PLTD Temajuk data:', error);
    return [];
  }
}
