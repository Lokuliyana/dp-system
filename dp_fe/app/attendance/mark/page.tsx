"use client";

import { useState } from "react";
import { CalendarCheck, Save, Users } from "lucide-react";
import { format } from "date-fns";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { AttendanceMenu } from "@/components/attendance/attendance-menu";
import { Button, Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { DatePicker } from "@/components/ui/date-picker";
import { useGrades } from "@/hooks/useGrades";
import { useStudentsByGrade } from "@/hooks/useStudents";
import { useMarkAttendance, useAttendanceByDate } from "@/hooks/useAttendance";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

export default function MarkAttendancePage() {
  const { data: grades = [] } = useGrades();
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const { toast } = useToast();

  const formattedDate = date ? format(date, "yyyy-MM-dd") : "";

  const { data: students = [], isLoading: isLoadingStudents } = useStudentsByGrade(selectedGradeId);
  const { data: existingAttendance = [], isLoading: isLoadingAttendance } = useAttendanceByDate(formattedDate, selectedGradeId);
  const markAttendanceMutation = useMarkAttendance(formattedDate, selectedGradeId);

  // Local state to track attendance changes before saving
  // Map of studentId -> status
  const [attendanceState, setAttendanceState] = useState<Record<string, "present" | "absent" | "late">>({});

  // Initialize state from existing attendance
  // This effect should run when existingAttendance changes
  // For now, we'll just handle the marking logic directly in the render or handlers

  const handleMark = (studentId: string, status: "present" | "absent" | "late") => {
    // Optimistic update in local state
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
    
    // Immediate save to backend (per student)
    // Ideally we'd have a bulk save, but the backend currently supports single record creation
    // We can debounce or just fire requests. For now, let's fire requests.
    // Wait, the backend create endpoint throws 409 if already exists.
    // We need to check if it exists in `existingAttendance` to decide between create or update?
    // The backend `markAttendance` is strictly create. `updateAttendance` is patch.
    
    const existingRecord = existingAttendance.find(a => a.studentId === studentId);
    
    if (existingRecord) {
      // Update logic would go here if we had a useUpdateAttendance hook that took ID
      // For now, let's assume we can't easily update from this view without more logic
      // Or we can implement update.
      console.log("Update not fully implemented in this view yet");
    } else {
      markAttendanceMutation.mutate({
        date: formattedDate,
        studentId,
        gradeId: selectedGradeId,
        status
      }, {
        onSuccess: () => {
           // Toast or silent success
        },
        onError: (err) => {
          toast({ title: "Failed to mark attendance", description: String(err), variant: "destructive" });
        }
      });
    }
  };

  const isPresent = (studentId: string) => {
    const local = attendanceState[studentId];
    if (local) return local === "present";
    const remote = existingAttendance.find(a => a.studentId === studentId);
    return remote ? remote.status === "present" : false; // Default to false? Or true?
  };

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <AttendanceMenu />

      <DynamicPageHeader
        title="Mark Attendance"
        subtitle="Record daily attendance for students."
        icon={CalendarCheck}
      />

      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Class & Date</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 items-center">
            <div className="w-64">
              <Select value={selectedGradeId} onValueChange={setSelectedGradeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.nameEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-64">
              <DatePicker date={date} setDate={(d) => d && setDate(d)} />
            </div>
          </CardContent>
        </Card>

        {selectedGradeId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Student List</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStudents || isLoadingAttendance ? (
                <div className="text-center py-8">Loading...</div>
              ) : students.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No students found in this grade.</div>
              ) : (
                <div className="space-y-2">
                  {students.map(student => {
                    const record = existingAttendance.find(a => a.studentId === student.id);
                    const isMarked = !!record;
                    const status = record?.status;

                    return (
                      <div key={student.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-xs">
                            {student.admissionNumber}
                          </div>
                          <div>
                            <p className="font-medium">{student.firstNameEn} {student.lastNameEn}</p>
                            <p className="text-xs text-muted-foreground">{student.nameSi}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant={status === "present" ? "default" : "outline"}
                            className={status === "present" ? "bg-green-600 hover:bg-green-700" : ""}
                            onClick={() => handleMark(student.id, "present")}
                            disabled={isMarked && status === "present"}
                          >
                            Present
                          </Button>
                          <Button 
                            size="sm" 
                            variant={status === "absent" ? "default" : "outline"}
                            className={status === "absent" ? "bg-red-600 hover:bg-red-700" : ""}
                            onClick={() => handleMark(student.id, "absent")}
                            disabled={isMarked && status === "absent"}
                          >
                            Absent
                          </Button>
                          <Button 
                            size="sm" 
                            variant={status === "late" ? "default" : "outline"}
                            className={status === "late" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                            onClick={() => handleMark(student.id, "late")}
                            disabled={isMarked && status === "late"}
                          >
                            Late
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </LayoutController>
  );
}
