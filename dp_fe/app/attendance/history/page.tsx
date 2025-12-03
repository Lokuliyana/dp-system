"use client";

import { useState } from "react";
import { History, Search } from "lucide-react";
import { format } from "date-fns";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { AttendanceMenu } from "@/components/attendance/attendance-menu";
import { Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { DatePicker } from "@/components/ui/date-picker";
import { useGrades } from "@/hooks/useGrades";
import { useAttendanceByDate } from "@/hooks/useAttendance";
import { useStudentsByGrade } from "@/hooks/useStudents";

export default function AttendanceHistoryPage() {
  const { data: grades = [] } = useGrades();
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());

  const formattedDate = date ? format(date, "yyyy-MM-dd") : "";

  const { data: attendance = [], isLoading } = useAttendanceByDate(formattedDate, selectedGradeId);
  const { data: students = [] } = useStudentsByGrade(selectedGradeId);

  // Helper to get student name
  const getStudentName = (id: string) => {
    const s = students.find(stu => stu.id === id);
    return s ? `${s.firstNameEn} ${s.lastNameEn}` : "Unknown Student";
  };

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <AttendanceMenu />

      <DynamicPageHeader
        title="Attendance History"
        subtitle="View past attendance records."
        icon={History}
      />

      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filter Records</CardTitle>
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
              <CardTitle className="text-base">Records for {formattedDate}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : attendance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No attendance records found for this date.</div>
              ) : (
                <div className="space-y-2">
                  {attendance.map(record => (
                    <div key={record.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{getStudentName(record.studentId)}</p>
                        <p className="text-xs text-muted-foreground">Recorded by: {record.recordedById}</p>
                      </div>
                      <div className="capitalize px-3 py-1 rounded-full text-xs font-medium bg-slate-100">
                        {record.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </LayoutController>
  );
}
