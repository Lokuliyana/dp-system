import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { qk } from "@/lib/queryKeys"
import { clubsService } from "@/services/masterdata/clubs.service"
import { clubPositionsService } from "@/services/masterdata/clubPositions.service"

/* ---- Club Positions ---- */
export function useClubPositions() {
  return useQuery({
    queryKey: qk.clubPositions.all,
    queryFn: () => clubPositionsService.list(),
    staleTime: 120_000,
  })
}

export function useCreateClubPosition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: clubPositionsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.clubPositions.all })
    },
  })
}

export function useUpdateClubPosition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      clubPositionsService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.clubPositions.all })
    },
  })
}

export function useDeleteClubPosition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => clubPositionsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.clubPositions.all })
    },
  })
}

/* ---- Clubs ---- */
export function useClubs() {
  return useQuery({
    queryKey: qk.clubs.all,
    queryFn: () => clubsService.list(),
    staleTime: 60_000,
  })
}

export function useCreateClub() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: clubsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.clubs.all })
    },
  })
}

export function useUpdateClub() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      clubsService.update(id, payload),
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: qk.clubs.all })
      qc.invalidateQueries({ queryKey: qk.clubs.byId(c.id) })
    },
  })
}

export function useDeleteClub() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => clubsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.clubs.all })
    },
  })
}

export function useAssignClubMember(clubId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: any) => clubsService.assignMember(clubId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.clubs.all })
      qc.invalidateQueries({ queryKey: qk.clubs.byId(clubId) })
    },
  })
}
