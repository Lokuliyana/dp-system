"use client";

import { useEffect, useMemo, useState } from "react";
import { Flag, Plus, Trash2 } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { HouseMeetsMenu } from "@/components/house-meets/house-meets-menu";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { usePermission } from "@/hooks/usePermission";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Checkbox,
} from "@/components/ui";
import { useCompetitions, useCreateCompetition, useUpdateCompetition, useDeleteCompetition } from "@/hooks/useCompetitions";
import { useSquads } from "@/hooks/useSquads";
import { useClubs } from "@/hooks/useClubs";
import { useGrades } from "@/hooks/useGrades";
import { useSections } from "@/hooks/useSections";

type Scope = "open" | "grade" | "section";
type OrgType = "squad" | "club";
type EventType = "regular" | "main" | "annual";

const defaultForm = {
  nameEn: "",
  nameSi: "",
  organizationType: "squad" as OrgType,
  squadId: "",
  clubId: "",
  scope: "grade" as Scope,
  gradeIds: [] as string[],
  sectionIds: [] as string[],
  eventType: "regular" as EventType,
  active: true,
  participationType: "individual" as "individual" | "team",
  teamConfig: { minSize: 1, maxSize: 1 },
  personalAwards: [] as string[],
  pointsConfig: { place1: 15, place2: 10, place3: 5, place4: 0, place5: 0 },
  excludedZonalGradeIds: [] as string[],
  excludedZonalSectionIds: [] as string[],
};

