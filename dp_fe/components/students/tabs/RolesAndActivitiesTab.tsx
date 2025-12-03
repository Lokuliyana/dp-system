"use client";

import { useState } from "react";
import type { Student } from "@/lib/school-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  Crown,
  Users,
  Award,
  Flag,
  Trophy,
  Plus,
  Calendar,
} from "lucide-react";

export interface ClubMembership {
  id: string;
  name: string;
  role: "member" | "secretary" | "president" | "vice-president";
  year: number;
  isActive: boolean;
}

export interface ActivityRecord {
  id: string;
  name: string;
  category: "sports" | "cultural" | "academic" | "other";
  level: "school" | "zonal" | "district" | "national" | "international";
  year: number;
  result?: string;
}

export interface HouseHistoryEntry {
  id: string;
  houseName: string;
  yearFrom: number;
  yearTo?: number;
  position?: "member" | "vice-captain" | "captain";
}

export interface HouseCompetitionWin {
  id: string;
  year: number;
  houseName: string;
  event: string;
  position: "1st" | "2nd" | "3rd" | "participant";
}

export interface PrefectshipInfo {
  isPrefect: boolean;
  rank?: "prefect" | "vice-prefect" | "head-prefect";
  appointmentDate?: string;
  responsibilities?: string[];
}

interface RolesAndActivitiesTabProps {
  student: Student;

  // read-only from system modules (optional)
  prefectship?: PrefectshipInfo;
  houseHistory?: HouseHistoryEntry[];
  houseWins?: HouseCompetitionWin[];

  // editable from this screen (optional)
  clubs?: ClubMembership[];
  activities?: ActivityRecord[];
  onAddClub?: (club: Omit<ClubMembership, "id">) => void;
  onRemoveClub?: (id: string) => void;
  onAddActivity?: (activity: Omit<ActivityRecord, "id">) => void;
  onRemoveActivity?: (id: string) => void;
}

