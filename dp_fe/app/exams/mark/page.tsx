"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Search, Save, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
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
  Badge,
} from "@/components/ui";
import { useGrades } from "@/hooks/useGrades";
import { useStudentsByGrade } from "@/hooks/useStudents";
import { useExamsList, useExamMarks, useUpdateExamMarks } from "@/hooks/useExams";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ExamsMenu } from "@/components/exams/exams-menu";
import Link from "next/link";

export default function MarkExamPage() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId") || "";
  
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: exams = [] } = useExamsList();
  const selectedExam = exams.find((e: any) => (e.id || e._id) === examId);
  const { data: grades = [] } = useGrades();

  // Filter grades to only those associated with this exam
  const examGrades = useMemo(() => {
    if (!selectedExam) return [];
    const ids = selectedExam.gradeIds.map((g: any) => (typeof g === 'string' ? g : (g.id || g._id)));
    return grades.filter(g => ids.includes(g.id));
  }, [selectedExam, grades]);

  // Set default grade if only one exists
  useEffect(() => {
    if (examGrades.length === 1 && !selectedGradeId) {
      setSelectedGradeId(examGrades[0].id);
    }
  }, [examGrades, selectedGradeId]);

  const { data: studentMarks = [], isLoading: isLoadingMarks } = useExamMarks(examId, selectedGradeId);
  const updateMarksMutation = useUpdateExamMarks(examId, selectedGradeId);

  // Local state for buffered marks entry
  const [localMarks, setLocalMarks] = useState<Record<string, { mark: string; comment: string; isPresent: boolean }>>({});

  // Sync local marks with remote data when selectedGradeId or studentMarks change
  useEffect(() => {
    if (studentMarks.length > 0) {
      const initial: Record<string, any> = {};
      studentMarks.forEach((m: any) => {
      const studentId = m.student.id || m.student._id;
      initial[studentId] = {
        mark: m.mark.toString(),
        isPresent: m.isPresent !== false,
        comment: m.comment || "",
      };
      });
      setLocalMarks(initial);
    }
  }, [studentMarks, selectedGradeId]);

  const filteredStudents = useMemo(() => {
    if (!studentMarks) return [];
    if (!searchQuery) return studentMarks;
    const lowerQuery = searchQuery.toLowerCase();
    return studentMarks.filter((m: any) => 
      m.student.firstNameEn?.toLowerCase().includes(lowerQuery) || 
      m.student.lastNameEn?.toLowerCase().includes(lowerQuery) ||
      m.student.admissionNumber.toLowerCase().includes(lowerQuery)
    );
  }, [studentMarks, searchQuery]);

  const handleMarkChange = (studentId: string, mark: string) => {
    setLocalMarks(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], mark }
    }));
  };

  const handlePresenceToggle = (studentId: string) => {
    setLocalMarks(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], isPresent: !prev[studentId]?.isPresent }
    }));
  };

  const handleSave = () => {
    if (!selectedGradeId) return;

    const marksToUpdate = Object.entries(localMarks).map(([studentId, data]) => ({
      studentId,
      gradeId: selectedGradeId,
      mark: data.isPresent ? parseFloat(data.mark) || 0 : 0,
      isPresent: data.isPresent,
      comment: data.comment,
    }));

    updateMarksMutation.mutate({ marks: marksToUpdate }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Exam marks saved successfully." });
      },
      onError: (err) => {
        toast({ title: "Error", description: String(err), variant: "destructive" });
      }
    });
  };

  if (!selectedExam && !isLoadingMarks) {
    return (
      <LayoutController showMainMenu showHorizontalToolbar>
        <div className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Exam Not Found</h2>
          <Button asChild className="mt-4">
            <Link href="/exams">Back to Exams</Link>
          </Button>
        </div>
      </LayoutController>
    );
  }

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <ExamsMenu />
      <DynamicPageHeader
        title={selectedExam ? `${selectedExam.nameSi} / ${selectedExam.nameEn}` : "Enter Marks"}
        subtitle={`Recording results for ${selectedExam?.nameEn}`}
        icon={FileText}
        actions={[
          {
            type: "select",
            props: {
              label: "Grade",
              value: selectedGradeId,
              onValueChange: setSelectedGradeId,
              options: examGrades.map(g => ({ label: g.nameEn, value: g.id })),
              placeholder: "Select Grade",
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
          {
            type: "button",
            props: {
              variant: "default",
              icon: Save,
              children: "Save All Marks",
              onClick: handleSave,
              disabled: updateMarksMutation.isPending,
            },
          },
        ]}
      />



      <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="text-slate-500">
            <Link href="/exams">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>



        {selectedGradeId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                Student List <span className="text-muted-foreground text-sm font-normal">({filteredStudents.length})</span>
              </h2>
              <Button 
                onClick={handleSave} 
                disabled={updateMarksMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100 font-bold"
              >
                {updateMarksMutation.isPending ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Marks</>}
              </Button>
            </div>

            {isLoadingMarks ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 animate-pulse bg-slate-100 rounded-lg" />
                ))}
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-muted-foreground">No students found for this grade.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Student</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-600 w-24">Presence</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-600 w-32">Mark</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredStudents.map((entry: any) => {
                      const studentId = entry.student.id || entry.student._id;
                      const localData = localMarks[studentId] || { mark: "", isPresent: true };
                      const isMarked = entry.markId !== null;

                      return (
                        <tr key={studentId} className={cn(
                          "hover:bg-slate-50/50 transition-colors",
                          !localData.isPresent && "bg-red-50/30"
                        )}>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{entry.student.nameWithInitialsSi || `${entry.student.firstNameEn} ${entry.student.lastNameEn}`}</span>
                              <span className="text-xs text-muted-foreground font-medium">{entry.student.admissionNumber}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              variant={localData.isPresent ? "outline" : "destructive"}
                              size="sm"
                              className={cn(
                                "h-8 px-3 font-bold text-[10px] uppercase tracking-wider",
                                localData.isPresent && "border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                              )}
                              onClick={() => handlePresenceToggle(studentId)}
                            >
                              {localData.isPresent ? "Present" : "Absent"}
                            </Button>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Input
                              type="number"
                              disabled={!localData.isPresent}
                              className={cn(
                                "h-9 w-24 mx-auto text-center font-bold bg-slate-50 border-none focus-visible:ring-indigo-500",
                                !localData.isPresent && "opacity-50"
                              )}
                              value={localData.mark}
                              onChange={(e) => handleMarkChange(studentId, e.target.value)}
                              placeholder="0-100"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isMarked ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border-none pointer-events-none">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Recorded
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-slate-400 border-slate-200 pointer-events-none">
                                Pending
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSave} 
                disabled={updateMarksMutation.isPending || !selectedGradeId}
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 font-bold px-8"
              >
                {updateMarksMutation.isPending ? "Saving..." : "Save All Marks"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </LayoutController>
  );
}
