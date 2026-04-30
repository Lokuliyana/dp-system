"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, Users, Shield, Loader, Search, Info, UserCheck, GraduationCap } from "lucide-react";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge, Separator, ScrollArea, Avatar, AvatarFallback } from "@/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LiveSearch } from "@/components/reusable";
import {
  StatCard,
  DeleteConfirmationModal,
} from "@/components/reusable";
import { ClubFormDialog, type ClubFormData } from "@/components/clubs/ClubFormDialog";
import { ClubPositionDialog, type ClubPositionFormData } from "@/components/clubs/ClubPositionDialog";
import { 
  useClubs, 
  useCreateClub, 
  useUpdateClub, 
  useDeleteClub, 
  useAssignClubMember, 
  useCreateClubPosition, 
  useUpdateClubPosition, 
  useDeleteClubPosition, 
  useClubPositions, 
  useRemoveClubMember,
  useBulkAssignClubMember
} from "@/hooks/useClubs";
import { useTeachers } from "@/hooks/useTeachers";
import { useStudents, useStudentsByGrade } from "@/hooks/useStudents";
import { useGrades } from "@/hooks/useGrades";
import { useToast } from "@/hooks/use-toast";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { usePermission } from "@/hooks/usePermission";
import type { Club } from "@/types/models";
import { cn } from "@/lib/utils";

