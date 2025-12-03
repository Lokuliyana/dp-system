import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { CompetitionHouseRule } from "@/types/models"

export type UpsertCompetitionRulePayload = {
  competitionId: string
  year: number
  maxPerHousePerGrade: number
  maxTotalPerGrade: number
  noteSi?: string
  noteEn?: string
}

export const competitionRulesService = {
  upsert(payload: UpsertCompetitionRulePayload) {
    return axiosInstance
      .post(endpoints.competitionRules, payload)
      .then((r) => r.data.data as CompetitionHouseRule)
  },

  list(competitionId: string, year?: number) {
    return axiosInstance
      .get(endpoints.competitionRules, { params: { competitionId, year } })
      .then((r) => r.data.data as CompetitionHouseRule[])
  },
}
