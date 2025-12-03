import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { housesService, type CreateHousePayload } from "@/services/masterdata/houses.service"
import { qk } from "@/lib/queryKeys"
import { useToast } from "@/hooks/use-toast"

export function useHouses() {
  return useQuery({
    queryKey: qk.houses.all,
    queryFn: () => housesService.list(),
    staleTime: 60 * 60 * 1000,
  })
}

export function useCreateHouse() {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (payload: CreateHousePayload) => housesService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.houses.all })
      toast({ title: "House created" })
    },
    onError: (err) => toast({ title: "Failed to create house", description: String(err), variant: "destructive" }),
  })
}

export function useUpdateHouse() {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateHousePayload> }) =>
      housesService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.houses.all })
      toast({ title: "House updated" })
    },
    onError: (err) => toast({ title: "Failed to update house", description: String(err), variant: "destructive" }),
  })
}

export function useDeleteHouse() {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => housesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.houses.all })
      toast({ title: "House removed" })
    },
    onError: (err) => toast({ title: "Failed to remove house", description: String(err), variant: "destructive" }),
  })
}
