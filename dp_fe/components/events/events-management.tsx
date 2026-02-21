"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Users, Plus, Edit, Trash2, Loader, X, Search, Info, Flag, Clock, UserCheck } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button, 
  Input, 
  Badge, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
  Textarea,
  Separator,
  ScrollArea,
  Avatar,
  AvatarFallback
} from "@/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
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
  useBulkRegisterEventStudents,
} from "@/hooks/useEvents";
import { useStudents, useStudentsByGrade } from "@/hooks/useStudents";
import { useGrades } from "@/hooks/useGrades";
import { useTeachers } from "@/hooks/useTeachers";
import { useClubs } from "@/hooks/useClubs";
import { useSquads } from "@/hooks/useSquads";
import { LiveSearch } from "@/components/reusable";
import { useToast } from "@/hooks/use-toast";
import type { Event, EventCategory } from "@/types/models";
import { cn } from "@/lib/utils";

export function EventsManagement() {
  const { data: events = [], isLoading: isLoadingEvents } = useEvents();
  const { data: grades = [] } = useGrades();
  const { data: teachers = [] } = useTeachers();
  const { data: clubs = [] } = useClubs();
  const { data: squads = [] } = useSquads();
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  
  const { data: studentsData } = useStudents({ limit: 1000 });
  const allStudents = studentsData?.items || [];

  const { data: studentsByGradeData } = useStudentsByGrade(selectedGradeId || "", new Date().getFullYear());
  const studentsByGrade = studentsByGradeData || [];
  
  useEffect(() => {
    if (!selectedGradeId && grades.length) {
      const firstGrade = grades[0];
      setSelectedGradeId(firstGrade.id || (firstGrade as any)._id);
    }
  }, [grades, selectedGradeId]);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
  const [clubSearchTerm, setClubSearchTerm] = useState("");
  const [squadSearchTerm, setSquadSearchTerm] = useState("");
  const [gradeSearchTerm, setGradeSearchTerm] = useState("");

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const { data: eventRegistrations = [] } = useEventRegistrations(selectedEventId || "");
  const registerStudent = useRegisterEventStudent(selectedEventId || "");
  const bulkRegisterMutation = useBulkRegisterEventStudents(selectedEventId || "");
  const removeRegistration = useRemoveEventRegistration(selectedEventId || "");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedUsersToAdd, setSelectedUsersToAdd] = useState<any[]>([]);
  const [registrationNote, setRegistrationNote] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "regular" as EventCategory,
    date: "",
    endDate: "",
    year: new Date().getFullYear(),
    teacherInChargeId: "",
    clubId: "",
    squadId: "",
  });

  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      const firstEvent = events[0];
      setSelectedEventId(firstEvent.id || (firstEvent as any)._id);
    }
  }, [events, selectedEventId]);

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
    () => events.find((e) => (e.id || (e as any)._id) === selectedEventId) ?? null,
    [events, selectedEventId],
  );

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

  const searchableClubs = useMemo(() => {
    return clubs.map((c: any) => ({
      ...c,
      displayName: c.nameEn,
    }));
  }, [clubs]);

  const filteredClubs = useMemo(() => {
    const q = clubSearchTerm.trim().toLowerCase();
    if (!q) return searchableClubs;
    return searchableClubs.filter((c: any) =>
      c.displayName.toLowerCase().includes(q)
    );
  }, [searchableClubs, clubSearchTerm]);

  const searchableSquads = useMemo(() => {
    return squads.map((s: any) => ({
      ...s,
      displayName: s.nameEn,
    }));
  }, [squads]);

  const filteredSquads = useMemo(() => {
    const q = squadSearchTerm.trim().toLowerCase();
    if (!q) return searchableSquads;
    return searchableSquads.filter((s: any) =>
      s.displayName.toLowerCase().includes(q)
    );
  }, [searchableSquads, squadSearchTerm]);

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

  const searchableUsers = useMemo(
    () =>
      studentsByGrade.map((s: any) => ({
        _id: s._id || s.id,
        firstName: s.firstNameEn || s.firstNameSi,
        lastName: s.lastNameEn || s.lastNameSi,
        displayName: `${s.nameWithInitialsSi || s.fullNameSi || ''} (${s.admissionNumber || ''})`,
        email: s.email,
        admissionNumber: s.admissionNumber,
        gradeId: typeof s.gradeId === "string" ? s.gradeId : s.gradeId?._id,
        fullNameSi: s.fullNameSi || s.nameWithInitialsSi,
        type: "student",
      })),
    [studentsByGrade],
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
      eventType: "regular",
      date: "",
      endDate: "",
      year: new Date().getFullYear(),
      teacherInChargeId: "",
      clubId: "",
      squadId: "",
    });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nameSi: formData.title,
      nameEn: formData.title,
      descriptionSi: formData.description,
      descriptionEn: formData.description,
      eventType: formData.eventType,
      date: formData.date,
      endDate: formData.endDate || undefined,
      gradeIds: selectedGradeId ? [selectedGradeId] : [],
      teacherInChargeId: formData.teacherInChargeId || undefined,
      year: formData.year,
      clubId: formData.eventType === 'club' ? formData.clubId || undefined : undefined,
      squadId: formData.eventType === 'squad' ? formData.squadId || undefined : undefined,
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
      title: ev.nameEn,
      description: ev.descriptionEn || "",
      eventType: ev.eventType,
      date: ev.date?.slice(0, 10) || "",
      endDate: ev.endDate?.slice(0, 10) || "",
      year: ev.year,
      teacherInChargeId: ev.teacherInChargeId || "",
      clubId: ev.clubId || "",
      squadId: ev.squadId || "",
    });
    setEditingId(ev.id);
    setIsFormOpen(true);
  };

  const handleRegister = () => {
    if (!selectedEventId || !selectedUsersToAdd.length || !selectedGradeId) {
      if (!selectedGradeId) toast({ title: "Please select a grade first", variant: "destructive" });
      return;
    }

    bulkRegisterMutation.mutate(
      {
        studentIds: selectedUsersToAdd.map((u) => u.id),
        gradeId: selectedGradeId,
        year: formData.year,
        noteEn: registrationNote,
      },
      {
        onSuccess: () => {
          toast({ title: `Successfully registered ${selectedUsersToAdd.length} students` });
          setSelectedUsersToAdd([]);
          setRegistrationNote("");
        },
        onError: (err: any) => {
          toast({
            title: "Registration failed",
            description: err.response?.data?.message || err.message,
            variant: "destructive",
          });
        },
      },
    );
  };
  
  const handleRemoveRegistration = (regId: string) => {
      removeRegistration.mutate(regId, {
          onSuccess: () => toast({ title: "Registration removed" }),
          onError: () => toast({ title: "Failed to remove registration", variant: "destructive" }),
      });
  };

  const chairHead = teachers.find((t) => t.id === currentEvent?.teacherInChargeId);

  if (isLoadingEvents) {
    return (
      <div className="flex h-[400px] items-center justify-center gap-2 text-sm text-slate-500">
        <Loader className="h-4 w-4 animate-spin" /> Loading events...
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-220px)] flex-col gap-6 lg:flex-row">
      {/* Left Sidebar - Event List */}
      <div className="flex w-full flex-col gap-4 lg:w-80">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-col gap-2 overflow-y-auto pr-1">
          {filteredEvents.map((ev) => (
            <button
              key={ev.id || (ev as any)._id}
              onClick={() => setSelectedEventId(ev.id || (ev as any)._id)}
              className={cn(
                "group flex flex-col gap-1 rounded-xl border p-4 text-left transition-all hover:border-primary/50",
                selectedEventId === (ev.id || (ev as any)._id)
                  ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                  : "border-slate-200 bg-white"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "font-semibold transition-colors",
                  selectedEventId === (ev.id || (ev as any)._id) ? "text-primary" : "text-slate-900"
                )}>
                  {ev.nameEn}
                </span>
                <Badge variant="outline" className="text-[10px] font-normal uppercase">
                  {ev.year}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={ev.eventType === 'main' ? 'default' : 'secondary'} className="text-[9px] h-4 px-1 shadow-none">
                  {ev.eventType}
                </Badge>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Calendar className="h-3 w-3" />
                  <span>{ev.date?.slice(0, 10)}</span>
                </div>
              </div>
            </button>
          ))}
          {filteredEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-xl">
              <p className="text-sm text-slate-400">No events found</p>
            </div>
          )}
        </div>

        <Button 
          onClick={() => {
            setEditingId(null);
            setIsFormOpen(true);
          }}
          className="mt-auto w-full gap-2"
        >
          <Plus className="h-4 w-4" /> New Event
        </Button>
      </div>

      {/* Main Content - Event Details */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {currentEvent ? (
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {/* Header Card */}
              <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                          <Flag className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <h1 className="text-2xl font-bold tracking-tight text-slate-900">{currentEvent.nameEn}</h1>
                             <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 uppercase text-[10px] font-bold">
                                {currentEvent.eventType}
                             </Badge>
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">{currentEvent.descriptionEn || "Plan, organize and track school activities."}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(currentEvent)}
                        className="h-9 border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        <Edit className="mr-2 h-3.5 w-3.5" /> Edit Event
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setItemToDelete(currentEvent.id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="h-9 w-9 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50/50 p-4 border border-slate-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-100 text-primary shadow-sm">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Participants</p>
                        <p className="text-xl font-bold text-slate-900">{eventRegistrations.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50/50 p-4 border border-slate-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-100 text-blue-500 shadow-sm">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Date</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{currentEvent.date?.slice(0, 10)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50/50 p-4 border border-slate-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-100 text-emerald-500 shadow-sm">
                        <UserCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Chair Head</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{chairHead ? `${chairHead.firstNameEn[0]}. ${chairHead.lastNameEn}` : "None"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50/50 p-4 border border-slate-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-100 text-amber-500 shadow-sm">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Year</p>
                        <p className="text-xl font-bold text-slate-900">{currentEvent.year}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Registration Management */}
                <Card className="lg:col-span-2 border-slate-200 shadow-sm overflow-hidden">
                  <CardHeader className="border-b bg-slate-50/50 pb-4 pt-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" /> Student Registrations
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <LiveSearch
                          data={filteredGrades}
                          labelKey="displayName"
                          valueKey="id"
                          onSearch={setGradeSearchTerm}
                          selected={(val) => setSelectedGradeId(val.item?.id || null)}
                          defaultSelected={selectedGradeId || undefined}
                          mode="filter"
                          placeholder="Grade Selection"
                          popoverTriggerClases="h-8 text-[11px] font-bold uppercase tracking-wider w-[180px]"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-4 border-b bg-slate-50/20 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Register Student</label>
                          <LiveSearch
                            data={filteredSearchableUsers}
                            labelKey="displayName"
                            valueKey="_id"
                            onSearch={setStudentSearchTerm}
                            selected={(_, ids) => {
                              const selected = searchableUsers.filter((u: any) => ids.includes(u._id));
                              setSelectedUsersToAdd(selected);
                            }}
                            multiple={true}
                            defaultSelected={selectedUsersToAdd.map(u => u._id)}
                            placeholder="Type student name..."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Note / Role</label>
                          <Input 
                            placeholder="e.g. Lead, Volunteer" 
                            value={registrationNote}
                            onChange={(e) => setRegistrationNote(e.target.value)}
                            className="bg-white h-10"
                          />
                        </div>
                      </div>
                      <Button
                        className="w-full gap-2"
                        onClick={handleRegister}
                        disabled={!selectedUsersToAdd.length || bulkRegisterMutation.isPending}
                        size="sm"
                      >
                        {bulkRegisterMutation.isPending ? <Loader className="animate-spin h-4 w-4" /> : <><Plus className="h-4 w-4" /> Confirm Registration</>}
                      </Button>
                    </div>
                    
                    <div className="border-t">
                      {eventRegistrations.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50/50">
                              <TableHead className="w-[80px] text-[10px] font-bold uppercase tracking-widest text-slate-500">Student</TableHead>
                              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Name</TableHead>
                              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Admission</TableHead>
                              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Role / Note</TableHead>
                              <TableHead className="w-[50px] text-right"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {eventRegistrations.map((reg) => {
                              const regStudentId = typeof reg.studentId === 'string' ? reg.studentId : (reg.studentId as any)?._id || (reg.studentId as any)?.id;
                              const student = allStudents.find(s => s.id === regStudentId) || (typeof reg.studentId === 'object' ? reg.studentId as any : null);
                              return (
                                <TableRow key={reg.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                                  <TableCell className="py-3">
                                    <Avatar className="h-8 w-8 border-white shadow-sm ring-1 ring-slate-100">
                                      <AvatarFallback className="bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                                        {student ? student.firstNameEn?.[0] || student.firstNameSi?.[0] : (regStudentId?.slice(0, 1) || "S").toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="text-xs font-semibold text-slate-900">
                                      {student?.nameWithInitialsSi || (student ? `${student.firstNameEn || ''} ${student.lastNameEn || ''}` : `Student ${regStudentId?.slice(-6)}`)} ({student?.admissionNumber || 'N/A'})
                                    </div>
                                    <div className="flex flex-col gap-0.5 mt-0.5">
                                      <div className="text-[10px] text-slate-500">
                                        {student ? `${student.firstNameEn || ''} ${student.lastNameEn || ''}` : 'Unknown Student'}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <Badge variant="outline" className="text-[10px] font-semibold bg-slate-50 text-slate-600 border-slate-200">
                                      {(reg.gradeId as any)?.nameEn || "N/A"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                      {reg.noteEn || "Standard Participant"}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-3 text-right">
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                      onClick={() => handleRemoveRegistration(reg.id)}
                                      disabled={removeRegistration.isPending}
                                    >
                                      {removeRegistration.isPending ? <Loader className="animate-spin h-3 w-3" /> : <Trash2 className="h-3.5 w-3.5" />}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                          <Users className="mb-2 h-10 w-10 opacity-20" />
                          <p className="text-sm">No students registered for this event yet.</p>
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
                        <Info className="h-4 w-4 text-blue-500" /> Event Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Chair / Lead</p>
                        {chairHead ? (
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                              <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                                {chairHead.firstNameEn?.[0]}{chairHead.lastNameEn?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{chairHead.firstNameEn} {chairHead.lastNameEn}</p>
                              <p className="text-[10px] text-slate-500 font-medium">Head of Organization</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 italic">No head teacher assigned</p>
                        )}
                      </div>
                      <Separator className="bg-slate-100" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Timeline</p>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2 border border-slate-100">
                             <span className="text-[10px] font-bold text-slate-500 uppercase">Starts</span>
                             <span className="text-xs font-semibold">{currentEvent.date?.slice(0,10)}</span>
                          </div>
                          {currentEvent.endDate && (
                            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2 border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Ends</span>
                              <span className="text-xs font-semibold">{currentEvent.endDate.slice(0,10)}</span>
                            </div>
                          )}
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
                <Flag className="h-10 w-10 text-slate-300" />
             </div>
             <div className="max-w-[280px]">
                <h3 className="text-lg font-bold text-slate-900">Select an Event</h3>
                <p className="text-sm text-slate-500 mt-1">Select an event from the sidebar to manage registrations and view planning details.</p>
             </div>
          </div>
        )}
      </div>

      <CrudModal
        title={editingId ? "Edit Event" : "Create Event"}
        isOpen={isFormOpen}
        onClose={resetForm}
        onSubmit={handleSubmit}
        isEditing={!!editingId}
        isLoading={createEvent.isPending || updateEvent.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-1.5 font-sans">
            <label className="text-sm font-semibold text-slate-700">Event Title</label>
            <Input 
              name="title" 
              value={formData.title} 
              onChange={handleInputChange} 
              required 
              placeholder="e.g. Annual Sport Meet" 
              className="h-11 border-slate-200"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5 font-sans">
                <label className="text-sm font-semibold text-slate-700">Category</label>
                <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    className="w-full h-11 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                    <option value="regular">Regular</option>
                    <option value="main">Main Event</option>
                    <option value="squad">Squad Wise</option>
                    <option value="club">Club Wise</option>
                    <option value="academic">Academic</option>
                    <option value="staff">Staff</option>
                </select>
             </div>
             <div className="space-y-1.5 font-sans">
                <label className="text-sm font-semibold text-slate-700">Event Year</label>
                <Input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                    className="h-11 border-slate-200"
                />
             </div>
          </div>

          <div className="space-y-1.5 font-sans">
            <label className="text-sm font-semibold text-slate-700">Brief Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="What is this event about?"
              className="resize-none border-slate-200"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 font-sans">
              <label className="text-sm font-semibold text-slate-700">Commencing Date</label>
              <Input type="date" name="date" value={formData.date} onChange={handleInputChange} required className="h-11 border-slate-200" />
            </div>
            <div className="space-y-1.5 font-sans">
              <label className="text-sm font-semibold text-slate-700">Conclusion (Optional)</label>
              <Input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="h-11 border-slate-200" />
            </div>
          </div>

          <div className="space-y-1.5 font-sans">
            <label className="text-sm font-semibold text-slate-700">Chair Head / MIC</label>
            <LiveSearch
              data={filteredTeachers}
              labelKey="displayName"
              valueKey="id"
              onSearch={setTeacherSearchTerm}
              selected={(val) => setFormData(prev => ({ ...prev, teacherInChargeId: val.item?.id || "" }))}
              defaultSelected={formData.teacherInChargeId}
              placeholder="Select Lead Teacher"
            />
          </div>

          {formData.eventType === 'club' && (
            <div className="space-y-1.5 font-sans">
              <label className="text-sm font-semibold text-slate-700">Select Club</label>
              <LiveSearch
                data={filteredClubs}
                labelKey="displayName"
                valueKey="id"
                onSearch={setClubSearchTerm}
                selected={(val) => setFormData(prev => ({ ...prev, clubId: val.item?.id || "" }))}
                defaultSelected={formData.clubId}
                placeholder="Select Club"
              />
            </div>
          )}

          {formData.eventType === 'squad' && (
            <div className="space-y-1.5 font-sans">
              <label className="text-sm font-semibold text-slate-700">Select Squad</label>
              <LiveSearch
                data={filteredSquads}
                labelKey="displayName"
                valueKey="id"
                onSearch={setSquadSearchTerm}
                selected={(val) => setFormData(prev => ({ ...prev, squadId: val.item?.id || "" }))}
                defaultSelected={formData.squadId}
                placeholder="Select Squad"
              />
            </div>
          )}
        </div>
      </CrudModal>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (itemToDelete) {
            deleteEvent.mutate(itemToDelete, {
              onSuccess: () => {
                toast({ title: "Event deleted" });
                if (selectedEventId === itemToDelete) {
                  setSelectedEventId(events.find(e => e.id !== itemToDelete)?.id || "");
                }
              },
              onError: () => toast({ title: "Failed to delete event", variant: "destructive" }),
            });
          }
          setIsDeleteModalOpen(false);
        }}
        title="Permanently remove event?"
        description="This will delete the event and all associated student registrations. This action is irreversible."
      />
    </div>
  );
}
