import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CalendarDay, EventTypeConfig, DEFAULT_EVENT_TYPES } from '../types';

interface WeekViewGridProps {
  days: CalendarDay[];
  selectedDate: Date | null;
  eventTypes?: Record<string, EventTypeConfig>;
  onSelectDate: (date: Date) => void;
}

const hours = Array.from({ length: 24 }, (_, i) => i);

export function WeekViewGrid({
  days,
  selectedDate,
  eventTypes = DEFAULT_EVENT_TYPES,
  onSelectDate,
}: WeekViewGridProps) {
  const selectedDateStr = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
    >
      {/* Day headers */}
      <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="py-3 px-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center border-r border-slate-200/60 dark:border-slate-800/60">
          Time
        </div>
        {days.map((day) => {
          const dayDateStr = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`;
          const isSelected = selectedDateStr === dayDateStr;
          const hasHoliday = day.events.some((e) => e.type === 'holiday');

          return (
            <div
              key={dayDateStr}
              onClick={() => onSelectDate(day.date)}
              className={cn(
                'py-2 px-1 text-center border-r border-slate-200/60 dark:border-slate-800/60 last:border-r-0 cursor-pointer transition-all duration-200',
                day.isWeekend ? 'bg-slate-50/30 dark:bg-slate-900/20' : 'bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/50',
                isSelected && 'bg-primary/5 dark:bg-primary/10'
              )}
            >
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                {format(day.date, 'EEE')}
              </span>
              <div
                className={cn(
                  'mt-1 w-7 h-7 mx-auto flex items-center justify-center rounded-md text-[13px] font-bold transition-all duration-200',
                  day.isToday && 'bg-primary text-white shadow-sm ring-2 ring-primary/20',
                  !day.isToday && isSelected && 'bg-primary/10 text-primary',
                  !day.isToday && !isSelected && 'text-slate-600 dark:text-slate-400'
                )}
              >
                {format(day.date, 'd')}
              </div>
              {hasHoliday && (
                <div className="mt-1 text-[9px] text-primary font-bold truncate px-1 uppercase tracking-tighter">
                  {day.events.find((e) => e.type === 'holiday')?.title}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 bg-slate-50/10 dark:bg-slate-900/5 relative">
        <div className="grid grid-cols-8 min-h-[1440px]">
          {/* Time column */}
          <div className="border-r border-slate-200/60 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm sticky left-0 z-20">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b border-slate-100 dark:border-slate-800/40 px-3 py-2 text-right"
              >
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                  {format(new Date().setHours(hour, 0), 'h a')}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const dayDateStr = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`;
            const isToday = format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            return (
              <div
                key={dayDateStr}
                className={cn(
                  'relative border-r border-slate-100 dark:border-slate-800/40 last:border-r-0',
                  day.isWeekend && 'bg-slate-50/30 dark:bg-slate-900/20'
                )}
              >
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] border-b border-slate-100 dark:border-slate-800/40 hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-colors cursor-pointer group"
                    onClick={() => onSelectDate(day.date)}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute inset-x-0 h-px bg-primary/20 transition-opacity" />
                  </div>
                ))}

                {/* Current time indicator */}
                {isToday && (
                  <div 
                    className="absolute left-0 right-0 border-t-2 border-red-500 z-10 pointer-events-none"
                    style={{ 
                      top: `${(new Date().getHours() * 60 + new Date().getMinutes())}px`,
                    }}
                  >
                    <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-500" />
                  </div>
                )}

                {/* Events overlay */}
                <div className="absolute inset-0 pointer-events-none p-1">
                  {day.events
                    .filter((e) => e.type !== 'holiday')
                    .map((event) => {
                      const typeConfig =
                        eventTypes[event.type] || eventTypes.event || DEFAULT_EVENT_TYPES.event;
                      return (
                        <div
                          key={event.id}
                          className="mb-1 px-2 py-1.5 rounded-lg text-[10px] font-bold truncate pointer-events-auto shadow-sm border border-black/5 dark:border-white/5 hover:scale-[1.02] transition-transform cursor-pointer"
                          style={{
                            backgroundColor: typeConfig.bgColor,
                            color: typeConfig.color,
                            borderLeft: `3px solid ${typeConfig.color}`,
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: typeConfig.color }} />
                            {event.title}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
