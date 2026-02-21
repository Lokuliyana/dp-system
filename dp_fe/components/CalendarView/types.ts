// Calendar View Types - Industrial Level Reusable Calendar Component Library

export type CalendarViewMode = 'month' | 'week' | 'year';

// Event type configuration for extensibility
export interface EventTypeConfig {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  icon?: string;
}

// Default event types - easily extensible
export const DEFAULT_EVENT_TYPES: Record<string, EventTypeConfig> = {
  'public-holiday': {
    id: 'public-holiday',
    label: 'Public Holiday',
    color: 'hsl(217 91% 60%)', // Blue 600
    bgColor: 'hsl(217 91% 95%)', // Blue 50
    icon: 'globe',
  },
  'custom-holiday': {
    id: 'custom-holiday',
    label: 'Organization Holiday',
    color: 'hsl(24 95% 53%)', // Orange 600
    bgColor: 'hsl(24 95% 96%)', // Orange 50
    icon: 'building',
  },
  holiday: {
    id: 'holiday',
    label: 'Holiday',
    color: 'hsl(var(--accent))',
    bgColor: 'hsl(var(--accent-soft))',
    icon: 'calendar-heart',
  },
  event: {
    id: 'event',
    label: 'Event',
    color: 'hsl(var(--primary))',
    bgColor: 'hsl(var(--primary) / 0.1)',
    icon: 'calendar',
  },
  'working-day': {
    id: 'working-day',
    label: 'Working Day',
    color: 'hsl(142 71% 45%)', // Emerald 600
    bgColor: 'hsl(142 71% 95%)', // Emerald 50
    icon: 'clock',
  },
};

export type EventType = string;

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD format
  endDate?: string; // YYYY-MM-DD format for multi-day events
  type: EventType;
  description?: string;
  color?: string;
  isMultiDay?: boolean;
  metadata?: Record<string, unknown>; // For custom data
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  events: CalendarEvent[];
}

export interface Holiday {
  date: string; // YYYY-MM-DD format
  name: string;
  type?: 'public' | 'observance' | 'optional';
}

// Form data for creating/editing events
export interface EventFormData {
  title: string;
  type: EventType;
  startDate: Date;
  endDate?: Date;
  description?: string;
  isMultiDay: boolean;
}

// Calendar configuration
export interface CalendarConfig {
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
  showWeekNumbers?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  eventTypes?: Record<string, EventTypeConfig>;
}

// Callback types for maximum flexibility
export interface CalendarCallbacks {
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventCreate?: (eventData: Omit<CalendarEvent, 'id'>) => void;
  onEventUpdate?: (eventId: string, eventData: Omit<CalendarEvent, 'id'>) => void;
  onEventDelete?: (eventId: string) => void;
  onViewChange?: (view: CalendarViewMode) => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  onMonthChange?: (date: Date) => void;
  onYearChange?: (year: number) => void;
}

// Main CalendarView props
export interface CalendarViewProps {
  // Data
  events?: CalendarEvent[];
  holidays?: Holiday[];
  
  // Initial state
  initialDate?: Date;
  initialView?: CalendarViewMode;
  
  // Configuration
  config?: CalendarConfig;
  
  // Callbacks
  callbacks?: CalendarCallbacks;
  
  // UI customization
  showHeader?: boolean;
  showHolidayPanel?: boolean;
  showHolidaysOnGrid?: boolean;
  showEventDialog?: boolean;
  className?: string;
  
  // Read-only mode
  readOnly?: boolean;

  // Custom labels
  entityName?: string;
  businessHours?: { start: string; end: string };
  onBusinessHoursChange?: (hours: { start: string; end: string; effectiveDate: Date }) => void;
  onDayConfigSave?: (config: {
    date: Date;
    endDate?: Date;
    isWorking: boolean;
    isHoliday: boolean;
    holidayType: 'PublicHoliday' | 'OrganizationalHoliday' | 'Weekend' | 'None';
    label: string;
    startTime: string;
    endTime: string;
    isMultiDay: boolean;
  }) => void;
}
