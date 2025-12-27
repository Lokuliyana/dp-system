"use client";

import { useState, useMemo } from "react";
import { History, Trophy, Medal, Search, Calendar, ChevronRight, Award } from "lucide-react";
import { 
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
  Badge,
  Input
} from "@/components/ui";
import {
  LayoutController,
  DynamicPageHeader,
} from "@/components/layout/dynamic";
import { HouseMeetsMenu } from "@/components/house-meets/house-meets-menu";
import { useHouses } from "@/hooks/useHouses";
import { useHousePoints, useAllResults, useCompetitions } from "@/hooks/useCompetitions";
import { cn } from "@/lib/utils";

export default function HouseHistoryPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [search, setSearch] = useState("");

  const { data: houses = [], isLoading: housesLoading } = useHouses();
  const { data: points = [], isLoading: pointsLoading } = useHousePoints(selectedYear);
  const { data: results = [], isLoading: resultsLoading } = useAllResults(selectedYear);
  const { data: competitions = [], isLoading: compsLoading } = useCompetitions(selectedYear);

  const years = useMemo(() => {
    const startYear = 2023; // Or fetch from API
    const arr = [];
    for (let y = currentYear; y >= startYear; y--) {
      arr.push(y);
    }
    return arr;
  }, [currentYear]);

  const standings = useMemo(() => {
    return houses.map((h) => {
      const housePoints = points.find((p) => p.houseId === h.id)?.points || 0;
      return { house: h, housePoints };
    }).sort((a, b) => b.housePoints - a.housePoints);
  }, [houses, points]);

  const filteredCompetitions = useMemo(() => {
    return competitions.filter(c => 
      c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      c.nameSi?.toLowerCase().includes(search.toLowerCase())
    );
  }, [competitions, search]);

  const loading = housesLoading || pointsLoading || resultsLoading || compsLoading;

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <HouseMeetsMenu />

      <DynamicPageHeader
        title="History & Archives"
        subtitle="View past house meet records and statistics."
        icon={History}
      />

      <div className="p-6 space-y-6">
        {/* Year Selection & Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-medium">Select Academic Year:</span>
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search competitions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Yearly Standings */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  {selectedYear} Final Standings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {standings.map((s, idx) => (
                    <div key={s.house.id} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                          idx === 0 ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                        )}>
                          {idx + 1}
                        </div>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.house.color }} />
                        <span className="font-semibold">{s.house.nameEn}</span>
                      </div>
                      <span className="font-bold">{s.housePoints} pts</span>
                    </div>
                  ))}
                  {standings.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">No records for this year</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Competition Records */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Medal className="h-5 w-5 text-blue-500" />
                  Competition Results
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Competition</TableHead>
                      <TableHead>1st Place</TableHead>
                      <TableHead>2nd Place</TableHead>
                      <TableHead>3rd Place</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompetitions.map((comp) => {
                      const compResults = results.filter(r => r.competitionId === comp.id);
                      const getWinner = (place: number) => {
                        const r = compResults.find(res => res.place === place);
                        if (!r) return null;
                        const student = r.studentId as any;
                        const house = houses.find(h => h.id === r.houseId);
                        return { student, house };
                      };

                      const p1 = getWinner(1);
                      const p2 = getWinner(2);
                      const p3 = getWinner(3);

                      return (
                        <TableRow key={comp.id}>
                          <TableCell className="font-medium">
                            <div>{comp.nameEn}</div>
                            <div className="text-[10px] text-muted-foreground uppercase">{comp.participationType || 'Individual'}</div>
                          </TableCell>
                          <TableCell>
                            {p1 ? (
                              <div className="text-xs">
                                <div className="font-bold">{p1.student?.firstNameEn || p1.house?.nameEn}</div>
                                <div className="text-[10px] opacity-70" style={{ color: p1.house?.color }}>{p1.house?.nameEn}</div>
                              </div>
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            {p2 ? (
                              <div className="text-xs">
                                <div className="font-bold">{p2.student?.firstNameEn || p2.house?.nameEn}</div>
                                <div className="text-[10px] opacity-70" style={{ color: p2.house?.color }}>{p2.house?.nameEn}</div>
                              </div>
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            {p3 ? (
                              <div className="text-xs">
                                <div className="font-bold">{p3.student?.firstNameEn || p3.house?.nameEn}</div>
                                <div className="text-[10px] opacity-70" style={{ color: p3.house?.color }}>{p3.house?.nameEn}</div>
                              </div>
                            ) : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredCompetitions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                          No competitions found for this year
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Special Awards Section */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  Special Awards & Recognitions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.filter(r => r.place === 0).flatMap(r => r.personalAwardWinners || []).map((award, idx) => {
                    const house = houses.find(h => h.id === award.houseId);
                    const student = award.studentId as any;
                    return (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border bg-gradient-to-r from-slate-50 to-white shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                          <Award className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">{award.awardName}</p>
                          <p className="text-sm font-bold truncate">{student?.firstNameEn} {student?.lastNameEn}</p>
                          {house && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: house.color }} />
                              <span className="text-[10px] font-medium text-slate-500">{house.nameEn}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {results.filter(r => r.place === 0).flatMap(r => r.personalAwardWinners || []).length === 0 && (
                    <div className="col-span-full text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                      No special awards recorded for this year
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </LayoutController>
  );
}
