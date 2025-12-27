"use client";

import { useState, useMemo } from "react";
import { CalendarCheck, Search } from "lucide-react";
import { format } from "date-fns";
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
} from "@/components/ui";
import { DatePicker } from "@/components/ui/date-picker";
import { useGrades } from "@/hooks/useGrades";
import { useStudentsByGrade } from "@/hooks/useStudents";
import { useMarkAttendance, useAttendanceByDate } from "@/hooks/useAttendance";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function MarkAttendancePage() {
  const { data: grades = [] } = useGrades();
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const formattedDate = date ? format(date, "yyyy-MM-dd") : "";

  const { data: students = [], isLoading: isLoadingStudents } = useStudentsByGrade(selectedGradeId);
  const { data: existingAttendance = [], isLoading: isLoadingAttendance } = useAttendanceByDate(formattedDate, selectedGradeId);
  const markAttendanceMutation = useMarkAttendance(formattedDate, selectedGradeId);

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
      />

      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Controls Section */}
        <Card className="border-none shadow-sm bg-slate-50/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="w-full md:w-64">
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Grade</label>
                <Select value={selectedGradeId} onValueChange={setSelectedGradeId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map(g => (
                      <SelectItem key={g.id} value={g.id}>{g.nameEn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-64">
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Date</label>
                <DatePicker date={date} setDate={(d) => d && setDate(d)} />
              </div>
              {selectedGradeId && (
                <div className="w-full md:w-auto md:ml-auto">
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search student..." 
                      className="pl-8 bg-white w-full md:w-64" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
                          {student.nameWithInitialsSi || student.fullNameEn}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {student.admissionNumber}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={status === "present" ? "default" : "outline"}
                          className={cn(
                            "w-24 h-10 font-medium transition-all",
                            status === "present" 
                              ? "bg-green-600 hover:bg-green-700 text-white shadow-sm" 
                              : "hover:bg-green-50 hover:text-green-700 hover:border-green-200 text-slate-600"
                          )}
                          onClick={() => handleMark(student.id, "present")}
                        >
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant={status === "absent" ? "default" : "outline"}
                          className={cn(
                            "w-24 h-10 font-medium transition-all",
                            status === "absent" 
                              ? "bg-red-600 hover:bg-red-700 text-white shadow-sm" 
                              : "hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-600"
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
