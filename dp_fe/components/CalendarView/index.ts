// Main export
export { CalendarView } from './CalendarView';

// Types
export type {
  CalendarViewProps,
  CalendarViewMode,
  CalendarEvent,
  CalendarDay,
  CalendarConfig,
  CalendarCallbacks,
  EventTypeConfig,
  EventType,
  Holiday,
  EventFormData,
} from './types';

export { DEFAULT_EVENT_TYPES } from './types';

// Hooks
export { useCalendarState } from './hooks/useCalendarState';

// Sub-components for advanced usage
export { CalendarHeader } from './components/CalendarHeader';
export { CalendarGrid } from './components/CalendarGrid';
export { WeekViewGrid } from './components/WeekViewGrid';
export { YearViewGrid } from './components/YearViewGrid';
export { DayCell } from './components/DayCell';
export { EventDialog } from './components/EventDialog';
export { HolidayPanel } from './components/HolidayPanel';
