"use client";

import { useState, useMemo, useEffect } from "react";
import { Trophy, AlertCircle, Save, RotateCcw, Loader, ArrowRight, CheckCircle2 } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { HouseMeetsMenu } from "@/components/house-meets/house-meets-menu";
import { CompetitionSidebar } from "@/components/house-meets/competition-sidebar";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Separator,
  ScrollArea
} from "@/components/ui";
import { useCompetitions, useTeamSelection, useSaveTeamSelection, useTeamSelectionSuggestions, useAutoGenerateTeamSelection } from "@/hooks/useCompetitions";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function ChampionsPage() {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const [year] = useState(currentYear);
  const [competitionId, setCompetitionId] = useState<string | null>(null);

  // 1. Fetch Data
  const { data: competitions = [], isLoading: compsLoading } = useCompetitions(year);
  const { data: suggestions = [], isLoading: suggLoading } = useTeamSelectionSuggestions(year);
  
  // Fetch selections for all levels
  const { data: zonalSel, isLoading: zonalLoading } = useTeamSelection("zonal", year);
  const { data: districtSel, isLoading: districtLoading } = useTeamSelection("district", year);
  const { data: islandSel, isLoading: islandLoading } = useTeamSelection("allisland", year);

  // Mutations
  const saveZonal = useSaveTeamSelection("zonal", year);
  const saveDistrict = useSaveTeamSelection("district", year);
  const saveIsland = useSaveTeamSelection("allisland", year);
  const autoGenerate = useAutoGenerateTeamSelection(year);

  // Helper to get ID
  const getId = (doc: any) => doc.id || doc._id;

  // Auto-select first competition
  useEffect(() => {
    if (!competitionId && competitions.length > 0) {
      setCompetitionId(getId(competitions[0]));
    }
  }, [competitions, competitionId]);

  const selectedCompetition = useMemo(
    () => competitions.find((c) => getId(c) === competitionId),
    [competitions, competitionId]
  );

  // 2. Conflict Detection (Zonal)
  // We need to know if a student is selected in ANY competition for Zonal
  const zonalConflicts = useMemo(() => {
    const studentCounts: Record<string, number> = {};
    zonalSel?.entries?.forEach((e: any) => {
      const sid = typeof e.studentId === 'object' ? (e.studentId._id || e.studentId.id) : e.studentId;
      if (sid) {
        studentCounts[sid] = (studentCounts[sid] || 0) + 1;
      }
    });
    
    const conflictIds = new Set<string>();
    Object.entries(studentCounts).forEach(([sid, count]) => {
      if (count > 1) conflictIds.add(sid);
    });
    
    return conflictIds;
  }, [zonalSel]);

  // 3. Handlers for updating selections
  // We update the ENTIRE list for the level, modifying only the current competition's entry
  const handleUpdateSelection = async (
    level: "zonal" | "district" | "allisland",
    studentId: string,
    place?: number
  ) => {
    if (!competitionId) return;

    const currentData = level === "zonal" ? zonalSel : level === "district" ? districtSel : islandSel;
    const saveMutation = level === "zonal" ? saveZonal : level === "district" ? saveDistrict : saveIsland;

    const existingEntries = currentData?.entries || [];
    
    // Remove existing entry for this competition
    const otherEntries = existingEntries.filter((e: any) => e.competitionId !== competitionId).map((e: any) => ({
      competitionId: e.competitionId,
      studentId: typeof e.studentId === 'object' ? (e.studentId._id || e.studentId.id) : e.studentId,
      place: e.place
    }));

    // Add new entry if studentId is provided
    const newEntries = [...otherEntries];
    if (studentId && studentId !== "none") {
      newEntries.push({
        competitionId,
        studentId,
        place
      });
    }

    try {
      await saveMutation.mutateAsync({
        level,
        year,
        entries: newEntries
      });
      toast({ title: "Saved", description: `${level} selection updated.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save selection.", variant: "destructive" });
    }
  };

  const handleAutoGenerate = async (from: "zonal" | "district", to: "district" | "allisland") => {
    try {
      await autoGenerate.mutateAsync({
        fromLevel: from,
        toLevel: to,
        year
      });
      toast({ title: "Generated", description: `Promoted ${from} winners to ${to}.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate selections.", variant: "destructive" });
    }
  };

  // 4. Derived state for current competition
  const currentZonal = zonalSel?.entries?.find((e: any) => e.competitionId === competitionId);
  const currentDistrict = districtSel?.entries?.find((e: any) => e.competitionId === competitionId);
  const currentIsland = islandSel?.entries?.find((e: any) => e.competitionId === competitionId);

  const compSuggestions = useMemo(() => {
    if (!competitionId) return [];
    return suggestions.filter((s: any) => s.competitionId === competitionId);
  }, [suggestions, competitionId]);

  const loading = compsLoading || suggLoading || zonalLoading || districtLoading || islandLoading;

  // Helper to get student name safely
  const getStudentName = (student: any) => {
    if (!student) return "Unknown";
    if (typeof student === 'string') return student; // Should be populated but fallback
    return `${student.firstNameEn} ${student.lastNameEn}`;
  };

  const getStudentId = (student: any) => {
    if (!student) return "";
    return typeof student === 'object' ? (student._id || student.id) : student;
  };

  return (
    <LayoutController showMainMenu showHorizontalToolbar showSidebar>
      <HouseMeetsMenu />
      <CompetitionSidebar 
        competitions={competitions} 
        selectedId={competitionId} 
        onSelect={setCompetitionId} 
      />

      <DynamicPageHeader
        title="Champions Path"
        subtitle="Manage progression from Zonal to All-Island."
        icon={Trophy}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAutoGenerate("zonal", "district")}
              disabled={autoGenerate.isPending}
              className="hidden md:flex"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Promote Zonal to District
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAutoGenerate("district", "allisland")}
              disabled={autoGenerate.isPending}
              className="hidden md:flex"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Promote District to Island
            </Button>
          </div>
        }
      />

      <div className="p-6 h-[calc(100vh-140px)] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : !selectedCompetition ? (
          <div className="text-center text-slate-500 mt-10">Select a competition to manage selections</div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Zonal Level */}
            <SelectionCard
              level="Zonal"
              color="bg-amber-50 border-amber-200"
              icon={<Trophy className="h-5 w-5 text-amber-600" />}
              description="Select the student representing the school at the Zonal level."
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Selected Student</label>
                    <Select 
                      value={getStudentId(currentZonal?.studentId) || "none"} 
                      onValueChange={(v) => handleUpdateSelection("zonal", v, currentZonal?.place)}
                    >
                      <SelectTrigger className={cn(
                        "w-full bg-white",
                        currentZonal && zonalConflicts.has(getStudentId(currentZonal.studentId)) && "border-red-300 ring-2 ring-red-100"
                      )}>
                        <SelectValue placeholder="Select Zonal Representative" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {compSuggestions.map((s: any) => {
                          const student = s.studentId;
                          return (
                            <SelectItem key={getStudentId(student)} value={getStudentId(student)}>
                              <span className="flex items-center gap-2">
                                <Badge variant="outline" className="w-5 h-5 p-0 flex items-center justify-center text-[10px] bg-slate-50">
                                  {s.place}
                                </Badge>
                                {getStudentName(student)}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {currentZonal && zonalConflicts.has(getStudentId(currentZonal.studentId)) && (
                      <div className="text-xs text-red-600 flex items-center gap-1 mt-1.5 font-medium">
                        <AlertCircle className="h-3 w-3" />
                        Warning: This student is selected for another Zonal event!
                      </div>
                    )}
                  </div>
                  
                  <div className="w-[140px]">
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Zonal Place</label>
                    <Select 
                      value={currentZonal?.place?.toString() || "0"} 
                      onValueChange={(v) => handleUpdateSelection("zonal", getStudentId(currentZonal?.studentId), parseInt(v))}
                      disabled={!currentZonal}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Participated</SelectItem>
                        <SelectItem value="1">1st Place</SelectItem>
                        <SelectItem value="2">2nd Place</SelectItem>
                        <SelectItem value="3">3rd Place</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </SelectionCard>

            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-slate-300 rotate-90" />
            </div>

            {/* District Level */}
            <SelectionCard
              level="District"
              color="bg-blue-50 border-blue-200"
              icon={<Trophy className="h-5 w-5 text-blue-600" />}
              description="Select the student representing the Zone at the District level."
              disabled={!currentZonal || currentZonal.place !== 1}
              disabledMessage="Student must achieve 1st Place in Zonal to qualify."
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-700 mb-1 block">District Representative</label>
                    {currentDistrict ? (
                       <div className="flex items-center justify-between p-2 bg-white border rounded-md">
                         <span className="font-medium">{getStudentName(currentDistrict.studentId)}</span>
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
                           onClick={() => handleUpdateSelection("district", "none")}
                         >
                           ×
                         </Button>
                       </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-muted-foreground bg-white"
                        onClick={() => handleUpdateSelection("district", getStudentId(currentZonal?.studentId))}
                        disabled={!currentZonal}
                      >
                        + Promote Zonal Winner
                      </Button>
                    )}
                  </div>

                  <div className="w-[140px]">
                    <label className="text-sm font-medium text-slate-700 mb-1 block">District Place</label>
                    <Select 
                      value={currentDistrict?.place?.toString() || "0"} 
                      onValueChange={(v) => handleUpdateSelection("district", getStudentId(currentDistrict?.studentId), parseInt(v))}
                      disabled={!currentDistrict}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Participated</SelectItem>
                        <SelectItem value="1">1st Place</SelectItem>
                        <SelectItem value="2">2nd Place</SelectItem>
                        <SelectItem value="3">3rd Place</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </SelectionCard>

            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-slate-300 rotate-90" />
            </div>

            {/* All Island Level */}
            <SelectionCard
              level="All Island"
              color="bg-purple-50 border-purple-200"
              icon={<Trophy className="h-5 w-5 text-purple-600" />}
              description="Select the student representing the District at the National level."
              disabled={!currentDistrict || currentDistrict.place !== 1}
              disabledMessage="Student must achieve 1st Place in District to qualify."
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-700 mb-1 block">National Representative</label>
                    {currentIsland ? (
                       <div className="flex items-center justify-between p-2 bg-white border rounded-md">
                         <span className="font-medium">{getStudentName(currentIsland.studentId)}</span>
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
                           onClick={() => handleUpdateSelection("allisland", "none")}
                         >
                           ×
                         </Button>
                       </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-muted-foreground bg-white"
                        onClick={() => handleUpdateSelection("allisland", getStudentId(currentDistrict?.studentId))}
                        disabled={!currentDistrict}
                      >
                        + Promote District Winner
                      </Button>
                    )}
                  </div>

                  <div className="w-[140px]">
                    <label className="text-sm font-medium text-slate-700 mb-1 block">National Place</label>
                    <Select 
                      value={currentIsland?.place?.toString() || "0"} 
                      onValueChange={(v) => handleUpdateSelection("allisland", getStudentId(currentIsland?.studentId), parseInt(v))}
                      disabled={!currentIsland}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Participated</SelectItem>
                        <SelectItem value="1">1st Place</SelectItem>
                        <SelectItem value="2">2nd Place</SelectItem>
                        <SelectItem value="3">3rd Place</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </SelectionCard>

          </div>
        )}
      </div>
    </LayoutController>
  );
}

function SelectionCard({ 
  level, 
  color, 
  icon, 
  description, 
  children, 
  disabled, 
  disabledMessage 
}: { 
  level: string; 
  color: string; 
  icon: React.ReactNode; 
  description: string; 
  children: React.ReactNode;
  disabled?: boolean;
  disabledMessage?: string;
}) {
  return (
    <div className={cn("rounded-xl border shadow-sm transition-all", color, disabled && "opacity-60 grayscale-[0.5]")}>
      <div className="p-4 border-b border-black/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-full shadow-sm">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{level} Level</h3>
            <p className="text-xs text-slate-600">{description}</p>
          </div>
        </div>
        {disabled && (
          <Badge variant="outline" className="bg-white/50 text-slate-500 border-slate-300">
            Locked
          </Badge>
        )}
      </div>
      <div className="p-4">
        {disabled ? (
          <div className="flex items-center justify-center py-4 text-sm text-slate-500 italic gap-2">
            <AlertCircle className="h-4 w-4" />
            {disabledMessage}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
