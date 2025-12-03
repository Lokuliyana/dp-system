import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { StudentTalent } from "@/types/models"

export type CreateTalentPayload = {
  studentId: string
  areaSi?: string
  areaEn: string
  level?: string
  notes?: string
  starLevel?: 1 | 2
  year?: number
}

export type UpdateTalentPayload = Partial<CreateTalentPayload>

export const studentTalentsService = {
  create(payload: CreateTalentPayload) {
    return axiosInstance.post(endpoints.studentTalents, payload)
      .then(r => r.data.data as StudentTalent)
  },

  list(studentId?: string) {
    return axiosInstance.get(endpoints.studentTalents, {
      params: { studentId },
    }).then(r => r.data.data as StudentTalent[])
  },

  update(id: string, payload: UpdateTalentPayload) {
    return axiosInstance.patch(`${endpoints.studentTalents}/${id}`, payload)
      .then(r => r.data.data as StudentTalent)
  },

  remove(id: string) {
    return axiosInstance.delete(`${endpoints.studentTalents}/${id}`)
      .then(r => r.data.data as { deleted: true })
  },
}
