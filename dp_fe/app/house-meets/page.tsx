"use client";

import { useMemo } from "react";
import { LayoutDashboard } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { HouseMeetsMenu } from "@/components/house-meets/house-meets-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { useHouses } from "@/hooks/useHouses";
import { useHouseAssignments } from "@/hooks/useHouseAssignments";
import { useHousePoints } from "@/hooks/useCompetitions";

export default function HouseMeetsPage() {
  const year = new Date().getFullYear();
  const { data: houses = [], isLoading: housesLoading } = useHouses();
  const { data: assignments = [], isLoading: assignmentsLoading } = useHouseAssignments({ year });
  const { data: points = [], isLoading: pointsLoading } = useHousePoints(year);

  const stats = useMemo(() => {
    return houses.map((h) => {
      const members = assignments.filter((a) => a.houseId === h.id).length;
      const housePoints = points.find((p) => p.houseId === h.id)?.points || 0;
      return { house: h, members, housePoints };
    });
  }, [houses, assignments, points]);

  const loading = housesLoading || assignmentsLoading || pointsLoading;

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <HouseMeetsMenu />

      <DynamicPageHeader
        title="House Meets Overview"
        subtitle="Manage house competitions, assignments, and results."
        icon={LayoutDashboard}
      />

      <div className="p-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading house metrics...</div>
        ) : stats.length === 0 ? (
          <div className="text-sm text-muted-foreground">No houses have been created yet.</div>
        ) : (
          stats.map((stat) => (
            <Card key={stat.house.id}>
              <CardHeader>
                <CardTitle className="text-lg">{stat.house.nameEn}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Members assigned: {stat.members}</p>
                <p>Competition points ({year}): {stat.housePoints}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </LayoutController>
  );
}
