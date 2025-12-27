"use client";

import { useMemo } from "react";
import { LayoutDashboard, Trophy, Users, Medal, Award, TrendingUp, Calendar } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { HouseMeetsMenu } from "@/components/house-meets/house-meets-menu";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Progress
} from "@/components/ui";
import { useHouses } from "@/hooks/useHouses";
import { useHouseAssignments } from "@/hooks/useHouseAssignments";
import { useHousePoints, useAllResults, useCompetitions } from "@/hooks/useCompetitions";
import { useGrades } from "@/hooks/useGrades";
import { cn } from "@/lib/utils";

export default function HouseMeetsPage() {
  const year = new Date().getFullYear();
  const { data: houses = [], isLoading: housesLoading } = useHouses();
  const { data: assignments = [], isLoading: assignmentsLoading } = useHouseAssignments({ year });
  const { data: points = [], isLoading: pointsLoading } = useHousePoints(year);
  const { data: results = [], isLoading: resultsLoading } = useAllResults(year);
  const { data: competitions = [], isLoading: compsLoading } = useCompetitions(year);
  const { data: grades = [] } = useGrades();

  const stats = useMemo(() => {
    return houses.map((h) => {
      const members = assignments.filter((a) => a.houseId === h.id).length;
      const housePoints = points.find((p) => p.houseId === h.id)?.points || 0;
      return { house: h, members, housePoints };
    }).sort((a, b) => b.housePoints - a.housePoints);
  }, [houses, assignments, points]);

  const recentWinners = useMemo(() => {
    return results
      .filter(r => r.place > 0)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  }, [results]);

  const gradePerformance = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    
    results.forEach(r => {
      if (!r.gradeId || !r.houseId || r.place === 0) return;
      if (!map[r.gradeId]) map[r.gradeId] = {};
      
      // Calculate points based on place (simplified, should ideally match pointsConfig)
      const pts = r.place === 1 ? 15 : r.place === 2 ? 10 : r.place === 3 ? 5 : 0;
      map[r.gradeId][r.houseId] = (map[r.gradeId][r.houseId] || 0) + pts;
    });

    return grades.map(g => {
      const houseScores = map[g.id] || {};
      const leadingHouseId = Object.entries(houseScores).sort((a, b) => b[1] - a[1])[0]?.[0];
      const leadingHouse = houses.find(h => h.id === leadingHouseId);
      return { grade: g, leadingHouse, score: houseScores[leadingHouseId || ''] || 0 };
    }).filter(g => g.score > 0);
  }, [results, grades, houses]);

  const loading = housesLoading || assignmentsLoading || pointsLoading || resultsLoading || compsLoading;

  const maxPoints = Math.max(...stats.map(s => s.housePoints), 1);

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <HouseMeetsMenu />

      <DynamicPageHeader
        title="House Meets Dashboard"
        subtitle="Real-time standings and performance metrics."
        icon={LayoutDashboard}
      />

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <>
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    Leading House
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats[0]?.house.nameEn || "N/A"}</div>
                  <p className="text-xs text-slate-400 mt-1">{stats[0]?.housePoints || 0} Total Points</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    Total Participants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assignments.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Across {houses.length} Houses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Medal className="h-4 w-4 text-emerald-500" />
                    Events Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{new Set(results.map(r => r.competitionId)).size}</div>
                  <p className="text-xs text-muted-foreground mt-1">Out of {competitions.length} Total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    Current Year
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{year}</div>
                  <p className="text-xs text-muted-foreground mt-1">Academic Session</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Standings Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    House Standings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {stats.map((stat, idx) => (
                    <div key={stat.house.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-400 w-4">{idx + 1}</span>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.house.color }} />
                          <span className="font-semibold">{stat.house.nameEn}</span>
                        </div>
                        <span className="font-bold">{stat.housePoints} pts</span>
                      </div>
                      <Progress 
                        value={(stat.housePoints / maxPoints) * 100} 
                        className="h-2" 
                        style={{ "--progress-background": stat.house.color } as any}
                      />
                    </div>
                  ))}
                  {stats.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">No data available</div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Winners */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Recent Winners
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {recentWinners.map((r, idx) => {
                      const student = r.studentId as any;
                      const house = houses.find(h => h.id === r.houseId);
                      const comp = competitions.find(c => c.id === r.competitionId);
                      
                      return (
                        <div key={idx} className="p-4 flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs",
                            r.place === 1 ? "bg-amber-100 text-amber-700" : 
                            r.place === 2 ? "bg-slate-100 text-slate-700" : 
                            "bg-orange-100 text-orange-700"
                          )}>
                            {r.place}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate">
                              {student?.firstNameEn} {student?.lastNameEn}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {comp?.nameEn}
                            </p>
                          </div>
                          {house && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={{ borderColor: house.color, color: house.color }}>
                              {house.nameEn}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                    {recentWinners.length === 0 && (
                      <div className="text-center py-10 text-muted-foreground">No winners recorded yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Grade-wise Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Grade-wise Leaders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {gradePerformance.map((gp, idx) => (
                    <div key={idx} className="p-3 border rounded-lg bg-slate-50/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-white border flex items-center justify-center font-bold text-slate-600">
                        G{gp.grade.level}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Leading</p>
                        <p className="text-sm font-bold truncate" style={{ color: gp.leadingHouse?.color }}>
                          {gp.leadingHouse?.nameEn || "N/A"}
                        </p>
                        <p className="text-[10px] font-medium">{gp.score} pts</p>
                      </div>
                    </div>
                  ))}
                  {gradePerformance.length === 0 && (
                    <div className="col-span-full text-center py-6 text-muted-foreground">No grade-wise data available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </LayoutController>
  );
}
