"use client";

import { useMemo, useState } from "react";
import { Users, Loader, X, ChevronsRight } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Badge,
  ScrollArea
} from "@/components/ui";
import { useTeachers } from "@/hooks/useTeachers";
import { useHouses } from "@/hooks/useHouses";
import { useTeacherHouseAssignments, useAssignTeacherHouse } from "@/hooks/useTeacherHouseAssignments";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export function TeacherHouseAssignments() {
  const { data: teachers = [], isLoading: loadingTeachers } = useTeachers();
  const { data: houses = [], isLoading: loadingHouses } = useHouses();
  const { data: assignments = [], isLoading: loadingAssignments } = useTeacherHouseAssignments();
  const assignHouse = useAssignTeacherHouse();
  const { toast } = useToast();

  const teacherAssignments = useMemo(() => {
    const map: Record<string, string> = {};
    assignments.forEach((a: any) => {
      map[a.teacherId] = a.houseId;
    });
    return map;
  }, [assignments]);

  const assignedByHouse = useMemo(() => {
    const map: Record<string, typeof teachers> = {};
    houses.forEach(h => (map[h.id] = []));
    
    teachers.forEach(t => {
      const houseId = teacherAssignments[t.id];
      if (houseId && map[houseId]) {
        map[houseId].push(t);
      }
    });
    return map;
  }, [teachers, teacherAssignments, houses]);

  const unassignedTeachers = useMemo(() => {
    return teachers.filter(t => !teacherAssignments[t.id]);
  }, [teachers, teacherAssignments]);

  const handleAssign = (teacherId: string, houseId: string | null) => {
    assignHouse.mutate(
      { teacherId, houseId: houseId || "" },
      {
        onSuccess: () => toast({ title: houseId ? "Staff assigned to house" : "Staff unassigned" }),
        onError: () => toast({ title: "Failed to update assignment", variant: "destructive" }),
      },
    );
  };

  const isLoading = loadingTeachers || loadingHouses || loadingAssignments;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 gap-2 text-sm text-slate-500">
        <Loader className="h-4 w-4 animate-spin" /> Loading staff assignments...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6 overflow-hidden">
      {/* Top: House Boxes */}
      <div className="grid grid-cols-4 gap-4 shrink-0 h-64">
        {houses.map((house) => (
          <StaffHouseBox
            key={house.id}
            house={house}
            staff={assignedByHouse[house.id] || []}
            onUnassign={(staffId) => handleAssign(staffId, null)}
          />
        ))}
      </div>

      {/* Bottom: Unassigned Staff */}
      <Card className="flex-1 flex flex-col border-slate-200 shadow-sm overflow-hidden min-h-0">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 py-3 min-h-[50px] shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              Unassigned Staff
              <Badge variant="secondary" className="bg-slate-200 text-slate-700 ml-2">
                {unassignedTeachers.length}
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden bg-slate-50/30">
          <ScrollArea className="h-full">
              {unassignedTeachers.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center h-full">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="font-medium text-slate-900">All staff assigned!</p>
                </div>
              ) : (
                <div className="flex flex-col bg-white rounded-md border border-slate-200 shadow-sm divide-y divide-slate-100">
                  {unassignedTeachers.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between gap-3 p-3 hover:bg-slate-50 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-slate-900 truncate">
                            {t.firstNameEn} {t.lastNameEn}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {t.email || t.phone || "No contact"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        {houses.map((house) => (
                          <button
                            key={house.id}
                            onClick={() => handleAssign(t.id, house.id)}
                            className="h-7 px-3 rounded-md text-[10px] font-bold text-white shadow-sm hover:shadow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center tracking-wide"
                            style={{ backgroundColor: house.color }}
                            title={`Assign to ${house.nameEn}`}
                          >
                            {house.nameEn.substring(0, 3).toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function StaffHouseBox({
  house,
  staff,
  onUnassign,
}: {
  house: any;
  staff: any[];
  onUnassign: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const defaultCount = 5; 
  
  const displayStaff = isExpanded ? staff : staff.slice(0, defaultCount);
  const remaining = Math.max(0, staff.length - defaultCount);
  const houseCode = house.nameEn.substring(0, 3).toUpperCase();

  return (
    <Card className="flex flex-col h-full border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="px-3 py-2 border-b flex items-center justify-between bg-slate-50/50"
        style={{ borderTop: `4px solid ${house.color}` }}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800 text-sm">{house.nameEn}</h3>
        </div>
        <Badge
          className="text-white font-mono text-xs"
          style={{ backgroundColor: house.color }}
        >
          {staff.length}
        </Badge>
      </div>
      
      <CardContent className="p-0 flex-1 overflow-hidden bg-white">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            <AnimatePresence initial={false}>
              {displayStaff.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group flex items-center justify-between p-1.5 bg-slate-50/50 rounded border border-slate-100 hover:border-red-100 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="text-[10px] font-bold px-1 rounded text-white shrink-0"
                      style={{ backgroundColor: house.color }}
                    >
                      {houseCode}
                    </span>
                    <span className="text-xs font-medium text-slate-700 truncate">
                      {t.firstNameEn} {t.lastNameEn}
                    </span>
                  </div>
                  <button
                    onClick={() => onUnassign(t.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-0.5 hover:bg-red-50 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {!isExpanded && remaining > 0 && (
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full py-1 text-[10px] text-muted-foreground hover:text-slate-700 hover:bg-slate-100 rounded border border-dashed border-slate-200 transition-colors flex items-center justify-center gap-1"
              >
                Show {remaining} more <ChevronsRight className="h-3 w-3" />
              </button>
            )}
            
            {isExpanded && staff.length > defaultCount && (
              <button
                onClick={() => setIsExpanded(false)}
                className="w-full py-1 text-[10px] text-muted-foreground hover:text-slate-700 hover:bg-slate-100 rounded border border-dashed border-slate-200 transition-colors"
              >
                Show less
              </button>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
