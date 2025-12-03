import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { qk } from "@/lib/queryKeys"
import { gradingSchemasService } from "@/services/gradingSchemas.service"
import { examResultsService } from "@/services/examResults.service"

/* ---- Grading Schemas ---- */
export function useGradingSchemas() {
  return useQuery({
    queryKey: qk.gradingSchemas.all,
    queryFn: () => gradingSchemasService.list(),
    staleTime: 120_000,
  })
}

export function useGradingSchema(id: string) {
  return useQuery({
    queryKey: qk.gradingSchemas.byId(id),
    queryFn: () => gradingSchemasService.getById(id),
    enabled: !!id,
  })
}

export function useCreateGradingSchema() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: gradingSchemasService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.gradingSchemas.all }),
  })
}

export function useUpdateGradingSchema() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      gradingSchemasService.update(id, payload),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: qk.gradingSchemas.all })
      qc.invalidateQueries({ queryKey: qk.gradingSchemas.byId(s.id) })
    },
  })
}

export function useDeleteGradingSchema() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => gradingSchemasService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.gradingSchemas.all }),
  })
}

/* ---- Exam Results (local keys; qk has no examResults section) ---- */
const examKeys = {
  byStudent: (studentId: string) => ["examResults", "student", studentId] as const,
  byGrade: (gradeId: string) => ["examResults", "grade", gradeId] as const,
}

export function useExamResultsByStudent(studentId: string) {
  return useQuery({
    queryKey: examKeys.byStudent(studentId),
    queryFn: () => examResultsService.listByStudent(studentId),
    enabled: !!studentId,
  })
}

export function useExamResultsByGrade(gradeId: string) {
  return useQuery({
    queryKey: examKeys.byGrade(gradeId),
    queryFn: () => examResultsService.listByGrade(gradeId),
    enabled: !!gradeId,
  })
}

export function useCreateExamSheet(gradeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: examResultsService.createSheet,
    onSuccess: () => qc.invalidateQueries({ queryKey: examKeys.byGrade(gradeId) }),
  })
}

export function useUpsertExamResults(gradeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: examResultsService.upsertResults,
    onSuccess: () => qc.invalidateQueries({ queryKey: examKeys.byGrade(gradeId) }),
  })
}
