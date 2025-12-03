"use client";

import { useState } from "react";
import { HOUSES } from "@/lib/house-meet-data";
import { Header } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Trophy, Users, TrendingUp, Calendar, ArrowRight } from "lucide-react";

interface HouseMeetOverviewProps {
  students: any[]; // Typing loosely as we just need counts
}

export function HouseMeetOverview({ students }: HouseMeetOverviewProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  // Mock data for stats
  const houseStatistics = HOUSES.map((house) => ({
    house: house.value,
    label: house.label,
    color: house.color,
    bgColor: house.bgColor,
    members: Math.floor(Math.random() * 100) + 50,
    points: Math.floor(Math.random() * 500) + 100,
    wins: Math.floor(Math.random() * 10),
  })).sort((a, b) => b.points - a.points);

  const totalPoints = houseStatistics.reduce((acc, curr) => acc + curr.points, 0);
  const leadingHouse = houseStatistics[0];

  return (
    <div className="space-y-6">
      <Header
        title="House Championship Dashboard"
        description="Real-time overview of house performance and standings."
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
              <p className="text-sm font-medium text-slate-500">Leading House</p>
              <h3 className={`text-2xl font-bold ${leadingHouse.color}`}>
                {leadingHouse.label}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {leadingHouse.points} points
              </p>
            </div>
            <Trophy className={`h-8 w-8 ${leadingHouse.color}`} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Participation</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {houseStatistics.reduce((acc, h) => acc + h.members, 0)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Students assigned to houses
              </p>
            </div>
            <Users className="h-8 w-8 text-slate-400" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Events Completed</p>
              <h3 className="text-2xl font-bold text-slate-900">24</h3>
              <p className="text-xs text-slate-500 mt-1">
                This academic year
              </p>
            </div>
            <Calendar className="h-8 w-8 text-slate-400" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* House Standings Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-slate-500" />
              House Standings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {houseStatistics.map((stat) => {
                const percentage = Math.round((stat.points / totalPoints) * 100);
                return (
                  <div key={stat.house} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">{stat.label}</span>
                        <Badge variant="secondary" className="text-xs font-normal">
                          {stat.wins} Wins
                        </Badge>
                      </div>
                      <span className="font-bold text-slate-900">{stat.points} pts</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${stat.color.replace("text-", "bg-")}`}
                        style={{ width: `${percentage * 3}%` }} // Artificial scale for visual
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity / Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>House Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {houseStatistics.map((stat) => (
                <div
                  key={stat.house}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${stat.color.replace("text-", "bg-")}`} />
                    <span className="font-medium text-slate-700">{stat.label}</span>
                  </div>
                  <div className="text-sm text-slate-500">
                    {stat.members} Members
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full mt-4 gap-2">
                View Full History
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
