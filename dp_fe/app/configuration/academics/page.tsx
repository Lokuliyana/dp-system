"use client";

import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { Header, Card, CardHeader, CardTitle, CardContent, Input, Label, Button, Checkbox } from "@/components/ui";
import { useGrades, useCreateGrade, useUpdateGrade, useDeleteGrade } from "@/hooks/useGrades";
import { useSections, useCreateSection, useUpdateSection, useDeleteSection } from "@/hooks/useSections";

type GradeForm = { nameEn: string; nameSi: string; level: number };
const emptyGrade: GradeForm = { nameEn: "", nameSi: "", level: 1 };

type SectionForm = { nameEn: string; nameSi: string; assignedGradeIds: string[] };
const emptySection: SectionForm = { nameEn: "", nameSi: "", assignedGradeIds: [] };

export default function AcademicsConfigurationPage() {
  const { data: grades = [] } = useGrades();
  const { data: sections = [] } = useSections();

  const createGrade = useCreateGrade();
  const updateGrade = useUpdateGrade();
  const deleteGrade = useDeleteGrade();

  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();

  const [gradeForm, setGradeForm] = useState<GradeForm>(emptyGrade);
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);

  const [sectionForm, setSectionForm] = useState<SectionForm>(emptySection);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (editingGradeId) {
      const g = grades.find((gr) => gr.id === editingGradeId);
      if (g) setGradeForm({ nameEn: g.nameEn, nameSi: g.nameSi, level: g.level });
    } else {
      setGradeForm(emptyGrade);
    }
  }, [editingGradeId, grades]);

  useEffect(() => {
    if (editingSectionId) {
      const s = sections.find((sec) => sec.id === editingSectionId);
      if (s) setSectionForm({ nameEn: s.nameEn, nameSi: s.nameSi, assignedGradeIds: s.assignedGradeIds || [] });
    } else {
      setSectionForm(emptySection);
    }
  }, [editingSectionId, sections]);

  const submitGrade = async () => {
    if (editingGradeId) {
      await updateGrade.mutateAsync({ id: editingGradeId, payload: gradeForm });
    } else {
      await createGrade.mutateAsync(gradeForm);
    }
    setEditingGradeId(null);
    setGradeForm(emptyGrade);
  };

  const submitSection = async () => {
    if (editingSectionId) {
      await updateSection.mutateAsync({ id: editingSectionId, payload: sectionForm });
    } else {
      await createSection.mutateAsync(sectionForm);
    }
    setEditingSectionId(null);
    setSectionForm(emptySection);
  };

  return (
    <div className="space-y-6">
      <Header
        title="Academics Configuration"
        description="Manage grades, sections, and academic standards."
        icon={GraduationCap}
        variant="section"
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{editingGradeId ? "Edit Grade" : "Create Grade"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name (English)</Label>
              <Input value={gradeForm.nameEn} onChange={(e) => setGradeForm((f) => ({ ...f, nameEn: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Name (Sinhala)</Label>
              <Input value={gradeForm.nameSi} onChange={(e) => setGradeForm((f) => ({ ...f, nameSi: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Level (1-14)</Label>
              <Input
                type="number"
                min={1}
                max={14}
                value={gradeForm.level}
                onChange={(e) => setGradeForm((f) => ({ ...f, level: Number(e.target.value) }))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={submitGrade} disabled={createGrade.isPending || updateGrade.isPending}>
                {editingGradeId ? "Update Grade" : "Create Grade"}
              </Button>
              {editingGradeId && (
                <Button variant="outline" onClick={() => setEditingGradeId(null)}>
                  Cancel
                </Button>
              )}
            </div>

            <div className="border rounded-md divide-y">
              {grades.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No grades yet.</div>
              ) : (
                grades.map((g) => (
                  <div key={g.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-semibold text-slate-900">{g.nameEn}</p>
                      <p className="text-xs text-muted-foreground">Level {g.level}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingGradeId(g.id)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteGrade.mutate(g.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{editingSectionId ? "Edit Section" : "Create Section"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name (English)</Label>
              <Input value={sectionForm.nameEn} onChange={(e) => setSectionForm((f) => ({ ...f, nameEn: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Name (Sinhala)</Label>
              <Input value={sectionForm.nameSi} onChange={(e) => setSectionForm((f) => ({ ...f, nameSi: e.target.value }))} />
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Assigned Grades</p>
              <div className="grid grid-cols-2 gap-2 border rounded-md p-3 max-h-48 overflow-auto">
                {grades.map((g) => (
                  <label key={g.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={sectionForm.assignedGradeIds.includes(g.id)}
                      onCheckedChange={(checked) =>
                        setSectionForm((f) => ({
                          ...f,
                          assignedGradeIds: checked
                            ? [...f.assignedGradeIds, g.id]
                            : f.assignedGradeIds.filter((id) => id !== g.id),
                        }))
                      }
                    />
                    {g.nameEn}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={submitSection} disabled={createSection.isPending || updateSection.isPending}>
                {editingSectionId ? "Update Section" : "Create Section"}
              </Button>
              {editingSectionId && (
                <Button variant="outline" onClick={() => setEditingSectionId(null)}>
                  Cancel
                </Button>
              )}
            </div>

            <div className="border rounded-md divide-y">
              {sections.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No sections yet.</div>
              ) : (
                sections.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-semibold text-slate-900">{s.nameEn}</p>
                      <p className="text-xs text-muted-foreground">
                        Grades: {(s.assignedGradeIds || []).length === 0 ? "All" : s.assignedGradeIds?.length}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingSectionId(s.id)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteSection.mutate(s.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
