import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gradesService, CreateGradePayload } from "@/services/masterdata/grades.service";
import { qk } from "@/lib/queryKeys";
import { useToast } from "@/hooks/use-toast";

export function useGrades() {
  return useQuery({
    queryKey: qk.grades.all,
    queryFn: () => gradesService.list(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useCreateGrade() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateGradePayload) => gradesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.grades.all });
      toast({ title: "Grade created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create grade", description: String(error), variant: "destructive" });
    },
  });
}

export function useUpdateGrade() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateGradePayload> }) =>
      gradesService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.grades.all });
      toast({ title: "Grade updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to update grade", description: String(error), variant: "destructive" });
    },
  });
}

export function useDeleteGrade() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => gradesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.grades.all });
      toast({ title: "Grade deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete grade", description: String(error), variant: "destructive" });
    },
  });
}
