"use client";

import { useState, useMemo, useEffect } from "react";
import type { Student } from "@/lib/school-data";
import type {
  CompetitionRegistration as CompRegType,
  CompetitionCategory,
  House,
  CompetitionMethod,
} from "@/lib/house-meet-data";
import {
  COMPETITION_METHODS,
  COMPETITION_CATEGORIES,
  HOUSES,
  getSectionLabel,
  getCategoriesByMethod,
  getHouseLabel,
} from "@/lib/house-meet-data";
import { GRADES } from "@/lib/school-data";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ResponsiveTabs,
} from "@/components/ui";
import { Trophy, Users, Search, Plus, Trash2, AlertCircle, X } from "lucide-react";

interface ImprovedHouseMeetRegistrationProps {
  students: Student[];
  registrations: CompRegType[];
  year: number;
  houseAssignments: Record<string, House | undefined>;
  onRegister: (studentId: string, category: CompetitionCategory, house?: House) => void;
  onUnregister: (registrationId: string) => void;
}

export function ImprovedHouseMeetRegistration({
  students,
  registrations,
  year,
  houseAssignments,
  onRegister,
  onUnregister,
}: ImprovedHouseMeetRegistrationProps) {
  const [selectedMethod, setSelectedMethod] = useState<CompetitionMethod | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CompetitionCategory | null>(null);
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Derived state
  const methodCategories = useMemo(
    () => (selectedMethod ? getCategoriesByMethod(selectedMethod) : []),
    [selectedMethod]
  );

  const categoryInfo = useMemo(
    () => COMPETITION_CATEGORIES.find((c) => c.value === selectedCategory) || null,
    [selectedCategory]
  );

  const eligibleGrades = useMemo(() => {
    if (!categoryInfo) return [];
    return categoryInfo.grades
      .map((g) => GRADES.find((gr) => gr.level === g))
      .filter((g): g is typeof GRADES[0] => !!g);
  }, [categoryInfo]);

  // Auto-select firsts if available
  useEffect(() => {
    if (methodCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(methodCategories[0].value);
    }
  }, [methodCategories, selectedCategory]);

  useEffect(() => {
    if (eligibleGrades.length > 0 && !selectedGradeId) {
      setSelectedGradeId(eligibleGrades[0].id);
    }
  }, [eligibleGrades, selectedGradeId]);

  // Data filtering
  const currentRegistrations = useMemo(() => {
    if (!selectedCategory || !selectedGradeId) return [];
    return registrations.filter(
      (r) =>
        r.category === selectedCategory &&
        r.year === year &&
        r.gradeId === selectedGradeId
    );
  }, [registrations, selectedCategory, selectedGradeId, year]);

  const availableStudents = useMemo(() => {
    if (!selectedCategory || !selectedGradeId) return [];
    const registeredIds = new Set(currentRegistrations.map((r) => r.studentId));
    return students.filter(
      (s) =>
        s.gradeId === selectedGradeId &&
        !registeredIds.has(s.id) &&
        (searchQuery === "" ||
          s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [students, selectedCategory, selectedGradeId, currentRegistrations, searchQuery]);

  const houseCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    HOUSES.forEach((h) => (counts[h.value] = 0));
    currentRegistrations.forEach((r) => {
      if (r.house) counts[r.house]++;
    });
    return counts;
  }, [currentRegistrations]);

  if (!selectedMethod && !selectedCategory) {
    // Initial state: select method
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COMPETITION_METHODS.map((method) => (
          <Card
            key={method.value}
            className="cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => setSelectedMethod(method.value)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{method.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">{method.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="space-y-4">
        {/* Method Toggle Bar */}
        <ResponsiveTabs
          items={COMPETITION_METHODS.map(m => ({ value: m.value, label: m.label }))}
          value={selectedMethod || ""}
          onValueChange={(v: string) => setSelectedMethod(v as any)}
        />

        {/* Category & Grade Selection */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Categories (Pills) */}
          <div className="flex-1 min-w-0">
             {methodCategories.length > 0 ? (
                <ResponsiveTabs
                  items={methodCategories.map(c => ({ 
                    value: c.value, 
                    label: `${c.label} (${getSectionLabel(c.section).split(" ")[0]})` 
                  }))}
                  value={selectedCategory || ""}
                  onValueChange={(v: string) => setSelectedCategory(v as any)}
                />
              ) : (
                <div className="text-sm text-slate-500 italic px-2">Select a competition method above</div>
              )}
          </div>

          {/* Grade Selector */}
          <div className="w-[180px] flex-shrink-0">
            <Select
              value={selectedGradeId || ""}
              onValueChange={setSelectedGradeId}
              disabled={!selectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                {eligibleGrades.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    Grade {g.level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {selectedCategory && selectedGradeId && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Available Students (Grouped by House) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Available Students</h3>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Accordion type="multiple" defaultValue={HOUSES.map(h => h.value)} className="w-full space-y-2">
                {HOUSES.map((house) => {
                  const houseStudents = availableStudents.filter(
                    (s) => houseAssignments[s.id] === house.value
                  );
                  const isHouseFull = (houseCounts[house.value] || 0) >= 2;
                  
                  if (houseStudents.length === 0) return null;

                  return (
                    <AccordionItem key={house.value} value={house.value} className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                      <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${house.color.replace("text-", "bg-")}`} />
                          <span className="font-semibold text-slate-700">{house.label}</span>
                          <Badge variant="secondary" className="ml-2">
                            {houseStudents.length} Eligible
                          </Badge>
                          {isHouseFull && (
                            <span className="ml-2 text-xs font-medium text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> Quota Full
                            </span>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-0 pb-0">
                        <div className="divide-y divide-slate-100 border-t border-slate-100">
                          {houseStudents.map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center justify-between px-4 py-2 hover:bg-slate-50/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-medium text-slate-600">
                                  {student.firstName[0]}{student.lastName[0]}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-900">
                                    {student.firstName} {student.lastName}
                                  </p>
                                  <p className="text-[10px] text-slate-500">
                                    Grade {GRADES.find(g => g.id === student.gradeId)?.level}
                                  </p>
                                </div>
                              </div>
                                <Button
                                  size="sm"
                                  variant={isHouseFull ? "secondary" : "default"}
                                  onClick={() => onRegister(student.id, selectedCategory!, isHouseFull ? undefined : house.value)}
                                  className="h-7 px-3 text-xs"
                                >
                                  {isHouseFull ? "Add Indep." : "Add"}
                                </Button>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
                
                {/* Independent / Unassigned Students */}
                {availableStudents.some(s => !houseAssignments[s.id]) && (
                   <AccordionItem value="independent" className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                      <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-slate-400" />
                          <span className="font-semibold text-slate-700">Independent / Unassigned</span>
                          <Badge variant="secondary" className="ml-2">
                            {availableStudents.filter(s => !houseAssignments[s.id]).length} Eligible
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-0 pb-0">
                        <div className="divide-y divide-slate-100 border-t border-slate-100">
                          {availableStudents.filter(s => !houseAssignments[s.id]).map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center justify-between px-4 py-2 hover:bg-slate-50/50 transition-colors"
                            >
                               <div className="flex items-center gap-3">
                                <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-medium text-slate-600">
                                  {student.firstName[0]}{student.lastName[0]}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-900">
                                    {student.firstName} {student.lastName}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onRegister(student.id, selectedCategory!, undefined)}
                                className="h-7 px-3 text-xs"
                              >
                                Add Indep.
                              </Button>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                   </AccordionItem>
                )}
              </Accordion>
            </div>
          </div>

          {/* Right: House Rosters & Quotas */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="h-full border-slate-200 shadow-md">
              <CardHeader className="pb-3 bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Event Roster
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <Accordion type="multiple" defaultValue={HOUSES.map(h => h.value)} className="w-full space-y-2">
                  {HOUSES.map((house) => {
                    const houseRegistrations = currentRegistrations.filter(r => r.house === house.value);
                    const count = houseRegistrations.length;
                    const isFull = count >= 2;
                    
                    return (
                      <AccordionItem key={house.value} value={house.value} className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                        <AccordionTrigger className="px-3 py-2 hover:bg-slate-50 hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-2">
                            <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${house.color.replace("text-", "bg-")}`} />
                               <span className="font-medium text-sm text-slate-700">{house.label}</span>
                            </div>
                            <span className={`text-xs font-bold ${isFull ? "text-red-600" : "text-slate-500"}`}>
                              {count}/2
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-2 pb-2 pt-0">
                          <div className="space-y-1 pt-1">
                            {houseRegistrations.length === 0 ? (
                              <div className="text-xs text-slate-400 text-center py-1">Empty</div>
                            ) : (
                              houseRegistrations.map(reg => (
                                <div key={reg.id} className="group flex items-center justify-between bg-slate-50 px-2 py-1.5 rounded border border-slate-100 text-sm">
                                  <span className="truncate max-w-[120px]">{reg.firstName} {reg.lastName}</span>
                                  <button
                                    onClick={() => onUnregister(reg.id)}
                                    className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                  
                  {/* Independent Roster */}
                  <AccordionItem value="independent" className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                    <AccordionTrigger className="px-3 py-2 hover:bg-slate-50 hover:no-underline">
                       <div className="flex items-center justify-between w-full pr-2">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-slate-400" />
                             <span className="font-medium text-sm text-slate-700">Independent</span>
                          </div>
                          <span className="text-xs font-bold text-slate-500">
                            {currentRegistrations.filter(r => !r.house).length}
                          </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pb-2 pt-0">
                       <div className="space-y-1 pt-1">
                          {currentRegistrations.filter(r => !r.house).map(reg => (
                                <div key={reg.id} className="group flex items-center justify-between bg-slate-50 px-2 py-1.5 rounded border border-slate-100 text-sm">
                                  <span className="truncate max-w-[120px]">{reg.firstName} {reg.lastName}</span>
                                  <button
                                    onClick={() => onUnregister(reg.id)}
                                    className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                          ))}
                           {currentRegistrations.filter(r => !r.house).length === 0 && (
                              <div className="text-xs text-slate-400 text-center py-1">Empty</div>
                           )}
                       </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
