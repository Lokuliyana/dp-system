import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { AppUser } from "@/types/models"

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  user: AppUser
  accessToken: string
  refreshToken: string
}

export type CreateAppUserPayload = {
  name: string
  email: string
  password: string
  roleId: string
}

export type UpdateAppUserPayload = Partial<CreateAppUserPayload> & {
  isActive?: boolean
}

export const authService = {
  login(payload: LoginPayload) {
    return axiosInstance
      .post(endpoints.auth.login, payload)
      .then(r => r.data.data as LoginResponse)
  },

  refresh(token: string) {
    return axiosInstance
      .post(endpoints.auth.refresh, { token })
      .then(r => r.data.data as { accessToken: string; refreshToken: string })
  },

  listUsers() {
    return axiosInstance
      .get(endpoints.auth.users)
      .then(r => r.data.data as AppUser[])
  },

  createUser(payload: CreateAppUserPayload) {
    return axiosInstance
      .post(endpoints.auth.users, payload)
      .then(r => r.data.data as AppUser)
  },

  updateUser(id: string, payload: UpdateAppUserPayload) {
    return axiosInstance
      .patch(`${endpoints.auth.users}/${id}`, payload)
      .then(r => r.data.data as AppUser)
  },

  deleteUser(id: string) {
    return axiosInstance
      .delete(`${endpoints.auth.users}/${id}`)
      .then(r => r.data.data as { deleted: true })
  },
}
