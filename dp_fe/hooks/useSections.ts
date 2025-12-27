import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sectionsService, CreateSectionPayload } from "@/services/masterdata/sections.service";
import { qk } from "@/lib/queryKeys";
import { useToast } from "@/hooks/use-toast";

export function useSections() {
  return useQuery({
    queryKey: qk.sections.all,
    queryFn: () => sectionsService.list(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useSectionsByGrade(gradeId: string) {
  return useQuery({
    queryKey: [...qk.sections.all, "by-grade", gradeId],
    queryFn: () => sectionsService.listByGrade(gradeId),
    enabled: !!gradeId,
    staleTime: 60 * 60 * 1000,
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateSectionPayload) => sectionsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.sections.all });
      toast({ title: "Section created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create section", description: String(error), variant: "destructive" });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateSectionPayload> }) =>
      sectionsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.sections.all });
      toast({ title: "Section updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to update section", description: String(error), variant: "destructive" });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => sectionsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.sections.all });
      toast({ title: "Section deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete section", description: String(error), variant: "destructive" });
    },
  });
}
