import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { authService, type LoginPayload, type CreateAppUserPayload, type UpdateAppUserPayload } from "@/services/masterdata/auth.service"
import { qk } from "@/lib/queryKeys"

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: qk.auth.me,
    queryFn: () => authService.me(),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useAppUsers() {
  return useQuery({
    queryKey: qk.auth.users,
    queryFn: () => authService.listUsers(),
  })
}

export function useAppUser(id: string) {
  return useQuery({
    queryKey: [...qk.auth.users, id],
    queryFn: () => authService.getUser(id),
    enabled: !!id,
  })
}

export function useCreateAppUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAppUserPayload) => authService.createUser(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.auth.users })
    },
  })
}

export function useUpdateAppUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAppUserPayload }) =>
      authService.updateUser(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.auth.users })
    },
  })
}

export function useDeleteAppUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => authService.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.auth.users })
    },
  })
}

import { roleService } from "@/services/masterdata/role.service"

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => roleService.list(),
  })
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: any) => roleService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      roleService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => roleService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