export function ClubsAndSocieties() {
  const { data: clubs = [], isLoading: isLoadingClubs } = useClubs();
  const { data: teachers = [], isLoading: isLoadingTeachers } = useTeachers();
  const { data: grades = [] } = useGrades();
  const { data: positions = [] } = useClubPositions();

  const createClub = useCreateClub();
  const updateClub = useUpdateClub();
  const deleteClub = useDeleteClub();
  const { can } = usePermission();

  const { toast } = useToast();
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedMembersToAdd, setSelectedMembersToAdd] = useState<any[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<string>("member");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");

  const { data: studentsData } = useStudentsByGrade(selectedGradeId, new Date().getFullYear());
  // const removeMemberMutation = useRemoveClubMember(selectedClubId); (Removed as it's defined below)

  const [formData, setFormData] = useState({
    nameSi: "",
    nameEn: "",
    descriptionSi: "",
    descriptionEn: "",
    teacherInChargeId: "",
    year: new Date().getFullYear(),
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
  const [gradeSearchTerm, setGradeSearchTerm] = useState("");
  const [positionSearchTerm, setPositionSearchTerm] = useState("");
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
  const [editingPositionId, setEditingPositionId] = useState<string | null>(null);
  const [positionFormData, setPositionFormData] = useState({
    nameSi: "",
    nameEn: "",
    responsibilitySi: "",
    responsibilityEn: "",
  });

  const createPosition = useCreateClubPosition();
  const updatePosition = useUpdateClubPosition();
  const deletePosition = useDeleteClubPosition();

  useEffect(() => {
    if (clubs.length > 0 && !selectedClubId) {
      const firstClub = clubs[0];
      setSelectedClubId(firstClub.id || (firstClub as any)._id);
    }
  }, [clubs, selectedClubId]);

  const selectedClub = clubs.find((c) => (c.id || (c as any)._id) === selectedClubId) || null;
  const bulkAssignMutation = useBulkAssignClubMember(selectedClubId);
  const removeMemberMutation = useRemoveClubMember(selectedClubId);
  const assignMemberMutation = useAssignClubMember(selectedClubId);

  const searchableUsers = useMemo(
    () => {
      const items = Array.isArray(studentsData) ? studentsData : (studentsData as any)?.items || [];
      return items.map((s: any) => ({
        _id: s._id || s.id,
        firstName: s.firstNameEn || s.firstNameSi,
        lastName: s.lastNameEn || s.lastNameSi,
        displayName: `${s.nameWithInitialsSi || s.fullNameSi || ''} (${s.admissionNumber || ''})`,
        email: s.email,
        admissionNumber: s.admissionNumber,
        gradeId: typeof s.gradeId === "string" ? s.gradeId : s.gradeId?._id,
        fullNameSi: s.fullNameSi || s.nameWithInitialsSi,
        type: "student",
      }));
    },
    [studentsData],
  );

  const filteredSearchableUsers = useMemo(() => {
    const q = studentSearchTerm.trim().toLowerCase();
    if (!q) return searchableUsers;
    return searchableUsers.filter((u: any) => 
      u.displayName.toLowerCase().includes(q) ||
      (u.admissionNumber || "").toLowerCase().includes(q) ||
      (u.fullNameSi || "").toLowerCase().includes(q)
    );
  }, [searchableUsers, studentSearchTerm]);

  const filteredClubs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return clubs;
    return clubs.filter((club) => {
      const teacher = teachers.find((t) => t.id === club.teacherInChargeId);
      const teacherName = teacher ? `${teacher.firstNameEn} ${teacher.lastNameEn}` : "";
      return (
        club.nameEn.toLowerCase().includes(q) ||
        (club.descriptionEn || "").toLowerCase().includes(q) ||
        teacherName.toLowerCase().includes(q)
      );
    });
  }, [clubs, searchTerm, teachers]);

  const searchableTeachers = useMemo(() => {
    return teachers.map((t: any) => ({
      ...t,
      displayName: t.fullNameEn ?? `${t.firstNameEn} ${t.lastNameEn}`,
    }));
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    const q = teacherSearchTerm.trim().toLowerCase();
    if (!q) return searchableTeachers;
    return searchableTeachers.filter((t: any) =>
      t.displayName.toLowerCase().includes(q)
    );
  }, [searchableTeachers, teacherSearchTerm]);

  const searchableGrades = useMemo(() => {
    return grades.map((g: any) => ({
      ...g,
      displayName: `${g.nameSi} (${g.nameEn})`,
    }));
  }, [grades]);

  const filteredGrades = useMemo(() => {
    const q = gradeSearchTerm.trim().toLowerCase();
    if (!q) return searchableGrades;
    return searchableGrades.filter((g: any) =>
      g.displayName.toLowerCase().includes(q)
    );
  }, [searchableGrades, gradeSearchTerm]);

  const searchablePositions = useMemo(() => {
    return [
      { id: "member", displayName: "General Member" },
      ...positions.map((p: any) => ({
        ...p,
        displayName: `${p.nameEn} / ${p.nameSi}`,
      })),
    ];
  }, [positions]);

  const filteredPositions = useMemo(() => {
    const q = positionSearchTerm.trim().toLowerCase();
    if (!q) return searchablePositions;
    return searchablePositions.filter((p: any) =>
      p.displayName.toLowerCase().includes(q)
    );
  }, [searchablePositions, positionSearchTerm]);

  const resetForm = () => {
    setFormData({
      nameSi: "",
      nameEn: "",
      descriptionSi: "",
      descriptionEn: "",
      teacherInChargeId: "",
      year: new Date().getFullYear(),
    });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (data: ClubFormData) => {
    const payload = {
      nameSi: data.nameSi,
      nameEn: data.nameEn,
      descriptionSi: data.descriptionSi,
      descriptionEn: data.descriptionEn,
      teacherInChargeId: data.teacherInChargeId,
      year: data.year,
    };

    if (editingId) {
      updateClub.mutate(
        { id: editingId, payload },
        {
          onSuccess: () => {
            toast({ title: "Club updated successfully" });
            resetForm();
          },
          onError: () =>
            toast({ title: "Failed to update club", variant: "destructive" }),
        },
      );
    } else {
      createClub.mutate(payload, {
        onSuccess: (c) => {
          toast({ title: "Club created successfully" });
          setSelectedClubId(c.id);
          resetForm();
        },
        onError: () =>
          toast({ title: "Failed to create club", variant: "destructive" }),
      });
    }
  };

  const handleEdit = (club: Club) => {
    setFormData({
      nameSi: club.nameSi,
      nameEn: club.nameEn,
      descriptionSi: club.descriptionSi || "",
      descriptionEn: club.descriptionEn || "",
      teacherInChargeId: club.teacherInChargeId,
      year: club.year,
    });
    setEditingId(club.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleAssignMembers = () => {
    if (!selectedClubId || !selectedMembersToAdd.length) return;

    const assignments = selectedMembersToAdd.map((user) => ({
      studentId: user.id,
      positionId: selectedPositionId === "member" ? null : selectedPositionId,
    }));

    bulkAssignMutation.mutate(assignments, {
      onSuccess: () => {
        toast({ title: `Successfully enrolled ${selectedMembersToAdd.length} student(s)` });
        setSelectedMembersToAdd([]);
      },
      onError: (err: any) => {
        toast({ 
          title: "Enrollment failed", 
          description: err.response?.data?.message || err.message,
          variant: "destructive" 
        });
      }
    });
  };

  const handlePositionSubmit = (data: ClubPositionFormData) => {
    if (editingPositionId) {
      updatePosition.mutate(
        { id: editingPositionId, payload: data },
        {
          onSuccess: () => {
            toast({ title: "Position updated successfully" });
            setEditingPositionId(null);
            setPositionFormData({ nameSi: "", nameEn: "", responsibilitySi: "", responsibilityEn: "" });
          },
        }
      );
    } else {
      createPosition.mutate(data, {
        onSuccess: () => {
          toast({ title: "Position created successfully" });
          setPositionFormData({ nameSi: "", nameEn: "", responsibilitySi: "", responsibilityEn: "" });
        },
      });
    }
  };

  const handlePositionEdit = (pos: any) => {
    if (!pos) {
      setEditingPositionId(null);
      setPositionFormData({ nameSi: "", nameEn: "", responsibilitySi: "", responsibilityEn: "" });
      return;
    }
    setEditingPositionId(pos.id);
    setPositionFormData({
      nameSi: pos.nameSi,
      nameEn: pos.nameEn,
      responsibilitySi: pos.responsibilitySi || "",
      responsibilityEn: pos.responsibilityEn || "",
    });
  };

  const mic = teachers.find((t) => t.id === selectedClub?.teacherInChargeId);

  if (isLoadingClubs || isLoadingTeachers) {
    return (
      <div className="flex h-[400px] items-center justify-center gap-2 text-sm text-slate-500">
        <Loader className="h-4 w-4 animate-spin" /> Loading clubs...
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-220px)] flex-col gap-6 lg:flex-row">
      {/* Left Sidebar - Club List */}
      <div className="flex w-full flex-col gap-4 lg:w-56">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search clubs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-col gap-2 overflow-y-auto pr-1">
          {filteredClubs.map((club) => (
            <button
              key={club.id || (club as any)._id}
              onClick={() => setSelectedClubId(club.id || (club as any)._id)}
              className={cn(
                "group flex flex-col gap-1 rounded-lg border p-3 text-left transition-all hover:border-primary/50",
                selectedClubId === (club.id || (club as any)._id)
                  ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                  : "border-slate-200 bg-white"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className={cn(
                    "font-semibold transition-colors",
                    selectedClubId === club.id ? "text-primary" : "text-slate-900"
                  )}>
                    {club.nameEn}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{club.nameSi}</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-normal uppercase">
                  {club.year}
                </Badge>
              </div>
              <p className="line-clamp-1 text-xs text-slate-500">{club.descriptionEn || "No description"}</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Users className="h-3 w-3" />
                  <span>{club.members?.length ?? 0} Members</span>
                </div>
                <Users className={cn(
                  "h-4 w-4 transition-all opacity-0 group-hover:opacity-100",
                  selectedClubId === club.id ? "text-primary opacity-100" : "text-slate-300"
                )} />
              </div>
            </button>
          ))}
          {filteredClubs.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-xl">
              <p className="text-sm text-slate-400">No clubs found</p>
            </div>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <PermissionGuard permission="activities.club_position.read">
            <Button 
                onClick={() => setIsPositionModalOpen(true)}
                variant="outline"
                className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5"
            >
                <Shield className="h-4 w-4" /> Manage Positions
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="activities.club.create">
            <Button 
                onClick={() => {
                setEditingId(null);
                setIsFormOpen(true);
                }}
                className="w-full gap-2"
            >
                <Plus className="h-4 w-4" /> New Club
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Main Content - Club Details */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {selectedClub ? (
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {/* Header Card */}
              <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100">
                          <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{selectedClub.nameEn}</h1>
                          <p className="text-lg text-primary font-medium mb-1">{selectedClub.nameSi}</p>
                          <p className="text-slate-500 text-sm max-w-2xl">{selectedClub.descriptionEn || selectedClub.descriptionSi || "A student-led organization at the school."}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PermissionGuard permission="activities.club.update">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(selectedClub)}
                          className="h-9 px-4"
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit Details
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard permission="activities.club.delete">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete(selectedClub.id)}
                          className="h-9 px-3"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </PermissionGuard>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Members</p>
                        <p className="text-xl font-bold text-slate-900">{selectedClub.members?.length ?? 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                        <UserCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Teacher In Charge</p>
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {mic ? (mic.nameWithInitialsSi || `${mic.firstNameEn} ${mic.lastNameEn}`) : "Not Assigned"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Academic Year</p>
                        <p className="text-xl font-bold text-slate-900">{selectedClub.year}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Member Management */}
                <Card className="lg:col-span-2 border-slate-200 shadow-sm overflow-hidden">
                  <CardHeader className="border-b bg-slate-50/50 pb-4 pt-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" /> Members & Roles
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <LiveSearch
                          data={filteredGrades}
                          labelKey="displayName"
                          valueKey="id"
                          onSearch={setGradeSearchTerm}
                          selected={(val) => setSelectedGradeId(val.item?.id || "")}
                          defaultSelected={selectedGradeId}
                          mode="filter"
                          placeholder="Grade"
                          popoverTriggerClases="h-8 text-[11px] font-bold uppercase tracking-wider w-[150px]"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-4 border-b bg-slate-50/20 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enroll Student</label>
                          <LiveSearch
                            data={filteredSearchableUsers}
                            labelKey="displayName"
                            valueKey="_id"
                            onSearch={setStudentSearchTerm}
                            selected={(_, ids) => {
                              const selected = searchableUsers.filter((u: any) => ids.includes(u._id));
                              setSelectedMembersToAdd(selected);
                            }}
                            multiple={true}
                            defaultSelected={selectedMembersToAdd.map(u => u._id)}
                            placeholder={selectedGradeId ? "Type student name..." : "← Select grade first"}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role / Position</label>
                          <LiveSearch
                            data={filteredPositions}
                            labelKey="displayName"
                            valueKey="id"
                            onSearch={setPositionSearchTerm}
                            selected={(val) => setSelectedPositionId(val.item?.id || "member")}
                            defaultSelected={selectedPositionId}
                            placeholder="Select role"
                          />
                        </div>
                      </div>
                      <PermissionGuard permission="activities.club.update">
                        <Button
                          className="w-full gap-2"
                          onClick={handleAssignMembers}
                          disabled={!selectedMembersToAdd.length || bulkAssignMutation.isPending}
                          size="sm"
                        >
                          {bulkAssignMutation.isPending ? <Loader className="animate-spin h-4 w-4" /> : <><Plus className="h-4 w-4" /> Confirm Enrollment</>}
                        </Button>
                      </PermissionGuard>
                    </div>

                    <div className="border-t">
                      {(selectedClub.members || []).length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50/50">
                              <TableHead className="w-[80px] text-[10px] font-bold uppercase tracking-widest text-slate-500"></TableHead>
                              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Name</TableHead>
                              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Admission</TableHead>
                              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Role</TableHead>
                              <TableHead className="w-[50px] text-right"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(selectedClub.members || []).map((m: any) => {
                              const student = m.studentId;
                              const pos = m.positionId;
                              const studentNameEn = student?.firstNameEn ? `${student.firstNameEn} ${student.lastNameEn}` : `Student ${m.studentId}`;
                              const admissionNo = student?.admissionNumber || "N/A";
                              const studentId = typeof student === 'string' ? student : (student?.id || student?._id);

                              return (
                                <TableRow key={studentId} className="hover:bg-slate-50/50 border-slate-100">
                                  <TableCell className="py-3">
                                    <Avatar className="h-8 w-8 border-white shadow-sm ring-1 ring-slate-100">
                                      <AvatarFallback className="bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                                        {typeof student === 'string' ? student.slice(0, 1).toUpperCase() : (student?.firstNameEn?.[0] || 'S')}
                                      </AvatarFallback>
                                    </Avatar>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="text-xs font-semibold text-slate-900">
                                      {student?.nameWithInitialsSi || studentNameEn} ({admissionNo})
                                    </div>
                                    <div className="text-[10px] text-slate-500">{studentNameEn}</div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <Badge variant="outline" className="text-[10px] font-semibold bg-slate-50 text-slate-600 border-slate-200">
                                      {admissionNo}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <PermissionGuard permission="activities.club.update">
                                      <Select
                                        value={(pos as any)?.id || "member"}
                                        onValueChange={(val) => {
                                          assignMemberMutation.mutate({
                                            studentId,
                                            positionId: val === "member" ? null : val,
                                          });
                                        }}
                                        disabled={assignMemberMutation.isPending}
                                      >
                                        <SelectTrigger className="h-7 text-xs w-32 border-slate-200">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="member">Member</SelectItem>
                                          {positions.map((p: any) => (
                                            <SelectItem key={p.id} value={p.id}>{p.nameEn}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </PermissionGuard>
                                  </TableCell>
                                  <TableCell className="py-3 text-right">
                                    <PermissionGuard permission="activities.club.update">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                        onClick={() => removeMemberMutation.mutate(studentId)}
                                        disabled={removeMemberMutation.isPending}
                                      >
                                        {removeMemberMutation.isPending ? <Loader className="animate-spin h-3 w-3" /> : <Trash2 className="h-3.5 w-3.5" />}
                                      </Button>
                                    </PermissionGuard>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                          <Users className="mb-2 h-10 w-10 opacity-20" />
                          <h3 className="text-sm font-bold text-slate-900 mb-1 tracking-tight">No Members Enrolled</h3>
                          <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed">
                            This club currently has no students assigned. Use the &apos;Add Student&apos; tool above to begin.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Sidebar Cards */}
                <div className="space-y-6">
                  <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b pb-3 pt-3">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-500" /> Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Teacher In Charge</p>
                        {mic ? (
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                                {mic.firstNameEn?.[0]}{mic.lastNameEn?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{mic.firstNameEn} {mic.lastNameEn}</p>
                              <p className="text-[10px] text-slate-600 font-medium">{mic.nameWithInitialsSi}</p>
                              <p className="text-[10px] text-slate-500 italic mt-0.5">Master In Charge</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 italic">No teacher assigned</p>
                        )}
                      </div>
                      <Separator className="bg-slate-100" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Overview</p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="rounded-lg bg-orange-50 p-2 border border-orange-100">
                            <p className="text-[9px] font-bold text-orange-600 uppercase tracking-tighter">Positions</p>
                            <p className="text-lg font-bold text-orange-700">{selectedClub.members?.filter(m => m.positionId).length ?? 0}</p>
                          </div>
                          <div className="rounded-lg bg-emerald-50 p-2 border border-emerald-100">
                            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">Activity</p>
                            <p className="text-lg font-bold text-emerald-700">High</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
             <div className="h-20 w-20 flex items-center justify-center rounded-3xl bg-white shadow-xl ring-1 ring-slate-100">
                <Shield className="h-10 w-10 text-slate-300" />
             </div>
             <div className="max-w-[280px]">
                <h3 className="text-lg font-bold text-slate-900">Select a Club</h3>
                <p className="text-sm text-slate-500 mt-1">Pick a club from the left sidebar to manage its members, roles and details.</p>
             </div>
          </div>
        )}
      </div>

      <ClubFormDialog
        isOpen={isFormOpen}
        onClose={resetForm}
        onSubmit={handleSubmit}
        isEditing={!!editingId}
        isLoading={createClub.isPending || updateClub.isPending}
        defaultValues={editingId ? formData : undefined}
        filteredTeachers={filteredTeachers}
        onTeacherSearch={setTeacherSearchTerm}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (itemToDelete) {
            deleteClub.mutate(itemToDelete, {
              onSuccess: () => {
                toast({ title: "Club deleted" });
                if (selectedClubId === itemToDelete) {
                  setSelectedClubId(clubs.find(c => c.id !== itemToDelete)?.id || "");
                }
              },
              onError: () =>
                toast({ title: "Failed to delete club", variant: "destructive" }),
            });
          }
          setIsDeleteModalOpen(false);
        }}
        title="Permanently delete club?"
        description="This action cannot be undone. All membership data for this club will be lost forever."
      />

      <ClubPositionDialog
        isOpen={isPositionModalOpen}
        onClose={() => {
          setIsPositionModalOpen(false);
          setEditingPositionId(null);
          setPositionFormData({ nameSi: "", nameEn: "", responsibilitySi: "", responsibilityEn: "" });
        }}
        onSubmit={handlePositionSubmit}
        onEdit={handlePositionEdit}
        onDelete={(id) => deletePosition.mutate(id)}
        isLoading={createPosition.isPending || updatePosition.isPending}
        editingId={editingPositionId}
        defaultValues={editingPositionId ? positionFormData : undefined}
        positions={positions}
      />
    </div>
  );
}
