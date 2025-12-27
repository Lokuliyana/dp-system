import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { studentsService } from "@/services/students.service"
import { qk } from "@/lib/queryKeys"
import type { CreateStudentPayload, UpdateStudentPayload } from "@/services/students.service"
import type { Student } from "@/types/models"

export function useStudents(params: {
  page?: number;
  limit?: number;
  search?: string;
  gradeId?: string;
  sectionId?: string;
  academicYear?: number;
} = {}) {
  return useQuery({
    queryKey: [qk.students.all, params],
    queryFn: () => studentsService.list(params),
    staleTime: 60_000,
  })
}

export function useStudentsByGrade(gradeId: string, year?: number) {
  return useQuery({
    queryKey: qk.students.byGrade(gradeId, year),
    queryFn: () => studentsService.listByGrade(gradeId, year),
    enabled: !!gradeId,
    staleTime: 60_000,
  })
}

export function useStudent360(studentId: string, year?: number) {
  return useQuery({
    queryKey: qk.students.view360(studentId, year),
    queryFn: () => studentsService.get360(studentId, year),
    enabled: !!studentId,
  })
}

export function useCreateStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateStudentPayload) => studentsService.create(payload),
    onSuccess: (s: Student) => {
      qc.invalidateQueries({ queryKey: qk.students.byGrade(s.gradeId, s.academicYear) })
    },
  })
}

export function useUpdateStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStudentPayload }) =>
      studentsService.update(id, payload),
    onSuccess: (s: Student) => {
      qc.invalidateQueries({ queryKey: qk.students.byGrade(s.gradeId, s.academicYear) })
      qc.invalidateQueries({ queryKey: qk.students.byId(s.id) })
      qc.invalidateQueries({ queryKey: qk.students.view360(s.id) })
    },
  })
}

export function useDeleteStudent(gradeId?: string, year?: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => studentsService.remove(id),
    onSuccess: () => {
      if (gradeId) {
        qc.invalidateQueries({ queryKey: qk.students.byGrade(gradeId, year) })
      } else {
        qc.invalidateQueries({ queryKey: qk.students.all })
      }
    },
  })
}

export function useAddStudentNote(studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { category?: string; content: string }) =>
      studentsService.addNote(studentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.students.notes(studentId) })
      qc.invalidateQueries({ queryKey: qk.students.view360(studentId) })
    },
  })
}

export function useRemoveStudentNote(studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (noteId: string) => studentsService.removeNote(studentId, noteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.students.notes(studentId) })
      qc.invalidateQueries({ queryKey: qk.students.view360(studentId) })
    },
  })
}

export function useBulkImportStudents() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => studentsService.bulkImport(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.students.all })
    },
  })
}
