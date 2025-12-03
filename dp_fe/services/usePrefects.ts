import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { qk } from "@/lib/queryKeys"
import { prefectPositionsService } from "@/services/prefectPositions.service"
import { prefectsService } from "@/services/prefects.service"

/* ---- Positions ---- */
export function usePrefectPositions() {
  return useQuery({
    queryKey: qk.prefectPositions.all,
    queryFn: () => prefectPositionsService.list(),
    staleTime: 120_000,
  })
}

export function useCreatePrefectPosition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: prefectPositionsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.prefectPositions.all }),
  })
}

/* ---- Prefect Years ---- */
export function usePrefectYears(year?: number) {
  return useQuery({
    queryKey: year ? qk.prefects.byYear(year) : qk.prefects.all,
    queryFn: () => prefectsService.listYears(),
  })
}

export function useCreatePrefectYear() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: prefectsService.createYear,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.prefects.all }),
  })
}

/* ---- Prefect Students ---- */
export function useAddPrefectStudent(prefectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: any) => prefectsService.addStudent(prefectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.prefects.all })
      qc.invalidateQueries({ queryKey: qk.prefects.students(prefectId) })
    },
  })
}

export function useUpdatePrefectStudent(prefectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ studentId, payload }: { studentId: string; payload: any }) =>
      prefectsService.updateStudent(prefectId, studentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.prefects.students(prefectId) })
    },
  })
}

export function useRemovePrefectStudent(prefectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (studentId: string) => prefectsService.removeStudent(prefectId, studentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.prefects.students(prefectId) }),
  })
}
