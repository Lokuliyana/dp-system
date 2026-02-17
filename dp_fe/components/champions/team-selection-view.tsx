"use client";

import { useMemo, useState } from "react";
import { 
  Trophy, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  ListChecks,
  UserPlus,
  Search,
  Check,
  Plus
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
  Input,
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
  useCompetitionRegistrations
} from "@/hooks/useCompetitions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TeamSelectionViewProps {
  level: "zonal" | "district" | "allisland";
  title: string;
  description: string;
  icon: any;
}

export function TeamSelectionView({ level, title, description, icon: Icon }: TeamSelectionViewProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const { data: selection, isLoading: selectionLoading } = useTeamSelection(level, year);
  const { data: suggestions = [], isLoading: suggestionsLoading } = useTeamSelectionSuggestions(year, level);
  const { data: competitions = [] } = useCompetitions(year);
  const saveSelection = useSaveTeamSelection(level, year);
  const { toast } = useToast();

  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  
  // Registration list for student change dialog
  const { data: registrations = [], isLoading: regsLoading } = useCompetitionRegistrations({
    competitionId: selectedCompId || "none",
    year
  });

  const selectedStudentsMap = useMemo(() => {
    const map = new Map<string, any[]>();
    (selection?.entries || []).forEach(e => {
      const compId = String(e.competitionId);
      if (!map.has(compId)) map.set(compId, []);
      map.get(compId)?.push(e);
    });
    return map;
  }, [selection]);

  const handleApplySuggestions = () => {
    if (!suggestions.length) return;
    
    // Merge existing selections with suggestions (suggestions take priority if new)
    const newEntries = [...(selection?.entries || [])];
    
    suggestions.forEach(s => {
      const idx = newEntries.findIndex(e => String(e.competitionId) === String(s.competitionId));
      const entry = {
        competitionId: s.competitionId,
        studentId: typeof s.studentId === 'object' ? s.studentId._id : s.studentId,
        place: s.place
      };
      
      if (idx > -1) {
        newEntries[idx] = entry;
      } else {
        newEntries.push(entry);
      }
    });

    saveSelection.mutate(
      { level, year, entries: newEntries },
      {
        onSuccess: () => toast({ title: `${level.charAt(0).toUpperCase() + level.slice(1)} selection updated` }),
        onError: (err) => toast({ title: "Failed to save selection", description: String(err), variant: "destructive" }),
      },
    );
  };

  const handleUpdateEntry = (competitionId: string, oldStudentId: string, newStudentId: string, place?: number) => {
    const newEntries = [...(selection?.entries || [])];
    const idx = newEntries.findIndex(e => 
      String(e.competitionId) === String(competitionId) && 
      String((e.studentId as any)?._id || e.studentId) === String(oldStudentId)
    );
    
    if (idx > -1) {
      newEntries[idx] = { ...newEntries[idx], studentId: newStudentId, place };
    } else {
      newEntries.push({ competitionId, studentId: newStudentId, place });
    }

    saveSelection.mutate(
      { level, year, entries: newEntries },
      {
        onSuccess: () => {
          toast({ title: "Updated successfully" });
          setSelectedCompId(null);
        },
        onError: (err) => toast({ title: "Error", description: String(err), variant: "destructive" }),
      }
    );
  };

  const handleAddEntry = (competitionId: string, studentId: string) => {
    const newEntries = [...(selection?.entries || [])];
    
    // Check if student already in THIS competition
    const exists = newEntries.some(e => 
      String(e.competitionId) === String(competitionId) && 
      String((e.studentId as any)?._id || e.studentId) === String(studentId)
    );

    if (exists) {
      toast({ title: "Student already added to this competition", variant: "destructive" });
      return;
    }

    newEntries.push({ competitionId, studentId, place: undefined });

    saveSelection.mutate(
      { level, year, entries: newEntries },
      {
        onSuccess: () => {
          toast({ title: "Student added successfully" });
          setSelectedCompId(null);
        },
        onError: (err) => toast({ title: "Error", description: String(err), variant: "destructive" }),
      }
    );
  };

  const handleRemoveEntry = (competitionId: string, studentId: string) => {
    const newEntries = (selection?.entries || []).filter(e => 
      !(String(e.competitionId) === String(competitionId) && 
        String((e.studentId as any)?._id || e.studentId) === String(studentId))
    );

    saveSelection.mutate(
      { level, year, entries: newEntries },
      {
        onSuccess: () => toast({ title: "Student removed" }),
        onError: (err) => toast({ title: "Error", description: String(err), variant: "destructive" }),
      }
    );
  };

  const renderStudentName = (student: any) => {
    if (!student) return "—";
    if (typeof student === "string") return student; // Fallback for old IDs
    return `${student.firstNameEn} ${student.lastNameEn} (${student.admissionNumber})`;
  };

  const pendingCount = suggestions.filter(s => !selectedStudentsMap.has(String(s.competitionId))).length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 rounded-xl text-white">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg self-start">
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Selected Team</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                {selection?.entries?.length || 0}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Competitions with entries</p>
            </div>
            <Users className="h-10 w-10 text-blue-500/20" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Team Rank</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                {selection?.teamPosition ? `${selection.teamPosition}${selection.teamPosition === 1 ? 'st' : selection.teamPosition === 2 ? 'nd' : selection.teamPosition === 3 ? 'rd' : 'th'}` : "—"}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Overall standing for {year}</p>
            </div>
            <Trophy className="h-10 w-10 text-yellow-500/20" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Marks</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{selection?.totalMarks || 0}</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Points accumulated</p>
            </div>
            <TrendingUp className="h-10 w-10 text-emerald-500/20" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-slate-400" />
                  Team Composition
                </CardTitle>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                  {selection?.entries?.length || 0} Entries
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30">
                    <TableHead className="w-[40%]">Competition</TableHead>
                    <TableHead className="w-[40%]">Student</TableHead>
                    <TableHead className="text-right">Result (Place)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectionLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">Loading selection...</TableCell>
                    </TableRow>
                  ) : competitions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-32 text-center text-slate-500">
                        No competitions found for this year.
                      </TableCell>
                    </TableRow>
                  ) : (
                    competitions.map((comp) => {
                      const compEntries = selectedStudentsMap.get(String(comp.id)) || [];
                      
                      return (
                        <TableRow key={String(comp.id)} className="group/row">
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{comp.nameEn}</span>
                            </div>
                          </TableCell>
                          <TableCell colSpan={2} className="p-0">
                            <Table className="border-none">
                              <TableBody>
                                {compEntries.length === 0 ? (
                                  <TableRow className="hover:bg-transparent border-none">
                                    <TableCell className="text-slate-400 italic text-xs py-4">No students assigned</TableCell>
                                    <TableCell className="text-right py-4">
                                      <Dialog onOpenChange={(open) => open && setSelectedCompId(String(comp.id))}>
                                        <DialogTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-8 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                            <Plus className="h-3 w-3" /> Add
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                          <DialogHeader>
                                            <DialogTitle>Add Student to {comp.nameEn}</DialogTitle>
                                            <p className="text-sm text-muted-foreground">Select from registered students</p>
                                          </DialogHeader>
                                          <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
                                            {regsLoading ? (
                                              <p className="text-center py-4 text-sm text-slate-500">Loading...</p>
                                            ) : registrations.length === 0 ? (
                                              <p className="text-center py-4 text-sm text-slate-500">No registrations found</p>
                                            ) : registrations.map((reg: any) => (
                                              <button
                                                key={reg.id}
                                                onClick={() => handleAddEntry(String(comp.id), (reg.studentId as any)._id || reg.studentId)}
                                                className="w-full p-3 rounded-lg border text-left hover:bg-slate-50 flex items-center justify-between"
                                              >
                                                <div className="flex flex-col">
                                                  <span className="font-bold text-sm">{(reg.studentId as any).firstNameEn} {(reg.studentId as any).lastNameEn}</span>
                                                  <span className="text-xs text-slate-500">{(reg.studentId as any).admissionNumber}</span>
                                                </div>
                                                <Plus className="h-4 w-4 text-slate-300" />
                                              </button>
                                            ))}
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  compEntries.map((entry, eIdx) => (
                                    <TableRow key={eIdx} className="hover:bg-transparent border-none">
                                      <TableCell className="py-2">
                                        <div className="flex items-center justify-between group/student">
                                          <span className="text-sm">{renderStudentName(entry.studentId)}</span>
                                          <div className="flex gap-1 opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 transition-opacity">
                                            <Dialog onOpenChange={(open) => open && setSelectedCompId(String(comp.id))}>
                                              <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600">
                                                  <Search className="h-3.5 w-3.5" />
                                                </Button>
                                              </DialogTrigger>
                                              <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                  <DialogTitle>Change Student for {comp.nameEn}</DialogTitle>
                                                </DialogHeader>
                                                <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
                                                  {regsLoading ? (
                                                    <p className="text-center py-4 text-sm text-slate-500">Loading...</p>
                                                  ) : registrations.map((reg: any) => (
                                                    <button
                                                      key={reg.id}
                                                      onClick={() => handleUpdateEntry(String(comp.id), (entry.studentId as any)?._id || entry.studentId, (reg.studentId as any)?._id || reg.studentId, entry.place)}
                                                      className={cn(
                                                        "w-full p-3 rounded-lg border text-left flex items-center justify-between hover:bg-slate-50",
                                                        String((reg.studentId as any)?._id || reg.studentId) === String((entry.studentId as any)?._id || entry.studentId) && "border-blue-500 bg-blue-50"
                                                      )}
                                                    >
                                                      <div className="flex flex-col">
                                                        <span className="font-bold text-sm">{(reg.studentId as any).firstNameEn} {(reg.studentId as any).lastNameEn}</span>
                                                        <span className="text-xs text-slate-500">{(reg.studentId as any).admissionNumber}</span>
                                                      </div>
                                                      {String((reg.studentId as any)?._id || reg.studentId) === String((entry.studentId as any)?._id || entry.studentId) && <Check className="h-4 w-4 text-blue-500" />}
                                                    </button>
                                                  ))}
                                                </div>
                                              </DialogContent>
                                            </Dialog>
                                              <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              className="h-7 w-7 p-0 text-slate-300 hover:text-red-500 hover:bg-red-50"
                                              onClick={() => handleRemoveEntry(String(comp.id), (entry.studentId as any)?._id || entry.studentId)}
                                            >
                                              <Users className="h-3.5 w-3.5" />
                                            </Button>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right py-2 w-[120px]">
                                        <div className="flex items-center justify-end gap-2">
                                          <Select 
                                            value={entry.place?.toString() || "0"} 
                                            onValueChange={(val) => handleUpdateEntry(String(comp.id), (entry.studentId as any)?._id || entry.studentId, (entry.studentId as any)?._id || entry.studentId, val === "0" ? undefined : parseInt(val))}
                                          >
                                            <SelectTrigger className="w-24 h-8 text-[11px]">
                                              <SelectValue placeholder="No Place" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="0" className="text-[11px]">No Place</SelectItem>
                                              <SelectItem value="1" className="text-[11px]">1st Place</SelectItem>
                                              <SelectItem value="2" className="text-[11px]">2nd Place</SelectItem>
                                              <SelectItem value="3" className="text-[11px]">3rd Place</SelectItem>
                                              <SelectItem value="4" className="text-[11px]">4th Place</SelectItem>
                                              <SelectItem value="5" className="text-[11px]">5th Place</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          {eIdx === compEntries.length - 1 && (
                                            <Dialog onOpenChange={(open) => open && setSelectedCompId(String(comp.id))}>
                                              <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                  <Plus className="h-3.5 w-3.5" />
                                                </Button>
                                              </DialogTrigger>
                                              <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                  <DialogTitle>Add Student to {comp.nameEn}</DialogTitle>
                                                </DialogHeader>
                                                <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
                                                  {regsLoading ? (
                                                    <p className="text-center py-4 text-sm text-slate-500">Loading...</p>
                                                  ) : registrations.map((reg: any) => (
                                                    <button
                                                      key={reg.id}
                                                      onClick={() => handleAddEntry(String(comp.id), (reg.studentId as any)?._id || reg.studentId)}
                                                      className="w-full p-3 rounded-lg border text-left hover:bg-slate-50 flex items-center justify-between"
                                                    >
                                                      <div className="flex flex-col">
                                                        <span className="font-bold text-sm">{(reg.studentId as any).firstNameEn} {(reg.studentId as any).lastNameEn}</span>
                                                        <span className="text-xs text-slate-500">{(reg.studentId as any).admissionNumber}</span>
                                                      </div>
                                                      <Plus className="h-4 w-4 text-slate-300" />
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
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}


                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-400">
                {level === 'zonal' 
                  ? "Suggestions based on school house meet winners and registrations." 
                  : `Suggestions based on ${level === 'district' ? 'Zonal' : 'District'} winners.`}
              </p>
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {suggestionsLoading ? (
                  <p className="text-center py-4 text-xs text-slate-500">Loading suggestions...</p>
                ) : suggestions.length === 0 ? (
                  <div className="text-center py-8 rounded-lg border border-slate-800 bg-slate-800/50">
                    <Trophy className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 italic">No suggestions available yet.</p>
                  </div>
                ) : (
                  suggestions.map((s, idx) => {
                    const comp = competitions.find(c => String(c.id) === String(s.competitionId));
                    const isSelected = selectedStudentsMap.has(String(s.competitionId));
                    return (
                      <div key={idx} className={cn(
                        "p-3 rounded-lg border border-slate-800 bg-slate-800/30 flex items-center justify-between gap-3",
                        isSelected && "border-emerald-500/30 bg-emerald-500/5"
                      )}>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-300 truncate">{comp?.nameEn || "Competition"}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">{renderStudentName(s.studentId)}</p>
                        </div>
                        {isSelected ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <Button 
                variant="outline" 
                className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700 text-white mt-2"
                onClick={handleApplySuggestions}
                disabled={suggestions.length === 0 || saveSelection.isPending}
              >
                {pendingCount > 0 ? `Apply ${pendingCount} New Suggestions` : "Apply All Suggestions"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Quick Result Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">1st Places</span>
                  <span className="font-bold">{(selection?.entries || []).filter(e => e.place === 1).length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">2nd Places</span>
                  <span className="font-bold">{(selection?.entries || []).filter(e => e.place === 2).length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">3rd Places</span>
                  <span className="font-bold">{(selection?.entries || []).filter(e => e.place === 3).length}</span>
                </div>
                <div className="h-px bg-slate-100 my-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-900 font-bold">Total Winners</span>
                  <span className="font-black text-blue-600">{(selection?.entries || []).filter(e => e.place && e.place > 0).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
