import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  CalendarDay,
  CalendarEvent,
  EventTypeConfig,
  DEFAULT_EVENT_TYPES,
} from "../types";
import { DayCell } from "./DayCell";

interface CalendarGridProps {
  days: CalendarDay[];
  selectedDate: Date | null;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  eventTypes?: Record<string, EventTypeConfig>;
  onSelectDate: (date: Date) => void;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  readOnly?: boolean;
  entityName?: string;
  businessHours?: { start: string; end: string };
}

const getWeekDays = (startDay: number = 0) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return [...days.slice(startDay), ...days.slice(0, startDay)];
};

const isWeekendHeader = (dayName: string) => {
  return dayName === "Sat" || dayName === "Sun";
};

export function CalendarGrid({
  days,
  selectedDate,
  weekStartsOn = 0,
  eventTypes = DEFAULT_EVENT_TYPES,
  onSelectDate,
  onEditEvent,
  onDeleteEvent,
  readOnly = false,
  entityName = 'Event',
  businessHours,
}: CalendarGridProps) {
  const weekDays = getWeekDays(weekStartsOn);
  const selectedDateStr = selectedDate
    ? `${selectedDate.getFullYear()}-${String(
        selectedDate.getMonth() + 1
      ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
    >
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        {weekDays.map((day) => (
          <div
            key={day}
            className={cn(
              "text-center py-3 text-[10px] font-bold uppercase tracking-[0.1em] border-r border-slate-200/60 dark:border-slate-800/60 last:border-r-0",
              isWeekendHeader(day)
                ? "text-slate-400 dark:text-slate-500"
                : "text-slate-500 dark:text-slate-400"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1">
        <AnimatePresence mode="popLayout">
          {days.map((day, index) => {
            const dayDateStr = `${day.date.getFullYear()}-${String(
              day.date.getMonth() + 1
            ).padStart(2, "0")}-${String(day.date.getDate()).padStart(2, "0")}`;
            const isSelected = selectedDateStr === dayDateStr;

            return (
              <DayCell
                key={dayDateStr}
                day={day}
                isSelected={isSelected}
                index={index}
                totalDays={days.length}
                eventTypes={eventTypes}
                onSelect={onSelectDate}
                onEditEvent={onEditEvent}
                onDeleteEvent={onDeleteEvent}
                readOnly={readOnly}
                entityName={entityName}
                businessHours={businessHours}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
