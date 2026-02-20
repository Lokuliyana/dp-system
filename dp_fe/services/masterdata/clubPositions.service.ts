import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { ClubPosition } from "@/types/models"

export type CreateClubPositionPayload = {
  nameSi: string
  nameEn: string
  responsibilitySi?: string
  responsibilityEn?: string
  clubId?: string | null
}

export type UpdateClubPositionPayload = Partial<CreateClubPositionPayload>

export const clubPositionsService = {
  create(payload: CreateClubPositionPayload) {
    return axiosInstance.post(endpoints.clubPositions, payload)
      .then(r => r.data.data as ClubPosition)
  },

  list() {
    return axiosInstance.get(endpoints.clubPositions)
      .then(r => r.data.data as ClubPosition[])
  },

  update(id: string, payload: UpdateClubPositionPayload) {
    return axiosInstance.patch(`${endpoints.clubPositions}/${id}`, payload)
      .then(r => r.data.data as ClubPosition)
  },

  remove(id: string) {
    return axiosInstance.delete(`${endpoints.clubPositions}/${id}`)
      .then(r => r.data.data as { deleted: true })
  },
}
