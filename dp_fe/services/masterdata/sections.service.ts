import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { Section } from "@/types/models"

export type CreateSectionPayload = {
  nameSi: string
  nameEn: string
  assignedGradeIds: string[]
}

export const sectionsService = {
  create(payload: CreateSectionPayload) {
    return axiosInstance.post(endpoints.sections, payload)
      .then(r => r.data.data as Section)
  },

  list() {
    return axiosInstance.get(endpoints.sections)
      .then(r => r.data.data as Section[])
  },

  update(id: string, payload: Partial<CreateSectionPayload>) {
    return axiosInstance.patch(`${endpoints.sections}/${id}`, payload)
      .then(r => r.data.data as Section)
  },

  remove(id: string) {
    return axiosInstance.delete(`${endpoints.sections}/${id}`)
      .then(r => r.data.data as { deleted: true })
  },
}
