import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { CompetitionResult } from "@/types/models"

export type ResultEntryPayload = {
  place: 1 | 2 | 3 | 4 | 5
  studentId?: string
  teamId?: string
  houseId?: string
  gradeId?: string
}

export type CreateCompetitionResultPayload = {
  competitionId: string
  year: number
  results: ResultEntryPayload[]
}

export type ResultFilters = {
  competitionId?: string
  year?: number
}

export const competitionResultsService = {
  create(payload: CreateCompetitionResultPayload) {
    return axiosInstance
      .post(endpoints.competitionResults, payload)
      .then((r) => r.data.data as CompetitionResult[])
  },

  list(filters: ResultFilters = {}) {
    return axiosInstance
      .get(endpoints.competitionResults, { params: filters })
      .then((r) => r.data.data as CompetitionResult[])
  },

  remove(id: string) {
    return axiosInstance
      .delete(`${endpoints.competitionResults}/${id}`)
      .then((r) => r.data.data as { deleted: true })
  },

  housePoints(year: number) {
    return axiosInstance
      .get(`${endpoints.competitionResults}/house-points`, { params: { year } })
      .then((r) => r.data.data as Array<{ houseId: string; points: number }>)
  },
}
