"use client";

import { useMemo, useState } from "react";
import { Trophy, Users, TrendingUp, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Header } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import {
  useTeamSelection,
  useSaveTeamSelection,
  useTeamSelectionSuggestions,
} from "@/hooks/useCompetitions";
import { useToast } from "@/hooks/use-toast";

export function ZonalOverview() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const { data: selection } = useTeamSelection("zonal", year);
  const { data: suggestions = [] } = useTeamSelectionSuggestions(year);
  const saveSelection = useSaveTeamSelection("zonal", year);
  const { toast } = useToast();

  const selectedStudents = selection?.entries?.length ?? 0;
  const pendingSelections = Math.max((suggestions?.length ?? 0) - selectedStudents, 0);
  const totalMarks = selection?.totalMarks ?? 0;
  const teamPosition = selection?.teamPosition;

  const progressPct = useMemo(() => {
    const total = selectedStudents + pendingSelections;
    if (!total) return 0;
    return Math.round((selectedStudents / total) * 100);
  }, [selectedStudents, pendingSelections]);

  const handleApplySuggestions = () => {
    if (!suggestions.length) return;
    saveSelection.mutate(
      { level: "zonal", year, entries: suggestions },
      {
        onSuccess: () => {
          toast({ title: "Zonal selection updated from suggestions" });
        },
        onError: (err) =>
          toast({
            title: "Failed to save selection",
            description: String(err),
            variant: "destructive",
          }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <Header
        title="Zonal Team Selection"
        description="Manage school team selection for Zonal competitions and record results."
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
              <p className="text-sm font-medium text-slate-500">Team Selection</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {selectedStudents} / {selectedStudents + pendingSelections}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Competitions with selected students
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">School Rank</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {teamPosition ? `${teamPosition} place` : "—"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Current zonal standing</p>
            </div>
            <Trophy className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Marks</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalMarks}</h3>
              <p className="text-xs text-slate-500 mt-1">Accumulated from wins</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-slate-500" />
              Selection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 border border-yellow-100">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Pending Suggestions</p>
                  <p className="text-sm text-yellow-700">
                    {pendingSelections} competitions need review
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="bg-white"
                disabled={!suggestions.length || saveSelection.isPending}
                onClick={handleApplySuggestions}
              >
                Apply suggestions
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Selection Progress</span>
                <span className="font-medium">{progressPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {(selection?.entries || []).map((entry) => (
                <div
                  key={`${entry.competitionId}-${entry.studentId}`}
                  className="flex items-center justify-between text-sm rounded border px-3 py-2"
                >
                  <span className="font-medium">Competition {entry.competitionId}</span>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Student {entry.studentId}</Badge>
                    {entry.place ? (
                      <Badge className="bg-yellow-100 text-yellow-800">Place {entry.place}</Badge>
                    ) : null}
                  </div>
                </div>
              ))}
              {!selection?.entries?.length && (
                <p className="text-sm text-slate-500">
                  No zonal selections saved for {year}.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-slate-500" />
              Zonal Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.map((s) => (
              <div
                key={`${s.competitionId}-${s.studentId}`}
                className="flex items-center justify-between rounded border px-3 py-2 text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium">Competition {s.competitionId}</span>
                  <span className="text-slate-500">Student {s.studentId}</span>
                </div>
                <Badge variant="secondary">Suggested</Badge>
              </div>
            ))}
            {!suggestions.length && (
              <p className="text-sm text-slate-500">
                No suggestions yet for {year}. Add competition results or registrations to seed the
                team.
              </p>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleApplySuggestions}
              disabled={!suggestions.length || saveSelection.isPending}
            >
              Apply all suggestions <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
