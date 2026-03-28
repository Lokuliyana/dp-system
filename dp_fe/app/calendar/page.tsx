"use client";

import { useEffect, useState, useCallback } from "react";
import { format, startOfYear, endOfYear } from "date-fns";
import { toast } from "sonner";
import { CalendarDays, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { CalendarView } from "@/components/CalendarView/CalendarView";
import { calendarService, OrganizationCalendarEntry } from "@/services/calendar.service";
import { eventsService } from "@/services/masterdata/events.service";
import { competitionsService } from "@/services/masterdata/competitions.service";
import { CalendarEvent } from "@/components/CalendarView/types";
import { usePermission } from "@/hooks/usePermission";
import { PermissionGuard } from "@/components/auth/permission-guard";

export default function CalendarPage() {
  const { can } = usePermission();
  const [entries, setEntries] = useState<any[]>([]);
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
      if (config.holidayType === 'SpecialEvent') {
        const payload = {
          nameEn: config.label,
          nameSi: config.label,
          descriptionEn: config.descriptionEn,
          date: format(config.date, "yyyy-MM-dd"),
          startTime: config.startTime,
          endTime: config.endTime,
          eventType: 'other',
          year: currentYear,
          teacherInChargeId: config.teacherInChargeId || undefined,
        };
        await eventsService.create(payload as any);
        toast.success("School event created successfully");
      } else if (config.holidayType === 'Competition') {
        const dateStr = format(config.date, "yyyy-MM-dd");
        const newIds = config.competitionIds || [];
        
        // Find existing competitions for this day from current entries
        const oldIds = entries
          .filter(e => format(new Date(e.date), "yyyy-MM-dd") === dateStr && (e.source === 'competition' || e.type === 'Competition'))
          .map(e => e.metadata?.competitionId)
          .filter(Boolean);

        const toRemove = oldIds.filter(id => !newIds.includes(id));
        const toUpdate = newIds; // All selected should have this date

        await Promise.all([
          ...toUpdate.map((id: string) => competitionsService.update(id, { 
            date: dateStr,
            startTime: config.startTime,
            endTime: config.endTime
          })),
          ...toRemove.map((id: string) => competitionsService.update(id, { date: null as any }))
        ]);
        
        toast.success("Competition schedule updated");
      } else {
        const payload: OrganizationCalendarEntry = {
          date: config.date,
          type: config.holidayType === 'None' ? 'Normal' : config.holidayType,
          label: config.label,
          startTime: config.startTime,
          endTime: config.endTime,
        };
        await calendarService.upsertDayConfig(payload);
        toast.success("Schedule updated successfully");
      }
      fetchCalendarData();
    } catch (error) {
      console.error("Failed to save calendar entry:", error);
      toast.error("Failed to update calendar");
    }
  };

  // Map backend entries (unified) to CalendarEvents
  const events: CalendarEvent[] = entries.map((entry) => ({
    id: entry.id || entry._id || String(entry.date),
    title: entry.label || entry.type,
    startDate: format(new Date(entry.date), "yyyy-MM-dd"),
    type: entry.type === 'PublicHoliday' ? 'public-holiday' : 
          entry.type === 'OrganizationalHoliday' ? 'custom-holiday' : 
          entry.type === 'Sunday' ? 'custom-holiday' : 
          entry.type === 'SpecialDay' ? 'special-day' : 
          entry.type === 'Competition' || entry.source === 'competition' ? 'competition-event' :
          entry.type === 'SpecialEvent' ? 'school-event' : 'working-day',
    metadata: {
      ...entry.metadata,
      startTime: entry.metadata?.startTime || (entry as any).startTime,
      endTime: entry.metadata?.endTime || (entry as any).endTime,
    }
  }));

  return (
    <PermissionGuard permission="activities.event.read">
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
          onDayConfigSave={can("activities.event.update") ? handleDayConfigSave : undefined}
          entityName="Organization Event"
        />
      </div>
      </PageContainer>
    </PermissionGuard>
  );
}
