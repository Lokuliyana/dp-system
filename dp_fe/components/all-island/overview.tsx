"use client";

import { useState } from "react";
import { Header } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Trophy, Users, TrendingUp, ArrowRight, Globe } from "lucide-react";

export function AllIslandOverview() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  // Mock data for All Island Team
  const teamStats = {
    qualifiedStudents: 5, // From District 1st places
    totalMarks: 15,
    teamPosition: 8,
  };

  return (
    <div className="space-y-6">
      <Header
        title="All Island Team Dashboard"
        description="Overview of students qualified for All Island level and school results."
        icon={Trophy}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">National Team</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {teamStats.qualifiedStudents} Students
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Auto-selected from District 1st places
              </p>
            </div>
            <Users className="h-8 w-8 text-orange-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">National Rank</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {teamStats.teamPosition}th Place
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Current national standing
              </p>
            </div>
            <Trophy className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Marks</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {teamStats.totalMarks}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Accumulated from national wins
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Qualification Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-slate-500" />
              Team Composition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
                <p className="text-sm text-orange-900">
                  <strong>Note:</strong> All Island team is automatically created from District 1st place winners.
                </p>
              </div>
              
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                      ST
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Student Name {i}</p>
                      <p className="text-xs text-slate-500">Qualified via District Art</p>
                    </div>
                    <Badge variant="outline">Qualified</Badge>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full gap-2">
                View Full Team List <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-slate-500" />
              Recent National Wins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                  <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                    1st Place
                  </Badge>
                  <div>
                    <p className="font-medium text-slate-900">Art Competition</p>
                    <p className="text-xs text-slate-500">Grade 5 • Nethmi Silva</p>
                  </div>
                </div>
                <span className="font-bold text-slate-900">+5 pts</span>
              </div>
              <Button variant="outline" className="w-full">
                View All Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
