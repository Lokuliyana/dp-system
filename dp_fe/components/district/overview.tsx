"use client";

import { useState } from "react";
import { Trophy, Users, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { Header } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import {
  useTeamSelection,
  useAutoGenerateTeamSelection,
} from "@/hooks/useCompetitions";
import { useToast } from "@/hooks/use-toast";

export function DistrictOverview() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const { data: selection } = useTeamSelection("district", year);
  const autoGenerate = useAutoGenerateTeamSelection(year);
  const { toast } = useToast();

  const qualified = selection?.entries?.length ?? 0;
  const totalMarks = selection?.totalMarks ?? 0;
  const teamPosition = selection?.teamPosition;

  const handleGenerate = () => {
    autoGenerate.mutate(
      { fromLevel: "zonal", toLevel: "district", year },
      {
        onSuccess: () => toast({ title: "District team generated from zonal winners" }),
        onError: (err) =>
          toast({
            title: "Failed to generate district team",
            description: String(err),
            variant: "destructive",
          }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <Header
        title="District Team Dashboard"
        description="Overview of students qualified for District level and school results."
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Qualified Team</p>
              <h3 className="text-2xl font-bold text-slate-900">{qualified} Students</h3>
              <p className="text-xs text-slate-500 mt-1">Auto-selected from Zonal 1st places</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">District Rank</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {teamPosition ? `${teamPosition} place` : "—"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Current district standing</p>
            </div>
            <Trophy className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Marks</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalMarks}</h3>
              <p className="text-xs text-slate-500 mt-1">Accumulated from district wins</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-slate-500" />
              Team Composition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-100 text-sm text-purple-900">
              District team is automatically created from Zonal 1st place winners.
            </div>
            {(selection?.entries || []).map((entry) => (
              <div
                key={`${entry.competitionId}-${entry.studentId}`}
                className="flex items-center justify-between p-2 rounded border text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium">Competition {entry.competitionId}</span>
                  <span className="text-slate-600">Student {entry.studentId}</span>
                </div>
                <Badge variant="outline">Qualified</Badge>
              </div>
            ))}
            {!selection?.entries?.length && (
              <p className="text-sm text-slate-500">No district selections yet for {year}.</p>
            )}
            <Button
              className="w-full gap-2"
              onClick={handleGenerate}
              disabled={autoGenerate.isPending}
            >
              Generate from zonal winners <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-slate-500" />
              Recent District Wins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              District results will appear once competition results are recorded for {year}.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
