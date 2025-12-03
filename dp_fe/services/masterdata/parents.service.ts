import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { Parent } from "@/types/models"

export type CreateParentPayload = {
  firstNameSi?: string
  lastNameSi?: string
  firstNameEn: string
  lastNameEn: string
  occupationSi?: string
  occupationEn?: string
  email?: string
  phoneNum?: string
  addressSi?: string
  addressEn?: string
}

export const parentsService = {
  create(payload: CreateParentPayload) {
    return axiosInstance.post(endpoints.parents, payload)
      .then(r => r.data.data as Parent)
  },

  list(q?: string) {
    return axiosInstance.get(endpoints.parents, { params: { q } })
      .then(r => r.data.data as Parent[])
  },

  update(id: string, payload: Partial<CreateParentPayload>) {
    return axiosInstance.patch(`${endpoints.parents}/${id}`, payload)
      .then(r => r.data.data as Parent)
  },

  remove(id: string) {
    return axiosInstance.delete(`${endpoints.parents}/${id}`)
      .then(r => r.data.data as { deleted: true })
  },
}
