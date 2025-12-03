"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader, Trophy, Users, Search, AlertCircle, X, ChevronDown } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { HouseMeetsMenu } from "@/components/house-meets/house-meets-menu";
import { CompetitionSidebar } from "@/components/house-meets/competition-sidebar";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui";
import { useGrades } from "@/hooks/useGrades";
import { useStudentsByGrade } from "@/hooks/useStudents";
import {
  useCompetitionRegistrations,
  useRegisterForCompetition,
  useDeleteCompetitionRegistration,
  useCompetitions,
  useCreateCompetitionTeam,
  useCompetitionTeams,
} from "@/hooks/useCompetitions";
import type { CompetitionRegistration, CompetitionTeam } from "@/types/models";
import { useHouseAssignments } from "@/hooks/useHouseAssignments";
import { useHouses } from "@/hooks/useHouses";
import { cn } from "@/lib/utils";

export default function HouseRegistrationsPage() {
  const currentYear = new Date().getFullYear();
  const [year] = useState(currentYear);
  const { data: grades = [] } = useGrades();
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [competitionId, setCompetitionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Team Registration State
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [teamName, setTeamName] = useState("");

  // Helper to get ID
  const getId = (doc: any) => doc.id || doc._id;

  // 1. Fetch Competitions
  const { data: competitions = [] } = useCompetitions(year);

  // Auto-select first competition
  useEffect(() => {
    if (!competitionId && competitions.length > 0) {
      setCompetitionId(getId(competitions[0]));
    }
  }, [competitions, competitionId]);

  // Auto-select first grade
  useEffect(() => {
    if (!selectedGrade && grades.length > 0) setSelectedGrade(grades[0].id);
  }, [grades, selectedGrade]);

  const selectedCompetition = useMemo(
    () => competitions.find((c) => getId(c) === competitionId),
    [competitions, competitionId]
  );
  const isTeamMode = selectedCompetition?.participationType === "team";

  // 2. Fetch Data
  const { data: houses = [], isLoading: housesLoading } = useHouses();
  const { data: students = [], isLoading: studentsLoading } = useStudentsByGrade(
    selectedGrade || "",
    year
  );
  const { data: assignments = [] } = useHouseAssignments({
    gradeId: selectedGrade || undefined,
    year,
  });

  // 3. Map Student -> House
  const houseByStudent = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    assignments?.forEach((a) => {
      map[a.studentId] = a.houseId;
    });
    return map;
  }, [assignments]);

  // 4. Fetch Registrations
  const registrationFilters = useMemo(
    () => ({
      competitionId: competitionId || undefined,
      gradeId: (selectedCompetition?.scope === "section" || selectedCompetition?.scope === "open") ? undefined : (selectedGrade || undefined),
      year,
    }),
    [competitionId, selectedGrade, year, selectedCompetition]
  );

  const { data: registrations = [], isLoading: regLoading } =
    useCompetitionRegistrations(registrationFilters);

  const registerMutation = useRegisterForCompetition(registrationFilters);
  const deleteMutation = useDeleteCompetitionRegistration(registrationFilters);

  // 5. Calculate Quotas & Available Students
  const registeredIds = useMemo(() => {
    const ids = new Set<string>();
    registrations.forEach((r) => {
        const sid = typeof r.studentId === 'object' ? (r.studentId as any)._id || (r.studentId as any).id : r.studentId;
        ids.add(sid);
    });
    return ids;
  }, [registrations]);

  const availableStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          !registeredIds.has(s.id) &&
          (search === "" ||
            s.firstNameEn.toLowerCase().includes(search.toLowerCase()) ||
            s.lastNameEn.toLowerCase().includes(search.toLowerCase()))
      ),
    [students, registeredIds, search]
  );

  const houseCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    houses.forEach((h) => (counts[getId(h)] = 0));
    
    registrations.forEach((r) => {
      if (r.houseId && (r.mode === "house" || !r.mode)) {
        counts[r.houseId] = (counts[r.houseId] || 0) + 1;
      }
    });
    return counts;
  }, [registrations, houses]);

  const handleRegister = async (studentId: string, forceIndependent = false) => {
    if (!competitionId || !selectedGrade) return;
    const houseId = houseByStudent[studentId];
    const mode = !houseId || forceIndependent ? "independent" : "house";

    await registerMutation.mutateAsync({
      competitionId,
      studentId,
      gradeId: selectedGrade,
      houseId: mode === "independent" ? null : (houseId || null),
      mode,
      year,
    });
  };

  const loading = studentsLoading || regLoading || housesLoading;
  
  // Determine Quota
  const HOUSE_QUOTA = useMemo(() => {
      if (selectedCompetition?.participationType === 'team') {
          return selectedCompetition.teamConfig?.maxSize || 2;
      }
      return 2; // Default for individual, or fetch from rules if needed
  }, [selectedCompetition]);

  return (
    <LayoutController showMainMenu showHorizontalToolbar showSidebar>
      <HouseMeetsMenu />
      <CompetitionSidebar 
        competitions={competitions} 
        selectedId={competitionId} 
        onSelect={setCompetitionId} 
      />

      <DynamicPageHeader
        title="Event Registrations"
        subtitle="Register students for competitions with house quotas."
        icon={Trophy}
      />

      <div className="p-6 h-[calc(100vh-140px)] flex gap-6">
        {/* Right Content: Registration Area */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 h-full">
            {/* Filters */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 shrink-0">
            <div>
                <label className="text-sm text-muted-foreground">Grade</label>
                <Select value={selectedGrade || ""} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                    {grades.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                        {g.nameSi || g.nameEn}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <div>
                <label className="text-sm text-muted-foreground">Search students</label>
                <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search by name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
                </div>
            </div>
            </div>

            {/* Registration Panels */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Available Students */}
            <Card className="lg:col-span-8 flex flex-col border-slate-200 shadow-sm overflow-hidden h-full">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 py-3 min-h-[50px]">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    Available Students
                    <Badge variant="secondary" className="bg-slate-200 text-slate-700 ml-2">
                    {availableStudents.length}
                    </Badge>
                    {isTeamMode && (
                    <span className="ml-auto text-xs font-normal text-slate-500">
                        Max {HOUSE_QUOTA} per house
                    </span>
                    )}
                </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-y-auto bg-slate-50/30">
                {loading ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Loader className="mr-2 h-5 w-5 animate-spin" />
                    Loading data...
                    </div>
                ) : !competitionId || !selectedGrade ? (
                    <div className="flex h-full items-center justify-center text-slate-500">
                    Select competition and grade to start
                    </div>
                ) : (
                    <div className="p-4 space-y-4">
                    <Accordion
                        type="multiple"
                        defaultValue={houses.map((h) => getId(h)).concat("independent")}
                        className="w-full space-y-3"
                    >
                        {houses.map((house) => {
                        const houseId = getId(house);
                        const houseStudents = availableStudents.filter(
                            (s) => houseByStudent[s.id] === houseId
                        );
                        const currentCount = houseCounts[houseId] || 0;
                        const isHouseFull = currentCount >= HOUSE_QUOTA;

                        if (houseStudents.length === 0) return null;

                        return (
                            <AccordionItem
                            key={houseId}
                            value={houseId}
                            className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm"
                            >
                            <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 hover:no-underline">
                                <div className="flex items-center gap-3 w-full">
                                <div
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ backgroundColor: house.color }}
                                />
                                <span className="font-semibold text-slate-800">
                                    {house.nameSi || house.nameEn}
                                </span>
                                <Badge variant="secondary" className="ml-auto mr-2">
                                    {houseStudents.length} Available
                                </Badge>
                                {isHouseFull ? (
                                    <span className="text-xs font-bold text-red-600 flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                    <AlertCircle className="h-3 w-3" /> Quota Full ({currentCount}/{HOUSE_QUOTA})
                                    </span>
                                ) : (
                                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                    {currentCount}/{HOUSE_QUOTA} Filled
                                    </span>
                                )}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-0 pb-0 border-t border-slate-100">
                                <div className="divide-y divide-slate-100">
                                {houseStudents.map((student) => (
                                    <div
                                    key={student.id}
                                    className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition-colors group"
                                    >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 shrink-0">
                                        {(student.firstNameSi || student.firstNameEn).charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">
                                            {student.firstNameSi || student.firstNameEn} {student.lastNameSi || student.lastNameEn}
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            #{student.admissionNumber}
                                        </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={isHouseFull ? "outline" : "default"}
                                        onClick={() => handleRegister(student.id, isHouseFull)}
                                        disabled={registerMutation.isPending}
                                        className={cn(
                                        "h-7 px-3 text-xs",
                                        isHouseFull && "text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                                        )}
                                    >
                                        {isHouseFull ? "Add Independent" : "Add to House"}
                                    </Button>
                                    </div>
                                ))}
                                </div>
                            </AccordionContent>
                            </AccordionItem>
                        );
                        })}

                        {/* Independent / Unassigned Students */}
                        {availableStudents.some((s) => !houseByStudent[s.id]) && (
                        <AccordionItem
                            value="independent"
                            className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm"
                        >
                            <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 hover:no-underline">
                            <div className="flex items-center gap-3 w-full">
                                <div className="w-3 h-3 rounded-full bg-slate-400 shrink-0" />
                                <span className="font-semibold text-slate-800">
                                Independent / Unassigned
                                </span>
                                <Badge variant="secondary" className="ml-auto mr-2">
                                {availableStudents.filter((s) => !houseByStudent[s.id]).length}{" "}
                                Available
                                </Badge>
                            </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-0 pb-0 border-t border-slate-100">
                            <div className="divide-y divide-slate-100">
                                {availableStudents
                                .filter((s) => !houseByStudent[s.id])
                                .map((student) => (
                                    <div
                                    key={student.id}
                                    className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition-colors"
                                    >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 shrink-0">
                                        {(student.firstNameSi || student.firstNameEn).charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">
                                            {student.firstNameSi || student.firstNameEn} {student.lastNameSi || student.lastNameEn}
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            #{student.admissionNumber}
                                        </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRegister(student.id, true)}
                                        disabled={registerMutation.isPending}
                                        className="h-7 px-3 text-xs"
                                    >
                                        Add Independent
                                    </Button>
                                    </div>
                                ))}
                            </div>
                            </AccordionContent>
                        </AccordionItem>
                        )}
                    </Accordion>
                    </div>
                )}
                </CardContent>
            </Card>

            {/* Right: Roster */}
            <Card className="lg:col-span-4 flex flex-col border-slate-200 shadow-sm overflow-hidden h-full">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 py-3 min-h-[50px]">
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Event Roster
                </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-y-auto bg-white">
                <div className="p-4 space-y-4">
                    <Accordion
                    type="multiple"
                    defaultValue={houses.map((h) => getId(h)).concat("independent-roster")}
                    className="w-full space-y-2"
                    >
                    {houses.map((house) => {
                        const houseId = getId(house);
                        const houseRegistrations = registrations.filter(r => r.houseId === houseId && r.mode === "house");
                        
                        const count = houseRegistrations.length;
                        const isFull = count >= HOUSE_QUOTA;

                        return (
                        <AccordionItem
                            key={houseId}
                            value={houseId}
                            className="border border-slate-200 rounded-lg bg-white overflow-hidden"
                        >
                            <AccordionTrigger className="px-3 py-2 hover:bg-slate-50 hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-2">
                                <div className="flex items-center gap-2">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: house.color }}
                                />
                                <span className="font-medium text-sm text-slate-700">
                                    {house.nameSi || house.nameEn}
                                </span>
                                </div>
                                <span
                                className={cn(
                                    "text-xs font-bold",
                                    isFull ? "text-red-600" : "text-slate-500"
                                )}
                                >
                                {count}/{HOUSE_QUOTA}
                                </span>
                            </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-2 pb-2 pt-0">
                            <div className="space-y-1 pt-1">
                                {houseRegistrations.length === 0 ? (
                                <div className="text-xs text-slate-400 text-center py-1">
                                    Empty
                                </div>
                                ) : (
                                houseRegistrations.map((reg: CompetitionRegistration) => {
                                    // Use populated student data if available, otherwise fallback to lookup (though backend should now populate)
                                    const student = typeof reg.studentId === 'object' ? reg.studentId : students.find((s) => s.id === reg.studentId);
                                    
                                    return (
                                    <div
                                        key={getId(reg)}
                                        className="group flex items-center justify-between bg-slate-50 px-2 py-1.5 rounded border border-slate-100 text-sm"
                                    >
                                        <span className="truncate max-w-[150px]">
                                        {student
                                            ? `${(student as any).firstNameSi || student.firstNameEn} ${(student as any).lastNameSi || student.lastNameEn}`
                                            : "Loading..."}
                                        </span>
                                        <button
                                        onClick={() => deleteMutation.mutate(getId(reg))}
                                        className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                        <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    );
                                })
                                )}
                            </div>
                            </AccordionContent>
                        </AccordionItem>
                        );
                    })}

                      {/* Independent Roster */}
                    <AccordionItem
                      value="independent-roster"
                      className="border border-slate-200 rounded-lg bg-white overflow-hidden"
                    >
                      <AccordionTrigger className="px-3 py-2 hover:bg-slate-50 hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-400" />
                            <span className="font-medium text-sm text-slate-700">
                              Independent
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-500">
                            {registrations.filter((r) => r.mode === "independent" || !r.houseId).length}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-2 pb-2 pt-0">
                        <div className="space-y-1 pt-1">
                          {registrations.filter((r) => r.mode === "independent" || !r.houseId).length === 0 ? (
                            <div className="text-xs text-slate-400 text-center py-1">
                              Empty
                            </div>
                          ) : (
                            registrations
                              .filter((r) => r.mode === "independent" || !r.houseId)
                              .map((reg: CompetitionRegistration) => {
                                const student = typeof reg.studentId === 'object' ? reg.studentId : students.find((s) => s.id === reg.studentId);
                                return (
                                  <div
                                    key={getId(reg)}
                                    className="group flex items-center justify-between bg-slate-50 px-2 py-1.5 rounded border border-slate-100 text-sm"
                                  >
                                    <span className="truncate max-w-[150px]">
                                      {student
                                        ? `${(student as any).firstNameSi || student.firstNameEn} ${(student as any).lastNameSi || student.lastNameEn}`
                                        : "Loading..."}
                                    </span>
                                    <button
                                      onClick={() => deleteMutation.mutate(getId(reg))}
                                      className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                );
                              })
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    </Accordion>
                </div>
                </CardContent>
            </Card>
            </div>
        </div>
      </div>
    </LayoutController>
  );
}
