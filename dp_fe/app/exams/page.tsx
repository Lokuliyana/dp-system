"use client";

import { useState } from "react";
import { FileText, Plus, Search, Calendar as CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { 
  Button, 
  Card, 
  CardContent, 
  Input,
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Badge,
} from "@/components/ui";
import { useExamsList } from "@/hooks/useExams";
import { useGrades } from "@/hooks/useGrades";
import { CreateExamDialog } from "../../components/exams/create-exam-dialog";
import { ExamsMenu } from "@/components/exams/exams-menu";
import { ExportButton } from "@/components/reusable";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ExamsPage() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [selectedGradeId, setSelectedGradeId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: grades = [] } = useGrades();
  const { data: exams = [], isLoading } = useExamsList({ 
    year, 
    gradeId: selectedGradeId === "all" ? undefined : selectedGradeId 
  });

  const filteredExams = exams.filter((exam: any) => 
    exam.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.nameSi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <ExamsMenu />
      <DynamicPageHeader
        title="Exam Results"
        subtitle="Manage exam papers and record student marks."
        icon={FileText}
        actions={[
          {
            type: "select",
            props: {
              label: "Year",
              value: year.toString(),
              onValueChange: (v) => setYear(parseInt(v)),
              options: [2024, 2025, 2026].map(y => ({ label: y.toString(), value: y.toString() })),
            },
          },
          {
            type: "select",
            props: {
              label: "Grade",
              value: selectedGradeId,
              onValueChange: setSelectedGradeId,
              options: [
                { label: "All Grades", value: "all" },
                ...grades.map(g => ({ label: g.nameEn, value: g.id }))
              ],
            },
          },
          {
            type: "search",
            props: {
              value: searchQuery,
              onChange: setSearchQuery,
              placeholder: "Search papers...",
            },
          },
          {
            type: "custom",
            render: (
              <ExportButton 
                endpoint="/reports/teams" 
                filename="exam_results_overall"
                className="h-9"
              />
            )
          },
          {
            type: "button",
            props: {
              variant: "default",
              icon: Plus,
              children: "Create Paper",
              onClick: () => setIsCreateDialogOpen(true),
            },
          },
        ]}
      />

      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">


        {/* Exams Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 animate-pulse bg-slate-100 rounded-xl" />
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <FileText className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Exams Found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-2">
              Create a new exam paper to start recording student performance.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(true)}
              className="mt-6 border-slate-200 hover:bg-white"
            >
              Create Your First Paper
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam: any) => (
              <Card key={exam.id} className="group border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden bg-white ring-1 ring-slate-100">
                <CardContent className="p-0">
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-tighter font-bold bg-slate-50 border-slate-100 text-slate-500">
                          {exam.type}
                        </Badge>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {exam.nameSi}
                        </h3>
                        <p className="text-sm font-medium text-slate-500">
                          {exam.nameEn}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg text-slate-500">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-slate-500 gap-2">
                        <span className="font-medium text-slate-400">Date:</span>
                        <span className="font-semibold text-slate-700">{format(new Date(exam.date), "PPP")}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {exam.gradeIds.map((g: any) => (
                          <Badge key={g.id} variant="secondary" className="bg-indigo-50 text-indigo-700 border-none font-medium">
                            {g.nameEn}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 border-t flex gap-2">
                    <Button asChild className="w-full bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-100 hover:border-indigo-200 shadow-none font-bold h-10">
                      <Link href={`/exams/mark?examId=${exam.id}`}>
                        Enter Marks
                      </Link>
                    </Button>
                    <Button variant="ghost" className="h-10 text-slate-500 hover:text-slate-900 font-bold px-4">
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateExamDialog 
        isOpen={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)} 
      />
    </LayoutController>
  );
}
