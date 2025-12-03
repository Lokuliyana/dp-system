import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffRolesService, CreateStaffRolePayload } from "@/services/masterdata/staffRoles.service";
import { qk } from "@/lib/queryKeys";
import { useToast } from "@/hooks/use-toast";

export function useStaffRoles() {
  return useQuery({
    queryKey: qk.staffRoles.all,
    queryFn: () => staffRolesService.list(),
  });
}

export function useCreateStaffRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateStaffRolePayload) => staffRolesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.staffRoles.all });
      toast({ title: "Role created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create role", description: String(error), variant: "destructive" });
    },
  });
}

export function useUpdateStaffRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateStaffRolePayload> }) =>
      staffRolesService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.staffRoles.all });
      toast({ title: "Role updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to update role", description: String(error), variant: "destructive" });
    },
  });
}

export function useDeleteStaffRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => staffRolesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.staffRoles.all });
      toast({ title: "Role deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete role", description: String(error), variant: "destructive" });
    },
  });
}
