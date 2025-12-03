import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { PrefectPosition } from "@/types/models"

export type CreatePrefectPositionPayload = {
  nameSi: string
  nameEn: string
  responsibilitySi?: string
  responsibilityEn?: string
  descriptionSi?: string
  descriptionEn?: string
  rankLevel?: number
}

export const prefectPositionsService = {
  create(payload: CreatePrefectPositionPayload) {
    return axiosInstance.post(endpoints.prefectPositions, payload)
      .then(r => r.data.data as PrefectPosition)
  },

  list() {
    return axiosInstance.get(endpoints.prefectPositions)
      .then(r => r.data.data as PrefectPosition[])
  },

  update(id: string, payload: Partial<CreatePrefectPositionPayload>) {
    return axiosInstance.patch(`${endpoints.prefectPositions}/${id}`, payload)
      .then(r => r.data.data as PrefectPosition)
  },

  remove(id: string) {
    return axiosInstance.delete(`${endpoints.prefectPositions}/${id}`)
      .then(r => r.data.data as { deleted: true })
  },
}
