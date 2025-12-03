import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { Teacher } from "@/types/models"

export type CreateTeacherPayload = {
  firstNameSi?: string
  lastNameSi?: string
  firstNameEn: string
  lastNameEn: string
  email?: string
  phone?: string
  dob?: string // ISO date string
  dateJoined: string // ISO date string
  roleIds?: string[]
  pastRoles?: { roleId: string; fromYear: number; toYear?: number }[]
  qualifications?: string[]
  status?: "active" | "inactive"
}

export const teachersService = {
  create(payload: CreateTeacherPayload) {
    return axiosInstance.post(endpoints.teachers, payload)
      .then(r => r.data.data as Teacher)
  },

  list(params?: any) {
    return axiosInstance.get(endpoints.teachers, { params })
      .then(r => r.data.data as Teacher[])
  },

  get(id: string) {
    return axiosInstance.get(`${endpoints.teachers}/${id}`)
      .then(r => r.data.data as Teacher)
  },

  update(id: string, payload: Partial<CreateTeacherPayload>) {
    return axiosInstance.patch(`${endpoints.teachers}/${id}`, payload)
      .then(r => r.data.data as Teacher)
  },

  remove(id: string) {
    return axiosInstance.delete(`${endpoints.teachers}/${id}`)
      .then(r => r.data.data as { deleted: true })
  },
}
