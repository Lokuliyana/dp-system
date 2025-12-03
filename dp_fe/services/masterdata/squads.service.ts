import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { Squad } from "@/types/models"

export type CreateSquadPayload = {
  nameSi: string
  nameEn: string
  icon?: string
  assignedGradeIds?: string[]
  assignedSectionIds?: string[]
}

export const squadsService = {
  create(payload: CreateSquadPayload) {
    return axiosInstance.post(endpoints.squads, payload).then((r) => r.data.data as Squad)
  },

  list() {
    return axiosInstance.get(endpoints.squads).then((r) => r.data.data as Squad[])
  },

  update(id: string, payload: Partial<CreateSquadPayload>) {
    return axiosInstance.patch(`${endpoints.squads}/${id}`, payload).then((r) => r.data.data as Squad)
  },

  remove(id: string) {
    return axiosInstance.delete(`${endpoints.squads}/${id}`).then((r) => r.data.data as { deleted: true })
  },
}
