"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, Home, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge } from "@/components/ui";
import { useTeachers } from "@/hooks/useTeachers";
import { useHouses } from "@/hooks/useHouses";
import { useTeacherHouseAssignments, useAssignTeacherHouse } from "@/hooks/useTeacherHouseAssignments";
import { useToast } from "@/hooks/use-toast";

export function TeacherHouseAssignments() {
  const { data: teachers = [], isLoading: loadingTeachers } = useTeachers();
  const { data: houses = [], isLoading: loadingHouses } = useHouses();
  const { data: assignments = [], isLoading: loadingAssignments } = useTeacherHouseAssignments();
  const assignHouse = useAssignTeacherHouse();
  const { toast } = useToast();

  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedTeacherId && teachers.length) {
      setSelectedTeacherId(teachers[0].id);
    }
  }, [teachers, selectedTeacherId]);

  const teacherAssignments = useMemo(() => {
    const map: Record<string, string> = {};
    assignments.forEach((a: any) => {
      map[a.teacherId] = a.houseId;
    });
    return map;
  }, [assignments]);

  const handleAssign = (teacherId: string, houseId: string) => {
    assignHouse.mutate(
      { teacherId, houseId },
      {
        onSuccess: () => toast({ title: "Teacher house updated" }),
        onError: () => toast({ title: "Failed to assign house", variant: "destructive" }),
      },
    );
  };

  const isLoading = loadingTeachers || loadingHouses || loadingAssignments;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          Teacher House Assignments
        </CardTitle>
        <Badge variant="secondary" className="font-mono">
          {assignments.length} assigned
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : (
          <div className="space-y-3">
            {teachers.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded border px-3 py-2">
                <div>
                  <p className="font-medium text-slate-900">
                    {t.firstNameEn} {t.lastNameEn}
                  </p>
                  <p className="text-xs text-slate-500">{t.email || t.phone || "No contact"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={teacherAssignments[t.id] || ""}
                    onValueChange={(val) => handleAssign(t.id, val)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Assign house" />
                    </SelectTrigger>
                    <SelectContent>
                      {houses.map((h) => (
                        <SelectItem key={h.id} value={h.id}>
                          {h.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleAssign(t.id, houses[0]?.id || "")}
                    disabled={!houses.length}
                    title="Quick assign first house"
                  >
                    <Home className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {!teachers.length && (
              <p className="text-sm text-slate-500">No teachers available.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
