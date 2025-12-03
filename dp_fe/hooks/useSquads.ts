import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { squadsService, type CreateSquadPayload } from "@/services/masterdata/squads.service"
import { qk } from "@/lib/queryKeys"
import { useToast } from "@/hooks/use-toast"

export function useSquads() {
  return useQuery({
    queryKey: qk.squads.all,
    queryFn: () => squadsService.list(),
    staleTime: 60 * 60 * 1000,
  })
}

export function useCreateSquad() {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (payload: CreateSquadPayload) => squadsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.squads.all })
      toast({ title: "Squad created" })
    },
    onError: (err) => toast({ title: "Failed to create squad", description: String(err), variant: "destructive" }),
  })
}

export function useUpdateSquad() {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateSquadPayload> }) =>
      squadsService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.squads.all })
      toast({ title: "Squad updated" })
    },
    onError: (err) => toast({ title: "Failed to update squad", description: String(err), variant: "destructive" }),
  })
}

export function useDeleteSquad() {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => squadsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.squads.all })
      toast({ title: "Squad removed" })
    },
    onError: (err) => toast({ title: "Failed to remove squad", description: String(err), variant: "destructive" }),
  })
}
