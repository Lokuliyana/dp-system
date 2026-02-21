import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { MoreHorizontal, Pencil, Trash2, Globe, Building, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalendarDay, CalendarEvent, EventTypeConfig, DEFAULT_EVENT_TYPES } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DayCellProps {
  day: CalendarDay;
  isSelected: boolean;
  index: number;
  totalDays: number;
  eventTypes?: Record<string, EventTypeConfig>;
  onSelect: (date: Date) => void;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  readOnly?: boolean;
  entityName?: string;
  businessHours?: { start: string; end: string };
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'public-holiday':
      return <Globe className="h-3 w-3" />;
    case 'custom-holiday':
      return <Building className="h-3 w-3" />;
    case 'working-day':
      return <Clock className="h-3 w-3" />;
    default:
      return <Calendar className="h-3 w-3" />;
  }
};

export function DayCell({
  day,
  isSelected,
  index,
  totalDays,
  eventTypes = DEFAULT_EVENT_TYPES,
  onSelect,
  onEditEvent,
  onDeleteEvent,
  readOnly = false,
  entityName = 'Event',
  businessHours,
}: DayCellProps) {
  const dayOfWeek = day.date.getDay();
  const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
  const hasHoliday = day.events.some((e) => e.type === 'public-holiday' || e.type === 'custom-holiday');
  
  const isLastInRow = (index + 1) % 7 === 0;
  const rowIndex = Math.floor(index / 7);
  const totalRows = Math.ceil(totalDays / 7);
  const isLastRow = rowIndex === totalRows - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.002 }}
      onClick={() => onSelect(day.date)}
      className={cn(
        'group relative flex flex-col min-h-[100px] sm:min-h-[120px] cursor-pointer transition-all duration-200',
        'border-r border-b border-slate-100 dark:border-slate-800/60',
        isLastInRow && 'border-r-0',
        isLastRow && 'border-b-0',
        !day.isCurrentMonth && 'bg-slate-50/30 dark:bg-slate-900/20 opacity-40',
        day.isCurrentMonth && !isWeekendDay && 'bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/50',
        day.isCurrentMonth && isWeekendDay && 'bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50',
        isSelected && 'bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/40 ring-inset z-10',
        hasHoliday && day.isCurrentMonth && 'bg-primary/[0.02] dark:bg-primary/[0.05]'
      )}
    >
      {/* Date header */}
      <div
        className={cn(
          'flex items-center justify-between px-2.5 py-2',
          isWeekendDay && day.isCurrentMonth && 'bg-slate-50/30 dark:bg-slate-900/20'
        )}
      >
        <span
          className={cn(
            'flex items-center justify-center w-6 h-6 rounded-md text-[13px] font-bold transition-all duration-200',
            !day.isCurrentMonth && 'text-slate-400 dark:text-slate-600',
            day.isCurrentMonth && !day.isToday && 'text-slate-600 dark:text-slate-400',
            day.isCurrentMonth && isWeekendDay && !day.isToday && 'text-slate-400 dark:text-slate-500',
            day.isToday && 'bg-primary text-white shadow-sm ring-2 ring-primary/20',
            hasHoliday && !day.isToday && day.isCurrentMonth && 'text-primary'
          )}
        >
          {format(day.date, 'd')}
        </span>
        
        {day.isToday && (
          <span className="text-[9px] font-bold text-primary uppercase tracking-tighter">Today</span>
        )}
      </div>

      {/* Events container */}
      <div className="flex-1 px-1.5 py-1 overflow-hidden">
        <div className="flex flex-col gap-1">
          {day.events.slice(0, 3).map((event) => {
            const typeConfig = eventTypes[event.type] || eventTypes.event || DEFAULT_EVENT_TYPES.event;
            const canEdit = !readOnly && event.type !== 'public-holiday';

            return (
              <div
                key={event.id}
                className="group/event relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className={cn(
                    'flex items-center gap-1.5 text-[10px] sm:text-[11px] truncate px-2 py-1 rounded-md',
                    'transition-all duration-200 hover:brightness-95 dark:hover:brightness-110 cursor-pointer shadow-sm border border-black/5 dark:border-white/5',
                    event.type === 'public-holiday' && 'border-blue-200 dark:border-blue-900/50',
                    event.type === 'custom-holiday' && 'border-orange-200 dark:border-orange-900/50',
                    event.type === 'working-day' && 'border-emerald-200 dark:border-emerald-900/50'
                  )}
                  style={{
                    backgroundColor: typeConfig.bgColor,
                    color: typeConfig.color,
                  }}
                >
                  <div className="flex-shrink-0 opacity-80">
                    {getEventIcon(event.type)}
                  </div>
                  <span className="truncate font-semibold tracking-tight">{event.title}</span>
                  
                  {/* Custom Time Indicator */}
                  {businessHours && (event as any).startTime && (event as any).endTime &&
                   ((event as any).startTime !== businessHours.start || (event as any).endTime !== businessHours.end) && (
                    <span className="ml-auto flex items-center gap-0.5 px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[8px] font-bold">
                      {(event as any).startTime}-{(event as any).endTime}
                    </span>
                  )}
                </div>

                {/* Event actions dropdown */}
                {canEdit && (onEditEvent || onDeleteEvent) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/event:opacity-100 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" style={{ color: typeConfig.color }} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 p-1">
                      {onEditEvent && (
                        <DropdownMenuItem onClick={() => onEditEvent(event)} className="text-xs py-2">
                          <Pencil className="h-3.5 w-3.5 mr-2 text-slate-500" />
                          Edit {entityName}
                        </DropdownMenuItem>
                      )}
                      {onDeleteEvent && (
                        <DropdownMenuItem
                          onClick={() => onDeleteEvent(event.id)}
                          className="text-xs py-2 text-destructive focus:text-destructive focus:bg-destructive/5"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete {entityName}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
          {day.events.length > 3 && (
            <div className="px-2 py-0.5">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                +{day.events.length - 3} more
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
