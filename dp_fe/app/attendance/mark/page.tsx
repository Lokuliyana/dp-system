"use client";

import { useState, useMemo } from "react";
import { CalendarCheck, Search } from "lucide-react";
import { format, isSunday, addDays, nextSunday, setHours, setMinutes, isBefore, isAfter, startOfDay, startOfMonth, endOfMonth } from "date-fns";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { AttendanceMenu } from "@/components/attendance/attendance-menu";
import { 
  Button, 
  Card, 
  CardContent, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Input,
  Alert,
  AlertDescription,
} from "@/components/ui";
import { DatePicker } from "@/components/ui/date-picker";
import { useGrades } from "@/hooks/useGrades";
import { useStudentsByGrade } from "@/hooks/useStudents";
import { useMarkAttendance, useAttendanceByDate } from "@/hooks/useAttendance";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { usePermission } from "@/hooks/usePermission";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { AlertCircle, Clock } from "lucide-react";

import { useSchoolConfig } from "@/hooks/useSchoolConfig";
import { calendarService, type OrganizationCalendarEntry } from "@/services/calendar.service";
import { useEffect, useCallback } from "react";
import { getDay, parseISO } from "date-fns";

export default function MarkAttendancePage() {
  const { can } = usePermission();
  const { data: grades = [] } = useGrades();
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const { config, isLoading: isLoadingConfig } = useSchoolConfig();
  const [calendarEntries, setCalendarEntries] = useState<OrganizationCalendarEntry[]>([]);
  
  // Logic to determine the default allowed day
  const getDefaultDate = useCallback((configData: any) => {
    const now = new Date();
    const allowedDay = configData?.allowedDayOfWeek ?? 0; // Default to Sunday
    
    // Check if today matches the allowed day
    if (getDay(now) === allowedDay) {
      const [h, m] = (configData?.endTime || "13:00").split(":").map(Number);
      const cutOff = setMinutes(setHours(startOfDay(now), h), m);
      if (isAfter(now, cutOff)) {
        // Find next allowed day
        return addDays(now, (allowedDay + 7 - getDay(now)) % 7 || 7);
      }
      return now;
    }
    // Default to next allowed day
    return addDays(now, (allowedDay + 7 - getDay(now)) % 7 || 7);
  }, []);

  const [date, setDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Update initial date when config loads
  useEffect(() => {
    if (config) {
      setDate(getDefaultDate(config));
    }
  }, [config, getDefaultDate]);

  // Fetch calendar entries for the current month
  useEffect(() => {
    const start = format(startOfMonth(date), "yyyy-MM-dd");
    const end = format(endOfMonth(date), "yyyy-MM-dd");
    calendarService.getCalendarRange(start, end).then(setCalendarEntries);
  }, [date]);

  const formattedDate = date ? format(date, "yyyy-MM-dd") : "";

  const { data: students = [], isLoading: isLoadingStudents } = useStudentsByGrade(selectedGradeId);
  const { data: existingAttendance = [], isLoading: isLoadingAttendance } = useAttendanceByDate(formattedDate, selectedGradeId);
  const markAttendanceMutation = useMarkAttendance(formattedDate, selectedGradeId);

  // Time window validation logic
  const markingStatus = useMemo(() => {
    if (!date) return { canMark: false, reason: "Please select a date" };
    if (isLoadingConfig) return { canMark: false, reason: "Loading configuration..." };
    
    const allowedDay = config?.allowedDayOfWeek ?? 0;
    const isRegularDay = getDay(date) === allowedDay;
    
    const calendarEntry = calendarEntries.find(e => 
      format(new Date(e.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );

    const isSpecialDay = calendarEntry && ["Sunday", "SpecialDay", "SpecialEvent"].includes(calendarEntry.type);
    
    if (!isRegularDay && !isSpecialDay) {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return { canMark: false, reason: `Attendance can only be marked for ${dayNames[allowedDay]}s or special calendar days` };
    }

    const now = new Date();
    const isToday = format(date, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");

    if (isToday) {
      const startTimeStr = calendarEntry?.startTime || config?.startTime || "07:30";
      const endTimeStr = calendarEntry?.endTime || config?.endTime || "13:00";
      
      const [startH, startM] = startTimeStr.split(":").map(Number);
      const [endH, endM] = endTimeStr.split(":").map(Number);

      const startTime = setMinutes(setHours(startOfDay(now), startH), startM);
      const endTime = setMinutes(setHours(startOfDay(now), endH), endM);

      if (!can("student.attendance.create")) return { canMark: false, reason: "You do not have permission to mark attendance" };
      
      if (isBefore(now, startTime)) return { canMark: false, reason: `Marking opens at ${startTimeStr} today` };
      if (isAfter(now, endTime)) return { canMark: false, reason: `Marking closed at ${endTimeStr} today` };
      
      return { canMark: true, reason: "" };
    }

    if (isBefore(date, startOfDay(now))) {
      return { canMark: false, reason: "Cannot modify past attendance" };
    }

    return { canMark: false, reason: "Marking window not open yet" };
  }, [date, config, calendarEntries, isLoadingConfig, can]);

  // Local state to track attendance changes before saving
  const [attendanceState, setAttendanceState] = useState<Record<string, "present" | "absent" | "late">>({});

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const lowerQuery = searchQuery.toLowerCase();
    return students.filter(s => 
      s.firstNameEn?.toLowerCase().includes(lowerQuery) || 
      s.lastNameEn?.toLowerCase().includes(lowerQuery) ||
      s.admissionNumber.toLowerCase().includes(lowerQuery) ||
      s.nameWithInitialsSi?.toLowerCase().includes(lowerQuery)
    );
  }, [students, searchQuery]);

  const handleMark = (studentId: string, status: "present" | "absent" | "late") => {
    // Optimistic update in local state
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
    
    const existingRecord = existingAttendance.find(a => a.studentId === studentId);
    
    if (existingRecord) {
      // Logic for updating existing record would go here
      console.log("Update not fully implemented in this view yet");
    } else {
      markAttendanceMutation.mutate({
        date: formattedDate,
        studentId,
        gradeId: selectedGradeId,
        status
      }, {
        onError: (err) => {
          toast({ title: "Failed to mark attendance", description: String(err), variant: "destructive" });
          // Revert optimistic update
          setAttendanceState(prev => {
            const newState = { ...prev };
            delete newState[studentId];
            return newState;
          });
        }
      });
    }
  };

  const getStatus = (studentId: string) => {
    const local = attendanceState[studentId];
    if (local) return local;
    const remote = existingAttendance.find(a => a.studentId === studentId);
    return remote?.status;
  };

  return (
    <PermissionGuard permission="student.attendance.read">
      <LayoutController showMainMenu showHorizontalToolbar>
        <AttendanceMenu />

      <DynamicPageHeader
        title="Mark Attendance"
        subtitle="Record daily attendance for students."
        icon={CalendarCheck}
        actions={[
          {
            type: "select",
            props: {
              label: "Grade",
              value: selectedGradeId,
              onValueChange: setSelectedGradeId,
              options: grades.map((g) => ({ label: g.nameEn, value: g.id })),
              placeholder: "Select Grade",
            },
          },
          {
            type: "date",
            props: {
              label: "Date",
              date: date,
              setDate: (d) => d && setDate(d),
              disabled: (d) => {
                const allowedDay = config?.allowedDayOfWeek ?? 0;
                const isRegularDay = getDay(d) === allowedDay;
                const isSpecialDay = calendarEntries.some(e => 
                  format(new Date(e.date), "yyyy-MM-dd") === format(d, "yyyy-MM-dd") &&
                  ["Sunday", "SpecialDay", "SpecialEvent"].includes(e.type)
                );
                return !isRegularDay && !isSpecialDay;
              },
            },
          },
          {
            type: "search",
            props: {
              value: searchQuery,
              onChange: setSearchQuery,
              placeholder: "Search students...",
            },
          },
        ]}
      />


      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">


        {selectedGradeId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                Students <span className="text-muted-foreground text-sm font-normal">({filteredStudents.length})</span>
              </h2>
            </div>

            {isLoadingStudents || isLoadingAttendance ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 animate-pulse bg-slate-100 rounded-md" />
                ))}
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
                <UsersIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-muted-foreground">No students found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredStudents.map(student => {
                  const status = getStatus(student.id);
                  const isMarked = !!status;

                  return (
                    <div 
                      key={student.id} 
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border bg-white transition-colors",
                        status === "present" && "border-green-200 bg-green-50/50",
                        status === "absent" && "border-red-200 bg-red-50/50"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 text-base">
                          {student.nameWithInitialsSi}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {student.admissionNumber}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={status === "present" ? "default" : "outline"}
                          disabled={!markingStatus.canMark || markAttendanceMutation.isPending}
                          className={cn(
                            "w-24 h-10 font-medium transition-all",
                            status === "present" 
                              ? "bg-green-600 hover:bg-green-700 text-white shadow-sm" 
                              : "hover:bg-green-50 hover:text-green-700 hover:border-green-200 text-slate-600",
                            !markingStatus.canMark && "opacity-50 cursor-not-allowed"
                          )}
                          onClick={() => handleMark(student.id, "present")}
                        >
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant={status === "absent" ? "default" : "outline"}
                          disabled={!markingStatus.canMark || markAttendanceMutation.isPending}
                          className={cn(
                            "w-24 h-10 font-medium transition-all",
                            status === "absent" 
                              ? "bg-red-600 hover:bg-red-700 text-white shadow-sm" 
                              : "hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-600",
                            !markingStatus.canMark && "opacity-50 cursor-not-allowed"
                          )}
                          onClick={() => handleMark(student.id, "absent")}
                        >
                          Absent
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      </LayoutController>
    </PermissionGuard>
  );
}

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
