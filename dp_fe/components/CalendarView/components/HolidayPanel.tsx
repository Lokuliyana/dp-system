import { format, parseISO } from 'date-fns';
import { CalendarHeart, Loader2, Globe, Building, Trophy, Star, Calendar as CalendarIcon } from 'lucide-react';
import { Holiday, CalendarEvent, DEFAULT_EVENT_TYPES } from '../types';

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

  // Combine and sort all items
  const allItems = [
    ...yearHolidays.map(h => ({
      date: h.date,
      name: h.name,
      type: 'public-holiday',
      label: 'Public Holiday',
      icon: <Globe className="h-3 w-3 text-slate-400" />,
      id: `public-${h.date}-${h.name}`
    })),
    ...yearCustomHolidays.map(h => {
      const config = DEFAULT_EVENT_TYPES[h.type] || DEFAULT_EVENT_TYPES.event;
      let label = config.label;
      let icon = <CalendarIcon className="h-3 w-3 text-slate-400" />;

      if (h.type === 'competition-event') {
        icon = <Trophy className="h-3 w-3 text-violet-500" />;
      } else if (h.type === 'special-day') {
        icon = <Star className="h-3 w-3 text-rose-500" />;
      } else if (h.type === 'public-holiday') {
        icon = <Globe className="h-3 w-3 text-blue-500" />;
      } else if (h.type === 'custom-holiday') {
        icon = <Building className="h-3 w-3 text-orange-500" />;
      }

      return {
        date: h.startDate,
        name: h.title,
        type: h.type,
        label: label,
        icon: icon,
        id: h.id
      };
    })
  ].sort((a, b) => a.date.localeCompare(b.date));

  // Group by month
  const groupedItems = allItems.reduce((acc, item) => {
    const month = format(parseISO(item.date), 'MMMM');
    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {} as Record<string, typeof allItems>);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mb-3" />
            <span className="text-xs font-medium uppercase tracking-wider">Loading calendar...</span>
          </div>
        ) : allItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-900 rounded-xl">
            <CalendarHeart className="h-8 w-8 mb-3 opacity-20" />
            <span className="text-xs font-medium uppercase tracking-wider">No events scheduled</span>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([month, items]) => (
              <div key={month} className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-900 pb-2">
                  {month}
                </h3>
                <div className="divide-y divide-slate-50 dark:divide-slate-900">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center py-3 first:pt-1 last:pb-1"
                    >
                      <div className="w-12 flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {format(parseISO(item.date), 'dd')}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase">
                          {format(parseISO(item.date), 'EEE')}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0 px-2">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary transition-colors">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.icon}
                          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            {item.label}
                          </span>
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
          <span>Events are synced with the school calendar for {currentYear}</span>
        </div>
      </div>
    </div>
  );
}
