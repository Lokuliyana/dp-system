import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teachersService, CreateTeacherPayload } from "@/services/masterdata/teachers.service";
import { qk } from "@/lib/queryKeys";
import { useToast } from "@/hooks/use-toast";

export function useTeachers(params?: any) {
  return useQuery({
    queryKey: qk.teachers.list(params),
    queryFn: () => teachersService.list(params),
  });
}

export function useTeacher(id: string) {
  return useQuery({
    queryKey: qk.teachers.detail(id),
    queryFn: () => teachersService.get(id),
    enabled: !!id,
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateTeacherPayload) => teachersService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.teachers.all });
      toast({ title: "Staff member created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create staff member", description: String(error), variant: "destructive" });
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateTeacherPayload> }) =>
      teachersService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.teachers.all });
      toast({ title: "Staff member updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to update staff member", description: String(error), variant: "destructive" });
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => teachersService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.teachers.all });
      toast({ title: "Staff member deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete staff member", description: String(error), variant: "destructive" });
    },
  });
}
