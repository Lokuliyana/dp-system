"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, Users, Shield, Loader } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Badge } from "@/components/ui";
import { LiveUserSearch, type SearchableUser } from "@/components/shared";
import {
  ManagementConsole,
  StatCard,
  CrudModal,
  DeleteConfirmationModal,
} from "@/components/reusable";
import {
  useClubs,
  useCreateClub,
  useUpdateClub,
  useDeleteClub,
  useAssignClubMember,
} from "@/hooks/useClubs";
import { useTeachers } from "@/hooks/useTeachers";
import { useStudents } from "@/hooks/useStudents";
import { useClubPositions } from "@/hooks/useClubs";
import { useToast } from "@/hooks/use-toast";
import type { Club } from "@/types/models";

export function ClubsAndSocieties() {
  const { data: clubs = [], isLoading: isLoadingClubs } = useClubs();
  const { data: teachers = [], isLoading: isLoadingTeachers } = useTeachers();
  const { data: students = [], isLoading: isLoadingStudents } = useStudents();
  const { data: positions = [] } = useClubPositions();

  const createClub = useCreateClub();
  const updateClub = useUpdateClub();
  const deleteClub = useDeleteClub();

  const { toast } = useToast();
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedMembersToAdd, setSelectedMembersToAdd] = useState<SearchableUser[]>([]);
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    teacherInChargeId: "",
    year: new Date().getFullYear(),
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (clubs.length > 0 && !clubs.find((c) => c.id === selectedClubId)) {
      setSelectedClubId(clubs[0].id);
    }
  }, [clubs, selectedClubId]);

  const selectedClub = clubs.find((c) => c.id === selectedClubId) || null;
  const assignMemberMutation = useAssignClubMember(selectedClubId);

  const searchableUsers: SearchableUser[] = useMemo(
    () =>
      students.map((s) => ({
        id: s.id,
        firstName: s.firstNameEn ?? s.firstName,
        lastName: s.lastNameEn ?? s.lastName,
        email: s.email,
        gradeId: s.gradeId,
        type: "student",
      })),
    [students],
  );

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

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" ? Number(value) || prev.year : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      teacherInChargeId: "",
      year: new Date().getFullYear(),
    });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      nameSi: formData.name,
      nameEn: formData.name,
      descriptionSi: formData.description,
      descriptionEn: formData.description,
      teacherInChargeId: formData.teacherInChargeId,
      year: formData.year,
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
      name: club.nameEn,
      description: club.descriptionEn || "",
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

    selectedMembersToAdd.forEach((user) => {
      assignMemberMutation.mutate({
        studentId: user.id,
        positionId: null,
      });
    });

    setSelectedMembersToAdd([]);
    setShowMemberSearch(false);
  };

  const totalMembers = clubs.reduce((acc, c) => acc + (c.members?.length || 0), 0);

  if (isLoadingClubs || isLoadingTeachers || isLoadingStudents) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader className="h-4 w-4 animate-spin" /> Loading clubs...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ManagementConsole
        title="Clubs & Societies"
        description="Create clubs, assign MIC, and manage memberships."
        actionLabel="New Club"
        onAction={() => {
          setEditingId(null);
          setIsFormOpen(true);
        }}
        searchPlaceholder="Search clubs or teachers..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard
            title="Total Clubs"
            value={clubs.length}
            icon={Shield}
          />
          <StatCard
            title="Active MICs"
            value={new Set(clubs.map((c) => c.teacherInChargeId)).size}
            icon={Users}
          />
          <StatCard
            title="Members"
            value={totalMembers}
            icon={Users}
          />
          <StatCard
            title="Positions"
            value={positions.length}
            icon={Shield}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            {filteredClubs.map((club) => {
              const mic = teachers.find((t) => t.id === club.teacherInChargeId);
              return (
                <Card key={club.id} className="shadow-sm border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-semibold">
                      {club.nameEn}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(club)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(club.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-slate-600">{club.descriptionEn}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <Badge variant="outline">Year {club.year}</Badge>
                      <Badge variant="secondary">
                        MIC: {mic ? `${mic.firstNameEn} ${mic.lastNameEn}` : "—"}
                      </Badge>
                      <Badge variant="outline">{club.members?.length ?? 0} members</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(club.members || []).map((m) => (
                        <Badge key={m.studentId} variant="outline">
                          Student {m.studentId}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {!filteredClubs.length && (
              <p className="text-sm text-slate-500">No clubs match the search.</p>
            )}
          </div>

          <div className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Add Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowMemberSearch((s) => !s)}
                  disabled={!selectedClubId}
                >
                  <Plus className="h-4 w-4" /> Add students
                </Button>
                {showMemberSearch && (
                  <>
                    <LiveUserSearch
                      users={searchableUsers}
                      selected={selectedMembersToAdd}
                      onChange={setSelectedMembersToAdd}
                    />
                    <Button
                      className="w-full"
                      onClick={handleAssignMembers}
                      disabled={!selectedMembersToAdd.length}
                    >
                      Assign to club
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </ManagementConsole>

      <CrudModal
        title={editingId ? "Edit Club" : "Create Club"}
        isOpen={isFormOpen}
        onClose={resetForm}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Name</label>
            <Input name="name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <Input
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description (optional)"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Teacher in charge</label>
            <select
              name="teacherInChargeId"
              value={formData.teacherInChargeId}
              onChange={handleInputChange}
              className="w-full rounded border px-3 py-2 text-sm"
              required
            >
              <option value="">Select teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstNameEn} {t.lastNameEn}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Year</label>
            <Input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={createClub.isPending || updateClub.isPending}>
              {editingId ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </CrudModal>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (itemToDelete) {
            deleteClub.mutate(itemToDelete, {
              onSuccess: () => toast({ title: "Club deleted" }),
              onError: () =>
                toast({ title: "Failed to delete club", variant: "destructive" }),
            });
          }
          setIsDeleteModalOpen(false);
        }}
        title="Delete club?"
        description="This will remove the club and its memberships."
      />
    </div>
  );
}
