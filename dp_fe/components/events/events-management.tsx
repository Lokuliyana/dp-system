"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Users, Plus, Edit, Trash2, Loader, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from "@/components/ui";
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
  useRemoveEventRegistration,
} from "@/hooks/useEvents";
import { useStudentsByGrade } from "@/hooks/useStudents";
import { useGrades } from "@/hooks/useGrades";
import { useTeachers } from "@/hooks/useTeachers";
import { LiveUserSearch, type SearchableUser } from "@/components/shared";
import { useToast } from "@/hooks/use-toast";
import type { Event, EventCategory } from "@/types/models";

export function EventsManagement() {
  const { data: events = [], isLoading: isLoadingEvents } = useEvents();
  const { data: grades = [] } = useGrades();
  const { data: teachers = [] } = useTeachers();
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(grades[0]?.id || null);
  const { data: students = [] } = useStudentsByGrade(selectedGradeId || "", new Date().getFullYear());
  
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
  const removeRegistration = useRemoveEventRegistration(selectedEventId || "");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedUsersToAdd, setSelectedUsersToAdd] = useState<SearchableUser[]>([]);
  const [registrationNote, setRegistrationNote] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "regular" as EventCategory,
    startDate: "",
    endDate: "",
    year: new Date().getFullYear(),
    chairHeadTeacherId: "",
  });

  const filteredEvents = useMemo(
    () =>
      events.filter(
        (e) =>
          e.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      title: "",
      description: "",
      category: "regular",
      startDate: "",
      endDate: "",
      year: new Date().getFullYear(),
      chairHeadTeacherId: "",
    });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      titleSi: formData.title,
      titleEn: formData.title,
      descriptionSi: formData.description,
      descriptionEn: formData.description,
      category: formData.category,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      gradeIds: selectedGradeId ? [selectedGradeId] : [],
      chairHeadTeacherId: formData.chairHeadTeacherId || undefined,
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
      title: ev.titleEn,
      description: ev.descriptionEn || "",
      category: ev.category,
      startDate: ev.startDate?.slice(0, 10) || "",
      endDate: ev.endDate?.slice(0, 10) || "",
      year: ev.year,
      chairHeadTeacherId: ev.chairHeadTeacherId || "",
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
          noteEn: registrationNote,
        },
        {
          onError: () => toast({ title: "Failed to register student", variant: "destructive" }),
          onSuccess: () => {
             toast({ title: "Student registered" });
             setRegistrationNote("");
          }
        },
      ),
    );
    setSelectedUsersToAdd([]);
  };
  
  const handleRemoveRegistration = (regId: string) => {
      removeRegistration.mutate(regId, {
          onSuccess: () => toast({ title: "Registration removed" }),
          onError: () => toast({ title: "Failed to remove registration", variant: "destructive" }),
      });
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
        description="Plan events, assign Chair Heads, and register students."
        actionLabel="New Event"
        onAction={() => {
          setEditingId(null);
          setIsFormOpen(true);
        }}
        searchPlaceholder="Search events..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {filteredEvents.map((ev) => {
              const chairHead = teachers.find((t) => t.id === ev.chairHeadTeacherId);
              return (
                <Card key={ev.id} className={`border shadow-sm transition-all ${selectedEventId === ev.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-semibold">{ev.titleEn}</CardTitle>
                        <Badge variant={ev.category === 'main' ? 'default' : 'secondary'} className="uppercase text-[10px]">
                            {ev.category}
                        </Badge>
                    </div>
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
                  <CardContent className="space-y-3">
                    <p className="text-sm text-slate-600">{ev.descriptionEn}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                        <Calendar className="h-3 w-3" />
                        <span>{ev.startDate?.slice(0, 10)} {ev.endDate ? ` - ${ev.endDate.slice(0, 10)}` : ''}</span>
                      </div>
                      <Badge variant="outline">{ev.year}</Badge>
                      {chairHead && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                          Chair: {chairHead.firstNameEn} {chairHead.lastNameEn}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant={selectedEventId === ev.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedEventId(ev.id)}
                      className="w-full gap-2 mt-2"
                    >
                      <Users className="h-4 w-4" /> 
                      {selectedEventId === ev.id ? "Viewing Registrations" : "View Registrations"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            {!filteredEvents.length && (
              <p className="text-sm text-slate-500">No events match the search.</p>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="h-full border-l-4 border-l-primary/20">
                <CardHeader className="pb-3 border-b bg-slate-50/50">
                    <CardTitle className="text-sm font-semibold flex items-center justify-between">
                        <span>Registrations</span>
                        {currentEvent && <Badge variant="outline" className="ml-2 truncate max-w-[120px]">{currentEvent.titleEn}</Badge>}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    {!selectedEventId ? (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            Select an event to manage registrations
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3 p-3 bg-slate-50 rounded-lg border">
                                <h4 className="text-xs font-semibold uppercase text-slate-500">Add Student</h4>
                                <div className="space-y-2">
                                    <select
                                    className="w-full rounded border px-3 py-2 text-sm bg-white"
                                    value={selectedGradeId || ""}
                                    onChange={(e) => setSelectedGradeId(e.target.value || null)}
                                    >
                                    <option value="">Select Grade</option>
                                    {grades.map((g) => (
                                        <option key={g.id} value={g.id}>
                                        {g.nameEn}
                                        </option>
                                    ))}
                                    </select>

                                    <LiveUserSearch
                                        users={searchableUsers}
                                        selected={selectedUsersToAdd}
                                        onChange={setSelectedUsersToAdd}
                                    />
                                    
                                    <Input 
                                        placeholder="Description (e.g. Role, Task)" 
                                        value={registrationNote}
                                        onChange={(e) => setRegistrationNote(e.target.value)}
                                        className="bg-white"
                                    />

                                    <Button
                                        className="w-full"
                                        onClick={handleRegister}
                                        disabled={!selectedUsersToAdd.length}
                                        size="sm"
                                    >
                                        Add to Event
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase text-slate-500 mt-4 mb-2">
                                    Registered Students ({eventRegistrations.length})
                                </h4>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                    {eventRegistrations.map((reg) => {
                                        // Try to find student info if available in the current loaded students
                                        // Note: This might miss students if they are not in the currently selected grade
                                        // Ideally, we should fetch student details for registrations
                                        const studentInfo = students.find(s => s.id === reg.studentId);
                                        
                                        return (
                                            <div
                                                key={reg.id}
                                                className="group flex flex-col gap-1 rounded-md border p-2 text-sm hover:bg-slate-50 transition-colors relative"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className="font-medium text-slate-900">
                                                        {studentInfo ? `${studentInfo.firstNameEn} ${studentInfo.lastNameEn}` : reg.studentId}
                                                    </span>
                                                    <button 
                                                        onClick={() => handleRemoveRegistration(reg.id)}
                                                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-opacity"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                {reg.noteEn && (
                                                    <p className="text-xs text-slate-500 italic">{reg.noteEn}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {!eventRegistrations.length && (
                                        <p className="text-xs text-slate-400 text-center py-4">No students registered yet.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
          </div>
        </div>
      </ManagementConsole>

      <CrudModal
        title={editingId ? "Edit Event" : "Create Event"}
        isOpen={isFormOpen}
        onClose={resetForm}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Title</label>
            <Input name="title" value={formData.title} onChange={handleInputChange} required placeholder="Event Title" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-sm font-medium">Category</label>
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <option value="regular">Regular</option>
                    <option value="main">Main Event</option>
                    <option value="squad">Squad Wise</option>
                    <option value="club">Club Wise</option>
                    <option value="academic">Academic</option>
                    <option value="staff">Staff</option>
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
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Event Description (optional)"
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Start Date</label>
              <Input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">End Date</label>
              <Input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Chair Head / Teacher in Charge</label>
            <select
              name="chairHeadTeacherId"
              value={formData.chairHeadTeacherId}
              onChange={handleInputChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select Teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstNameEn} {t.lastNameEn}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEvent.isPending || updateEvent.isPending}>
              {editingId ? "Update Event" : "Create Event"}
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
