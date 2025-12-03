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
  dob?: string
  dateJoined?: string
  qualifications?: string[]
  roleIds?: string[]
  status?: "active" | "inactive"
}

export type UpdateTeacherPayload = Partial<CreateTeacherPayload>

export type AddPastRolePayload = {
  roleId: string
  fromYear: number
  toYear?: number
}

export const teachersService = {
  create(payload: CreateTeacherPayload) {
    return axiosInstance.post(endpoints.teachers, payload)
      .then(r => r.data.data as Teacher)
  },

  list() {
    return axiosInstance.get(endpoints.teachers)
      .then(r => r.data.data as Teacher[])
  },

  update(id: string, payload: UpdateTeacherPayload) {
    return axiosInstance.patch(`${endpoints.teachers}/${id}`, payload)
      .then(r => r.data.data as Teacher)
  },

  remove(id: string) {
    return axiosInstance.delete(`${endpoints.teachers}/${id}`)
      .then(r => r.data.data as { deleted: true })
  },

  addPastRole(teacherId: string, payload: AddPastRolePayload) {
    return axiosInstance.post(`${endpoints.teachers}/${teacherId}/past-roles`, payload)
      .then(r => r.data.data as Teacher)
  },
}
