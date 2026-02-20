"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader, Medal, Trophy, Search, User, Users, Award } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { HouseMeetsMenu } from "@/components/house-meets/house-meets-menu";
import { CompetitionSidebar } from "@/components/house-meets/competition-sidebar";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Badge,
  ScrollArea,
  Separator,
} from "@/components/ui";
import { useGrades } from "@/hooks/useGrades";
import {
  useCompetitions,
  useCompetitionResults,
  useCreateCompetitionResult,
  useDeleteCompetitionResult,
  useCompetitionRegistrations,
} from "@/hooks/useCompetitions";
import { useStudentsByGrade } from "@/hooks/useStudents";
import { useHouses } from "@/hooks/useHouses";
import { cn } from "@/lib/utils";
import { Competition, CompetitionResult } from "@/types/models";

import { useToast } from "@/components/ui/use-toast";

export default function HouseResultsPage() {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const [year] = useState(currentYear);
  const { data: grades = [] } = useGrades();
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const { data: competitions = [] } = useCompetitions(year);
  const [competitionId, setCompetitionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Helper to get ID
  const getId = (doc: any) => doc.id || doc._id;

  // Set default competition
  useEffect(() => {
    if (!competitionId && competitions.length > 0) {
      setCompetitionId(getId(competitions[0]));
    }
  }, [competitions, competitionId]);

  const selectedCompetition = useMemo(
    () => competitions.find((c) => getId(c) === competitionId),
    [competitions, competitionId]
  );

  // Fetch Data
  const { data: students = [], isLoading: studentsLoading } = useStudentsByGrade(
    selectedGrade || "", // Fetch all if no grade selected? No, hook requires grade.
    year
  );
  
  const { data: houses = [], isLoading: housesLoading } = useHouses();

  const registrationFilters = useMemo(
    () => ({
      competitionId: competitionId || undefined,
      gradeId: selectedCompetition?.scope === 'grade' ? selectedGrade || undefined : undefined,
      year,
    }),
    [competitionId, selectedGrade, year, selectedCompetition]
  );

  const { data: registrations = [], isLoading: regLoading } =
    useCompetitionRegistrations(registrationFilters);

  const { data: results = [], isLoading: resultsLoading } = useCompetitionResults(
    competitionId || "",
    year
  );

  const createResult = useCreateCompetitionResult(competitionId || "", year);
  const deleteResult = useDeleteCompetitionResult(competitionId || "", year);

  // Filter students to show only registered ones
  const registeredStudents = useMemo(() => {
    if (!competitionId) return [];
    
    let filtered = registrations;

    if (selectedGrade && selectedCompetition?.scope !== 'grade') {
        filtered = filtered.filter(r => r.gradeId === selectedGrade);
    }

    if (search) {
        const lower = search.toLowerCase();
        filtered = filtered.filter(r => {
            const s = r.studentId as any; // Populated
            return (
                (s.nameWithInitialsSi && s.nameWithInitialsSi.toLowerCase().includes(lower)) ||
                s.admissionNumber?.includes(lower)
            );
        });
    }
    
    return filtered;
  }, [registrations, search, competitionId, selectedGrade, selectedCompetition]);

  // Helper to get student ID (string) from populated or unpopulated studentId field
  const getStudentId = (doc: any) => {
    if (!doc) return null;
    if (typeof doc === 'string') return doc;
    return doc._id || doc.id;
  };

  const handleToggleResult = async (studentId: string, place: 1 | 2 | 3 | 4 | 5) => {
    if (!competitionId) return;

    // Check if student already has a result
    const existingResult = results.find((r) => getStudentId(r.studentId) === studentId && r.place !== 0);

    // If clicking the same place, remove it
    if (existingResult && existingResult.place === place) {
      await deleteResult.mutateAsync(existingResult.id || (existingResult as any)._id);
      return;
    }

    if (existingResult) {
      await deleteResult.mutateAsync(existingResult.id || (existingResult as any)._id);
    }

    // Find registration to get houseId
    const registration = registrations.find((r) => (r.studentId as any).id === studentId || r.studentId === studentId);
    const houseId = registration?.houseId;
    const gradeId = registration?.gradeId;

    await createResult.mutateAsync({
      competitionId,
      year,
      results: [
        {
          place,
          studentId,
          houseId: houseId || undefined,
          gradeId: gradeId,
        },
      ],
    });
  };

  const handleTeamPlace = async (houseId: string, place: 1 | 2 | 3) => {
    if (!competitionId) return;
    
    // Check if this house already has a place
    const existingResult = results.find(r => r.houseId === houseId && r.place === place && !r.studentId);
    
    if (existingResult) {
        await deleteResult.mutateAsync(existingResult.id);
        return;
    }

    // Check if another house has this place (exclusive)
    const placeHolder = results.find(r => r.place === place && !r.studentId);
    if (placeHolder) {
        await deleteResult.mutateAsync(placeHolder.id);
    }

    await createResult.mutateAsync({
        competitionId,
        year,
        results: [{
            place,
            houseId,
            gradeId: undefined // Team results usually apply to the house, not a specific grade? Or maybe the grade context matters.
        }]
    });
  };

  const handlePersonalAward = async (awardName: string, studentId: string) => {
    if (!competitionId) return;

    // Find the special result entry for personal awards (place 0)
    let awardResult = results.find(r => r.place === 0);
    
    let currentWinners = awardResult?.personalAwardWinners || [];
    
    // Remove existing winner for this award
    currentWinners = currentWinners.filter(w => w.awardName !== awardName);
    
    if (studentId) {
        const reg = registrations.find(r => (r.studentId as any).id === studentId || r.studentId === studentId);
        currentWinners.push({
            awardName,
            studentId,
            houseId: reg?.houseId || undefined
        });
    }

    await createResult.mutateAsync({
        competitionId,
        year,
        results: [{
            place: 0,
            personalAwardWinners: currentWinners
        }]
    });
  };

  const handleSaveAll = () => {
    toast({
      title: "Results Finalized",
      description: "Competition results have been successfully recorded.",
    });
  };

  const loading = resultsLoading || housesLoading || regLoading;
  const PLACES = [1, 2, 3, 4, 5] as const;

  return (
    <LayoutController showMainMenu showHorizontalToolbar showSidebar>
      <HouseMeetsMenu />
      <CompetitionSidebar 
        competitions={competitions} 
        selectedId={competitionId} 
        onSelect={setCompetitionId} 
      />

      <DynamicPageHeader
        title="Competition Results"
        subtitle="Record results for registered students."
        icon={Medal}
        actions={[
          {
            type: "select",
            props: {
              label: "Year",
              value: year.toString(),
              onValueChange: () => {},
              options: [{ label: year.toString(), value: year.toString() }],
            },
          },
          {
            type: "select",
            props: {
              label: "Grade",
              value: selectedGrade || "",
              onValueChange: setSelectedGrade,
              options: grades.map(g => ({ label: g.nameEn, value: g.id })),
              placeholder: "Select Grade",
            },
          },
          {
            type: "search",
            props: {
              value: search,
              onChange: setSearch,
              placeholder: "Search students...",
            },
          },
          {
            type: "button",
            props: {
              variant: "default",
              children: "Save & Finalize",
              onClick: handleSaveAll,
            },
          },
        ]}
      />


      <div className="flex h-[calc(100vh-140px)]">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">


          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <Loader className="h-6 w-6 animate-spin text-slate-400" />
                </div>
            ) : !selectedCompetition ? (
                <div className="text-center text-slate-500 mt-10">Select a competition</div>
            ) : (
                <>
                    {/* Team Results Section */}
                    {selectedCompetition.participationType === 'team' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* House Places */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">House Places</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {houses.map(house => {
                                            const result = results.find(r => r.houseId === getId(house) && r.place > 0 && !r.studentId);
                                            return (
                                                <div key={getId(house)} className="flex items-center justify-between p-2 border rounded-md bg-white">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: house.color }} />
                                                        <span className="font-medium">{house.nameSi || house.nameEn}</span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3].map(p => (
                                                            <Button
                                                                key={p}
                                                                size="sm"
                                                                variant={result?.place === p ? "default" : "outline"}
                                                                className={cn(
                                                                    "w-8 h-8 p-0 rounded-full",
                                                                    result?.place === p && "bg-amber-500 hover:bg-amber-600 border-amber-600"
                                                                )}
                                                                onClick={() => handleTeamPlace(getId(house), p as 1|2|3)}
                                                            >
                                                                {p}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Personal Awards */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Personal Awards</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {selectedCompetition.personalAwards?.map((award, idx) => {
                                            const awardResult = results.find(r => r.place === 0);
                                            const winner = awardResult?.personalAwardWinners?.find(w => w.awardName === award);
                                            
                                            return (
                                                <div key={idx} className="space-y-2">
                                                    <label className="text-sm font-medium flex items-center gap-2">
                                                        <Award className="h-4 w-4 text-amber-500" />
                                                        {award}
                                                    </label>
                                                    <Select 
                                                        value={winner?.studentId || "none"} 
                                                        onValueChange={(v) => handlePersonalAward(award, v === "none" ? "" : v)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Winner" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">None</SelectItem>
                                                            {registrations.map(reg => {
                                                                const s = reg.studentId as any;
                                                                return (
                                                                    <SelectItem key={s.id || s._id} value={s.id || s._id}>
                                                                        {s.nameWithInitialsSi || s.firstNameEn} ({s.admissionNumber})
                                                                    </SelectItem>
                                                                );
                                                            })}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            );
                                        })}
                                        {(!selectedCompetition.personalAwards || selectedCompetition.personalAwards.length === 0) && (
                                            <div className="text-sm text-slate-500 italic">No personal awards defined.</div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Individual Results / Roster */}
                    {selectedCompetition.participationType === 'individual' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Student Results</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>House</TableHead>
                                            <TableHead className="text-center">Place</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {registeredStudents.map(reg => {
                                            const s = reg.studentId as any;
                                            const house = houses.find(h => getId(h) === reg.houseId);
                                            const result = results.find(r => getStudentId(r.studentId) === (s.id || s._id) && r.place > 0);

                                            return (
                                                <TableRow key={s.id || s._id}>
                                                    <TableCell>
                                                        <div className="font-medium">{s.nameWithInitialsSi || s.firstNameEn}</div>
                                                        <div className="text-xs text-slate-500">{s.admissionNumber}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {house ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: house.color }} />
                                                                {house.nameSi || house.nameEn}
                                                            </div>
                                                        ) : <span className="text-slate-400 italic">Independent</span>}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-center gap-1">
                                                            {PLACES.map(p => (
                                                                <Button
                                                                    key={p}
                                                                    size="sm"
                                                                    variant={result?.place === p ? "default" : "outline"}
                                                                    className={cn(
                                                                        "w-8 h-8 p-0 rounded-full",
                                                                        result?.place === p && "bg-amber-500 hover:bg-amber-600 border-amber-600"
                                                                    )}
                                                                    onClick={() => handleToggleResult(s.id || s._id, p)}
                                                                >
                                                                    {p}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                        {registeredStudents.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                                                    No students found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
          </div>
        </div>
      </div>
    </LayoutController>
  );
}