export function RolesAndActivitiesTab({
  student,
  prefectship,
  houseHistory,
  houseWins,
  clubs,
  activities,
  onAddClub,
  onRemoveClub,
  onAddActivity,
  onRemoveActivity,
}: RolesAndActivitiesTabProps) {
  // Safe defaults so we never read `.length` on undefined
  const safePrefectship: PrefectshipInfo = prefectship ?? { isPrefect: false };
  const safeClubs: ClubMembership[] = clubs ?? [];
  const safeActivities: ActivityRecord[] = activities ?? [];
  const safeHouseHistory: HouseHistoryEntry[] = houseHistory ?? [];
  const safeHouseWins: HouseCompetitionWin[] = houseWins ?? [];

  const [clubDraft, setClubDraft] = useState<Omit<ClubMembership, "id">>({
    name: "",
    role: "member",
    year: new Date().getFullYear(),
    isActive: true,
  });

  const [activityDraft, setActivityDraft] = useState<Omit<ActivityRecord, "id">>({
    name: "",
    category: "sports",
    level: "school",
    year: new Date().getFullYear(),
    result: "",
  });

  const handleAddClub = () => {
    if (!onAddClub || !clubDraft.name.trim()) return;
    onAddClub(clubDraft);
    setClubDraft((prev) => ({ ...prev, name: "" }));
  };

  const handleAddActivity = () => {
    if (!onAddActivity || !activityDraft.name.trim()) return;
    onAddActivity(activityDraft);
    setActivityDraft((prev) => ({ ...prev, name: "", result: "" }));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Prefectship: READ-ONLY */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-600" />
            Prefectship / Leadership
          </CardTitle>
        </CardHeader>
        <CardContent>
          {safePrefectship.isPrefect ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-900">Current Rank</p>
                <p className="text-xl font-bold capitalize text-amber-900">
                  {safePrefectship.rank || "Prefect"}
                </p>
                <p className="text-xs text-amber-800">
                  Managed by the central leadership module. Changes must be done there.
                </p>
              </div>
              <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
                {safePrefectship.appointmentDate && (
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">Appointment Date: </span>
                    {new Date(safePrefectship.appointmentDate).toLocaleDateString()}
                  </p>
                )}
                {safePrefectship.responsibilities &&
                  safePrefectship.responsibilities.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-800">Key Responsibilities</p>
                      <ul className="list-disc space-y-1 pl-4 text-sm text-slate-700">
                        {safePrefectship.responsibilities.map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              This student is not currently marked as a prefect in the leadership module.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clubs & societies: EDITABLE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Clubs & Societies
            </span>
            <Badge variant="outline" className="border-blue-200 text-xs text-blue-700">
              Managed here (student-level)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {onAddClub && (
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-medium text-slate-700">Club Name</label>
                <Input
                  value={clubDraft.name}
                  onChange={(e) =>
                    setClubDraft((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g., Science Club"
                  className="h-9 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Role</label>
                <Select
                  value={clubDraft.role}
                  onValueChange={(v) =>
                    setClubDraft((p) => ({
                      ...p,
                      role: v as ClubMembership["role"],
                    }))
                  }
                >
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="secretary">Secretary</SelectItem>
                    <SelectItem value="vice-president">Vice President</SelectItem>
                    <SelectItem value="president">President</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Year</label>
                <Input
                  type="number"
                  value={clubDraft.year}
                  onChange={(e) =>
                    setClubDraft((p) => ({
                      ...p,
                      year: Number.isNaN(Number(e.target.value))
                        ? new Date().getFullYear()
                        : Number(e.target.value),
                    }))
                  }
                  className="h-9 bg-white"
                />
              </div>
              <div className="md:col-span-4 flex justify-end pt-1">
                <Button
                  type="button"
                  size="sm"
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={handleAddClub}
                  disabled={!clubDraft.name.trim()}
                >
                  <Plus className="h-4 w-4" />
                  Add Club
                </Button>
              </div>
            </div>
          )}

          {safeClubs.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">
              No clubs/societies recorded for this student.
            </p>
          ) : (
            <div className="space-y-2">
              {safeClubs
                .slice()
                .sort((a, b) => b.year - a.year)
                .map((club) => (
                  <div
                    key={club.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-900">{club.name}</span>
                        <Badge variant="outline" className="border-slate-200 text-xs capitalize">
                          {club.role.replace("-", " ")}
                        </Badge>
                        {club.isActive && (
                          <Badge className="bg-emerald-50 text-xs text-emerald-700">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        <Calendar className="mr-1 inline-block h-3 w-3" />
                        {club.year}
                      </p>
                    </div>
                    {onRemoveClub && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveClub(club.id)}
                        className="flex-shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activities: EDITABLE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-600" />
              Extracurricular Activities
            </span>
            <Badge variant="outline" className="border-indigo-200 text-xs text-indigo-700">
              Managed here (student-level)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {onAddActivity && (
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-medium text-slate-700">Activity</label>
                <Input
                  value={activityDraft.name}
                  onChange={(e) =>
                    setActivityDraft((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g., Inter-house Athletics, Drama Competition"
                  className="h-9 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Category</label>
                <Select
                  value={activityDraft.category}
                  onValueChange={(v) =>
                    setActivityDraft((p) => ({
                      ...p,
                      category: v as ActivityRecord["category"],
                    }))
                  }
                >
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Level</label>
                <Select
                  value={activityDraft.level}
                  onValueChange={(v) =>
                    setActivityDraft((p) => ({
                      ...p,
                      level: v as ActivityRecord["level"],
                    }))
                  }
                >
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="zonal">Zonal</SelectItem>
                    <SelectItem value="district">District</SelectItem>
                    <SelectItem value="national">National</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Year</label>
                <Input
                  type="number"
                  value={activityDraft.year}
                  onChange={(e) =>
                    setActivityDraft((p) => ({
                      ...p,
                      year: Number.isNaN(Number(e.target.value))
                        ? new Date().getFullYear()
                        : Number(e.target.value),
                    }))
                  }
                  className="h-9 bg-white"
                />
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Result (optional)
                </label>
                <Input
                  value={activityDraft.result}
                  onChange={(e) =>
                    setActivityDraft((p) => ({ ...p, result: e.target.value }))
                  }
                  placeholder="e.g., 1st place, Participation"
                  className="h-9 bg-white"
                />
              </div>
              <div className="md:col-span-1 flex items-end justify-end">
                <Button
                  type="button"
                  size="sm"
                  className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleAddActivity}
                  disabled={!activityDraft.name.trim()}
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
          )}

          {safeActivities.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">
              No extracurricular activities recorded.
            </p>
          ) : (
            <div className="space-y-2">
              {safeActivities
                .slice()
                .sort((a, b) => b.year - a.year)
                .map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-900">
                          {activity.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-slate-200 text-xs capitalize"
                        >
                          {activity.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-slate-200 text-xs capitalize"
                        >
                          {activity.level}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">
                        <Calendar className="mr-1 inline-block h-3 w-3" />
                        {activity.year}
                        {activity.result && (
                          <>
                            {" "}
                            • <Trophy className="mr-1 inline-block h-3 w-3" />
                            {activity.result}
                          </>
                        )}
                      </p>
                    </div>
                    {onRemoveActivity && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveActivity(activity.id)}
                        className="flex-shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Houses & competitions: READ-ONLY */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-emerald-600" />
            House History & Inter-house Wins
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* House history */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">House Assignments</p>
            {safeHouseHistory.length === 0 ? (
              <p className="text-sm text-slate-500">
                No house history recorded for this student. This is maintained by
                the house module.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-700">
                    <tr>
                      <th className="px-3 py-2">House</th>
                      <th className="px-3 py-2">From</th>
                      <th className="px-3 py-2">To</th>
                      <th className="px-3 py-2">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeHouseHistory
                      .slice()
                      .sort((a, b) => b.yearFrom - a.yearFrom)
                      .map((entry) => (
                        <tr key={entry.id} className="border-t">
                          <td className="px-3 py-2 text-slate-900">
                            {entry.houseName}
                          </td>
                          <td className="px-3 py-2">{entry.yearFrom}</td>
                          <td className="px-3 py-2">
                            {entry.yearTo ? entry.yearTo : "Present"}
                          </td>
                          <td className="px-3 py-2 capitalize">
                            {entry.position ?? "Member"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Competition wins */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">
              House Competition Performance
            </p>
            {safeHouseWins.length === 0 ? (
              <p className="text-sm text-slate-500">
                No inter-house competition records. Maintained by the competitions
                module.
              </p>
            ) : (
              <div className="space-y-2">
                {safeHouseWins
                  .slice()
                  .sort((a, b) => b.year - a.year)
                  .map((win) => (
                    <div
                      key={win.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-slate-900">
                            {win.event}
                          </span>
                          <Badge className="bg-emerald-50 text-xs text-emerald-700">
                            {win.houseName}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600">
                          <Calendar className="mr-1 inline-block h-3 w-3" />
                          {win.year} •{" "}
                          <Trophy className="mr-1 inline-block h-3 w-3" />
                          {win.position}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="flex-shrink-0 border-slate-200 text-xs text-slate-700"
                      >
                        Source: Competitions Module
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
