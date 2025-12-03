"use client";

import { useState } from "react";
import { Layers, Plus, Edit, Trash2, Users, Search } from "lucide-react";
import {
  LayoutController,
  DynamicPageHeader,
} from "@/components/layout/dynamic";
import { StudentsMenu } from "@/components/students/students-menu";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui";
import { DeleteConfirmationModal } from "@/components/reusable";
import { useSections, useCreateSection, useUpdateSection, useDeleteSection } from "@/hooks/useSections";
import { useGrades } from "@/hooks/useGrades";
import { SectionForm } from "@/components/students/section/SectionForm";
import { CreateSectionPayload } from "@/services/masterdata/sections.service";
import { Section } from "@/types/models";

export default function SectionsManagementPage() {
  const { data: sections = [], isLoading: isLoadingSections } = useSections();
  const { data: grades = [], isLoading: isLoadingGrades } = useGrades();
  const createSectionMutation = useCreateSection();
  const updateSectionMutation = useUpdateSection();
  const deleteSectionMutation = useDeleteSection();

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const handleDelete = (id: string) => {
    deleteSectionMutation.mutate(id, {
      onSuccess: () => setItemToDelete(null),
    });
  };

  const handleCreate = (data: CreateSectionPayload) => {
    createSectionMutation.mutate(data, {
      onSuccess: () => setIsCreateModalOpen(false),
    });
  };

  const handleUpdate = (data: CreateSectionPayload) => {
    if (editingSection) {
      updateSectionMutation.mutate({ id: editingSection.id, payload: data }, {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          setEditingSection(null);
        },
      });
    }
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setIsCreateModalOpen(true);
  };

  const filteredSections = sections.filter((section) => 
    section.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.nameSi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoadingSections || isLoadingGrades) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        <Users className="mr-2 h-6 w-6 animate-spin" />
        <span>Loading data...</span>
      </div>
    );
  }

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <StudentsMenu />

      <DynamicPageHeader
        title="Section Management"
        subtitle="Define and manage class sections."
        icon={Layers}
        actions={
          <Button className="gap-2" onClick={() => {
            setEditingSection(null);
            setIsCreateModalOpen(true);
          }}>
            <Plus className="h-4 w-4" />
            Add Section
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search sections by name (En/Si)..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900">
              All Sections
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {filteredSections.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No sections found.
                </div>
              ) : (
                filteredSections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{section.nameSi}</p>
                      <p className="text-sm text-slate-500">{section.nameEn}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-blue-600"
                        onClick={() => handleEdit(section)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-red-600"
                        onClick={() => setItemToDelete(section.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription>
              Create a new section and assign it to grades.
            </DialogDescription>
          </DialogHeader>
          <SectionForm 
            grades={grades}
            defaultValues={editingSection ? {
              nameSi: editingSection.nameSi,
              nameEn: editingSection.nameEn,
              assignedGradeIds: editingSection.assignedGradeIds || [],
            } : undefined}
            onSubmit={editingSection ? handleUpdate : handleCreate} 
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={createSectionMutation.isPending || updateSectionMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
        itemName="this section"
      />
    </LayoutController>
  );
}
