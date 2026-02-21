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
import { Clock } from 'lucide-react';
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
  businessHours: initialBusinessHours = { start: "08:00", end: "17:00" },
  onBusinessHoursChange,
  onDayConfigSave,
}: CalendarViewProps) {
  const eventTypes = config.eventTypes || DEFAULT_EVENT_TYPES;

  // Internal state for custom events
  const [customEvents] = useState<CalendarEvent[]>([]);
  const [showHolidayPanel, setShowHolidayPanel] = useState(false);
  const [showDayConfigDialog, setShowDayConfigDialog] = useState(false);
  const [selectedDayConfig, setSelectedDayConfig] = useState<any>(null);
  const [businessHours, setBusinessHours] = useState({ 
    start: initialBusinessHours.start, 
    end: initialBusinessHours.end, 
    effectiveDate: new Date() 
  });
  const [showBusinessHoursDialog, setShowBusinessHoursDialog] = useState(false);
  const [tempBusinessHours, setTempBusinessHours] = useState({ 
    start: initialBusinessHours.start, 
    end: initialBusinessHours.end, 
    effectiveDate: new Date() 
  });

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hh = h % 12 || 12;
    return `${hh.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const businessHoursDisplay = `${formatTime(businessHours.start)} to ${formatTime(businessHours.end)}`;

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
      
      // Find existing config for this day from externalEvents (backend data)
      const existingEvent = externalEvents.find(e => e.startDate === dateStr);
      
      // Check if it's a public holiday (from Google/Holidays array)
      const publicHoliday = holidays.find(h => h.date === dateStr);
      
      if (!readOnly) {
        if (existingEvent) {
          // Use backend data if available
          setSelectedDayConfig({
            isWorking: (existingEvent as any).isWorking ?? true,
            isHoliday: (existingEvent as any).isHoliday ?? (existingEvent.type === 'custom-holiday'),
            holidayType: (existingEvent as any).holidayType || (existingEvent.type === 'custom-holiday' ? 'OrganizationalHoliday' : 'None'),
            label: existingEvent.title,
            startTime: (existingEvent as any).startTime || businessHours.start,
            endTime: (existingEvent as any).endTime || businessHours.end,
          });
        } else if (publicHoliday) {
          // Default for public holiday (Google API)
          setSelectedDayConfig({
            isWorking: false,
            isHoliday: true,
            holidayType: 'PublicHoliday',
            label: publicHoliday.name,
            startTime: businessHours.start,
            endTime: businessHours.end,
          });
        } else if (isWeekendDerived) {
          // Default for weekend
          setSelectedDayConfig({
            isWorking: false,
            isHoliday: true,
            holidayType: 'Weekend',
            label: '',
            startTime: businessHours.start,
            endTime: businessHours.end,
          });
        } else {
          // Default for normal working day
          setSelectedDayConfig({
            isWorking: true,
            isHoliday: false,
            holidayType: 'None',
            label: '',
            startTime: businessHours.start,
            endTime: businessHours.end,
          });
        }
        setShowDayConfigDialog(true);
      }
    },
    [calendar, callbacks, externalEvents, holidays, readOnly, businessHours]
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
            businessHours={businessHoursDisplay}
            onEditBusinessHours={() => {
              setTempBusinessHours(businessHours);
              setShowBusinessHoursDialog(true);
            }}
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
                businessHours={businessHours}
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
              Holidays {calendar.currentDate.getFullYear()}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <HolidayPanel
              holidays={showHolidaysOnGrid ? holidays : []}
              customHolidays={[
                ...customEvents,
                ...externalEvents.filter(e => 
                  e.type === 'public-holiday' || 
                  e.type === 'custom-holiday' || 
                  e.type === 'holiday'
                )
              ]}
              currentYear={calendar.currentDate.getFullYear()}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Business Hours Dialog */}
      <Dialog open={showBusinessHoursDialog} onOpenChange={setShowBusinessHoursDialog}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-xl rounded-lg">
          <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Business Hours Configuration
                </DialogTitle>
                <p className="text-xs text-slate-500 font-medium">Set operating hours for your organization</p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startTime" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={tempBusinessHours.start}
                  onChange={(e) => setTempBusinessHours({ ...tempBusinessHours, start: e.target.value })}
                  className="h-9 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm font-medium shadow-sm focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endTime" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={tempBusinessHours.end}
                  onChange={(e) => setTempBusinessHours({ ...tempBusinessHours, end: e.target.value })}
                  className="h-9 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm font-medium shadow-sm focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Effective From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-9 justify-start text-xs font-medium rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <CalendarHeart className="mr-2 h-3.5 w-3.5 text-slate-400" />
                    {tempBusinessHours.effectiveDate ? format(tempBusinessHours.effectiveDate, 'MMMM d, yyyy') : 'Select effective date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-md shadow-lg border-slate-200 dark:border-slate-800" align="start">
                  <Calendar
                    mode="single"
                    selected={tempBusinessHours.effectiveDate}
                    onSelect={(date) => date && setTempBusinessHours({ ...tempBusinessHours, effectiveDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-[10px] text-slate-500 italic mt-1">Changes will be applied to all working days from this date onwards.</p>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowBusinessHoursDialog(false)}
              className="flex-1 h-9 rounded-md text-xs font-semibold text-slate-600 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setBusinessHours(tempBusinessHours);
                onBusinessHoursChange?.(tempBusinessHours);
                setShowBusinessHoursDialog(false);
                toast.success('Business hours updated successfully');
              }}
              className="flex-1 h-9 rounded-md text-xs font-semibold bg-primary hover:bg-primary/90 text-white shadow-sm transition-all"
            >
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
