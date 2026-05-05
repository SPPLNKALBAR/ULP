import React, { useState, useMemo, useEffect } from 'react';
import { Card } from './UI';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek, getYear } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '../utils';

interface Holiday {
  name: string;
  isCuti: boolean;
}

// Comprehensive 2026 Indonesian National Holidays & Cuti Bersama
const HOLIDAYS_2026: Record<string, Holiday> = {
  '2026-01-01': { name: 'Tahun Baru 2026 Masehi', isCuti: false },
  '2026-01-18': { name: 'Isra Mikraj Nabi Muhammad SAW', isCuti: false },
  '2026-01-19': { name: 'Cuti Bersama Isra Mikraj', isCuti: true },
  '2026-02-17': { name: 'Tahun Baru Imlek 2577 Kongzili', isCuti: false },
  '2026-02-18': { name: 'Cuti Bersama Tahun Baru Imlek', isCuti: true },
  '2026-03-18': { name: 'Cuti Bersama Idul Fitri 1447 H', isCuti: true },
  '2026-03-19': { name: 'Hari Suci Nyepi (Tahun Baru Saka 1948)', isCuti: false },
  '2026-03-20': { name: 'Hari Raya Idul Fitri 1447 H', isCuti: false },
  '2026-03-21': { name: 'Hari Raya Idul Fitri 1447 H', isCuti: false },
  '2026-03-23': { name: 'Cuti Bersama Idul Fitri 1447 H', isCuti: true },
  '2026-03-24': { name: 'Cuti Bersama Idul Fitri 1447 H', isCuti: true },
  '2026-03-25': { name: 'Cuti Bersama Idul Fitri 1447 H', isCuti: true },
  '2026-04-03': { name: 'Wafat Yesus Kristus', isCuti: false },
  '2026-05-01': { name: 'Hari Buruh Internasional', isCuti: false },
  '2026-05-14': { name: 'Kenaikan Yesus Kristus', isCuti: false },
  '2026-05-15': { name: 'Cuti Bersama Kenaikan Yesus Kristus', isCuti: true },
  '2026-05-31': { name: 'Hari Raya Waisak 2570 BE', isCuti: false },
  '2026-06-01': { name: 'Hari Lahir Pancasila', isCuti: false },
  '2026-06-02': { name: 'Cuti Bersama Hari Raya Waisak', isCuti: true },
  '2026-06-16': { name: 'Hari Raya Idul Adha 1447 H', isCuti: false },
  '2026-06-17': { name: 'Cuti Bersama Idul Adha', isCuti: true },
  '2026-07-07': { name: 'Tahun Baru Islam 1448 H', isCuti: false },
  '2026-08-17': { name: 'Hari Kemerdekaan RI', isCuti: false },
  '2026-09-15': { name: 'Maulid Nabi Muhammad SAW', isCuti: false },
  '2026-12-25': { name: 'Hari Raya Natal', isCuti: false },
  '2026-12-26': { name: 'Cuti Bersama Hari Raya Natal', isCuti: true },
};

export const KalenderNasional: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<Record<string, Holiday>>(HOLIDAYS_2026);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHolidays = async () => {
    const year = getYear(currentDate);
    if (year !== 2026) {
      try {
        setIsLoading(true);
        const response = await fetch(`https://dayoffapi.vercel.app/api/v1/holidays?year=${year}`);
        const data = await response.json();

        if (data && Array.isArray(data)) {
          const holidayMap: Record<string, Holiday> = {};
          data.forEach((item: any) => {
            const date = new Date(item.holiday_date);
            const dateStr = format(date, 'yyyy-MM-dd');
            holidayMap[dateStr] = {
              name: item.holiday_name,
              isCuti: item.is_joint_holiday || false
            };
          });
          setHolidays(holidayMap);
        }
      } catch (error) {
        console.error('Error fetching holidays:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setHolidays(HOLIDAYS_2026);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [getYear(currentDate)]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  const monthHolidays = useMemo(() => {
    return Object.entries(holidays)
      .filter(([dateStr]) => {
        const date = new Date(dateStr);
        return isSameMonth(date, currentDate);
      })
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
  }, [currentDate, holidays]);

  return (
    <Card 
      title="Kalender Nasional" 
      extra={
        <div className="flex items-center gap-2">
          {isLoading && <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />}
          <CalendarIcon className="w-4 h-4 text-zinc-400" />
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <button 
            onClick={prevMonth}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </button>
          <h2 className="text-sm font-black text-zinc-900 dark:text-white drop-shadow-sm">
            {format(currentDate, 'MMMM yyyy', { locale: id })}
          </h2>
          <button 
            onClick={nextMonth}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 py-1">
              {day}
            </div>
          ))}
          
          {days.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const holiday = holidays[dateStr];
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isTodayDate = isToday(day);
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            
            return (
              <div 
                key={day.toString()} 
                className={cn(
                  "relative flex items-center justify-center h-8 w-full text-xs rounded-md transition-all font-bold drop-shadow-sm",
                  !isCurrentMonth && "text-zinc-400 dark:text-zinc-600",
                  isCurrentMonth && !isTodayDate && !holiday && !isWeekend && "text-zinc-900 dark:text-white hover:bg-white/20 dark:hover:bg-white/5",
                  isCurrentMonth && isWeekend && !holiday && !isTodayDate && "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20",
                  holiday && !holiday.isCuti && !isTodayDate && "text-rose-700 dark:text-rose-400 font-black bg-rose-100/50 dark:bg-rose-900/30",
                  holiday && holiday.isCuti && !isTodayDate && "text-amber-700 dark:text-amber-400 font-black bg-amber-100/50 dark:bg-amber-900/30",
                  isTodayDate && "bg-blue-600 text-white font-black shadow-md"
                )}
                title={holiday ? holiday.name : undefined}
              >
                {format(day, dateFormat)}
                {holiday && (
                  <div className={cn(
                    "absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                    isTodayDate ? "bg-white" : holiday.isCuti ? "bg-amber-500" : "bg-rose-500"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Holidays List */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <h4 className="text-[10px] uppercase tracking-wider font-black text-zinc-700 dark:text-zinc-200 mb-2 drop-shadow-sm">
            Hari Libur & Cuti Bersama
          </h4>
          <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
              </div>
            ) : monthHolidays.length > 0 ? (
              monthHolidays.map(([dateStr, holiday]) => (
                <div key={dateStr} className="flex items-start gap-2 text-xs">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                    holiday.isCuti ? "bg-amber-500" : "bg-rose-500"
                  )} />
                  <div>
                    <span className="font-black text-zinc-900 dark:text-white drop-shadow-sm">
                      {format(new Date(dateStr), 'd MMM', { locale: id })}
                    </span>
                    <span className="text-zinc-800 dark:text-zinc-200 ml-1 font-bold drop-shadow-sm">
                      - {holiday.name}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">
                Tidak ada hari libur nasional di bulan ini.
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
