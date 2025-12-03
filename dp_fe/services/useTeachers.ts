import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { qk } from "@/lib/queryKeys"
import { teachersService } from "@/services/teachers.service"
import { staffRolesService } from "@/services/staffRoles.service"

/* ---- Staff Roles ---- */
export function useStaffRoles() {
  return useQuery({
    queryKey: qk.staffRoles.all,
    queryFn: () => staffRolesService.list(),
    staleTime: 120_000,
  })
}

export function useCreateStaffRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: staffRolesService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.staffRoles.all }),
  })
}

/* ---- Teachers ---- */
export function useTeachers() {
  return useQuery({
    queryKey: qk.teachers.all,
    queryFn: () => teachersService.list(),
    staleTime: 60_000,
  })
}

export function useCreateTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: teachersService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.teachers.all }),
  })
}

export function useUpdateTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      teachersService.update(id, payload),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: qk.teachers.all })
      qc.invalidateQueries({ queryKey: qk.teachers.byId(t.id) })
    },
  })
}

export function useDeleteTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => teachersService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.teachers.all }),
  })
}

export function useAddTeacherPastRole(teacherId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: any) => teachersService.addPastRole(teacherId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.teachers.all })
      qc.invalidateQueries({ queryKey: qk.teachers.byId(teacherId) })
    },
  })
}
