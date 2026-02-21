import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isWeekend,
} from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CalendarEvent, CalendarViewMode } from '../types';

interface YearViewGridProps {
  months: Date[];
  events: CalendarEvent[];
  onSelectMonth: (month: number) => void;
  onViewChange: (view: CalendarViewMode) => void;
}

const weekDaysShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function YearViewGrid({
  months,
  events,
  onSelectMonth,
  onViewChange,
}: YearViewGridProps) {
  const getMonthDays = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const handleMonthClick = (monthIndex: number) => {
    onSelectMonth(monthIndex);
    onViewChange('month');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.2 }}
      className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 p-6 bg-slate-50/30 dark:bg-slate-900/10"
    >
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {months.map((month, monthIndex) => {
        const days = getMonthDays(month);
        const monthEvents = events.filter((e) => {
          const eventDate = new Date(e.startDate);
          return eventDate.getMonth() === monthIndex && eventDate.getFullYear() === month.getFullYear();
        });
        
        const publicHolidayCount = monthEvents.filter((e) => e.type === 'public-holiday').length;
        const customHolidayCount = monthEvents.filter((e) => e.type === 'custom-holiday').length;

        return (
          <motion.button
            key={monthIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: monthIndex * 0.05, duration: 0.4 }}
            onClick={() => handleMonthClick(monthIndex)}
            className={cn(
              'group p-6 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950',
              'hover:border-primary/40 hover:bg-white dark:hover:bg-slate-950 transition-all duration-500',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
              'text-left shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-2'
            )}
          >
            {/* Month name */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-black text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors uppercase tracking-[0.15em]">
                {format(month, 'MMMM')}
              </span>
              <div className="flex gap-1.5">
                {publicHolidayCount > 0 && (
                  <div className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black border border-indigo-100 dark:border-indigo-800/50">
                    {publicHolidayCount}
                  </div>
                )}
                {customHolidayCount > 0 && (
                  <div className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-100 dark:border-emerald-800/50">
                    {customHolidayCount}
                  </div>
                )}
              </div>
            </div>

            {/* Mini week headers */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {weekDaysShort.map((day, i) => (
                <span
                  key={i}
                  className={cn(
                    'text-center text-[9px] font-black uppercase tracking-tighter',
                    i === 0 || i === 6 ? 'text-slate-400 dark:text-slate-500' : 'text-slate-300 dark:text-slate-600'
                  )}
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Mini calendar grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((day, dayIndex) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayEvents = events.filter((e) => e.startDate === dateStr);
                const hasPublicHoliday = dayEvents.some((e) => e.type === 'public-holiday');
                const hasCustomHoliday = dayEvents.some((e) => e.type === 'custom-holiday');
                const isCurrentMonth = isSameMonth(day, month);
                const isTodayDate = isToday(day);
                const isWeekendDay = isWeekend(day);

                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      'aspect-square flex items-center justify-center text-[10px] rounded-lg transition-all duration-300 relative',
                      !isCurrentMonth && 'opacity-0 pointer-events-none',
                      isCurrentMonth && !isTodayDate && !isWeekendDay && 'text-slate-600 dark:text-slate-400 font-bold',
                      isCurrentMonth && isWeekendDay && !isTodayDate && 'text-slate-400 dark:text-slate-500',
                      isTodayDate && 'bg-primary text-white font-black shadow-lg shadow-primary/30 ring-2 ring-primary/20 z-10 scale-110',
                      hasPublicHoliday && !isTodayDate && isCurrentMonth && 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-black',
                      hasCustomHoliday && !isTodayDate && isCurrentMonth && 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-black'
                    )}
                  >
                    {format(day, 'd')}
                    {(hasPublicHoliday || hasCustomHoliday) && !isTodayDate && (
                      <div className={cn(
                        "absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                        hasPublicHoliday ? "bg-indigo-400" : "bg-emerald-400"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.button>
        );
      })}
      </div>
    </motion.div>
  );
}
