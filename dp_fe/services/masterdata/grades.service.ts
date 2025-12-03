import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { Grade } from "@/types/models"

export type CreateGradePayload = {
  nameSi: string
  nameEn: string
  level: number
  classTeacherId?: string | null
}

export const gradesService = {
  create(payload: CreateGradePayload) {
    return axiosInstance.post(endpoints.grades, payload)
      .then(r => r.data.data as Grade)
  },

  list() {
    return axiosInstance.get(endpoints.grades)
      .then(r => r.data.data as Grade[])
  },

  update(id: string, payload: Partial<CreateGradePayload>) {
    return axiosInstance.patch(`${endpoints.grades}/${id}`, payload)
      .then(r => r.data.data as Grade)
  },

  remove(id: string) {
    return axiosInstance.delete(`${endpoints.grades}/${id}`)
      .then(r => r.data.data as { deleted: true })
  },
}
