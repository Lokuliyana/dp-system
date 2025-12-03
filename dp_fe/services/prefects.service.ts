import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { Prefect } from "@/types/models"

export type CreatePrefectYearPayload = {
  year: number
  appointedDate: string
}

export type AddPrefectStudentPayload = {
  studentId: string
  rank: "prefect" | "vice-prefect" | "head-prefect"
  positionIds?: string[]
}

export type UpdatePrefectStudentPayload = Partial<AddPrefectStudentPayload>

export const prefectsService = {
  createYear(payload: CreatePrefectYearPayload) {
    return axiosInstance.post(endpoints.prefects, payload)
      .then(r => r.data.data as Prefect)
  },

  listYears() {
    return axiosInstance.get(endpoints.prefects)
      .then(r => r.data.data as Prefect[])
  },

  addStudent(prefectId: string, payload: AddPrefectStudentPayload) {
    return axiosInstance.post(`${endpoints.prefects}/${prefectId}/students`, payload)
      .then(r => r.data.data as Prefect)
  },

  updateStudent(prefectId: string, studentId: string, payload: UpdatePrefectStudentPayload) {
    return axiosInstance.patch(`${endpoints.prefects}/${prefectId}/students/${studentId}`, payload)
      .then(r => r.data.data as Prefect)
  },

  removeStudent(prefectId: string, studentId: string) {
    return axiosInstance.delete(`${endpoints.prefects}/${prefectId}/students/${studentId}`)
      .then(r => r.data.data as Prefect)
  },
}
