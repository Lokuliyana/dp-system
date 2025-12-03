import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { House } from "@/types/models"

export type CreateHousePayload = {
  nameSi: string
  nameEn: string
  color: string
  mottoSi?: string
  mottoEn?: string
}

export const housesService = {
  create(payload: CreateHousePayload) {
    return axiosInstance.post(endpoints.houses, payload)
      .then(r => r.data.data as House)
  },

  list() {
    return axiosInstance.get(endpoints.houses)
      .then(r => r.data.data as House[])
  },

  update(id: string, payload: Partial<CreateHousePayload>) {
    return axiosInstance.patch(`${endpoints.houses}/${id}`, payload)
      .then(r => r.data.data as House)
  },

  remove(id: string) {
    return axiosInstance.delete(`${endpoints.houses}/${id}`)
      .then(r => r.data.data as { deleted: true })
  },
}
