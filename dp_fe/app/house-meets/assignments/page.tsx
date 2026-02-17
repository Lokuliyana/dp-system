"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader, Users, ArrowRight, X, ChevronsRight, Save, RotateCcw, Calendar, Wand2, Briefcase } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { HouseMeetsMenu } from "@/components/house-meets/house-meets-menu";
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  ScrollArea, 
  Badge, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui";
import { useGrades } from "@/hooks/useGrades";
import { useStudentsByGrade } from "@/hooks/useStudents";
import { useAssignHouse, useHouseAssignments, useUnassignHouse, useBulkAssignHouse } from "@/hooks/useHouseAssignments";
import { useHouses } from "@/hooks/useHouses";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AutomaticAssignmentDialog } from "@/components/house-meets/automatic-assignment-dialog";
import { TeacherHouseAssignments } from "@/components/house-meets/teacher-house-assignments";

export default function HouseAssignmentsPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const { data: grades = [] } = useGrades();
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [isAutoDialogOpen, setIsAutoDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("students");
  
  // Local state for pending assignments: studentId -> houseId (or null for unassigned)
  const [localAssignments, setLocalAssignments] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (!selectedGrade && grades.length > 0) {
      setSelectedGrade(grades[0].id);
    }
  }, [grades, selectedGrade]);

  // Clear local assignments when grade or year changes to avoid confusion
  useEffect(() => {
    setLocalAssignments({});
  }, [selectedGrade, selectedYear]);

  const { data: houses = [], isLoading: housesLoading } = useHouses();
  const { data: students = [], isLoading: studentsLoading } = useStudentsByGrade(selectedGrade || "", selectedYear);
  
  const assignmentFilters = useMemo(
    () => ({
      gradeId: selectedGrade || undefined,
      year: selectedYear,
    }),
    [selectedGrade, selectedYear]
  );
  
  const { data: assignments = [], isLoading: assignmentsLoading } = useHouseAssignments(assignmentFilters);
  const bulkAssign = useBulkAssignHouse(assignmentFilters);

  // Map of confirmed assignments from DB
  const dbAssignmentMap = useMemo(() => {
    const map: Record<string, string> = {};
    assignments?.forEach((a) => {
      map[a.studentId] = a.houseId;
    });
    return map;
  }, [assignments]);

  // Merge DB assignments with local changes
  const effectiveAssignmentMap = useMemo(() => {
    return { ...dbAssignmentMap, ...localAssignments };
  }, [dbAssignmentMap, localAssignments]);

  const unassignedStudents = useMemo(() => {
    return students.filter((s) => !effectiveAssignmentMap[s.id]);
  }, [students, effectiveAssignmentMap]);

  const houseStudents = useMemo(() => {
    const map: Record<string, typeof students> = {};
    houses.forEach((h) => (map[h.id] = []));
    
    students.forEach((s) => {
      const houseId = effectiveAssignmentMap[s.id];
      if (houseId && map[houseId]) {
        map[houseId].push(s);
      }
    });
    return map;
  }, [students, effectiveAssignmentMap, houses]);

  const handleAssign = (studentId: string, houseId: string) => {
    setLocalAssignments((prev) => ({
      ...prev,
      [studentId]: houseId,
    }));
  };

  const handleUnassign = (studentId: string) => {
    setLocalAssignments((prev) => ({
      ...prev,
      [studentId]: null,
    }));
  };

  const hasChanges = Object.keys(localAssignments).length > 0;

  const handleSave = () => {
    const changes = Object.entries(localAssignments).map(([studentId, houseId]) => ({
      studentId,
      houseId,
      gradeId: selectedGrade!,
    }));

    bulkAssign.mutate(
      { assignments: changes, year: selectedYear },
      {
        onSuccess: () => {
          setLocalAssignments({});
        },
      }
    );
  };

  const handleReset = () => {
    setLocalAssignments({});
  };

  const isLoading = (!selectedGrade && grades.length === 0) || studentsLoading || housesLoading || assignmentsLoading;

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <HouseMeetsMenu />

      <DynamicPageHeader
        title="House Assignments"
        subtitle="Manage student and staff house assignments."
        icon={Users}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 rounded-md px-2 py-1 border border-slate-200">
              <Calendar className="h-4 w-4 text-slate-500" />
              <Select
                value={selectedYear.toString()}
                onValueChange={(v) => setSelectedYear(parseInt(v))}
              >
                <SelectTrigger className="h-8 w-24 border-none bg-transparent shadow-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoDialogOpen(true)}
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Automatic
            </Button>

            {hasChanges && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-muted-foreground hover:text-slate-700"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button size="sm" onClick={handleSave} disabled={bulkAssign.isPending}>
                  {bulkAssign.isPending ? (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="p-6 h-[calc(100vh-140px)] flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col h-full overflow-hidden">
          <TabsList className="mb-4">
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Staff
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="flex-1 flex flex-col gap-6 overflow-hidden mt-0">
             {/* Grade Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0">
              {grades.map((grade) => (
                <Button
                  key={grade.id}
                  onClick={() => setSelectedGrade(grade.id)}
                  variant={selectedGrade === grade.id ? "default" : "outline"}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  Grade {grade.level}
                </Button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <Loader className="mr-2 h-5 w-5 animate-spin" />
                Loading assignments...
              </div>
            ) : houses.length === 0 ? (
              <div className="text-sm text-muted-foreground">Create houses first to start assignments.</div>
            ) : !selectedGrade ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 border border-dashed border-slate-200 rounded-lg">
                Select a grade to manage assignments
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                {/* Top: House Boxes */}
                <div className="grid grid-cols-4 gap-4 shrink-0 h-64">
                  {houses.map((house) => (
                    <HouseBox
                      key={house.id}
                      house={house}
                      students={houseStudents[house.id] || []}
                      onUnassign={(studentId) => handleUnassign(studentId)}
                    />
                  ))}
                </div>

                {/* Bottom: Unassigned Students */}
                <Card className="flex-1 flex flex-col border-slate-200 shadow-sm overflow-hidden min-h-0">
                  <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 py-3 min-h-[50px] shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                        Unassigned Students
                        <Badge variant="secondary" className="bg-slate-200 text-slate-700 ml-2">
                          {unassignedStudents.length}
                        </Badge>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 overflow-hidden bg-slate-50/30">
                    <ScrollArea className="h-full">
                        {unassignedStudents.length === 0 ? (
                          <div className="col-span-full py-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center h-full">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                              <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <p className="font-medium text-slate-900">All students assigned!</p>
                            <p className="text-slate-500 mt-1">Great job organizing the houses.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col bg-white rounded-md border border-slate-200 shadow-sm divide-y divide-slate-100">
                            {unassignedStudents.map((student) => (
                              <div
                                key={student.id}
                                className="flex items-center justify-between gap-3 p-3 hover:bg-slate-50 transition-all group"
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm text-slate-900 truncate">
                                      {student.nameEn || student.nameWithInitialsSi}
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                      ID: {student.admissionNumber}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                                  {houses.map((house) => (
                                    <button
                                      key={house.id}
                                      onClick={() => handleAssign(student.id, house.id)}
                                      className="h-7 px-3 rounded-md text-[10px] font-bold text-white shadow-sm hover:shadow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center tracking-wide"
                                      style={{ backgroundColor: house.color }}
                                      title={`Assign to ${house.nameEn}`}
                                    >
                                      {house.nameEn.substring(0, 3).toUpperCase()}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="staff" className="flex-1 overflow-hidden mt-0">
             <TeacherHouseAssignments />
          </TabsContent>
        </Tabs>
      </div>

      <AutomaticAssignmentDialog 
        isOpen={isAutoDialogOpen}
        onClose={() => setIsAutoDialogOpen(false)}
        grades={grades}
        houses={houses}
        year={selectedYear}
      />
    </LayoutController>
  );
}

function HouseBox({
  house,
  students,
  onUnassign,
}: {
  house: any;
  students: any[];
  onUnassign: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const defaultCount = 5; 
  
  const displayStudents = isExpanded ? students : students.slice(0, defaultCount);
  const remaining = Math.max(0, students.length - defaultCount);
  const houseCode = house.nameEn.substring(0, 3).toUpperCase();

  return (
    <Card className="flex flex-col h-full border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="px-3 py-2 border-b flex items-center justify-between bg-slate-50/50"
        style={{ borderTop: `4px solid ${house.color}` }}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800 text-sm">{house.nameEn}</h3>
        </div>
        <Badge
          className="text-white font-mono text-xs"
          style={{ backgroundColor: house.color }}
        >
          {students.length}
        </Badge>
      </div>
      
      <CardContent className="p-0 flex-1 overflow-hidden bg-white">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            <AnimatePresence initial={false}>
              {displayStudents.map((student) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group flex items-center justify-between p-1.5 bg-slate-50/50 rounded border border-slate-100 hover:border-red-100 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="text-[10px] font-bold px-1 rounded text-white shrink-0"
                      style={{ backgroundColor: house.color }}
                    >
                      {houseCode}
                    </span>
                    <span className="text-xs font-medium text-slate-700 truncate">
                      {student.nameEn || student.nameWithInitialsSi}
                    </span>
                  </div>
                  <button
                    onClick={() => onUnassign(student.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-0.5 hover:bg-red-50 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {!isExpanded && remaining > 0 && (
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full py-1 text-[10px] text-muted-foreground hover:text-slate-700 hover:bg-slate-100 rounded border border-dashed border-slate-200 transition-colors flex items-center justify-center gap-1"
              >
                Show {remaining} more <ChevronsRight className="h-3 w-3" />
              </button>
            )}
            
            {isExpanded && students.length > defaultCount && (
              <button
                onClick={() => setIsExpanded(false)}
                className="w-full py-1 text-[10px] text-muted-foreground hover:text-slate-700 hover:bg-slate-100 rounded border border-dashed border-slate-200 transition-colors"
              >
                Show less
              </button>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

