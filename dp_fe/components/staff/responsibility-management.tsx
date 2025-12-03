"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStaffRoles } from "@/hooks/useStaffRoles";
import { usePrefectPositions } from "@/hooks/usePrefectPositions";

type ResponsibilityManagementProps = {
  type: "teacher" | "prefect";
  onClose?: () => void;
};

/**
 * Read-only responsibility view that surfaces duties already defined
 * on staff roles (teachers) or prefect positions (prefects).
 */
export function ResponsibilityManagement({ type }: ResponsibilityManagementProps) {
  const { data: roles = [], isLoading: loadingRoles } = useStaffRoles();
  const { data: positions = [], isLoading: loadingPositions } = usePrefectPositions();

  const items = useMemo(() => {
    if (type === "teacher") {
      return roles
        .flatMap((r) => r.responsibilities || [])
        .map((r, idx) => ({
          id: `role-resp-${idx}`,
          title: r.textEn,
          subtitle: r.textSi,
          level: r.level,
        }));
    }
    return positions.map((p) => ({
      id: p.id,
      title: p.responsibilityEn || p.nameEn,
      subtitle: p.responsibilitySi,
      level: p.rankLevel || 0,
    }));
  }, [roles, positions, type]);

  const isLoading = type === "teacher" ? loadingRoles : loadingPositions;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{type === "teacher" ? "Teacher Responsibilities" : "Prefect Responsibilities"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">No responsibilities defined yet.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="border rounded-md p-3 bg-slate-50">
                <p className="font-semibold text-slate-900">{item.title}</p>
                {item.subtitle && <p className="text-xs text-slate-500">{item.subtitle}</p>}
                {item.level ? (
                  <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                    Level {item.level}
                  </span>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
