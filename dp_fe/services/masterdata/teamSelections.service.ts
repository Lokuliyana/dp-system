import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { TeamSelection } from "@/types/models"

export type SaveTeamSelectionPayload = {
  level: "zonal" | "district" | "allisland"
  year: number
  entries?: Array<{
    competitionId: string
    studentId: string
    place?: number
  }>
  teamPosition?: number
}

export type AutoGeneratePayload = {
  fromLevel: "zonal" | "district"
  toLevel: "district" | "allisland"
  year: number
}

export const teamSelectionsService = {
  save(payload: SaveTeamSelectionPayload) {
    return axiosInstance
      .post(endpoints.teamSelections, payload)
      .then((r) => r.data.data as TeamSelection)
  },

  get(level: "zonal" | "district" | "allisland", year: number) {
    return axiosInstance
      .get(endpoints.teamSelections, { params: { level, year } })
      .then((r) => r.data.data as TeamSelection | null)
  },

  computeTotal(level: "zonal" | "district" | "allisland", year: number) {
    return axiosInstance
      .post(`${endpoints.teamSelections}/compute-total`, { level, year })
      .then((r) => r.data.data as TeamSelection)
  },

  getZonalSuggestions(year: number) {
    return axiosInstance
      .get(`${endpoints.teamSelections}/zonal-suggestions`, { params: { year } })
      .then((r) => r.data.data as Array<{ competitionId: string; studentId: string; place?: number }>)
  },

  autoGenerate(payload: AutoGeneratePayload) {
    return axiosInstance
      .post(`${endpoints.teamSelections}/auto-generate`, payload)
      .then((r) => r.data.data as TeamSelection)
  },
}
