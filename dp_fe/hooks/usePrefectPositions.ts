import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { prefectPositionsService, CreatePrefectPositionPayload } from "@/services/masterdata/prefectPositions.service";
import { qk } from "@/lib/queryKeys";
import { useToast } from "@/hooks/use-toast";

export function usePrefectPositions() {
  return useQuery({
    queryKey: qk.prefectPositions.all,
    queryFn: () => prefectPositionsService.list(),
  });
}

export function useCreatePrefectPosition() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreatePrefectPositionPayload) => prefectPositionsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.prefectPositions.all });
      toast({ title: "Position created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create position", description: String(error), variant: "destructive" });
    },
  });
}

export function useUpdatePrefectPosition() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreatePrefectPositionPayload> }) =>
      prefectPositionsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.prefectPositions.all });
      toast({ title: "Position updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to update position", description: String(error), variant: "destructive" });
    },
  });
}

export function useDeletePrefectPosition() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => prefectPositionsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.prefectPositions.all });
      toast({ title: "Position deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete position", description: String(error), variant: "destructive" });
    },
  });
}
