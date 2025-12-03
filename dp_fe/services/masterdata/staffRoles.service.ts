import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { StaffRole } from "@/types/models"

export type ResponsibilityPayload = { level: 1 | 2; textSi: string; textEn: string }

export type CreateStaffRolePayload = {
  nameSi: string
  nameEn: string
  gradeBased?: boolean
  singleGraded?: boolean
  gradesEffected?: string[]
  responsibilities?: ResponsibilityPayload[]
  descriptionSi?: string
  descriptionEn?: string
  teacherIds?: string[]
  order?: number
}

export const staffRolesService = {
  create(payload: CreateStaffRolePayload) {
    return axiosInstance.post(endpoints.staffRoles, payload)
      .then(r => r.data.data as StaffRole)
  },

  list() {
    return axiosInstance.get(endpoints.staffRoles)
      .then(r => r.data.data as StaffRole[])
  },

  update(id: string, payload: Partial<CreateStaffRolePayload>) {
    return axiosInstance.patch(`${endpoints.staffRoles}/${id}`, payload)
      .then(r => r.data.data as StaffRole)
  },

  remove(id: string) {
    return axiosInstance.delete(`${endpoints.staffRoles}/${id}`)
      .then(r => r.data.data as { deleted: true })
  },
}
