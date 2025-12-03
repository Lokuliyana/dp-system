import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { parentsService } from "@/services/parents.service"
import { parentStudentLinksService } from "@/services/parentStudentLinks.service"
import { qk } from "@/lib/queryKeys"
import type { CreateParentPayload } from "@/services/parents.service"
import type { LinkParentStudentPayload } from "@/services/parentStudentLinks.service"
import type { Parent } from "@/types/models"

export function useParents(q?: string) {
  return useQuery({
    queryKey: qk.parents.search(q),
    queryFn: () => parentsService.list(q),
    staleTime: 120_000,
  })
}

export function useCreateParent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateParentPayload) => parentsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "parents" })
    },
  })
}

export function useUpdateParent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateParentPayload> }) =>
      parentsService.update(id, payload),
    onSuccess: (p: Parent) => {
      qc.invalidateQueries({ queryKey: qk.parents.byId(p.id) })
      qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "parents" })
    },
  })
}

export function useDeleteParent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => parentsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "parents" })
    },
  })
}

export function useParentStudentLinksByStudent(studentId: string) {
  return useQuery({
    queryKey: qk.parentStudentLinks.byStudent(studentId),
    queryFn: () =>
      // backend has no list endpoint, so this is fetched via student 360
      Promise.resolve([]),
    enabled: false,
  })
}

export function useLinkParentStudent(studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: LinkParentStudentPayload) =>
      parentStudentLinksService.link(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.parentStudentLinks.byStudent(studentId) })
      qc.invalidateQueries({ queryKey: qk.students.view360(studentId) })
    },
  })
}

export function useUpdateParentStudentLink(studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      parentStudentLinksService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.parentStudentLinks.byStudent(studentId) })
      qc.invalidateQueries({ queryKey: qk.students.view360(studentId) })
    },
  })
}

export function useUnlinkParentStudent(studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => parentStudentLinksService.unlink(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.parentStudentLinks.byStudent(studentId) })
      qc.invalidateQueries({ queryKey: qk.students.view360(studentId) })
    },
  })
}
