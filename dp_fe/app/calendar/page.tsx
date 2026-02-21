"use client";

import { useEffect, useState, useCallback } from "react";
import { format, startOfYear, endOfYear } from "date-fns";
import { toast } from "sonner";
import { CalendarDays, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { CalendarView } from "@/components/CalendarView/CalendarView";
import { calendarService, OrganizationCalendarEntry } from "@/services/calendar.service";
import { CalendarEvent } from "@/components/CalendarView/types";

export default function CalendarPage() {
  const [entries, setEntries] = useState<OrganizationCalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentYear] = useState(new Date().getFullYear());

  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      const start = format(startOfYear(new Date(currentYear, 0, 1)), "yyyy-MM-dd");
      const end = format(endOfYear(new Date(currentYear, 11, 31)), "yyyy-MM-dd");
      const data = await calendarService.getCalendarRange(start, end);
      setEntries(data);
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
      toast.error("Failed to load organization calendar");
    } finally {
      setLoading(false);
    }
  }, [currentYear]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const handleDayConfigSave = async (config: any) => {
    try {
      const payload: OrganizationCalendarEntry = {
        date: config.date,
        type: config.holidayType === 'None' ? 'Normal' : config.holidayType,
        label: config.label,
        isWorking: config.isWorking,
        startTime: config.startTime,
        endTime: config.endTime,
      };

      await calendarService.upsertDayConfig(payload);
      toast.success("Schedule updated successfully");
      fetchCalendarData();
    } catch (error) {
      console.error("Failed to save day config:", error);
      toast.error("Failed to update schedule");
    }
  };

  const handleBusinessHoursChange = async (hours: { start: string; end: string; effectiveDate: Date }) => {
    // This could be a bulk update or a school setting. 
    // For now, let's keep it simple or notify that it needs further implementation if complex.
    toast.info("Business hours bulk update not implemented yet. Please update individual days.");
  };

  // Map backend entries to CalendarEvents
  const events: CalendarEvent[] = entries.map((entry) => ({
    id: entry._id || String(entry.date),
    title: entry.label || entry.type,
    startDate: format(new Date(entry.date), "yyyy-MM-dd"),
    type: entry.type === 'PublicHoliday' ? 'public-holiday' : 
          entry.type === 'OrganizationalHoliday' ? 'custom-holiday' : 
          entry.type === 'Sunday' ? 'custom-holiday' : 
          entry.type === 'SpecialEvent' ? 'event' : 'working-day',
    metadata: {
      isWorking: entry.isWorking,
      startTime: entry.startTime,
      endTime: entry.endTime,
      holidayType: entry.type
    }
  }));

  return (
    <PageContainer variant="fluid">
      <PageHeader 
        title="Organization Calendar" 
        description="Manage school holidays, special events and working days"
        icon={<CalendarDays className="h-6 w-6" />}
      />
      
      <div className="flex-1 bg-white dark:bg-slate-950 p-6 min-h-0 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 z-50 flex items-center justify-center backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-slate-500">Loading calendar data...</p>
            </div>
          </div>
        )}
        
        <CalendarView 
          events={events}
          initialView="year"
          onDayConfigSave={handleDayConfigSave}
          onBusinessHoursChange={handleBusinessHoursChange}
          entityName="Organization Event"
        />
      </div>
    </PageContainer>
  );
}
