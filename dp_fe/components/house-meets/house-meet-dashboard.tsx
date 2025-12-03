"use client";

import { useState } from "react";
import type { Student } from "@/lib/school-data";
import type {
  HouseAssignment,
  CompetitionRegistration as CompetitionRegType,
  CompetitionResult,
  House,
} from "@/lib/house-meet-data";
import {
  HOUSES,
  COMPETITION_CATEGORIES,
  getHouseLabel,
} from "@/lib/house-meet-data";
import { GRADES } from "@/lib/school-data";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { Trophy, Users, Medal, History } from "lucide-react";

import { HouseAssignmentManager } from "./house-assignment-manager";
import { CompetitionResults } from "./competition-results";
import { ImprovedHouseMeetRegistration } from "./improved-house-meet-registration";
import { Header } from "@/components/ui";

interface HouseMeetDashboardProps {
  students: Student[];
}

export function HouseMeetDashboard({ students }: HouseMeetDashboardProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [houseAssignments, setHouseAssignments] = useState<HouseAssignment[]>(
    []
  );
  const [registrations, setRegistrations] = useState<CompetitionRegType[]>([]);
  const [results, setResults] = useState<CompetitionResult[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  const handleAssignHouse = (studentId: string, house: House) => {
    setHouseAssignments((prev) => {
      const idx = prev.findIndex(
        (a) => a.studentId === studentId && a.year === year
      );
      const assignment: HouseAssignment = {
        studentId,
        house,
        year,
        assignedDate: new Date().toISOString().split("T")[0],
      };
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = assignment;
        return copy;
      }
      return [...prev, assignment];
    });
  };

  const handleRegisterStudent = (
    studentId: string,
    category: string,
    house?: House
  ) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const reg: CompetitionRegType = {
      id: `${studentId}-${category}-${Date.now()}`,
      studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      gradeId: student.gradeId,
      category: category as any,
      house,
      registeredDate: new Date().toISOString().split("T")[0],
      year,
    };

    setRegistrations((prev) => [...prev, reg]);
  };

  const handleUnregister = (registrationId: string) => {
    setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));
  };

  const handleAddResult = (result: CompetitionResult) => {
    setResults((prev) => [...prev, result]);
  };

  const handleRemoveResult = (resultId: string) => {
    setResults((prev) => prev.filter((r) => r.id !== resultId));
  };

  const houseAssignmentMap = houseAssignments
    .filter((a) => a.year === year)
    .reduce((acc, a) => {
      acc[a.studentId] = a.house;
      return acc;
    }, {} as Record<string, House>);

  const houseStatistics = HOUSES.map((house) => {
    const members = houseAssignments.filter(
      (a) => a.house === house.value && a.year === year
    ).length;
    const wins = results.filter(
      (r) => r.house === house.value && r.year === year && r.place === 1
    ).length;
    return { house: house.value, label: house.label, members, wins };
  });

  return (
    <div className="space-y-6">
      {/* Section header */}
      <Header
        title="House Meets"
        description="Manage house assignments, registrations, and competition results for the annual house meet."
        variant="page"
        actions={
          <div className="flex gap-2">
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <Button
                key={y}
                onClick={() => setYear(y)}
                variant={year === y ? "default" : "outline"}
                size="sm"
              >
                {y}
              </Button>
            ))}
          </div>
        }
      />

      {/* House overview cards */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {houseStatistics.map((stat) => {
            const meta = HOUSES.find((h) => h.value === stat.house);
            return (
              <Card key={stat.house} className={meta?.bgColor}>
                <CardContent className="pt-6">
                  <div className={`text-xl font-bold ${meta?.color}`}>
                    {stat.label}
                  </div>
                  <div className="mt-4 text-sm text-slate-700">
                    <div>Members: {stat.members}</div>
                    <div>1st Place Wins: {stat.wins}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Main tabs */}
      <section>
        <Tabs defaultValue="assignment" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assignment" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Assign Houses</span>
            </TabsTrigger>
            <TabsTrigger
              value="registration"
              className="flex items-center gap-2"
            >
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Registrations</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Medal className="h-4 w-4" />
              <span className="hidden sm:inline">Results</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          {/* Assign houses */}
          <TabsContent value="assignment" className="mt-4 space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {GRADES.map((grade) => (
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
            {selectedGrade && (
              <HouseAssignmentManager
                students={students}
                assignments={houseAssignments}
                year={year}
                gradeId={selectedGrade}
                onAssign={handleAssignHouse}
              />
            )}
          </TabsContent>

          {/* Registrations */}
          <TabsContent value="registration" className="mt-4">
            <ImprovedHouseMeetRegistration
              students={students}
              registrations={registrations}
              year={year}
              houseAssignments={houseAssignmentMap}
              onRegister={handleRegisterStudent}
              onUnregister={handleUnregister}
            />
          </TabsContent>

          {/* Results */}
          <TabsContent value="results" className="mt-4">
            <CompetitionResults
              results={results}
              year={year}
              onAddResult={handleAddResult}
              onRemoveResult={handleRemoveResult}
            />
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="mt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    House Members – {year}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {HOUSES.map((house) => {
                    const members = students.filter((s) =>
                      houseAssignments.find(
                        (a) =>
                          a.studentId === s.id &&
                          a.house === house.value &&
                          a.year === year
                      )
                    );
                    return (
                      <div
                        key={house.value}
                        className={`${house.bgColor} rounded-lg p-4`}
                      >
                        <div className={`${house.color} mb-2 font-semibold`}>
                          {house.label}
                        </div>
                        <div className="max-h-40 space-y-1 overflow-y-auto text-sm">
                          {members.length ? (
                            members.map((m) => (
                              <div key={m.id}>
                                {m.firstName} {m.lastName}
                              </div>
                            ))
                          ) : (
                            <div className="text-slate-500 italic">
                              No members assigned
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Medal className="h-5 w-5" />
                    Competition Winners – {year}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {COMPETITION_CATEGORIES.map((cat) => {
                      const categoryWinners = results.filter(
                        (r) =>
                          r.category === cat.value &&
                          r.year === year &&
                          r.place === 1
                      );
                      return (
                        <div key={cat.value}>
                          <div className="mb-2 font-medium text-slate-900">
                            {cat.label}
                          </div>
                          {categoryWinners.length ? (
                            <div className="ml-4 space-y-1 text-sm">
                              {categoryWinners.map((winner) => (
                                <div key={winner.id} className="text-slate-700">
                                  1st – {winner.firstName} {winner.lastName}
                                  {winner.house &&
                                    ` (${getHouseLabel(winner.house)})`}
                                  {!winner.house && " (Independent)"}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="ml-4 text-sm italic text-slate-500">
                              No winner recorded
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
