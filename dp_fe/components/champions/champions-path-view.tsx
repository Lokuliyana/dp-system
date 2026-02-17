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
  Loader
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
  useAutoGenerateTeamSelection
} from "@/hooks/useCompetitions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CompetitionSidebar } from "@/components/house-meets/competition-sidebar";
import { DynamicPageHeader } from "@/components/layout/dynamic";

interface ChampionsPathViewProps {
  level: "zonal" | "district" | "allisland";
  title: string;
  description: string;
  icon: any;
}

export function ChampionsPathView({ level, title, description, icon: Icon }: ChampionsPathViewProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [competitionId, setCompetitionId] = useState<string | null>(null);
  
  const { toast } = useToast();

  // 1. Fetch Data
  const { data: competitions = [], isLoading: compsLoading } = useCompetitions(year);
  const { data: selection, isLoading: selectionLoading } = useTeamSelection(level, year);
  const { data: suggestions = [], isLoading: suggestionsLoading } = useTeamSelectionSuggestions(year, level);
  const autoGenerate = useAutoGenerateTeamSelection(year);
  const saveSelection = useSaveTeamSelection(level, year);

  // Registration list for student add/change dialog
  const { data: registrations = [], isLoading: regsLoading } = useCompetitionRegistrations({
    competitionId: competitionId || undefined,
    year
  });

  // Auto-select first competition
  useEffect(() => {
    if (!competitionId && competitions.length > 0) {
      setCompetitionId(competitions[0].id || (competitions[0] as any)._id);
    }
  }, [competitions, competitionId]);

  const selectedCompetition = useMemo(
    () => competitions.find((c) => (c.id || (c as any)._id) === competitionId),
    [competitions, competitionId]
  );

  const compEntries = useMemo(() => {
    return (selection?.entries || []).filter(e => String(e.competitionId) === String(competitionId));
  }, [selection, competitionId]);

  const compSuggestions = useMemo(() => {
    return suggestions.filter(s => String(s.competitionId) === String(competitionId));
  }, [suggestions, competitionId]);

  // Total stats for the year
  const totalEntries = (selection?.entries || []).length;
  const totalMarks = selection?.totalMarks || 0;
  const teamPosition = selection?.teamPosition;

  // 2. Handlers
  const handleApplySuggestions = () => {
    if (!compSuggestions.length) return;
    
    const existingEntries = [...(selection?.entries || [])];
    const newEntries = [...existingEntries];
    let addedCount = 0;
    
    compSuggestions.forEach(s => {
      const sid = typeof s.studentId === 'object' ? (s.studentId._id || s.studentId.id) : s.studentId;
      
      const exists = existingEntries.some(e => 
        String(e.competitionId) === String(s.competitionId) && 
        String((e.studentId as any)?._id || (e.studentId as any)?.id || e.studentId) === String(sid)
      );

      if (!exists) {
        newEntries.push({
          competitionId: s.competitionId,
          studentId: sid,
          place: undefined
        });
        addedCount++;
      }
    });

    if (addedCount === 0) {
      toast({ title: "No new suggestions to apply" });
      return;
    }

    saveSelection.mutate(
      { level, year, entries: newEntries },
      {
        onSuccess: () => toast({ title: "Suggestions applied successfully" }),
        onError: (err) => toast({ title: "Error", description: String(err), variant: "destructive" }),
      },
    );
  };

  const handleUpdateEntry = (studentId: string, newStudentId: string, place?: number) => {
    if (!competitionId) return;

    const existingEntries = [...(selection?.entries || [])];
    
    // Find index of the entry we want to update
    const idx = existingEntries.findIndex(e => 
      String(e.competitionId) === String(competitionId) && 
      String((e.studentId as any)?._id || (e.studentId as any)?.id || e.studentId) === String(studentId)
    );

    const newEntries = [...existingEntries];
    if (idx > -1) {
      newEntries[idx] = { ...newEntries[idx], studentId: newStudentId, place };
    }

    saveSelection.mutate(
      { level, year, entries: newEntries },
      {
        onSuccess: () => toast({ title: "Updated" }),
        onError: (err) => toast({ title: "Error", description: String(err), variant: "destructive" }),
      }
    );
  };

  const handleAddEntry = (studentId: string) => {
    if (!competitionId) return;

    const existingEntries = [...(selection?.entries || [])];
    
    const exists = existingEntries.some(e => 
      String(e.competitionId) === String(competitionId) && 
      String((e.studentId as any)?._id || (e.studentId as any)?.id || e.studentId) === String(studentId)
    );

    if (exists) {
      toast({ title: "Student already added", variant: "destructive" });
      return;
    }

    const newEntries = [...existingEntries, { competitionId, studentId, place: undefined }];

    saveSelection.mutate(
      { level, year, entries: newEntries },
      {
        onSuccess: () => toast({ title: "Added" }),
        onError: (err) => toast({ title: "Error", description: String(err), variant: "destructive" }),
      }
    );
  };

  const handleRemoveEntry = (studentId: string) => {
    if (!competitionId) return;

    const newEntries = (selection?.entries || []).filter(e => 
      !(String(e.competitionId) === String(competitionId) && 
        String((e.studentId as any)?._id || (e.studentId as any)?.id || e.studentId) === String(studentId))
    );

    saveSelection.mutate(
      { level, year, entries: newEntries },
      {
        onSuccess: () => toast({ title: "Removed" }),
        onError: (err) => toast({ title: "Error", description: String(err), variant: "destructive" }),
      }
    );
  };

  const handleAutoGenerate = async (from: "zonal" | "district", to: "district" | "allisland") => {
    try {
      await autoGenerate.mutateAsync({ fromLevel: from, toLevel: to, year });
      toast({ title: "Success", description: `Promoted ${from} winners to ${to}.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to promote winners.", variant: "destructive" });
    }
  };

  const renderStudentName = (student: any) => {
    if (!student) return "—";
    if (typeof student === "string") return student;
    return (student.nameWithInitialsSi || student.nameSi) 
      ? `${student.nameWithInitialsSi || student.nameSi} (${student.admissionNumber})`
      : `${student.firstNameEn} ${student.lastNameEn} (${student.admissionNumber})`;
  };

  const getStudentId = (student: any) => {
    if (!student) return "";
    return typeof student === 'object' ? (student._id || student.id) : student;
  };

  const loading = compsLoading || selectionLoading || suggestionsLoading;

  return (
    <>
      <CompetitionSidebar 
        competitions={competitions} 
        selectedId={competitionId} 
        onSelect={setCompetitionId} 
      />

      <DynamicPageHeader
        title={title}
        subtitle={description}
        icon={Icon}
        actions={
          <div className="flex gap-2">
            {level === "zonal" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleAutoGenerate("zonal", "district")}
                disabled={autoGenerate.isPending}
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Promote to District
              </Button>
            )}
            {level === "district" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleAutoGenerate("district", "allisland")}
                disabled={autoGenerate.isPending}
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Promote to All Island
              </Button>
            )}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
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

      <div className="p-6 h-[calc(100vh-140px)] overflow-y-auto">
        <div className="grid grid-cols-1 gap-6">
          {/* Top Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border-none shadow-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Selected Team</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{totalEntries}</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Total entries for {year}</p>
                </div>
                <Users className="h-10 w-10 text-blue-500/20" />
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Marks</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{totalMarks}</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Points accumulated</p>
                </div>
                <TrendingUp className="h-10 w-10 text-emerald-500/20" />
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Team Rank</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">
                    {teamPosition ? `${teamPosition}${teamPosition === 1 ? 'st' : teamPosition === 2 ? 'nd' : teamPosition === 3 ? 'rd' : 'th'}` : "—"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Overall standing</p>
                </div>
                <Trophy className="h-10 w-10 text-yellow-500/20" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Composition Table */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ListChecks className="h-5 w-5 text-slate-400" />
                      Team Composition
                    </CardTitle>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      {compEntries.length} Entries
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex items-center justify-center p-12">
                      <Loader className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                  ) : !selectedCompetition ? (
                    <div className="p-12 text-center text-slate-400 italic">Select a competition from the sidebar</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/30">
                          <TableHead className="w-[50%] px-6">Student</TableHead>
                          <TableHead className="text-right px-6">Result (Place)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {compEntries.length === 0 ? (
                          <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={2} className="h-32 text-center">
                              <div className="flex flex-col items-center gap-2 text-slate-400">
                                <Users className="h-8 w-8 opacity-20" />
                                <p className="text-sm">No students assigned to this competition</p>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="mt-2 text-blue-600 border-blue-100 hover:bg-blue-50">
                                      <Plus className="h-3 w-3 mr-1" /> Add First Student
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                      <DialogTitle>Add Student to {selectedCompetition.nameEn}</DialogTitle>
                                    </DialogHeader>
                                    <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
                                      {regsLoading ? (
                                        <div className="text-center py-4"><Loader className="h-4 w-4 animate-spin mx-auto" /></div>
                                      ) : registrations.length === 0 ? (
                                        <p className="text-center py-4 text-xs text-slate-500">No registered students found</p>
                                      ) : registrations.map((reg: any) => (
                                        <button
                                          key={reg.id}
                                          onClick={() => handleAddEntry(getStudentId(reg.studentId))}
                                          className="w-full p-3 rounded-lg border text-left hover:bg-slate-50 flex items-center justify-between group/btn"
                                        >
                                          <div className="flex flex-col">
                                            <span className="font-bold text-sm">{(reg.studentId as any).nameWithInitialsSi || `${(reg.studentId as any).firstNameEn} ${(reg.studentId as any).lastNameEn}`}</span>
                                            <span className="text-xs text-slate-500">{(reg.studentId as any).admissionNumber}</span>
                                          </div>
                                          <Plus className="h-4 w-4 text-slate-300 group-hover/btn:text-blue-500" />
                                        </button>
                                      ))}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          compEntries.map((entry, idx) => (
                            <TableRow key={idx} className="group/row">
                              <TableCell className="px-6 py-4">
                                <div className="flex items-center justify-between group/student">
                                  <div className="flex flex-col">
                                    <span className="font-medium text-slate-900">{renderStudentName(entry.studentId)}</span>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 text-slate-400 hover:text-blue-600">
                                          <Search className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                          <DialogTitle>Change Student</DialogTitle>
                                        </DialogHeader>
                                        <div className="mt-4 space-y-1 max-h-[300px] overflow-y-auto">
                                          {registrations.map((reg: any) => {
                                            const sid = getStudentId(reg.studentId);
                                            const isSelected = sid === getStudentId(entry.studentId);
                                            return (
                                              <button
                                                key={reg.id}
                                                onClick={() => handleUpdateEntry(getStudentId(entry.studentId), sid, entry.place)}
                                                className={cn(
                                                  "w-full p-3 rounded-lg border text-left flex items-center justify-between",
                                                  isSelected ? "border-blue-500 bg-blue-50" : "hover:bg-slate-50 border-transparent"
                                                )}
                                              >
                                                <div className="flex flex-col">
                                                  <span className="font-bold text-sm">{(reg.studentId as any).nameWithInitialsSi || `${(reg.studentId as any).firstNameEn} ${(reg.studentId as any).lastNameEn}`}</span>
                                                  <span className="text-xs text-slate-500">{(reg.studentId as any).admissionNumber}</span>
                                                </div>
                                                {isSelected && <Check className="h-4 w-4 text-blue-500" />}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                      onClick={() => handleRemoveEntry(getStudentId(entry.studentId))}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <Select 
                                    value={entry.place?.toString() || "0"} 
                                    onValueChange={(val) => handleUpdateEntry(getStudentId(entry.studentId), getStudentId(entry.studentId), val === "0" ? undefined : parseInt(val))}
                                  >
                                    <SelectTrigger className="w-32 bg-white">
                                      <SelectValue placeholder="No Place" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="0">No Place</SelectItem>
                                      <SelectItem value="1">1st Place</SelectItem>
                                      <SelectItem value="2">2nd Place</SelectItem>
                                      <SelectItem value="3">3rd Place</SelectItem>
                                      <SelectItem value="4">4th Place</SelectItem>
                                      <SelectItem value="5">5th Place</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {idx === compEntries.length - 1 && (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50">
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                          <DialogTitle>Add Another Student</DialogTitle>
                                        </DialogHeader>
                                        <div className="mt-4 space-y-1 max-h-[300px] overflow-y-auto">
                                          {registrations.map((reg: any) => (
                                            <button
                                              key={reg.id}
                                              onClick={() => handleAddEntry(getStudentId(reg.studentId))}
                                              className="w-full p-3 rounded-lg border border-transparent text-left hover:bg-slate-50 flex items-center justify-between group/add"
                                            >
                                              <div className="flex flex-col">
                                                <span className="font-bold text-sm">{(reg.studentId as any).nameWithInitialsSi || `${(reg.studentId as any).firstNameEn} ${(reg.studentId as any).lastNameEn}`}</span>
                                                <span className="text-xs text-slate-500">{(reg.studentId as any).admissionNumber}</span>
                                              </div>
                                              <Plus className="h-4 w-4 text-slate-300 group-hover/add:text-blue-500" />
                                            </button>
                                          ))}
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Stats & Suggestions */}
            <div className="space-y-6">
              <Card className="border-none shadow-lg bg-slate-900 text-white">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-slate-400">
                    {level === 'zonal' 
                      ? "Winners from School House Meets." 
                      : `1st Place winners from ${level === 'district' ? 'Zonal' : 'District'} level.`}
                  </p>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {suggestionsLoading ? (
                      <p className="text-center py-4 text-xs text-slate-500">Loading...</p>
                    ) : compSuggestions.length === 0 ? (
                      <div className="text-center py-6 rounded-lg border border-slate-800 bg-slate-800/50">
                        <p className="text-xs text-slate-500 italic">No suggestions for this event.</p>
                      </div>
                    ) : (
                      compSuggestions.map((s, idx) => {
                        const sid = typeof s.studentId === 'object' ? (s.studentId._id || s.studentId.id) : s.studentId;
                        const isSelected = compEntries.some(e => String((e.studentId as any)?._id || (e.studentId as any)?.id || e.studentId) === String(sid));
                        
                        return (
                          <div key={idx} className={cn(
                            "p-3 rounded-lg border border-slate-800 bg-slate-800/30 flex items-center justify-between gap-3",
                            isSelected && "border-emerald-500/30 bg-emerald-500/10"
                          )}>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-bold text-slate-300 truncate">{renderStudentName(s.studentId)}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">Place: {s.place || "N/A"}</p>
                            </div>
                            {isSelected ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700 text-white mt-2 h-9"
                    onClick={handleApplySuggestions}
                    disabled={compSuggestions.length === 0 || saveSelection.isPending}
                  >
                    Apply All Suggestions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader className="py-4">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Result Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map(p => (
                      <div key={p} className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">{p}{p === 1 ? 'st' : p === 2 ? 'nd' : 'rd'} Place</span>
                        <span className="font-bold">{(selection?.entries || []).filter(e => e.place === p).length}</span>
                      </div>
                    ))}
                    <div className="h-px bg-slate-100 my-2" />
                    <div className="flex items-center justify-between text-sm pt-1">
                      <span className="text-slate-900 font-bold">Total Winners</span>
                      <span className="font-black text-blue-600">{(selection?.entries || []).filter(e => e.place && e.place > 0).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}
