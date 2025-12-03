import { useState, useMemo } from "react";
import type { Student } from "@/lib/school-data";
import type { House, HouseAssignment } from "@/lib/house-meet-data";
import { HOUSES } from "@/lib/house-meet-data";
import { GRADES } from "@/lib/school-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { Search, Users, Star, X, Info } from "lucide-react";

interface HouseAssignmentManagerProps {
  students: Student[];
  assignments: HouseAssignment[];
  year: number;
  gradeId: string;
  onAssign: (studentId: string, house?: House) => void;
}

export function HouseAssignmentManager({
  students,
  assignments,
  year,
  gradeId,
  onAssign,
}: HouseAssignmentManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const grade = GRADES.find((g) => g.id === gradeId);
  const gradeStudents = useMemo(
    () => students.filter((s) => s.gradeId === gradeId),
    [students, gradeId]
  );

  // Merge student data with assignment status
  const tableData = useMemo(() => {
    return gradeStudents.map((student) => {
      const assignment = assignments.find(
        (a) => a.studentId === student.id && a.year === year
      );
      return {
        ...student,
        assignedHouse: assignment?.house,
      };
    });
  }, [gradeStudents, assignments, year]);

  // Mock Squad History
  const squadHistory = useMemo(() => {
    const history: Record<string, { squad: string; year: number; role: string; achievements: string[] }> = {};
    gradeStudents.forEach((s, i) => {
      if (i % 3 === 0) {
        history[s.id] = { 
          squad: "Junior Athletics Squad", 
          year: 2023, 
          role: "Member",
          achievements: ["1st Place - 100m", "Relay Team Gold"]
        };
      }
    });
    return history;
  }, [gradeStudents]);

  // Filter unassigned students for the bottom table
  const unassignedStudents = useMemo(() => {
    return tableData.filter((item) => {
      const matchesSearch =
        item.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lastName.toLowerCase().includes(searchQuery.toLowerCase());
      
      return !item.assignedHouse && matchesSearch;
    });
  }, [tableData, searchQuery]);

  // Group assigned students by house
  const assignedByHouse = useMemo(() => {
    const grouped: Record<string, typeof tableData> = { meththa: [], karuna: [], muditha: [], upekka: [] };
    tableData.forEach((s) => {
      if (s.assignedHouse) {
        grouped[s.assignedHouse].push(s);
      }
    });
    return grouped;
  }, [tableData]);

  return (
    <div className="space-y-8">
      {/* Top: House Containers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {HOUSES.map((house) => {
          const houseStudents = assignedByHouse[house.value];
          return (
            <Card key={house.value} className={`flex flex-col h-auto max-h-[320px] border-t-4 ${house.color.replace("text-", "border-")}`}>
              <CardHeader className="pb-2 py-3 bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-base font-bold ${house.color}`}>
                    {house.label}
                  </CardTitle>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {houseStudents.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-1.5 overflow-y-auto bg-slate-50/30">
                <div className="space-y-1.5">
                  {houseStudents.length === 0 ? (
                    <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs italic">
                      <Users className="h-6 w-6 mb-1 opacity-20" />
                      No students
                    </div>
                  ) : (
                    houseStudents.map((student) => {
                      const history = squadHistory[student.id];
                      return (
                        <div
                          key={student.id}
                          className="group flex items-center justify-between p-1.5 bg-white rounded border border-slate-200 shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-medium text-slate-900 truncate">
                                {student.firstName} {student.lastName}
                              </span>
                              {history && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-0.5 text-[10px] text-amber-600 cursor-help w-fit">
                                        <Star className="h-2.5 w-2.5 fill-amber-600" />
                                        <span className="font-medium">Squad</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[200px] p-2">
                                      <div className="space-y-1">
                                        <p className="font-bold text-amber-700 flex items-center gap-1 text-xs">
                                          <Star className="h-3 w-3 fill-amber-700" /> {history.squad}
                                        </p>
                                        <p className="text-[10px] text-slate-600">Year: {history.year} • {history.role}</p>
                                        <div className="pt-1 border-t border-amber-100 mt-1">
                                          {history.achievements.map((a, i) => (
                                            <p key={i} className="text-[10px] text-slate-500">• {a}</p>
                                          ))}
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAssign(student.id, undefined)}
                            className="h-5 w-5 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom: Unassigned Students */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            Unassigned Students
            <Badge variant="secondary">{unassignedStudents.length}</Badge>
          </h3>
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search unassigned..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-[300px]">Student Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Squad History</TableHead>
                <TableHead className="text-right">Assign To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unassignedStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                    No unassigned students found.
                  </TableCell>
                </TableRow>
              ) : (
                unassignedStudents.map((student) => {
                  const history = squadHistory[student.id];
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell>Grade {grade?.level}</TableCell>
                      <TableCell>
                        {history ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 text-sm text-amber-600 w-fit px-2 py-1 rounded-full bg-amber-50 border border-amber-100">
                                  <Star className="h-3.5 w-3.5 fill-amber-600" />
                                  <span className="font-medium">Squad Member</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-medium">{history.squad} ({history.year})</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {HOUSES.map((house) => (
                            <button
                              key={house.value}
                              onClick={() => onAssign(student.id, house.value)}
                              className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all uppercase w-14 bg-white hover:scale-105 ${house.color} border-slate-200 hover:border-current shadow-sm`}
                            >
                              {house.label.substring(0, 3)}
                            </button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
