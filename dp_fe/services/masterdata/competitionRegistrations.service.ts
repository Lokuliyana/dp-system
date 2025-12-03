import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { CompetitionRegistration } from "@/types/models"

export type RegisterCompetitionPayload = {
  competitionId: string
  studentId: string
  gradeId: string
  houseId?: string | null
  mode: "house" | "independent"
  year: number
}

export type RegistrationFilters = {
  competitionId?: string
  year?: number
  mode?: "house" | "independent"
  gradeId?: string
  houseId?: string
}

export const competitionRegistrationsService = {
  register(payload: RegisterCompetitionPayload) {
    return axiosInstance
      .post(endpoints.competitionRegistrations, payload)
      .then((r) => r.data.data as CompetitionRegistration)
  },

  list(filters: RegistrationFilters = {}) {
    return axiosInstance
      .get(endpoints.competitionRegistrations, { params: filters })
      .then((r) => r.data.data as CompetitionRegistration[])
  },

  remove(id: string) {
    return axiosInstance
      .delete(`${endpoints.competitionRegistrations}/${id}`)
      .then((r) => r.data.data as { deleted: true })
  },
}
