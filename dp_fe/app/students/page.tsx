"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, UserPlus, Search, Layers, ChevronRight, MoreVertical, Trash2, Pencil } from "lucide-react";

import { useGrades, useUpdateGrade, useCreateGrade, useDeleteGrade } from "@/hooks/useGrades";
import { useSections, useCreateSection, useUpdateSection, useDeleteSection } from "@/hooks/useSections";
import { GradeSelector } from "@/components/students/grade/GradeSelector";
import { GradeForm } from "@/components/students/grade/GradeForm";
import { SectionForm } from "@/components/students/section/SectionForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteConfirmationModal } from "@/components/reusable";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Grade, Section } from "@/types/models";
import {
  LayoutController,
  DynamicPageHeader,
} from "@/components/layout/dynamic";
import { StudentsMenu } from "@/components/students/students-menu";
import { ExportButton } from "@/components/reusable";

export default function StudentsPage() {
  const router = useRouter();
  
  // Data Fetching
  const { data: grades = [], isLoading: isLoadingGrades } = useGrades();
  const { data: sections = [], isLoading: isLoadingSections } = useSections();

  // Mutations
  const updateGradeMutation = useUpdateGrade();
  const deleteGradeMutation = useDeleteGrade();
  const { mutate: createGrade } = useCreateGrade();

  const createSectionMutation = useCreateSection();
  const updateSectionMutation = useUpdateSection();
  const deleteSectionMutation = useDeleteSection();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  
  // Grade Modal State
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const [gradeToDelete, setGradeToDelete] = useState<string | null>(null);

  // Section Modal State
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);

  // Derived Data
  const studentCountsByGrade = grades.reduce((acc, g) => {
    // @ts-ignore - assuming studentCount exists in the response from listGradesWithStats
    acc[g.id] = g.studentCount || 0;
    return acc;
  }, {} as Record<string, number>);

  const filteredGrades = grades.filter((grade) => 
    grade.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    grade.nameSi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group Grades by Section
  const gradesBySection = sections.map(section => {
    const sectionGrades = filteredGrades.filter(g => section.assignedGradeIds?.includes(g.id));
    return {
      section,
      grades: sectionGrades
    };
  });

  const assignedGradeIds = new Set(sections.flatMap(s => s.assignedGradeIds || []));
  const unassignedGrades = filteredGrades.filter(g => !assignedGradeIds.has(g.id));

  // Handlers - Grade
  const handleEditGrade = (grade: Grade) => {
    setEditingGrade(grade);
    setIsGradeModalOpen(true);
  };

  const handleDeleteGrade = (id: string) => {
    deleteGradeMutation.mutate(id, {
      onSuccess: () => setGradeToDelete(null),
    });
  };

  const handleSaveGrade = (data: any) => {
    if (editingGrade) {
      updateGradeMutation.mutate({ id: editingGrade.id, payload: data }, {
        onSuccess: () => {
          setIsGradeModalOpen(false);
          setEditingGrade(null);
        },
      });
    } else {
      createGrade(data, {
        onSuccess: (newGrade) => {
          // If we are adding to a specific section, update the section
          if (targetSectionId) {
            const section = sections.find(s => s.id === targetSectionId);
            if (section) {
              const updatedGradeIds = [...(section.assignedGradeIds || []), newGrade.id];
              updateSectionMutation.mutate({
                id: section.id,
                payload: { assignedGradeIds: updatedGradeIds }
              });
            }
          }
          setIsGradeModalOpen(false);
          setTargetSectionId(null);
        },
      });
    }
  };

  // Handlers - Section
  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    setIsSectionModalOpen(true);
  };

  const handleDeleteSection = (id: string) => {
    deleteSectionMutation.mutate(id, {
      onSuccess: () => setSectionToDelete(null),
    });
  };

  const handleSaveSection = (data: any) => {
    if (editingSection) {
      updateSectionMutation.mutate({ id: editingSection.id, payload: data }, {
        onSuccess: () => {
          setIsSectionModalOpen(false);
          setEditingSection(null);
        },
      });
    } else {
      createSectionMutation.mutate(data, {
        onSuccess: () => {
          setIsSectionModalOpen(false);
        },
      });
    }
  };

  if (isLoadingGrades || isLoadingSections) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        <Users className="mr-2 h-6 w-6 animate-spin" />
        <span>Loading students...</span>
      </div>
    );
  }

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      {/* 1. Sidebar: Global Navigation */}
      <StudentsMenu />

      {/* 2. Header: Page Title & Actions */}
      <DynamicPageHeader
        title="Student Management"
        subtitle="Browse grades and manage student profiles across the school."
        icon={Users}
        actions={[
          {
            type: "custom",
            render: (
              <ExportButton 
                endpoint="/reports/teams" 
                filename="championship_selections"
                className="h-9"
              />
            )
          },
          {
            type: "button",
            props: {
              variant: "outline",
              icon: Plus, // Use Plus instead of Layers if we want consistency, or I can keep the icons from implementation plan
              children: "Add Section",
              onClick: () => {
                setEditingSection(null);
                setIsSectionModalOpen(true);
              },
            },
          },
          {
            type: "button",
            props: {
              variant: "default",
              icon: Plus,
              children: "Add Grade",
              onClick: () => {
                setEditingGrade(null);
                setTargetSectionId(null);
                setIsGradeModalOpen(true);
              },
            },
          },
        ]}
      />


      {/* 3. Content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search grades..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Sections Accordion */}
        <Accordion type="multiple" className="space-y-4" defaultValue={sections.map(s => s.id)}>
          {gradesBySection.map(({ section, grades }) => (
            <AccordionItem key={section.id} value={section.id} className="border rounded-lg bg-white px-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4 sm:gap-0">
                <AccordionTrigger className="hover:no-underline py-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-lg text-slate-900">{section.nameEn}</div>
                      <div className="text-sm text-slate-500">{section.nameSi}</div>
                    </div>
                    <div className="ml-2 px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                      {grades.length} Grades
                    </div>
                  </div>
                </AccordionTrigger>
                <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-4 justify-end">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 gap-1.5 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTargetSectionId(section.id);
                      setEditingGrade(null);
                      setIsGradeModalOpen(true);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Grade
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4 text-slate-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditSection(section)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit Section
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setSectionToDelete(section.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Section
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <AccordionContent className="pt-2 pb-6">
                {grades.length > 0 ? (
                  <GradeSelector
                    grades={grades}
                    studentCountsByGrade={studentCountsByGrade}
                    onSelectGrade={(gradeId) => router.push(`/students/${gradeId}`)}
                    onEdit={handleEditGrade}
                    onDelete={setGradeToDelete}
                  />
                ) : (
                  <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                    No grades in this section yet.
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Unassigned Grades */}
        {unassignedGrades.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              Unassigned Grades
            </h3>
            <GradeSelector
              grades={unassignedGrades}
              studentCountsByGrade={studentCountsByGrade}
              onSelectGrade={(gradeId) => router.push(`/students/${gradeId}`)}
              onEdit={handleEditGrade}
              onDelete={setGradeToDelete}
            />
          </div>
        )}
      </div>

      {/* Grade Modal */}
      <Dialog open={isGradeModalOpen} onOpenChange={setIsGradeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGrade ? "Edit Grade" : "Add New Grade"}</DialogTitle>
          </DialogHeader>
          <GradeForm
            defaultValues={editingGrade ? {
              nameSi: editingGrade.nameSi,
              nameEn: editingGrade.nameEn,
              level: editingGrade.level,
            } : undefined}
            onSubmit={handleSaveGrade}
            isLoading={updateGradeMutation.isPending}
            onCancel={() => setIsGradeModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Section Modal */}
      <Dialog open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSection ? "Edit Section" : "Add New Section"}</DialogTitle>
          </DialogHeader>
          <SectionForm
            grades={grades}
            defaultValues={editingSection ? {
              nameSi: editingSection.nameSi,
              nameEn: editingSection.nameEn,
              assignedGradeIds: editingSection.assignedGradeIds || [],
            } : undefined}
            onSubmit={handleSaveSection}
            isLoading={updateSectionMutation.isPending || createSectionMutation.isPending}
            onCancel={() => setIsSectionModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmations */}
      <DeleteConfirmationModal
        isOpen={!!gradeToDelete}
        onClose={() => setGradeToDelete(null)}
        onConfirm={() => gradeToDelete && handleDeleteGrade(gradeToDelete)}
        itemName="this grade"
      />
      
      <DeleteConfirmationModal
        isOpen={!!sectionToDelete}
        onClose={() => setSectionToDelete(null)}
        onConfirm={() => sectionToDelete && handleDeleteSection(sectionToDelete)}
        itemName="this section"
      />
    </LayoutController>
  );
}
