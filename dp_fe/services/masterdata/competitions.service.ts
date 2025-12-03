import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { Competition } from "@/types/models"

export type CreateCompetitionPayload = {
  nameSi: string
  nameEn: string
  squadId?: string
  scope: "open" | "grade" | "section"
  gradeIds?: string[]
  sectionIds?: string[]
  isMainCompetition: boolean
  active?: boolean
  year?: number
  participationType?: "individual" | "team"
  teamConfig?: {
    minSize: number
    maxSize: number
  }
  pointsConfig?: {
    place1: number
    place2: number
    place3: number
    place4: number
    place5: number
  }
}

export type UpdateCompetitionPayload = Partial<CreateCompetitionPayload>

export const competitionsService = {
  create(payload: CreateCompetitionPayload) {
    return axiosInstance
      .post(endpoints.competitions, payload)
      .then((r) => r.data.data as Competition)
  },

  list(year?: number) {
    return axiosInstance
      .get(endpoints.competitions, { params: { year } })
      .then((r) => r.data.data as Competition[])
  },

  update(id: string, payload: UpdateCompetitionPayload) {
    return axiosInstance
      .patch(`${endpoints.competitions}/${id}`, payload)
      .then((r) => r.data.data as Competition)
  },

  remove(id: string) {
    return axiosInstance
      .delete(`${endpoints.competitions}/${id}`)
      .then((r) => r.data.data as { deleted: true })
  },
}
