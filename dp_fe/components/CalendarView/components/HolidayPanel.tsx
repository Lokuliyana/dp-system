import { format, parseISO } from 'date-fns';
import { CalendarHeart, Loader2, Globe, Building } from 'lucide-react';
import { Holiday, CalendarEvent } from '../types';

interface HolidayPanelProps {
  holidays: Holiday[];
  customHolidays?: CalendarEvent[];
  isLoading?: boolean;
  currentYear: number;
}

export function HolidayPanel({
  holidays,
  customHolidays = [],
  isLoading = false,
  currentYear,
}: HolidayPanelProps) {
  const yearHolidays = holidays.filter((h) => h.date.startsWith(String(currentYear)));
  const yearCustomHolidays = customHolidays.filter((h) => h.startDate.startsWith(String(currentYear)));

  // Combine and sort all holidays
  const allHolidays = [
    ...yearHolidays.map(h => ({
      date: h.date,
      name: h.name,
      type: 'public' as const,
      isWorking: false,
      id: `public-${h.date}-${h.name}`
    })),
    ...yearCustomHolidays.map(h => ({
      date: h.startDate,
      name: h.title,
      type: (h.type === 'public-holiday' ? 'public' : 'company') as 'public' | 'company',
      isWorking: (h as any).isWorking || false,
      id: h.id
    }))
  ].sort((a, b) => a.date.localeCompare(b.date));

  // Group by month
  const groupedHolidays = allHolidays.reduce((acc, holiday) => {
    const month = format(parseISO(holiday.date), 'MMMM');
    if (!acc[month]) acc[month] = [];
    acc[month].push(holiday);
    return acc;
  }, {} as Record<string, typeof allHolidays>);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mb-3" />
            <span className="text-xs font-medium uppercase tracking-wider">Loading holidays...</span>
          </div>
        ) : allHolidays.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-900 rounded-xl">
            <CalendarHeart className="h-8 w-8 mb-3 opacity-20" />
            <span className="text-xs font-medium uppercase tracking-wider">No holidays scheduled</span>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedHolidays).map(([month, items]) => (
              <div key={month} className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-900 pb-2">
                  {month}
                </h3>
                <div className="divide-y divide-slate-50 dark:divide-slate-900">
                  {items.map((holiday) => (
                    <div
                      key={holiday.id}
                      className="group flex items-center py-3 first:pt-1 last:pb-1"
                    >
                      <div className="w-12 flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {format(parseISO(holiday.date), 'dd')}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase">
                          {format(parseISO(holiday.date), 'EEE')}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0 px-2">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary transition-colors">
                          {holiday.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {holiday.type === 'public' ? (
                            <Globe className="h-3 w-3 text-slate-400" />
                          ) : (
                            <Building className="h-3 w-3 text-slate-400" />
                          )}
                          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            {holiday.type === 'public' ? 'Public' : 'Company'} Holiday
                          </span>
                          {holiday.isWorking && (
                            <span className="ml-auto px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[9px] font-bold uppercase tracking-tighter border border-amber-200/50 dark:border-amber-800/50">
                              Workable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20">
        <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
          <span>Holidays are synced with the global calendar for {currentYear}</span>
        </div>
      </div>
    </div>
  );
}
