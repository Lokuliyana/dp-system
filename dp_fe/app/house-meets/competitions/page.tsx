"use client";

import { useEffect, useMemo, useState } from "react";
import { Flag, Plus, Trash2 } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { HouseMeetsMenu } from "@/components/house-meets/house-meets-menu";
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
import { useGrades } from "@/hooks/useGrades";
import { useSections } from "@/hooks/useSections";

type Scope = "open" | "grade" | "section";

const emptyForm = {
  nameEn: "",
  nameSi: "",
  squadId: "",
  scope: "open" as Scope,
  gradeIds: [] as string[],
  sectionIds: [] as string[],
  isMainCompetition: false,
  year: new Date().getFullYear(),
};

export default function CompetitionsPage() {
  const [form, setForm] = useState({
    nameEn: "",
    nameSi: "",
    squadId: "",
    scope: "open" as Scope,
    gradeIds: [] as string[],
    sectionIds: [] as string[],
    isMainCompetition: false,
    active: true,
    participationType: "individual" as "individual" | "team",
    teamConfig: { minSize: 1, maxSize: 1 },
    personalAwards: [] as string[],
    pointsConfig: { place1: 15, place2: 10, place3: 5, place4: 0, place5: 0 },
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [newAward, setNewAward] = useState("");

  const { data: competitions = [], isLoading: compLoading } = useCompetitions(yearFilter);
  const createCompetition = useCreateCompetition();
  const updateCompetition = useUpdateCompetition();
  const deleteCompetition = useDeleteCompetition(yearFilter);

  const { data: squads = [] } = useSquads();
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
      squadId: form.squadId || undefined,
      scope: form.scope,
      gradeIds: form.scope === "grade" ? form.gradeIds : [],
      sectionIds: form.scope === "section" ? form.sectionIds : [],
      isMainCompetition: form.isMainCompetition,
      active: form.active,
      participationType: form.participationType,
      teamConfig: form.participationType === "team" ? form.teamConfig : undefined,
      personalAwards: form.participationType === "team" ? form.personalAwards : [],
      pointsConfig: form.pointsConfig,
      year: new Date().getFullYear(),
    };

    if (editingId) {
      await updateCompetition.mutateAsync({ id: editingId, payload });
    } else {
      await createCompetition.mutateAsync(payload);
    }
    setForm({
      nameEn: "",
      nameSi: "",
      squadId: "",
      scope: "open",
      gradeIds: [],
      sectionIds: [],
      isMainCompetition: false,
      active: true,
      participationType: "individual",
      teamConfig: { minSize: 1, maxSize: 1 },
      personalAwards: [],
      pointsConfig: { place1: 15, place2: 10, place3: 5, place4: 0, place5: 0 },
    });
    setEditingId(null);
  };

  const startEdit = (id: string) => {
    const comp = competitions.find((c) => getId(c) === id);
    if (!comp) return;
    setEditingId(id);
    setForm({
      nameEn: comp.nameEn,
      nameSi: comp.nameSi,
      squadId: comp.squadId || "",
      scope: comp.scope as Scope,
      gradeIds: comp.gradeIds || [],
      sectionIds: comp.sectionIds || [],
      isMainCompetition: comp.isMainCompetition,
      active: comp.active !== undefined ? comp.active : true,
      participationType: comp.participationType || "individual",
      teamConfig: comp.teamConfig || { minSize: 1, maxSize: 1 },
      personalAwards: comp.personalAwards || [],
      pointsConfig: comp.pointsConfig || { place1: 15, place2: 10, place3: 5, place4: 0, place5: 0 },
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

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <HouseMeetsMenu />

      <DynamicPageHeader
        title="Competitions"
        subtitle="Create and manage house competitions."
        icon={Flag}
      />

      <div className="p-6 space-y-6">
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
                    Define awards like "Best Actor", "Best Speaker" etc.
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
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isMainCompetition}
                  onCheckedChange={(checked) => setForm((f) => ({ ...f, isMainCompetition: checked }))}
                />
                <div>
                  <p className="text-sm font-semibold">Main competition</p>
                  <p className="text-xs text-muted-foreground">Marks the primary annual event.</p>
                </div>
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

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={createCompetition.isPending || updateCompetition.isPending}
              >
                {editingId ? "Update" : "Create"}
              </Button>
              {editingId && (
                <Button variant="outline" onClick={() => { setEditingId(null); setForm({
                  nameEn: "",
                  nameSi: "",
                  squadId: "",
                  scope: "open",
                  gradeIds: [],
                  sectionIds: [],
                  isMainCompetition: false,
                  active: true,
                  participationType: "individual",
                  teamConfig: { minSize: 1, maxSize: 1 },
                  personalAwards: [],
                  pointsConfig: { place1: 15, place2: 10, place3: 5, place4: 0, place5: 0 },
                }); }}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

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
                  <TableHead>Squad</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Type</TableHead>
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
                  filteredCompetitions.map((c) => (
                    <TableRow key={getId(c)}>
                      <TableCell>{c.nameEn}</TableCell>
                      <TableCell>{squads.find((s) => s.id === c.squadId)?.nameEn || c.squadId || "-"}</TableCell>
                      <TableCell className="capitalize">{c.scope}</TableCell>
                      <TableCell className="capitalize">{c.participationType || "Individual"}</TableCell>
                      <TableCell>{c.active ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => startEdit(getId(c))}>
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteCompetition.mutate(getId(c))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </LayoutController>
  );
}
