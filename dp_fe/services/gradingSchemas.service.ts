import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { GradingSchema } from "@/types/models"

export type CreateGradingSchemaPayload = {
  nameSi: string
  nameEn: string
  bands: Array<{ label: string; min: number; max: number }>
  year?: number
}

export type UpdateGradingSchemaPayload = Partial<CreateGradingSchemaPayload>

export const gradingSchemasService = {
  create(payload: CreateGradingSchemaPayload) {
    return axiosInstance.post(endpoints.gradingSchemas, payload)
      .then(r => r.data.data as GradingSchema)
  },

  list() {
    return axiosInstance.get(endpoints.gradingSchemas)
      .then(r => r.data.data as GradingSchema[])
  },

  getById(id: string) {
    return axiosInstance.get(`${endpoints.gradingSchemas}/${id}`)
      .then(r => r.data.data as GradingSchema)
  },

  update(id: string, payload: UpdateGradingSchemaPayload) {
    return axiosInstance.patch(`${endpoints.gradingSchemas}/${id}`, payload)
      .then(r => r.data.data as GradingSchema)
  },

  remove(id: string) {
    return axiosInstance.delete(`${endpoints.gradingSchemas}/${id}`)
      .then(r => r.data.data as { deleted: true })
  },
}
