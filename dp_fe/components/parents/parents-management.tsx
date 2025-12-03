"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Input } from "@/components/ui";
import { Search, Plus, Mail, Phone, User, Briefcase, Filter, Link2, Pencil, Trash2 } from "lucide-react";
import { useParents, useCreateParent, useUpdateParent, useDeleteParent } from "@/hooks/useParents";
import { ParentForm } from "./ParentForm";
import type { Parent } from "@/types/models";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteConfirmationModal } from "@/components/reusable";
import { LinkParentStudentDialog } from "./LinkParentStudentDialog";

export function ParentsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [linkParent, setLinkParent] = useState<Parent | null>(null);
  const [linkedStudents, setLinkedStudents] = useState<Record<string, string[]>>({});

  const { data: parents = [], isLoading } = useParents(searchTerm);
  const createParent = useCreateParent();
  const updateParent = useUpdateParent();
  const deleteParent = useDeleteParent();

  const occupations = useMemo(() => {
    const occs = parents
      .map((p) => p.occupationEn || p.occupationSi)
      .filter(Boolean) as string[];
    return Array.from(new Set(occs));
  }, [parents]);

  const filteredParents = useMemo(
    () =>
      parents.filter((parent) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          parent.firstNameEn.toLowerCase().includes(search) ||
          parent.lastNameEn.toLowerCase().includes(search) ||
          (parent.email || "").toLowerCase().includes(search) ||
          (parent.phoneNum || "").toLowerCase().includes(search);
        return matchesSearch;
      }),
    [parents, searchTerm],
  );

  const handleSave = (data: any) => {
    if (editingParent) {
      updateParent.mutate(
        { id: editingParent.id, payload: data },
        { onSuccess: () => setIsModalOpen(false) },
      );
    } else {
      createParent.mutate(data, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const onLinked = (studentName: string) => {
    if (!linkParent) return;
    setLinkedStudents((prev) => ({
      ...prev,
      [linkParent.id]: [...(prev[linkParent.id] || []), studentName],
    }));
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Parents</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{parents.length}</p>
              <p className="mt-1 text-xs text-slate-500">Registered in the system</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Occupations</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{occupations.length}</p>
              <p className="mt-1 text-xs text-slate-500">Unique occupation categories</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Filtered Results</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{filteredParents.length}</p>
              <p className="mt-1 text-xs text-slate-500">Matching current search</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions & Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="gap-2 whitespace-nowrap"
            >
              <Filter className="h-4 w-4" />
              Clear filters
            </Button>
          </div>
        </div>

        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => { setEditingParent(null); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4" />
          Add Parent
        </Button>
      </div>

      {/* Directory table */}
      <Card>
        <CardHeader>
          <CardTitle>Parent Directory</CardTitle>
          <CardDescription>All registered parents and guardians with their linked students.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50/50 text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Contact</th>
                  <th className="px-6 py-3 text-left">Occupation</th>
                  <th className="px-6 py-3 text-center">Linked Students</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-slate-500">
                      Loading parents...
                    </td>
                  </tr>
                ) : filteredParents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-slate-500">
                      No parents found matching the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredParents.map((parent) => (
                    <tr
                      key={parent.id}
                      className="border-b last:border-0 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {parent.fullNameEn || `${parent.firstNameEn} ${parent.lastNameEn}`}
                        {parent.fullNameSi && (
                          <div className="text-xs text-slate-500">{parent.fullNameSi}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-slate-600">
                          {parent.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5" />
                              <span className="truncate">{parent.email}</span>
                            </div>
                          )}
                          {parent.phoneNum && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{parent.phoneNum}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-700">
                            {parent.occupationEn || parent.occupationSi || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {(linkedStudents[parent.id] || []).length > 0 ? (
                          <div className="flex flex-wrap gap-1 justify-center">
                            {linkedStudents[parent.id].map((name) => (
                              <Badge key={name} variant="outline">
                                {name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge variant="secondary">Link pending</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setEditingParent(parent); setIsModalOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setLinkParent(parent)}>
                            <Link2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setItemToDelete(parent.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingParent(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingParent ? "Edit Parent" : "Add Parent"}</DialogTitle>
          </DialogHeader>
          <ParentForm
            defaultValues={editingParent || undefined}
            onSubmit={handleSave}
            onCancel={() => setIsModalOpen(false)}
            isLoading={createParent.isPending || updateParent.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => itemToDelete && deleteParent.mutate(itemToDelete, { onSuccess: () => setItemToDelete(null) })}
        itemName="this parent"
        isLoading={deleteParent.isPending}
      />

      <LinkParentStudentDialog
        parent={linkParent}
        open={!!linkParent}
        onClose={() => setLinkParent(null)}
        onLinked={onLinked}
      />
    </div>
  );
}
