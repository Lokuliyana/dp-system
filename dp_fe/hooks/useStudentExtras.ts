import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { qk } from "@/lib/queryKeys"
import { studentTalentsService } from "@/services/studentTalents.service"
import { studentHouseAssignmentsService } from "@/services/studentHouseAssignments.service"

/* ---- Talents ---- */
export function useStudentTalents(studentId: string) {
  return useQuery({
    queryKey: qk.studentTalents.byStudent(studentId),
    queryFn: () => studentTalentsService.list(studentId),
    enabled: !!studentId,
  })
}

export function useCreateStudentTalent(studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: studentTalentsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.studentTalents.byStudent(studentId) })
      qc.invalidateQueries({ queryKey: qk.students.view360(studentId) })
    },
  })
}

export function useUpdateStudentTalent(studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      studentTalentsService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.studentTalents.byStudent(studentId) })
      qc.invalidateQueries({ queryKey: qk.students.view360(studentId) })
    },
  })
}

export function useDeleteStudentTalent(studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => studentTalentsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.studentTalents.byStudent(studentId) })
      qc.invalidateQueries({ queryKey: qk.students.view360(studentId) })
    },
  })
}

/* ---- House Assignments ---- */
export function useStudentHouseAssignments(studentId: string) {
  return useQuery({
    queryKey: qk.studentHouseAssignments.byStudent(studentId),
    queryFn: () => studentHouseAssignmentsService.list({ studentId }),
    enabled: !!studentId,
  })
}

export function useAssignStudentHouse(studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: studentHouseAssignmentsService.assign,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.studentHouseAssignments.byStudent(studentId) })
      qc.invalidateQueries({ queryKey: qk.students.view360(studentId) })
    },
  })
}
