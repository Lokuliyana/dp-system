"use client";

import { useState, useMemo } from "react";
import { CalendarCheck, Search } from "lucide-react";
import { format, isSunday, addDays, nextSunday, setHours, setMinutes, isBefore, isAfter, startOfDay } from "date-fns";
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
import { AlertCircle, Clock } from "lucide-react";

export default function MarkAttendancePage() {
  const { data: grades = [] } = useGrades();
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  
  // Logic to determine the default Sunday
  const getDefaultDate = () => {
    const now = new Date();
    // If it's Sunday
    if (isSunday(now)) {
      const cutOff = setMinutes(setHours(startOfDay(now), 13), 0); // 1:00 PM
      // If past 1:00 PM, default to NEXT Sunday
      if (isAfter(now, cutOff)) {
        return nextSunday(now);
      }
      return now;
    }
    // If not Sunday, default to NEXT Sunday
    return nextSunday(now);
  };

  const [date, setDate] = useState<Date>(getDefaultDate());
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const formattedDate = date ? format(date, "yyyy-MM-dd") : "";

  const { data: students = [], isLoading: isLoadingStudents } = useStudentsByGrade(selectedGradeId);
  const { data: existingAttendance = [], isLoading: isLoadingAttendance } = useAttendanceByDate(formattedDate, selectedGradeId);
  const markAttendanceMutation = useMarkAttendance(formattedDate, selectedGradeId);

  // Time window validation logic
  const markingStatus = useMemo(() => {
    if (!date) return { canMark: false, reason: "Please select a date" };
    
    if (!isSunday(date)) return { canMark: false, reason: "Attendance can only be marked for Sundays" };

    const now = new Date();
    const isToday = format(date, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");

    if (isToday) {
      const startTime = setMinutes(setHours(startOfDay(now), 7), 30); // 7:30 AM
      const endTime = setMinutes(setHours(startOfDay(now), 13), 0); // 1:00 PM

      if (isBefore(now, startTime)) return { canMark: false, reason: "Marking opens at 7:30 AM today" };
      if (isAfter(now, endTime)) return { canMark: false, reason: "Marking closed at 1:00 PM today" };
      
      return { canMark: true, reason: "" };
    }

    // If it's a past Sunday, we assume it's closed (based on "cant change after 1pm on THAT sunday")
    if (isBefore(date, startOfDay(now))) {
      return { canMark: false, reason: "Cannot modify past attendance" };
    }

    // If it's a future Sunday, it's not open yet
    return { canMark: false, reason: "Marking will open on Sunday at 7:30 AM" };
  }, [date]);

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
              disabled: (d) => !isSunday(d),
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
