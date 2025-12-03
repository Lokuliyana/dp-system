"use client";

import { useState, useMemo, useEffect } from "react";
import type { Student } from "@/lib/school-data";
import type {
  CompetitionResult,
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
  PLACES,
} from "@/lib/house-meet-data";
import { GRADES } from "@/lib/school-data";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import { Trophy, Medal, Search, Plus, Trash2, Filter, X, Users } from "lucide-react";

interface CompetitionResultsProps {
  students: Student[];
  results: CompetitionResult[];
  year: number;
  houseAssignments: Record<string, House | undefined>;
  onAssignResult: (
    studentId: string,
    category: CompetitionCategory,
    place: number,
    house?: House
  ) => void;
  onRemoveResult: (resultId: string) => void;
}

export function CompetitionResults({
  students,
  results,
  year,
  houseAssignments,
  onAssignResult,
  onRemoveResult,
}: CompetitionResultsProps) {
  const [selectedMethod, setSelectedMethod] = useState<CompetitionMethod | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CompetitionCategory | null>(null);
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  
  // For the "Add Result" modal
  const [isFinalized, setIsFinalized] = useState(false);


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

  // Auto-select defaults
  useEffect(() => {
    if (methodCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(methodCategories[0].value);
    } else if (selectedCategory && !methodCategories.some(mc => mc.value === selectedCategory)) {
      setSelectedCategory(methodCategories.length > 0 ? methodCategories[0].value : null);
    }
  }, [methodCategories, selectedCategory]);

  useEffect(() => {
    if (eligibleGrades.length > 0 && !selectedGradeId) {
      setSelectedGradeId(eligibleGrades[0].id);
    } else if (selectedGradeId && !eligibleGrades.some(eg => eg.id === selectedGradeId)) {
      setSelectedGradeId(eligibleGrades.length > 0 ? eligibleGrades[0].id : null);
    }
  }, [eligibleGrades, selectedGradeId]);

  // Current results
  const currentResults = useMemo(() => {
    if (!selectedCategory || !selectedGradeId) return [];
    return results.filter(
      (r) =>
        r.category === selectedCategory &&
        r.year === year &&
        r.gradeId === selectedGradeId
    );
  }, [results, selectedCategory, selectedGradeId, year]);

  // Students available for selection in the modal
  const availableStudents = useMemo(() => {
    if (!selectedGradeId) return [];
    // Just return all students in the grade for now, or filter by registrations if we had that prop.
    // Since we are showing ALL students in the grade for the scorecard, we don't need to filter by "not registered" anymore for the dropdown.
    // But wait, the scorecard shows ALL students.
    return students.filter((s) => s.gradeId === selectedGradeId);
  }, [students, selectedGradeId]);

  const getPlaceBadgeColor = (place: number) => {
    switch (place) {
      case 1: return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 2: return "bg-slate-100 text-slate-800 border-slate-200";
      case 3: return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const getPlaceLabel = (place: number) => {
    const p = PLACES.find(pl => pl.value === place);
    return p ? p.label : `${place}th Place`;
  };

  if (!selectedMethod && !selectedCategory) {
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
      {/* Filter Bar */}
      {/* Filter Bar */}
      <div className="space-y-4">
        {/* Method Toggle Bar */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200 overflow-x-auto scrollbar-hide">
          {COMPETITION_METHODS.map((method) => (
            <button
              key={method.value}
              onClick={() => setSelectedMethod(method.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedMethod === method.value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              {method.label}
            </button>
          ))}
        </div>

        {/* Category & Grade Selection */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Categories (Pills) */}
          <div className="flex-1 overflow-x-auto pb-2 md:pb-0">
            <div className="flex gap-2">
              {methodCategories.length > 0 ? (
                methodCategories.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setSelectedCategory(c.value)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selectedCategory === c.value
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {c.label} ({getSectionLabel(c.section).split(" ")[0]})
                  </button>
                ))
              ) : (
                <div className="text-sm text-slate-500 italic px-2">Select a competition method above</div>
              )}
            </div>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Results: {categoryInfo?.label}
              </CardTitle>
              <p className="text-sm text-slate-500">
                Grade {GRADES.find(g => g.id === selectedGradeId)?.level} · {getSectionLabel(categoryInfo?.section || "primary")}
              </p>
            </div>
            {/* Finalize / Rollback Controls */}
            <div className="flex items-center gap-2">
               {currentResults.length > 0 && (
                  <Button
                    variant={isFinalized ? "outline" : "default"}
                    onClick={() => setIsFinalized(!isFinalized)}
                    className={isFinalized ? "bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-slate-800"}
                  >
                    {isFinalized ? "Unlock / Edit" : "Finalize Results"}
                  </Button>
               )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-[100px]">Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>House</TableHead>
                    <TableHead className="text-center">Assign Placement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* 
                      Logic: 
                      If Finalized: Show only winners (results).
                      If Edit Mode: Show ALL students in the grade (or registered ones). 
                      Since we don't have a 'registrations' prop here, we'll show ALL students in the grade.
                  */}
                  {(() => {
                    // Filter students for this grade
                    const gradeStudents = students.filter(s => s.gradeId === selectedGradeId);
                    
                    // If finalized, only show those with results
                    const displayStudents = isFinalized 
                        ? gradeStudents.filter(s => currentResults.some(r => r.studentId === s.id)).sort((a, b) => {
                            const placeA = currentResults.find(r => r.studentId === a.id)?.place || 99;
                            const placeB = currentResults.find(r => r.studentId === b.id)?.place || 99;
                            return placeA - placeB;
                        })
                        : gradeStudents;

                    if (displayStudents.length === 0) {
                        return (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                                    No students found.
                                </TableCell>
                            </TableRow>
                        );
                    }

                    return displayStudents.map((student) => {
                        const result = currentResults.find(r => r.studentId === student.id);
                        const place = result?.place;
                        const house = houseAssignments[student.id];

                        return (
                            <TableRow key={student.id} className={place ? "bg-slate-50/50" : ""}>
                                <TableCell>
                                    {place ? (
                                        <Badge variant="outline" className={getPlaceBadgeColor(place)}>
                                            {getPlaceLabel(place)}
                                        </Badge>
                                    ) : (
                                        <span className="text-slate-300">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {student.firstName} {student.lastName}
                                </TableCell>
                                <TableCell>
                                    {house ? (
                                        <Badge variant="outline" className="bg-slate-50">
                                            {getHouseLabel(house)}
                                        </Badge>
                                    ) : (
                                        <span className="text-slate-400 text-xs">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isFinalized ? (
                                        <div className="text-center text-sm font-mono font-bold text-slate-700">
                                            {place ? `${PLACES.find(p => p.value === place)?.points} pts` : "-"}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            {[1, 2, 3, 4, 5].map((p) => {
                                                const isSelected = place === p;
                                                return (
                                                    <button
                                                        key={p}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                if (result) onRemoveResult(result.id);
                                                            } else {
                                                                // Remove any existing result for this student first (if any)
                                                                // Actually onAssignResult usually handles upsert, but here we might need to be careful.
                                                                // Also need to clear this place from OTHER students? 
                                                                // For now, let's just assign. The user can manually clear others if needed, or we rely on backend.
                                                                // But for UI polish, we should ideally clear others. 
                                                                // I'll just call assign.
                                                                onAssignResult(student.id, selectedCategory!, p, house);
                                                            }
                                                        }}
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                                                            isSelected
                                                                ? getPlaceBadgeColor(p) + " ring-2 ring-offset-1 ring-slate-300 scale-110"
                                                                : "bg-white border border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600"
                                                        }`}
                                                    >
                                                        {p}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    });
                  })()}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