export default function CompetitionsPage() {
  const [form, setForm] = useState(defaultForm);
  const { can } = usePermission();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [newAward, setNewAward] = useState("");

  const { data: competitions = [], isLoading: compLoading } = useCompetitions({ year: yearFilter });
  const createCompetition = useCreateCompetition();
  const updateCompetition = useUpdateCompetition();
  const deleteCompetition = useDeleteCompetition(yearFilter);

  const { data: squads = [] } = useSquads();
  const { data: clubs = [] } = useClubs();
  const { data: grades = [] } = useGrades();
  const { data: sections = [] } = useSections();

  // Helper to get ID
  const getId = (doc: any) => doc.id || doc._id;

  const filteredCompetitions = useMemo(
    () => competitions, // Show all for now, or filter by active if needed
    [competitions]
  );

  const handleScopeChange = (scope: Scope) => {
    setForm((f) => ({
      ...f,
      scope,
      gradeIds: scope === "grade" ? f.gradeIds : [],
      sectionIds: scope === "section" ? f.sectionIds : [],
    }));
  };

  const handleAddAward = () => {
    if (!newAward.trim()) return;
    setForm((f) => ({
      ...f,
      personalAwards: [...f.personalAwards, newAward.trim()],
    }));
    setNewAward("");
  };

  const handleRemoveAward = (index: number) => {
    setForm((f) => ({
      ...f,
      personalAwards: f.personalAwards.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      nameEn: form.nameEn,
      nameSi: form.nameSi,
      squadId: form.organizationType === "squad" ? (form.squadId || undefined) : undefined,
      clubId: form.organizationType === "club" ? (form.clubId || undefined) : undefined,
      scope: form.scope,
      gradeIds: form.scope === "grade" ? form.gradeIds : [],
      sectionIds: form.scope === "section" ? form.sectionIds : [],
      eventType: form.eventType,
      isMainCompetition: form.eventType === "main",
      active: form.active,
      participationType: form.participationType,
      teamConfig: form.participationType === "team" ? form.teamConfig : undefined,
      personalAwards: form.participationType === "team" ? form.personalAwards : [],
      pointsConfig: form.pointsConfig,
      year: new Date().getFullYear(),
      excludedZonalGradeIds: form.eventType === "main" ? form.excludedZonalGradeIds : [],
      excludedZonalSectionIds: form.eventType === "main" ? form.excludedZonalSectionIds : [],
    };

    if (editingId) {
      await updateCompetition.mutateAsync({ id: editingId, payload });
    } else {
      await createCompetition.mutateAsync(payload);
    }
    setForm(defaultForm);
    setEditingId(null);
  };

  const startEdit = (id: string) => {
    const comp = competitions.find((c) => getId(c) === id);
    if (!comp) return;
    setEditingId(id);
    const orgType: OrgType = comp.clubId ? "club" : "squad";
    const evType: EventType = (comp.eventType as EventType) || (comp.isMainCompetition ? "main" : "regular");
    setForm({
      nameEn: comp.nameEn,
      nameSi: comp.nameSi,
      organizationType: orgType,
      squadId: comp.squadId || "",
      clubId: comp.clubId || "",
      scope: comp.scope as Scope,
      gradeIds: comp.gradeIds || [],
      sectionIds: comp.sectionIds || [],
      eventType: evType,
      active: comp.active !== undefined ? comp.active : true,
      participationType: comp.participationType || "individual",
      teamConfig: comp.teamConfig || { minSize: 1, maxSize: 1 },
      personalAwards: comp.personalAwards || [],
      pointsConfig: comp.pointsConfig || { place1: 15, place2: 10, place3: 5, place4: 0, place5: 0 },
      excludedZonalGradeIds: comp.excludedZonalGradeIds || [],
      excludedZonalSectionIds: comp.excludedZonalSectionIds || [],
    });
  };

  const toggleGrade = (id: string) => {
    setForm((f) => ({
      ...f,
      gradeIds: f.gradeIds.includes(id) ? f.gradeIds.filter((g) => g !== id) : [...f.gradeIds, id],
    }));
  };

  const toggleSection = (id: string) => {
    setForm((f) => ({
      ...f,
      sectionIds: f.sectionIds.includes(id) ? f.sectionIds.filter((s) => s !== id) : [...f.sectionIds, id],
    }));
  };

  const toggleExcludedZonalGrade = (id: string) => {
    setForm((f) => ({
      ...f,
      excludedZonalGradeIds: f.excludedZonalGradeIds.includes(id)
        ? f.excludedZonalGradeIds.filter((g) => g !== id)
        : [...f.excludedZonalGradeIds, id],
    }));
  };

  const toggleExcludedZonalSection = (id: string) => {
    setForm((f) => ({
      ...f,
      excludedZonalSectionIds: f.excludedZonalSectionIds.includes(id)
        ? f.excludedZonalSectionIds.filter((s) => s !== id)
        : [...f.excludedZonalSectionIds, id],
    }));
  };

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <HouseMeetsMenu />

      <DynamicPageHeader
        title="Competitions"
        subtitle="Create and manage house competitions."
        icon={Flag}
      />

      <div className="p-6 space-y-6">
        {(can("housemeets.competition.create") || can("housemeets.competition.update")) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{editingId ? "Edit Competition" : "Create Competition"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name (English)</Label>
                  <Input value={form.nameEn} onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Name (Sinhala)</Label>
                  <Input value={form.nameSi} onChange={(e) => setForm((f) => ({ ...f, nameSi: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Competition Type</Label>
                  <Select
                    value={form.organizationType}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, organizationType: v as OrgType, squadId: "", clubId: "" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="squad">Squad</SelectItem>
                      <SelectItem value="club">Club</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  {form.organizationType === "squad" ? (
                    <>
                      <Label>Squad (Optional)</Label>
                      <Select value={form.squadId} onValueChange={(v) => setForm((f) => ({ ...f, squadId: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select squad" />
                        </SelectTrigger>
                        <SelectContent>
                          {squads.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.nameEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <>
                      <Label>Club (Optional)</Label>
                      <Select value={form.clubId} onValueChange={(v) => setForm((f) => ({ ...f, clubId: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select club" />
                        </SelectTrigger>
                        <SelectContent>
                          {clubs.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.nameEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Participation Type</Label>
                  <Select
                    value={form.participationType}
                    onValueChange={(v) => setForm((f) => ({ ...f, participationType: v as "individual" | "team" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {form.participationType === "team" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 border p-3 rounded-md bg-slate-50">
                    <div className="space-y-2">
                      <Label>Min Team Size</Label>
                      <Input
                        type="number"
                        min={1}
                        value={form.teamConfig.minSize}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            teamConfig: { ...f.teamConfig, minSize: Number(e.target.value) },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Team Size</Label>
                      <Input
                        type="number"
                        min={1}
                        value={form.teamConfig.maxSize}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            teamConfig: { ...f.teamConfig, maxSize: Number(e.target.value) },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="border p-3 rounded-md bg-slate-50 space-y-3">
                    <Label className="font-semibold">Personal Awards</Label>
                    <p className="text-xs text-muted-foreground">
                      Define awards like &quot;Best Actor&quot;, &quot;Best Speaker&quot; etc.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Award Name (e.g. Best Actor)"
                        value={newAward}
                        onChange={(e) => setNewAward(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddAward();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddAward} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.personalAwards.map((award, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-md text-sm"
                        >
                          <span>{award}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAward(idx)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {form.personalAwards.length === 0 && (
                        <span className="text-xs text-slate-400 italic">No personal awards defined.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 border p-3 rounded-md bg-slate-50">
                <Label className="font-semibold">Points Configuration</Label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((place) => (
                    <div key={place} className="space-y-1">
                      <Label className="text-xs">Place {place}</Label>
                      <Input
                        type="number"
                        min={0}
                        value={(form.pointsConfig as any)[`place${place}`]}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            pointsConfig: { ...f.pointsConfig, [`place${place}`]: Number(e.target.value) },
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Scope</Label>
                  <Select value={form.scope} onValueChange={(v) => handleScopeChange(v as Scope)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="grade">Grade-specific</SelectItem>
                      <SelectItem value="section">Section-specific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select
                    value={form.eventType}
                    onValueChange={(v) => setForm((f) => ({ ...f, eventType: v as EventType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="main">Main Event</SelectItem>
                      <SelectItem value="annual">Annual Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.active}
                    onCheckedChange={(checked) => setForm((f) => ({ ...f, active: checked }))}
                  />
                  <div>
                    <p className="text-sm font-semibold">Active</p>
                    <p className="text-xs text-muted-foreground">Enable for current year.</p>
                  </div>
                </div>
              </div>

              {form.scope === "grade" && (
                <div>
                  <p className="text-sm font-semibold mb-2">Eligible Grades</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border rounded-md p-3 max-h-48 overflow-auto">
                    {grades.map((g) => (
                      <label key={g.id} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={form.gradeIds.includes(g.id)} onCheckedChange={() => toggleGrade(g.id)} />
                        {g.nameEn}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {form.scope === "section" && (
                <div>
                  <p className="text-sm font-semibold mb-2">Eligible Sections</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border rounded-md p-3 max-h-48 overflow-auto">
                    {sections.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={form.sectionIds.includes(s.id)} onCheckedChange={() => toggleSection(s.id)} />
                        {s.nameEn}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {form.eventType === "main" && (
                <div className="border border-amber-200 bg-amber-50 rounded-md p-4 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Zonal Level Exclusions</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Select grades or sections that will <strong>not</strong> participate at zonal level for this competition.
                    </p>
                  </div>

                  {(form.scope === "grade" || form.scope === "open") && (
                    <div>
                      <p className="text-xs font-medium text-amber-800 mb-2">Exclude Grades from Zonal</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-white border border-amber-100 rounded-md p-3 max-h-40 overflow-auto">
                        {(form.scope === "grade" && form.gradeIds.length > 0
                          ? grades.filter((g) => form.gradeIds.includes(g.id))
                          : grades
                        ).map((g) => (
                          <label key={g.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={form.excludedZonalGradeIds.includes(g.id)}
                              onCheckedChange={() => toggleExcludedZonalGrade(g.id)}
                            />
                            {g.nameEn}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {form.scope === "section" && (
                    <div>
                      <p className="text-xs font-medium text-amber-800 mb-2">Exclude Sections from Zonal</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-white border border-amber-100 rounded-md p-3 max-h-40 overflow-auto">
                        {(form.sectionIds.length > 0
                          ? sections.filter((s) => form.sectionIds.includes(s.id))
                          : sections
                        ).map((s) => (
                          <label key={s.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={form.excludedZonalSectionIds.includes(s.id)}
                              onCheckedChange={() => toggleExcludedZonalSection(s.id)}
                            />
                            {s.nameEn}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {editingId ? (
                  <PermissionGuard permission="housemeets.competition.update">
                    <Button
                      onClick={handleSubmit}
                      disabled={updateCompetition.isPending}
                    >
                      Update
                    </Button>
                  </PermissionGuard>
                ) : (
                  <PermissionGuard permission="housemeets.competition.create">
                    <Button
                      onClick={handleSubmit}
                      disabled={createCompetition.isPending}
                    >
                      Create
                    </Button>
                  </PermissionGuard>
                )}
                {editingId && (
                  <Button variant="outline" onClick={() => { setEditingId(null); setForm(defaultForm); }}>
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Competitions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Squad / Club</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Loading competitions...
                    </TableCell>
                  </TableRow>
                ) : filteredCompetitions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No competitions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompetitions.map((c) => {
                    const orgName = c.squadId
                      ? squads.find((s) => s.id === c.squadId)?.nameEn
                      : c.clubId
                      ? clubs.find((cl) => cl.id === c.clubId)?.nameEn
                      : null;
                    const evLabel =
                      c.eventType === "main" ? "Main Event" :
                      c.eventType === "annual" ? "Annual Event" :
                      c.isMainCompetition ? "Main Event" : "Regular";
                    return (
                    <TableRow key={getId(c)}>
                      <TableCell>{c.nameEn}</TableCell>
                      <TableCell>{orgName || "-"}</TableCell>
                      <TableCell className="capitalize">{c.scope}</TableCell>
                      <TableCell>{evLabel}</TableCell>
                      <TableCell>{c.active ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <PermissionGuard permission="housemeets.competition.update">
                          <Button size="sm" variant="ghost" onClick={() => startEdit(getId(c))}>
                            Edit
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard permission="housemeets.competition.delete">
                          <Button size="sm" variant="ghost" onClick={() => deleteCompetition.mutate(getId(c))}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                      </TableCell>
                    </TableRow>
                  );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </LayoutController>
  );
}
