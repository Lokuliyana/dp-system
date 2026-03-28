"use client";

import { useMemo, useState, useEffect } from "react";
import { 
  Trophy, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  ListChecks,
  Plus,
  Search,
  Check,
  RotateCcw,
  Loader,
  UserPlus,
  Save
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button, 
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui";
import {
  useTeamSelection,
  useSaveTeamSelection,
  useTeamSelectionSuggestions,
  useCompetitions,
  useCompetitionRegistrations,
  useCompetitionResults
} from "@/hooks/useCompetitions";
import { useGrades } from "@/hooks/useGrades";
import { useSections } from "@/hooks/useSections";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { DynamicPageHeader } from "@/components/layout/dynamic";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { usePermission } from "@/hooks/usePermission";

export function ChampionsUnifiedView({ level }: { level: "zonal" | "district" | "allisland" }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [localEntries, setLocalEntries] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  const { toast } = useToast();
  const { can } = usePermission();

  // 1. Fetch Data
  const { data: competitions = [], isLoading: compsLoading } = useCompetitions(year);
  const { data: grades = [], isLoading: gradesLoading } = useGrades();
  const { data: sections = [], isLoading: sectionsLoading } = useSections();
  const { data: selection, isLoading: selectionLoading } = useTeamSelection(level, year);
  const { data: suggestions = [], isLoading: suggestionsLoading } = useTeamSelectionSuggestions(year, level);
  
  const saveSelection = useSaveTeamSelection(level, year);

  // Sync local entries with server data or suggestions for higher levels
  useEffect(() => {
    if (selection && selection.entries && selection.entries.length > 0) {
      setLocalEntries(selection.entries || []);
      setHasChanges(false);
    } else if (!selectionLoading && !suggestionsLoading) {
      // If higher level and no official selection yet, auto-populate from previous level 1st places
      if (level !== 'zonal' && suggestions.length > 0) {
        const autoSelections = suggestions
          .map((s: any) => ({
            competitionId: s.competitionId,
            gradeId: s.gradeId,
            studentId: s.studentId,
            place: undefined
          }));
        setLocalEntries(autoSelections);
        setHasChanges(autoSelections.length > 0);
      } else {
        setLocalEntries([]);
        setHasChanges(false);
      }
    }
  }, [selection, selectionLoading, suggestions, suggestionsLoading, year, level]);

  // Helper for ID comparison
  const getSid = (s: any) => {
    if (!s) return null;
    return typeof s === 'object' ? (s._id || s.id) : String(s);
  };

  // 2. Flatten Competitions and Grades
  const unifiedRows = useMemo(() => {
    if (compsLoading || gradesLoading || sectionsLoading) return [];

    const mainComps = competitions.filter(c => c.isMainCompetition);
    const rows: any[] = [];

    mainComps.forEach(comp => {
      let compGradeIds: string[] = [];
      if (comp.scope === 'grade') {
        compGradeIds = comp.gradeIds || [];
      } else if (comp.scope === 'section') {
        (comp.sectionIds || []).forEach((sid: string) => {
          const section = sections.find(s => s.id === sid || (s as any)._id === sid);
          if (section) compGradeIds.push(...(section.assignedGradeIds || []));
        });
      } else if (comp.scope === 'open') {
        compGradeIds = grades.map(g => g.id || (g as any)._id);
      }

      [...new Set(compGradeIds)].forEach(gid => {
        const grade = grades.find(g => (g.id || (g as any)._id) === gid);
        if (grade) {
          const entry = localEntries.find(
            (e: any) => String(e.competitionId) === String(comp.id || (comp as any)._id) && String(e.gradeId) === String(gid)
          );
          
          const suggestion = suggestions.find(
            (s: any) => String(s.competitionId) === String(comp.id || (comp as any)._id) && 
                       String(s.gradeId) === String(gid) && 
                       (level === 'zonal' ? s.place === 1 : true)
          );

          // FOR DISTRICT/ALL ISLAND: Only include rows that have a winner advancing from the previous level
          // (or an existing official selection already saved)
          if (level === 'zonal' || suggestion || entry) {
            rows.push({
              id: `${comp.id || (comp as any)._id}-${gid}`,
              competitionId: comp.id || (comp as any)._id,
              competitionName: comp.nameEn,
              gradeId: gid,
              gradeName: grade.nameEn,
              selectedStudent: entry?.studentId,
              suggestion: suggestion?.studentId,
              place: entry?.place
            });
          }
        }
      });
    });

    return rows.sort((a, b) => a.competitionName.localeCompare(b.competitionName) || a.gradeName.localeCompare(b.gradeName));
  }, [competitions, grades, sections, localEntries, suggestions, compsLoading, gradesLoading, sectionsLoading, level]);

  // 3. Conflict Detection
  const conflicts = useMemo(() => {
    const counts: Record<string, number> = {};
    localEntries.forEach(e => {
      if (e.studentId) {
        const sid = getSid(e.studentId);
        if (sid) counts[sid] = (counts[sid] || 0) + 1;
      }
    });

    const conflictSet = new Set<string>();
    Object.entries(counts).forEach(([sid, count]) => {
      if (count > 1) conflictSet.add(sid);
    });
    return conflictSet;
  }, [localEntries]);

  // 4. Handlers
  const handleLocalUpdate = (competitionId: string, gradeId: string, student: any | null, place?: number) => {
    setLocalEntries(prev => {
      const filtered = prev.filter(e => 
        !(String(e.competitionId) === String(competitionId) && String(e.gradeId) === String(gradeId))
      );
      if (!student) return filtered;
      // We store the full student object locally so names show up immediately
      return [...filtered, { competitionId, gradeId, studentId: student, place }];
    });
    setHasChanges(true);
  };

  const handleApplySuggestions = () => {
    const newEntries = [...localEntries];
    const assignedIds = new Set(newEntries.map(e => getSid(e.studentId)));
    let addedCount = 0;

    unifiedRows.forEach(row => {
      // If row is currently empty and has a 1st place suggestion
      if (!getSid(row.selectedStudent) && row.suggestion) {
        const sid = getSid(row.suggestion);
        // Only assign if this student isn't already assigned elsewhere in our local state
        if (sid && !assignedIds.has(sid)) {
          newEntries.push({
            competitionId: row.competitionId,
            gradeId: row.gradeId,
            studentId: row.suggestion,
            place: undefined
          });
          assignedIds.add(sid);
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      setLocalEntries(newEntries);
      setHasChanges(true);
      toast({ title: "Suggestions applied", description: `Added ${addedCount} selections without conflicts.` });
    } else {
      toast({ title: "No new suggestions", description: "All previous level winners are already assigned or in conflict." });
    }
  };

  const handleOfficialSave = () => {
    if (conflicts.size > 0) {
      toast({ 
        title: "Cannot Save", 
        description: "Please resolve student conflicts (highlighted in red) before saving.",
        variant: "destructive"
      });
      return;
    }

    const normalizedEntries = localEntries.map(e => ({
      competitionId: getSid(e.competitionId),
      gradeId: getSid(e.gradeId),
      studentId: getSid(e.studentId),
      place: e.place
    }));

    saveSelection.mutate(
      { level, year, entries: normalizedEntries },
      {
        onSuccess: () => {
          toast({ title: "Success", description: `Official ${level.charAt(0).toUpperCase() + level.slice(1)} selection saved successfully.` });
          setHasChanges(false);
        },
        onError: (err) => {
          toast({ title: "Save Failed", description: String(err), variant: "destructive" });
        },
      }
    );
  };

  const isConflict = (student: any) => {
    const sid = getSid(student);
    return sid ? conflicts.has(sid) : false;
  };

  const renderStudentName = (student: any) => {
    if (!student) return "—";
    if (typeof student === "string") return student;
    return (student.nameWithInitialsSi || student.nameSi || student.fullNameEn) 
      ? `${student.nameWithInitialsSi || student.nameSi || student.fullNameEn} (${student.admissionNumber})`
      : `${student.firstNameEn} ${student.lastNameEn} (${student.admissionNumber})`;
  };

  const levelInfo = {
    zonal: { label: "Zonal", suggestion: "House 1st Place", result: "Zonal Result" },
    district: { label: "District", suggestion: "Zonal 1st Place", result: "District Result" },
    allisland: { label: "All Island", suggestion: "District 1st Place", result: "National Result" }
  };

  const info = levelInfo[level];
  const loading = compsLoading || gradesLoading || sectionsLoading || selectionLoading || suggestionsLoading;

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <DynamicPageHeader
        title={`${info.label} Team Selection`}
        subtitle={`Finalize category-wise student selections for the ${info.label} level.`}
        icon={Trophy}
        actions={
          <div className="flex gap-2">
            <PermissionGuard permission="housemeets.team_selection.update">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleApplySuggestions}
                disabled={loading || saveSelection.isPending}
                className="bg-white border-blue-100 text-blue-700 hover:bg-blue-50"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Apply Suggestions
              </Button>
            </PermissionGuard>

            <PermissionGuard permission="housemeets.team_selection.update">
              <Button 
                variant="default" 
                size="sm"
                onClick={handleOfficialSave}
                disabled={loading || saveSelection.isPending || (conflicts.size > 0) || !hasChanges}
                className={cn(
                  "shadow-md transition-all",
                  hasChanges ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-400"
                )}
              >
                <Save className="mr-2 h-4 w-4" /> Save Official Selection
              </Button>
            </PermissionGuard>
            
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg ml-2">
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <Button
                  key={y}
                  onClick={() => setYear(y)}
                  variant={year === y ? "default" : "ghost"}
                  size="sm"
                  className={cn("px-4", year === y && "shadow-sm bg-white text-slate-900 hover:bg-white")}
                >
                  {y}
                </Button>
              ))}
            </div>
          </div>
        }
      />

      <div className="p-6 flex-1 overflow-hidden">
        <Card className="h-full flex flex-col border-none shadow-xl overflow-hidden rounded-2xl">
          <CardHeader className="bg-white border-b py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800 font-black">
                <ListChecks className="h-5 w-5 text-blue-600" />
                Category Assignments
              </CardTitle>
              <div className="flex gap-3">
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 h-6 px-3">
                  {unifiedRows.length} Rows
                </Badge>
                {conflicts.size > 0 && (
                  <Badge variant="destructive" className="animate-bounce h-6 px-3 bg-red-500 border-none">
                    <AlertCircle className="h-3 w-3 mr-1" /> {conflicts.size} Conflicts Found
                  </Badge>
                )}
                {hasChanges && (
                  <Badge className="bg-amber-500 text-white border-none h-6 px-3">
                    Unsaved Changes
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10 border-b shadow-sm">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">Category Detail</TableHead>
                    {level === 'zonal' && (
                      <TableHead className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">{info.suggestion}</TableHead>
                    )}
                    <TableHead className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">Official Selection</TableHead>
                    <TableHead className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-right">{info.result}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={level === 'zonal' ? 4 : 3} className="h-64 text-center">
                        <Loader className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                        <p className="mt-2 text-slate-400 text-sm font-bold uppercase tracking-widest">Preparing Dashboard...</p>
                      </TableCell>
                    </TableRow>
                  ) : unifiedRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={level === 'zonal' ? 4 : 3} className="h-64 text-center">
                        <AlertCircle className="h-10 w-10 mx-auto text-slate-200 mb-2" />
                        <p className="text-slate-400 font-medium">No competition data found for {year}</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    unifiedRows.map((row) => {
                      const conflict = isConflict(row.selectedStudent);
                      const isBlank = !row.selectedStudent;
                      
                      return (
                        <TableRow key={row.id} className={cn(
                          "group transition-all duration-200 border-b border-slate-50",
                          conflict ? "bg-red-50/70" : isBlank ? "bg-amber-50/50" : "hover:bg-slate-50/50"
                        )}>
                          <TableCell className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{row.competitionName}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{row.gradeName}</span>
                            </div>
                          </TableCell>
                          {level === 'zonal' && (
                            <TableCell className="px-6 py-4 text-slate-500">
                              {row.suggestion ? (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="w-5 h-5 p-0 flex items-center justify-center bg-white text-amber-600 border-amber-200">1</Badge>
                                  <span className="text-sm font-medium italic">{renderStudentName(row.suggestion)}</span>
                                </div>
                              ) : "—"}
                            </TableCell>
                          )}
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "flex-1 min-w-[280px] p-2 rounded-xl border-2 transition-all flex items-center justify-between",
                                conflict 
                                  ? "bg-white border-red-500 text-red-900 shadow-sm shadow-red-100" 
                                  : isBlank 
                                    ? "bg-white border-dashed border-amber-300 text-amber-600/60" 
                                    : "bg-white border-slate-100 text-slate-900 group-hover:border-blue-200"
                              )}>
                                <div className="flex items-center gap-2 overflow-hidden px-1">
                                  {conflict && <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />}
                                  {isBlank && level === 'zonal' && <UserPlus className="h-4 w-4 text-amber-300 shrink-0" />}
                                  <span className={cn("text-sm font-bold truncate", isBlank && "italic font-medium")}>
                                    {row.selectedStudent ? renderStudentName(row.selectedStudent) : level === 'zonal' ? "Select Student" : "No Representative"}
                                  </span>
                                </div>
                                
                                {level === 'zonal' && (
                                  <StudentSelector 
                                    year={year}
                                    competitionId={row.competitionId}
                                    gradeId={row.gradeId}
                                    selectedStudent={row.selectedStudent}
                                    onSelect={(student: any) => handleLocalUpdate(row.competitionId, row.gradeId, student, row.place)}
                                  />
                                )}
                              </div>
                              
                              {level === 'zonal' && row.selectedStudent && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-full"
                                  onClick={() => handleLocalUpdate(row.competitionId, row.gradeId, null)}
                                >
                                 <span className="text-xl leading-none">×</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <Select 
                              value={row.place?.toString() || "0"} 
                              onValueChange={(val) => handleLocalUpdate(row.competitionId, row.gradeId, getSid(row.selectedStudent), val === "0" ? undefined : parseInt(val))}
                              disabled={!row.selectedStudent || !can("housemeets.competition_result.create")}
                            >
                              <SelectTrigger className="w-32 ml-auto bg-white h-9 text-xs font-bold rounded-lg border-2 border-slate-100 focus:ring-0">
                                <SelectValue placeholder="No Result" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0" className="text-xs">No Place</SelectItem>
                                <SelectItem value="1" className="text-xs font-bold text-amber-600 bg-amber-50/30">1st Place</SelectItem>
                                <SelectItem value="2" className="text-xs font-bold text-slate-600 bg-slate-50/30">2nd Place</SelectItem>
                                <SelectItem value="3" className="text-xs font-bold text-orange-600 bg-orange-50/30">3rd Place</SelectItem>
                                <SelectItem value="4" className="text-xs">4th Place</SelectItem>
                                <SelectItem value="5" className="text-xs">5th Place</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          {hasChanges && (
            <div className="bg-amber-50 border-t border-amber-100 p-3 flex items-center justify-between px-6 animate-in slide-in-from-bottom-2">
               <div className="flex items-center gap-2 text-amber-700 text-sm font-bold">
                 <AlertCircle className="h-4 w-4" />
                 You have unsaved changes in the selection list.
               </div>
               <div className="flex gap-2">
                 <Button variant="ghost" size="sm" onClick={() => setLocalEntries(selection?.entries || [])} className="text-slate-500 font-bold">Discard</Button>
                 <Button size="sm" onClick={handleOfficialSave} disabled={conflicts.size > 0} className="bg-amber-600 hover:bg-amber-700 font-bold shadow-sm">Save Now</Button>
               </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function StudentSelector({ year, competitionId, gradeId, selectedStudent, onSelect }: any) {
  const [open, setOpen] = useState(false);
  const { data: registrations = [], isLoading: regsLoading } = useCompetitionRegistrations({ competitionId, year });
  const { data: results = [], isLoading: resultsLoading } = useCompetitionResults(competitionId, year, gradeId);

  // Filter registrations by the specific grade
  const gradeRegistrations = useMemo(() => {
    return registrations.filter((r: any) => String(r.gradeId) === String(gradeId));
  }, [registrations, gradeId]);

  // Merge results with registrations to show places
  const studentsWithPlaces = useMemo(() => {
    return gradeRegistrations.map((reg: any) => {
      const regSid = typeof reg.studentId === 'object' ? (reg.studentId._id || reg.studentId.id) : String(reg.studentId);
      
      const result = results.find((res: any) => {
        const resSid = typeof res.studentId === 'object' ? (res.studentId._id || res.studentId.id) : String(res.studentId);
        return String(resSid) === String(regSid);
      });

      return {
        ...(typeof reg.studentId === 'object' ? reg.studentId : { id: reg.studentId }),
        place: result?.place,
      };
    }).sort((a: any, b: any) => {
      if (a.place && !b.place) return -1;
      if (!a.place && b.place) return 1;
      if (a.place && b.place) return a.place - b.place;
      const aName = a.nameWithInitialsSi || a.fullNameEn || a.firstNameEn || "";
      const bName = b.nameWithInitialsSi || b.fullNameEn || b.firstNameEn || "";
      return aName.localeCompare(bName);
    });
  }, [gradeRegistrations, results]);

  const loading = regsLoading || resultsLoading;

  const currentSid = selectedStudent ? (typeof selectedStudent === 'object' ? (selectedStudent._id || selectedStudent.id) : String(selectedStudent)) : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
          <Search className="h-3 w-3 mr-1" /> {selectedStudent ? "Change" : "Select"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-500" />
            Select Representative
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {loading ? (
            <div className="text-center py-10">
              <Loader className="h-6 w-6 animate-spin mx-auto text-slate-300" />
              <p className="text-xs text-slate-400 mt-2">Fetching registered students...</p>
            </div>
          ) : studentsWithPlaces.length === 0 ? (
            <p className="text-center py-10 text-sm text-slate-500 italic border-2 border-dashed rounded-xl">No students registered for this competition/grade.</p>
          ) : studentsWithPlaces.map((student: any) => {
            const sid: string = student._id || student.id;
            const isSelected = String(sid) === String(currentSid);
            
            return (
              <button
                key={sid}
                onClick={() => {
                  onSelect(student);
                  setOpen(false);
                }}
                className={cn(
                  "w-full p-3 rounded-xl border-2 text-left flex items-center justify-between transition-all group",
                  isSelected 
                    ? "border-blue-500 bg-blue-50 shadow-sm" 
                    : "border-transparent bg-slate-50 hover:border-slate-200 hover:bg-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 shadow-sm",
                    student.place === 1 ? "bg-amber-100 text-amber-700 border border-amber-200" :
                    student.place === 2 ? "bg-slate-200 text-slate-700 border border-slate-300" :
                    student.place === 3 ? "bg-orange-100 text-orange-700 border border-orange-200" :
                    student.place ? "bg-blue-50 text-blue-600 border border-blue-100" : 
                    "bg-slate-100 text-slate-400 border border-slate-200"
                  )}>
                    {student.place || "R"}
                  </div>
                  <div className="flex flex-col">
                    <span className={cn("font-bold text-sm", isSelected ? "text-blue-900" : "text-slate-800")}>
                      {student.nameWithInitialsSi || student.fullNameEn || `${student.firstNameEn} ${student.lastNameEn}`}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{student.admissionNumber}</span>
                  </div>
                </div>
                {isSelected ? (
                  <Check className="h-5 w-5 text-blue-600" />
                ) : (
                  <Plus className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}


