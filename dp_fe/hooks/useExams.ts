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

import { examsService } from "@/services/exams.service"

/* ---- Exams ---- */
export function useExamsList(params?: { year?: number; gradeId?: string }) {
  return useQuery({
    queryKey: qk.exams.list(params),
    queryFn: () => examsService.list(params),
  })
}

export function useCreateExam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: examsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.exams.all }),
  })
}

export function useExamMarks(examId: string, gradeId: string) {
  return useQuery({
    queryKey: qk.exams.marks(examId, gradeId),
    queryFn: () => examsService.getMarks(examId, gradeId),
    enabled: !!examId && !!gradeId,
  })
}

export function useUpdateExamMarks(examId: string, gradeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: any) => examsService.updateMarks(examId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.exams.marks(examId, gradeId) }),
  })
}

export function useStudentExamHistory(studentId: string) {
  return useQuery({
    queryKey: qk.exams.history(studentId),
    queryFn: () => examsService.getStudentHistory(studentId),
    enabled: !!studentId,
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
