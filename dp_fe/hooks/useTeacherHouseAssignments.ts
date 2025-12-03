import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { teacherHouseAssignmentsService, type AssignTeacherHousePayload } from "@/services/masterdata/teacherHouseAssignments.service"
import { qk } from "@/lib/queryKeys"

export function useTeacherHouseAssignments(filters?: { teacherId?: string; houseId?: string }) {
  return useQuery({
    queryKey: qk.teacherHouseAssignments.list(filters),
    queryFn: () => teacherHouseAssignmentsService.list(filters),
  })
}

export function useAssignTeacherHouse(filtersToInvalidate?: { teacherId?: string; houseId?: string }) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AssignTeacherHousePayload) => teacherHouseAssignmentsService.assign(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.teacherHouseAssignments.list(filtersToInvalidate) })
    },
  })
}
