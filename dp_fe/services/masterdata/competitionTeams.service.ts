import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { CompetitionTeam } from "@/types/models"

export type CreateCompetitionTeamPayload = {
  competitionId: string
  year: number
  type: "house" | "independent"
  houseId?: string
  gradeId?: string
  teamNameSi?: string
  teamNameEn?: string
  memberStudentIds: string[]
}

export type TeamFilters = {
  competitionId?: string
  year?: number
  type?: "house" | "independent"
  houseId?: string
  gradeId?: string
}

export const competitionTeamsService = {
  create(payload: CreateCompetitionTeamPayload) {
    return axiosInstance
      .post(endpoints.competitionTeams, payload)
      .then((r) => r.data.data as CompetitionTeam)
  },

  list(filters: TeamFilters = {}) {
    return axiosInstance
      .get(endpoints.competitionTeams, { params: filters })
      .then((r) => r.data.data as CompetitionTeam[])
  },

  update(id: string, payload: Partial<CreateCompetitionTeamPayload>) {
    return axiosInstance
      .patch(`${endpoints.competitionTeams}/${id}`, payload)
      .then((r) => r.data.data as CompetitionTeam)
  },

  remove(id: string) {
    return axiosInstance
      .delete(`${endpoints.competitionTeams}/${id}`)
      .then((r) => r.data.data as { deleted: true })
  },
}
