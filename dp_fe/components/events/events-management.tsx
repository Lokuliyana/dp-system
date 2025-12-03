"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Users, Plus, Edit, Trash2, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from "@/components/ui";
import {
  ManagementConsole,
  CrudModal,
  DeleteConfirmationModal,
} from "@/components/reusable";
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useRegisterEventStudent,
  useEventRegistrations,
} from "@/hooks/useEvents";
import { useStudentsByGrade } from "@/hooks/useStudents";
import { useGrades } from "@/hooks/useGrades";
import { useTeachers } from "@/hooks/useTeachers";
import { LiveUserSearch, type SearchableUser } from "@/components/shared";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@/types/models";

export function EventsManagement() {
  const { data: events = [], isLoading: isLoadingEvents } = useEvents();
  const { data: grades = [] } = useGrades();
  const { data: teachers = [] } = useTeachers();
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(grades[0]?.id || null);
  const { data: students = [] } = useStudentsByGrade(selectedGradeId || "", 2024);
  useEffect(() => {
    if (!selectedGradeId && grades.length) {
      setSelectedGradeId(grades[0].id);
    }
  }, [grades, selectedGradeId]);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const { data: eventRegistrations = [] } = useEventRegistrations(selectedEventId || "");
  const registerStudent = useRegisterEventStudent(selectedEventId || "");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedUsersToAdd, setSelectedUsersToAdd] = useState<SearchableUser[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    year: new Date().getFullYear(),
    teacherInChargeId: "",
  });

  const filteredEvents = useMemo(
    () =>
      events.filter(
        (e) =>
          e.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (e.descriptionEn || "").toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [events, searchTerm],
  );

  const currentEvent: Event | null = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

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
      date: "",
      year: new Date().getFullYear(),
      teacherInChargeId: "",
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
      eventType: "general",
      date: formData.date,
      gradeIds: selectedGradeId ? [selectedGradeId] : [],
      teacherInChargeId: formData.teacherInChargeId,
      year: formData.year,
    };

    if (editingId) {
      updateEvent.mutate(
        { id: editingId, payload },
        {
          onSuccess: () => {
            toast({ title: "Event updated" });
            resetForm();
          },
          onError: () => toast({ title: "Failed to update event", variant: "destructive" }),
        },
      );
    } else {
      createEvent.mutate(payload, {
        onSuccess: (ev) => {
          toast({ title: "Event created" });
          setSelectedEventId(ev.id);
          resetForm();
        },
        onError: () => toast({ title: "Failed to create event", variant: "destructive" }),
      });
    }
  };

  const handleEdit = (ev: Event) => {
    setFormData({
      name: ev.nameEn,
      description: ev.descriptionEn || "",
      date: ev.date?.slice(0, 10) || "",
      year: ev.year,
      teacherInChargeId: ev.teacherInChargeId,
    });
    setEditingId(ev.id);
    setIsFormOpen(true);
  };

  const handleRegister = () => {
    if (!selectedEventId || !selectedUsersToAdd.length) return;
    selectedUsersToAdd.forEach((user) =>
      registerStudent.mutate(
        {
          eventId: selectedEventId,
          studentId: user.id,
          year: formData.year,
        },
        {
          onError: () => toast({ title: "Failed to register student", variant: "destructive" }),
        },
      ),
    );
    setSelectedUsersToAdd([]);
  };

  if (isLoadingEvents) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Loader className="h-4 w-4 animate-spin" /> Loading events...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ManagementConsole
        title="Events"
        description="Plan events, assign MIC teachers, and register students."
        actionLabel="New Event"
        onAction={() => {
          setEditingId(null);
          setIsFormOpen(true);
        }}
        searchPlaceholder="Search events..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            {filteredEvents.map((ev) => {
              const mic = teachers.find((t) => t.id === ev.teacherInChargeId);
              return (
                <Card key={ev.id} className="border shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold">{ev.nameEn}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(ev)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setItemToDelete(ev.id);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-slate-600">{ev.descriptionEn}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <Badge variant="outline">{ev.year}</Badge>
                      <Badge variant="secondary">
                        MIC: {mic ? `${mic.firstNameEn} ${mic.lastNameEn}` : "—"}
                      </Badge>
                      <Badge variant="outline">
                        {ev.gradeIds?.length ? `${ev.gradeIds.length} grades` : "All grades"}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEventId(ev.id)}
                      className="gap-2"
                    >
                      <Calendar className="h-4 w-4" /> View registrations
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            {!filteredEvents.length && (
              <p className="text-sm text-slate-500">No events match the search.</p>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Registrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-500">Grade</label>
                <select
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={selectedGradeId || ""}
                  onChange={(e) => setSelectedGradeId(e.target.value || null)}
                >
                  <option value="">All grades</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <LiveUserSearch
                users={searchableUsers}
                selected={selectedUsersToAdd}
                onChange={setSelectedUsersToAdd}
              />
              <Button
                className="w-full"
                onClick={handleRegister}
                disabled={!selectedUsersToAdd.length || !selectedEventId}
              >
                Register students
              </Button>

              <div className="space-y-2">
                {eventRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between rounded border px-2 py-1 text-xs"
                  >
                    <span>{reg.studentId}</span>
                    <Badge variant="outline">{reg.year}</Badge>
                  </div>
                ))}
                {!eventRegistrations.length && (
                  <p className="text-xs text-slate-500">No registrations for this event.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </ManagementConsole>

      <CrudModal
        title={editingId ? "Edit Event" : "Create Event"}
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
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
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
            <label className="text-sm font-medium">Grades</label>
            <select
              className="w-full rounded border px-3 py-2 text-sm"
              value={selectedGradeId || ""}
              onChange={(e) => setSelectedGradeId(e.target.value || null)}
            >
              <option value="">All grades</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nameEn}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEvent.isPending || updateEvent.isPending}>
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
            deleteEvent.mutate(itemToDelete, {
              onSuccess: () => toast({ title: "Event deleted" }),
              onError: () => toast({ title: "Failed to delete event", variant: "destructive" }),
            });
          }
          setIsDeleteModalOpen(false);
        }}
        title="Delete event?"
        description="This will remove the event and all registrations."
      />
    </div>
  );
}
