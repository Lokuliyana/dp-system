import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useCalendarState } from './hooks/useCalendarState';
import { CalendarHeader } from './components/CalendarHeader';
import { CalendarGrid } from './components/CalendarGrid';
import { WeekViewGrid } from './components/WeekViewGrid';
import { YearViewGrid } from './components/YearViewGrid';
import { HolidayPanel } from './components/HolidayPanel';
import { CalendarViewProps, CalendarEvent, Holiday, DEFAULT_EVENT_TYPES } from './types';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { DayConfigDialog } from './components/DayConfigDialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarHeart } from 'lucide-react';

// Default holidays
const defaultHolidays: Holiday[] = [
  { date: '2025-01-01', name: "New Year's Day", type: 'public' },
  { date: '2025-01-26', name: 'Republic Day', type: 'public' },
  { date: '2025-03-14', name: 'Holi', type: 'public' },
  { date: '2025-08-15', name: 'Independence Day', type: 'public' },
  { date: '2025-10-02', name: 'Gandhi Jayanti', type: 'public' },
  { date: '2025-10-20', name: 'Diwali', type: 'public' },
  { date: '2025-12-25', name: 'Christmas', type: 'public' },
];

export function CalendarView({
  events: externalEvents = [],
  holidays = defaultHolidays,
  initialDate,
  initialView = 'month',
  config = {},
  callbacks = {},
  showHeader = true,
  showHolidayPanel: enableHolidayPanel = true,
  showHolidaysOnGrid = true,
  className,
  readOnly = false,
  entityName = 'Event',
  onDayConfigSave,
}: CalendarViewProps) {
  const eventTypes = config.eventTypes || DEFAULT_EVENT_TYPES;

  // Internal state for custom events
  const [customEvents] = useState<CalendarEvent[]>([]);
  const [showHolidayPanel, setShowHolidayPanel] = useState(false);
  const [showDayConfigDialog, setShowDayConfigDialog] = useState(false);
  const [selectedDayConfig, setSelectedDayConfig] = useState<any>(null);

  // Combine all events
  const allEvents: CalendarEvent[] = [
    ...(showHolidaysOnGrid ? holidays.map((h, i) => ({
      id: `google-holiday-${i}`,
      title: h.name,
      startDate: h.date,
      type: 'public-holiday',
    })) : []),
    ...externalEvents,
    ...customEvents.map(e => ({
      ...e,
      type: entityName === 'Holiday' ? 'custom-holiday' : e.type
    })),
  ];

  const calendar = useCalendarState({
    initialDate,
    initialView,
    events: allEvents,
    config,
    callbacks,
  });

  const handleDateSelect = useCallback(
    (date: Date) => {
      calendar.setSelectedDate(date);
      callbacks.onDateSelect?.(date);
      
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekendDerived = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Find all existing events for this day from externalEvents (backend data)
      const dayEvents = externalEvents.filter(e => e.startDate === dateStr);
      const firstEvent = dayEvents[0];
      
      // Check if it's a public holiday (from Google/Holidays array)
      const publicHoliday = holidays.find(h => h.date === dateStr);
      
      if (!readOnly) {
        if (dayEvents.length > 0) {
          const isCompetition = dayEvents.some(e => e.type === 'competition-event');
          const isPublicHoliday = dayEvents.some(e => e.type === 'public-holiday');
          const isOrgHoliday = dayEvents.some(e => e.type === 'custom-holiday');
          const isSchoolEvent = dayEvents.some(e => e.type === 'school-event');
          const isSpecialDay = dayEvents.some(e => e.type === 'special-day');

          setSelectedDayConfig({
            isHoliday: isPublicHoliday || isOrgHoliday,
            holidayType: isCompetition ? 'Competition' :
                         isPublicHoliday ? 'PublicHoliday' :
                         isOrgHoliday ? 'OrganizationalHoliday' :
                         isSchoolEvent ? 'SpecialEvent' :
                         isSpecialDay ? 'SpecialDay' : 'None',
            label: firstEvent.title,
            descriptionEn: (firstEvent as any).description,
            startTime: firstEvent.metadata?.startTime, // Add these
            endTime: firstEvent.metadata?.endTime,
            metadata: {
              ...(firstEvent as any).metadata,
              allDayEvents: dayEvents 
            }
          });
        } else if (publicHoliday) {
          // Default for public holiday (Google API)
          setSelectedDayConfig({
            isHoliday: true,
            holidayType: 'PublicHoliday',
            label: publicHoliday.name,
          });
        } else if (isWeekendDerived) {
          // Default for weekend
          setSelectedDayConfig({
            isHoliday: true,
            holidayType: 'Weekend',
            label: '',
          });
        } else {
          // Default for normal working day
          setSelectedDayConfig({
            isHoliday: false,
            holidayType: 'None',
            label: '',
          });
        }
        setShowDayConfigDialog(true);
      }
    },
    [calendar, callbacks, externalEvents, holidays, readOnly]
  );

  const handleSaveDayConfig = (config: any) => {
    onDayConfigSave?.(config);
    setShowDayConfigDialog(false);
  };

  return (
    <div className={cn('flex flex-col h-full overflow-hidden', className)}>
      <div className="flex flex-col flex-1 min-h-0 space-y-4">
        {showHeader && (
          <CalendarHeader
            currentDate={calendar.currentDate}
            view={calendar.view}
            onViewChange={calendar.setView}
            onNavigate={calendar.navigate}
            onToday={calendar.goToToday}
            onYearChange={calendar.setYear}
            onShowHolidayPanel={() => setShowHolidayPanel(true)}
            enableHolidayPanel={enableHolidayPanel}
          />
        )}

        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            {calendar.view === 'month' && (
              <CalendarGrid
                key="month"
                days={calendar.monthDays}
                selectedDate={calendar.selectedDate}
                weekStartsOn={config.weekStartsOn}
                eventTypes={eventTypes}
                onSelectDate={handleDateSelect}
                onEditEvent={readOnly ? undefined : (event) => {
                  calendar.setSelectedDate(new Date(event.startDate));
                  handleDateSelect(new Date(event.startDate));
                }}
                readOnly={readOnly}
                entityName={entityName}
              />
            )}
            {calendar.view === 'week' && (
              <WeekViewGrid
                key="week"
                days={calendar.weekDays}
                selectedDate={calendar.selectedDate}
                eventTypes={eventTypes}
                onSelectDate={handleDateSelect}
              />
            )}
            {calendar.view === 'year' && (
              <YearViewGrid
                key="year"
                months={calendar.yearMonths}
                events={allEvents}
                onSelectMonth={calendar.setMonth}
                onViewChange={calendar.setView}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <DayConfigDialog
        isOpen={showDayConfigDialog}
        onClose={() => setShowDayConfigDialog(false)}
        onSave={handleSaveDayConfig}
        selectedDate={calendar.selectedDate}
        initialConfig={selectedDayConfig}
      />

      <Sheet open={showHolidayPanel} onOpenChange={setShowHolidayPanel}>
        <SheetContent className="sm:max-w-[400px] p-0 bg-white dark:bg-slate-950 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <SheetTitle className="text-lg font-bold">
              School Calendar {calendar.currentDate.getFullYear()}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <HolidayPanel
              holidays={showHolidaysOnGrid ? holidays : []}
              customHolidays={externalEvents}
              currentYear={calendar.currentDate.getFullYear()}
            />
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
}
