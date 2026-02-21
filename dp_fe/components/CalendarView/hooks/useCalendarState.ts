import { useState, useMemo, useCallback } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addYears,
  subYears,
  addWeeks,
  subWeeks,
  isToday,
  isSameMonth,
  isWeekend,
  format,
} from 'date-fns';
import {
  CalendarViewMode,
  CalendarDay,
  CalendarEvent,
  CalendarConfig,
  CalendarCallbacks,
} from '../types';

interface UseCalendarStateProps {
  initialDate?: Date;
  initialView?: CalendarViewMode;
  events?: CalendarEvent[];
  config?: CalendarConfig;
  callbacks?: CalendarCallbacks;
}

export function useCalendarState({
  initialDate = new Date(),
  initialView = 'month',
  events = [],
  config = {},
  callbacks = {},
}: UseCalendarStateProps = {}) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [view, setView] = useState<CalendarViewMode>(initialView);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const weekStartsOn = config.weekStartsOn ?? 0;

  // Calculate month days
  const monthDays = useMemo((): CalendarDay[] => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return days.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayEvents = events.filter((e) => {
        if (e.isMultiDay && e.endDate) {
          return dateStr >= e.startDate && dateStr <= e.endDate;
        }
        return e.startDate === dateStr;
      });

      return {
        date,
        isCurrentMonth: isSameMonth(date, currentDate),
        isToday: isToday(date),
        isWeekend: isWeekend(date),
        events: dayEvents,
      };
    });
  }, [currentDate, events, weekStartsOn]);

  // Calculate week days
  const weekDays = useMemo((): CalendarDay[] => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn });

    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return days.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayEvents = events.filter((e) => {
        if (e.isMultiDay && e.endDate) {
          return dateStr >= e.startDate && dateStr <= e.endDate;
        }
        return e.startDate === dateStr;
      });

      return {
        date,
        isCurrentMonth: true,
        isToday: isToday(date),
        isWeekend: isWeekend(date),
        events: dayEvents,
      };
    });
  }, [currentDate, events, weekStartsOn]);

  // Calculate year months
  const yearMonths = useMemo(() => {
    const year = currentDate.getFullYear();
    return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
  }, [currentDate]);

  // Navigation
  const navigate = useCallback(
    (direction: 'prev' | 'next') => {
      setCurrentDate((prev) => {
        let newDate: Date;
        switch (view) {
          case 'month':
            newDate = direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1);
            break;
          case 'week':
            newDate = direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1);
            break;
          case 'year':
            newDate = direction === 'next' ? addYears(prev, 1) : subYears(prev, 1);
            break;
          default:
            newDate = prev;
        }
        callbacks.onNavigate?.(direction);
        callbacks.onMonthChange?.(newDate);
        return newDate;
      });
    },
    [view, callbacks]
  );

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const setYear = useCallback(
    (year: number) => {
      setCurrentDate((prev) => {
        const newDate = new Date(prev);
        newDate.setFullYear(year);
        callbacks.onYearChange?.(year);
        return newDate;
      });
    },
    [callbacks]
  );

  const setMonth = useCallback((month: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(month);
      return newDate;
    });
  }, []);

  const handleViewChange = useCallback(
    (newView: CalendarViewMode) => {
      setView(newView);
      callbacks.onViewChange?.(newView);
    },
    [callbacks]
  );

  const handleDateSelect = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      callbacks.onDateSelect?.(date);
    },
    [callbacks]
  );

  return {
    // State
    currentDate,
    view,
    selectedDate,
    
    // Computed
    monthDays,
    weekDays,
    yearMonths,
    
    // Actions
    navigate,
    goToToday,
    setYear,
    setMonth,
    setView: handleViewChange,
    setSelectedDate: handleDateSelect,
    setCurrentDate,
  };
}
