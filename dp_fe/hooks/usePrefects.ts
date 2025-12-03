import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { prefectsService, CreatePrefectYearPayload, AddPrefectStudentPayload } from "@/services/masterdata/prefects.service";
import { qk } from "@/lib/queryKeys";
import { useToast } from "@/hooks/use-toast";

export function usePrefects(year?: number) {
  return useQuery({
    queryKey: qk.prefects.list(year),
    queryFn: () => prefectsService.list(year),
  });
}

export function useCreatePrefectYear() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreatePrefectYearPayload) => prefectsService.createYear(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "prefects" });
      toast({ title: "Prefect year created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create prefect year", description: String(error), variant: "destructive" });
    },
  });
}

export function useAddPrefectStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ yearId, payload }: { yearId: string; payload: AddPrefectStudentPayload }) =>
      prefectsService.addStudent(yearId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "prefects" });
      toast({ title: "Student added to prefects successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to add student to prefects", description: String(error), variant: "destructive" });
    },
  });
}

export function useUpdatePrefectStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ yearId, studentId, payload }: { yearId: string; studentId: string; payload: { positionId: string } }) =>
      prefectsService.updateStudent(yearId, studentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "prefects" });
      toast({ title: "Prefect updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to update prefect", description: String(error), variant: "destructive" });
    },
  });
}

export function useRemovePrefectStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ yearId, studentId }: { yearId: string; studentId: string }) =>
      prefectsService.removeStudent(yearId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "prefects" });
      toast({ title: "Prefect removed successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to remove prefect", description: String(error), variant: "destructive" });
    },
  });
}
