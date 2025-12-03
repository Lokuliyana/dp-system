import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { studentHouseAssignmentsService, type AssignStudentHousePayload } from "@/services/studentHouseAssignments.service"
import { qk } from "@/lib/queryKeys"
import { useToast } from "@/hooks/use-toast"

type Filters = { studentId?: string; gradeId?: string; houseId?: string; year?: number }

export function useHouseAssignments(filters: Filters) {
  return useQuery({
    queryKey: qk.studentHouseAssignments.list(filters),
    queryFn: () => studentHouseAssignmentsService.list(filters),
    enabled: !!filters.gradeId || !!filters.studentId || !!filters.houseId || !!filters.year,
  })
}

export function useAssignHouse(filtersToInvalidate: Filters) {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (payload: AssignStudentHousePayload) => studentHouseAssignmentsService.assign(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.studentHouseAssignments.list(filtersToInvalidate) })
      toast({ title: "House assignment saved" })
    },
    onError: (err) => toast({ title: "Failed to assign house", description: String(err), variant: "destructive" }),
  })
}

export function useUnassignHouse(filtersToInvalidate: Filters) {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ studentId, year }: { studentId: string; year: number }) => 
      studentHouseAssignmentsService.remove(studentId, year),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.studentHouseAssignments.list(filtersToInvalidate) })
      toast({ title: "House assignment removed" })
    },
    onError: (err) => toast({ title: "Failed to remove assignment", description: String(err), variant: "destructive" }),
  })
}

export function useBulkAssignHouse(filtersToInvalidate: Filters) {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (payload: { assignments: { studentId: string; houseId: string | null; gradeId?: string }[]; year: number }) => 
      studentHouseAssignmentsService.bulkAssign(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.studentHouseAssignments.list(filtersToInvalidate) })
      toast({ title: "Assignments saved successfully" })
    },
    onError: (err) => toast({ title: "Failed to save assignments", description: String(err), variant: "destructive" }),
  })
}
